import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

export const cmsStatements = {
  ...defaultStatements,
  cms: [
    'overview',
    'homebuilder',
    'news',
    'media_read',
    'media_write',
    'logos',
    'kerjasama',
    'tarif',
    'magang',
    'settings',
  ],
} as const;

export const cmsAc = createAccessControl(cmsStatements);

export const superAdminRole = cmsAc.newRole({
  ...adminAc.statements,
  cms: [
    'overview',
    'homebuilder',
    'news',
    'media_read',
    'media_write',
    'logos',
    'kerjasama',
    'tarif',
    'magang',
    'settings',
  ],
});

export const adminRole = cmsAc.newRole({
  user: [],
  session: [],
  cms: [
    'overview',
    'homebuilder',
    'news',
    'media_read',
    'media_write',
    'logos',
    'kerjasama',
    'tarif',
    'magang',
    'settings',
  ],
});

export const editorBeritaRole = cmsAc.newRole({
  user: [],
  session: [],
  cms: ['overview', 'news', 'media_read'],
});

export const cmsRoles = {
  super_admin: superAdminRole,
  admin: adminRole,
  editor_berita: editorBeritaRole,
};

export type CmsRoleKey = keyof typeof cmsRoles;
export type CmsPermission = (typeof cmsStatements.cms)[number] | 'users';

export interface CmsRoleMeta {
  key: CmsRoleKey;
  label: string;
  shortLabel: string;
  description: string;
  capabilities: string[];
}

export const CMS_ROLE_META: Record<CmsRoleKey, CmsRoleMeta> = {
  super_admin: {
    key: 'super_admin',
    label: 'Super Admin',
    shortLabel: 'Super Admin',
    description:
      'Akses penuh ke seluruh modul konten, pengaturan sistem, serta manajemen pengguna dan peran.',
    capabilities: [
      'Kelola Pengguna, Peran & Reset Password',
      'Page Builder (Beranda & Profil)',
      'Berita, Kategori & Media Library',
      'Logo Mitra, Kerjasama, Tarif & Magang',
      'Pengaturan Umum & SEO',
    ],
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    shortLabel: 'Admin',
    description:
      'Mengelola seluruh konten website dan layanan operasional tanpa akses manajemen akun pengguna.',
    capabilities: [
      'Page Builder (Beranda & Profil)',
      'Berita, Kategori & Media Library',
      'Logo Mitra, Kerjasama, Tarif & Magang',
      'Pengaturan Umum Website',
    ],
  },
  editor_berita: {
    key: 'editor_berita',
    label: 'Editor Berita',
    shortLabel: 'Editor Berita',
    description:
      'Peran khusus redaksi untuk menulis, menyunting, menerbitkan berita, kategori, dan media artikel.',
    capabilities: [
      'Buat, Edit & Terbitkan Berita',
      'Kelola Kategori Berita',
      'Unggah Foto Sampul, Galeri & PDF Artikel',
      'Ubah Password Akun Sendiri',
    ],
  },
};

export const CMS_ROLE_LIST: CmsRoleMeta[] = [
  CMS_ROLE_META.super_admin,
  CMS_ROLE_META.admin,
  CMS_ROLE_META.editor_berita,
];

const ROLE_PERMISSION_SETS: Record<CmsRoleKey, Set<CmsPermission>> = {
  super_admin: new Set<CmsPermission>([
    'overview',
    'homebuilder',
    'news',
    'media_read',
    'media_write',
    'logos',
    'kerjasama',
    'tarif',
    'magang',
    'settings',
    'users',
  ]),
  admin: new Set<CmsPermission>([
    'overview',
    'homebuilder',
    'news',
    'media_read',
    'media_write',
    'logos',
    'kerjasama',
    'tarif',
    'magang',
    'settings',
  ]),
  editor_berita: new Set<CmsPermission>(['overview', 'news', 'media_read']),
};

export function normalizeCmsRole(rawRole?: string | null): CmsRoleKey {
  const cleaned = String(rawRole || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (
    cleaned === 'super_admin' ||
    cleaned === 'superadmin' ||
    cleaned === 'owner'
  ) {
    return 'super_admin';
  }
  if (cleaned === 'admin' || cleaned === 'administrator') {
    return 'admin';
  }
  if (
    cleaned === 'editor_berita' ||
    cleaned === 'editor' ||
    cleaned === 'penulis' ||
    cleaned === 'news_editor' ||
    cleaned === 'kontributor' ||
    cleaned === 'user'
  ) {
    return 'editor_berita';
  }
  return 'editor_berita';
}

export function getCmsRoleMeta(rawRole?: string | null): CmsRoleMeta {
  return CMS_ROLE_META[normalizeCmsRole(rawRole)];
}

export function hasCmsPermission(
  rawRole: string | null | undefined,
  permission: CmsPermission
): boolean {
  const roleKey = normalizeCmsRole(rawRole);
  return ROLE_PERMISSION_SETS[roleKey].has(permission);
}

export function hasAnyCmsPermission(
  rawRole: string | null | undefined,
  permissions: CmsPermission[]
): boolean {
  return permissions.some((perm) => hasCmsPermission(rawRole, perm));
}

export function getPermissionsForRole(rawRole?: string | null): CmsPermission[] {
  return Array.from(ROLE_PERMISSION_SETS[normalizeCmsRole(rawRole)]);
}
