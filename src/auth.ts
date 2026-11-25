import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { betterAuth } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { admin, bearer, username } from 'better-auth/plugins';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from './db/pool.ts';
import { cmsAc, cmsRoles, normalizeCmsRole } from './lib/authRoles.ts';

const PORT = Number(process.env.PORT || 3000);
const RUNTIME_AUTH_SECRET = crypto.randomBytes(32).toString('hex');

const AUTH_SECRET =
  (process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_SECRET !== 'CHANGE_ME_TO_A_RANDOM_SECRET' &&
    process.env.BETTER_AUTH_SECRET.trim()) ||
  (process.env.CMS_SESSION_SECRET &&
    process.env.CMS_SESSION_SECRET !== 'CHANGE_ME_TO_A_RANDOM_SECRET' &&
    process.env.CMS_SESSION_SECRET.trim()) ||
  RUNTIME_AUTH_SECRET;

function parseOrigin(raw?: string): string | undefined {
  const val = (raw || '').trim();
  if (!val || val === 'MY_APP_URL') return undefined;
  try {
    return new URL(val).origin;
  } catch {
    return undefined;
  }
}

const appUrlOrigin = parseOrigin(process.env.APP_URL) || parseOrigin(process.env.BETTER_AUTH_URL);
const isHttpsEnv =
  Boolean(appUrlOrigin?.startsWith('https://')) ||
  process.env.NODE_ENV === 'production';

const allowedHosts = [
  'localhost:*',
  '127.0.0.1:*',
  '*.run.app',
  'pusatbisnis.uinsalatiga.ac.id',
  '*.uinsalatiga.ac.id',
];
if (appUrlOrigin) {
  try {
    allowedHosts.push(new URL(appUrlOrigin).host);
  } catch {
    // ignore invalid host
  }
}

export const auth = betterAuth({
  appName: 'CMS P2B UIN Salatiga',
  database: pool,
  secret: AUTH_SECRET,
  basePath: '/api/auth',
  baseURL: {
    allowedHosts: Array.from(new Set(allowedHosts)),
    fallback: appUrlOrigin || `http://localhost:${PORT}`,
    protocol: 'auto',
  },
  trustedOrigins: (request) => {
    const origins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://pusatbisnis.uinsalatiga.ac.id',
      'https://*.run.app',
      ...(appUrlOrigin ? [appUrlOrigin] : []),
    ];
    if (request) {
      const fwdHost = request.headers.get('x-forwarded-host');
      const host = request.headers.get('host');
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      if (fwdHost && /^[a-zA-Z0-9.-]+(?::\d+)?$/.test(fwdHost)) {
        origins.push(`${proto === 'http' ? 'http' : 'https'}://${fwdHost}`);
      }
      if (host && /^[a-zA-Z0-9.-]+(?::\d+)?$/.test(host)) {
        origins.push(`http://${host}`, `https://${host}`);
      }
    }
    return Array.from(new Set(origins));
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 6,
    password: {
      hash: async (password) => hashPassword(password),
      verify: async ({ hash, password }) => {
        if (
          hash.startsWith('$2a$') ||
          hash.startsWith('$2b$') ||
          hash.startsWith('$2y$')
        ) {
          return bcrypt.compare(password, hash);
        }
        return verifyPassword({ hash, password });
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 12, // 12 hours
    updateAge: 60 * 60, // refresh every 1 hour
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 64,
    }),
    admin({
      ac: cmsAc,
      roles: cmsRoles,
      defaultRole: 'editor_berita',
      adminRoles: ['super_admin'],
    }),
    bearer(),
  ],
  advanced: {
    trustedProxyHeaders: true,
    cookiePrefix: 'p2b_ba',
    useSecureCookies: isHttpsEnv,
    defaultCookieAttributes: isHttpsEnv
      ? {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          partitioned: true,
          path: '/',
        }
      : {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          path: '/',
        },
  },
});

export function buildFallbackEmailForUsername(rawUsername: string): string {
  const safe = rawUsername
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 48);
  return `${safe || 'user'}@cms.p2b.local`;
}

export async function runBetterAuthMigrationsAndSeed(): Promise<void> {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();

  // Check if Better Auth `user` table already has accounts
  const [baUserCountRows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM `user`'
  );
  const existingBaCount = Number(baUserCountRows[0]?.total || 0);

  // Migrate any legacy cms_users into Better Auth `user` & `account` tables idempotently
  const [legacyTableRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cms_users'`
  );
  const hasLegacyTable = Number(legacyTableRows[0]?.cnt || 0) > 0;

  if (hasLegacyTable) {
    const [legacyUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, display_name, password_hash, role, created_at FROM cms_users ORDER BY id ASC'
    );

    for (const legacy of legacyUsers) {
      const uname = String(legacy.username || '').trim().toLowerCase();
      if (!uname) continue;

      const [already] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM `user` WHERE username = ? LIMIT 1',
        [uname]
      );
      if (already.length > 0) continue;

      const userId = crypto.randomUUID();
      const email = uname.includes('@')
        ? uname
        : buildFallbackEmailForUsername(uname);
      const displayName = String(legacy.display_name || uname).trim() || uname;
      const roleKey = normalizeCmsRole(String(legacy.role || 'super_admin'));
      const now = legacy.created_at ? new Date(String(legacy.created_at)) : new Date();

      await pool.query(
        `INSERT INTO \`user\`
          (id, name, email, emailVerified, image, createdAt, updatedAt, username, displayUsername, role, banned)
         VALUES (?, ?, ?, 1, NULL, ?, ?, ?, ?, ?, 0)`,
        [
          userId,
          displayName,
          email,
          now,
          now,
          uname,
          String(legacy.username || uname).trim(),
          roleKey,
        ]
      );

      await pool.query(
        `INSERT INTO \`account\`
          (id, accountId, providerId, userId, password, createdAt, updatedAt)
         VALUES (?, ?, 'credential', ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          userId,
          userId,
          String(legacy.password_hash),
          now,
          now,
        ]
      );
    }
  }

  // Re-check user count after legacy migration; seed from env ONLY if configured
  if (existingBaCount === 0) {
    const [afterCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM `user`'
    );
    const totalAfterMigration = Number(afterCountRows[0]?.total || 0);
    const envAdminPassword = process.env.CMS_ADMIN_PASSWORD?.trim();

    if (totalAfterMigration === 0 && envAdminPassword) {
      const userId = crypto.randomUUID();
      const hashed = await hashPassword(envAdminPassword);
      const now = new Date();
      const adminUsername = 'admin';
      const adminEmail = buildFallbackEmailForUsername(adminUsername);

      await pool.query(
        `INSERT INTO \`user\`
          (id, name, email, emailVerified, image, createdAt, updatedAt, username, displayUsername, role, banned)
         VALUES (?, ?, ?, 1, NULL, ?, ?, ?, ?, 'super_admin', 0)`,
        [
          userId,
          'Super Admin P2B',
          adminEmail,
          now,
          now,
          adminUsername,
          adminUsername,
        ]
      );

      await pool.query(
        `INSERT INTO \`account\`
          (id, accountId, providerId, userId, password, createdAt, updatedAt)
         VALUES (?, ?, 'credential', ?, ?, ?, ?)`,
        [crypto.randomUUID(), userId, userId, hashed, now, now]
      );
    }
  }
}

export async function createFirstRunSuperAdmin(input: {
  username: string;
  displayName: string;
  email?: string;
  password: string;
}): Promise<{ id: string; username: string; displayName: string; email: string; role: 'super_admin' }> {
  const uname = input.username.trim().toLowerCase();
  const displayName = input.displayName.trim() || uname;
  const email =
    input.email && input.email.trim().includes('@')
      ? input.email.trim().toLowerCase()
      : buildFallbackEmailForUsername(uname);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [countRows] = await conn.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM `user` FOR UPDATE'
    );
    if (Number(countRows[0]?.total || 0) > 0) {
      await conn.rollback();
      throw new Error('ALREADY_INITIALIZED');
    }

    const userId = crypto.randomUUID();
    const hashed = await hashPassword(input.password);
    const now = new Date();

    await conn.query(
      `INSERT INTO \`user\`
        (id, name, email, emailVerified, image, createdAt, updatedAt, username, displayUsername, role, banned)
       VALUES (?, ?, ?, 1, NULL, ?, ?, ?, ?, 'super_admin', 0)`,
      [
        userId,
        displayName,
        email,
        now,
        now,
        uname,
        input.username.trim(),
      ]
    );

    await conn.query(
      `INSERT INTO \`account\`
        (id, accountId, providerId, userId, password, createdAt, updatedAt)
       VALUES (?, ?, 'credential', ?, ?, ?, ?)`,
      [crypto.randomUUID(), userId, userId, hashed, now, now]
    );

    await conn.commit();
    return {
      id: userId,
      username: uname,
      displayName,
      email,
      role: 'super_admin',
    };
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      // ignore rollback error
    }
    throw err;
  } finally {
    conn.release();
  }
}
