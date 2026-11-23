import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import path from 'path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import mysql from 'mysql2/promise';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT || 3000);
const DB_NAME = process.env.DB_NAME || 'p2b';
const SESSION_COOKIE_NAME = 'p2b_cms_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const SESSION_SECRET =
  process.env.CMS_SESSION_SECRET ||
  crypto.createHash('sha256').update(`${process.env.DB_HOST || 'local'}:${DB_NAME}`).digest('hex');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 6,
  queueLimit: 0,
  connectTimeout: 10000,
});

const NEWS_PLACEHOLDER_LOGO =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/2022-Web-UIN-Logo-1.png';

const SEED_NEWS = [
  {
    slug: 'auditorium-modernisasi',
    category: 'Fasilitas',
    published_date: '14 Nov 2026',
    title: 'Modernisasi Sistem Akustik & Reservasi Digital Gedung Auditorium Salatiga',
    excerpt:
      'Peningkatan tata suara dan sistem pemesanan terpadu kini memudahkan penyelenggaraan seminar nasional hingga wisuda dengan konfirmasi jadwal real-time.',
    image_url:
      'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/09/auditorium-2con.png',
    is_logo_placeholder: 0,
    content: [
      'Gedung Auditorium Student Centre di Salatiga resmi mengoperasikan pembaruan panel akustik arsitektural serta sistem pencahayaan panggung hemat energi untuk mendukung beragam agenda akademik maupun publik.',
      'Melalui kanal Pelayanan Sewa Aset dan Tiket terpadu P2B UIN Salatiga, panitia acara maupun mitra eksternal kini dapat meninjau ketersediaan tanggal, kapasitas ruang, serta paket dukungan teknis secara transparan.',
      'Langkah ini menjadi bagian dari komitmen berkelanjutan dalam menghadirkan infrastruktur kegiatan berstandar profesional bagi civitas dan masyarakat luas.',
    ],
  },
  {
    slug: 'klinik-uin-saga',
    category: 'Layanan',
    published_date: '09 Nov 2026',
    title: 'Klinik Mitra Insani Perluas Jam Layanan Konsultasi & Pemeriksaan Preventif',
    excerpt:
      'Penambahan jadwal praktik dokter umum dan layanan skrining kesehatan berkala hadir untuk meningkatkan akses kesehatan civitas serta warga sekitar.',
    image_url: NEWS_PLACEHOLDER_LOGO,
    is_logo_placeholder: 1,
    content: [
      'Klinik Mitra Insani membuka perluasan jam operasional layanan rawat jalan dan pemeriksaan preventif guna menjawab meningkatnya kebutuhan konsultasi kesehatan harian.',
      'Area tunggu dan ruang konsultasi dirancang ulang dengan partisi kaca higienis dan alur pendaftaran digital agar pasien memperoleh pengalaman layanan yang tenang dan efisien.',
      'Civitas akademika maupun masyarakat umum dapat memanfaatkan layanan pemeriksaan dasar, konsultasi gizi, serta rujukan terstruktur setiap hari kerja.',
    ],
  },
  {
    slug: 'produk-air-mineral',
    category: 'Produk',
    published_date: '02 Nov 2026',
    title: 'Distribusi Air Mineral Kemasan Ramah Lingkungan Resmi Menjangkau Area Kantin',
    excerpt:
      'Inisiatif produksi air mineral berstandar higienis tinggi mulai dipasok ke seluruh unit kantin dan kegiatan resmi auditorium kampus.',
    image_url:
      'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp',
    is_logo_placeholder: 0,
    content: [
      'Unit produksi Air Mineral P2B UIN Salatiga resmi meluncurkan lini kemasan terbarunya yang mengedepankan proses filtrasi berlapis dan pengawasan mutu laboratorium berkala.',
      'Seluruh gerai Kantin serta penyelenggaraan acara di Gedung Auditorium kini memperoleh pasokan langsung dengan skema distribusi yang lebih ringkas dan terjangkau.',
      'Program ini turut mendukung pengurangan limbah kemasan sekali pakai melalui sistem pengumpulan ulang di titik-titik layanan utama.',
    ],
  },
  {
    slug: 'optimalisasi-sewa-aset',
    category: 'Fasilitas',
    published_date: '25 Okt 2026',
    title: 'Skema Baru Pelayanan Sewa Aset & Ruang Kolaborasi bagi Mitra Eksternal',
    excerpt:
      'P2B membuka akses pemanfaatan ruang seminar, studio, dan sarana pendukung kegiatan universitas dengan tarif PTN BLU yang transparan.',
    image_url: NEWS_PLACEHOLDER_LOGO,
    is_logo_placeholder: 1,
    content: [
      'Melalui unit Pelayanan Sewa Aset, P2B UIN Salatiga menata ulang katalog pemanfaatan ruang rapat eksekutif, aula seminar, dan fasilitas pendukung acara agar mudah diakses oleh lembaga mitra maupun komunitas profesional.',
      'Optimalisasi aset ini dirancang sesuai prinsip tata kelola Badan Layanan Umum (PTN BLU) sehingga memberikan nilai ekonomi berkelanjutan bagi penguatan kelembagaan universitas.',
      'Calon penyewa dapat mengajukan jadwal survei lokasi serta konsultasi kebutuhan perlengkapan secara langsung melalui tim layanan P2B.',
    ],
  },
  {
    slug: 'revitalisasi-kantin-sehat',
    category: 'Layanan',
    published_date: '18 Okt 2026',
    title: 'Revitalisasi Kantin Kampus Hadirkan Konsep Kuliner Higienis & Pembayaran Nontunai',
    excerpt:
      'Penataan ulang area kantin universitas kini mengintegrasikan standar sanitasi dapur modern dan sistem transaksi QRIS terpadu.',
    image_url: NEWS_PLACEHOLDER_LOGO,
    is_logo_placeholder: 1,
    content: [
      'Unit usaha Kantin di bawah pengelolaan P2B UIN Salatiga menyelesaikan penataan area duduk yang lebih terang dan nyaman bagi mahasiswa, dosen, serta tamu kampus.',
      'Setiap mitra tenant wajib memenuhi standar kebersihan penyajian makanan, sertifikasi halal, serta mendukung pembayaran digital agar antrean jam makan siang berlangsung lebih cepat.',
      'Kantin juga menjadi lokasi uji coba pemasaran produk UMKM binaan serta hasil inovasi mahasiswa.',
    ],
  },
  {
    slug: 'program-magang-tiket',
    category: 'Produk',
    published_date: '10 Okt 2026',
    title: 'Peluncuran Layanan Tiket Terpadu & Rekrutmen Magang Talenta Mahasiswa P2B',
    excerpt:
      'Integrasi loket tiket acara kampus membuka kesempatan magang profesional bagi mahasiswa bidang IT, komunikasi, pemasaran digital, dan akuntansi.',
    image_url: NEWS_PLACEHOLDER_LOGO,
    is_logo_placeholder: 1,
    content: [
      'P2B UIN Salatiga menghadirkan layanan Tiket terpadu untuk mendukung pengelolaan tiket kegiatan seminar, pertunjukan, hingga akses fasilitas kampus secara tertib.',
      'Sejalan dengan pilar Pengembangan Talenta dan Inovasi Mahasiswa, operasional layanan digital ini melibatkan mahasiswa magang aktif dari program studi teknologi informasi, komunikasi, bisnis, dan akuntansi.',
      'Melalui pengalaman langsung dalam unit bisnis nyata, mahasiswa memperoleh bekal kompetensi profesional sekaligus berkontribusi dalam ekosistem entrepreneurial university.',
    ],
  },
  {
    slug: 'kajian-unit-bisnis-blu',
    category: 'Fasilitas',
    published_date: '03 Okt 2026',
    title: 'Kajian Kelayakan Pengembangan Unit Bisnis Baru & Sarana Pendukung Kampus',
    excerpt:
      'Tim P2B UIN Salatiga menyusun peta jalan pengembangan unit bisnis baru berbasis tata kelola PTN BLU yang transparan dan berkelanjutan.',
    image_url: NEWS_PLACEHOLDER_LOGO,
    is_logo_placeholder: 1,
    content: [
      'Sebagai bagian dari penguatan kelembagaan PTN BLU, Pusat Pengembangan Bisnis (P2B) UIN Salatiga melaksanakan kajian kelayakan terhadap sejumlah potensi pengembangan unit bisnis baru di lingkungan kampus.',
      'Setiap rencana pembukaan layanan dan pemanfaatan sarana pendukung dikaji dari sisi manfaat akademik, proyeksi keberlanjutan ekonomi, serta kesesuaiannya dengan prinsip tata kelola bisnis yang baik.',
      'Hasil kajian ini menjadi dasar penyusunan standar operasional dan skema kerja sama strategis di tahun berjalan.',
    ],
  },
  {
    slug: 'forum-kemitraan-alumni',
    category: 'Layanan',
    published_date: '26 Sep 2026',
    title: 'Penguatan Kemitraan Strategis Bersama Industri, Pemerintah, dan Jaringan Alumni',
    excerpt:
      'P2B membuka forum kolaborasi lintas sektor untuk memperluas pemanfaatan layanan komersial serta proyek inovasi bersama sivitas akademika.',
    image_url: NEWS_PLACEHOLDER_LOGO,
    is_logo_placeholder: 1,
    content: [
      'Pusat Pengembangan Bisnis (P2B) UIN Salatiga menggelar pertemuan penjajakan kemitraan bersama perwakilan dunia usaha, instansi pemerintah daerah, dan ikatan alumni.',
      'Kolaborasi ini diarahkan pada pemanfaatan fasilitas kampus secara profesional, distribusi produk unit bisnis universitas, serta program pendampingan kewirausahaan bagi sivitas akademika.',
      'Melalui sinergi berkelanjutan, keberadaan P2B diharapkan memberi nilai tambah nyata bagi kemandirian universitas dan masyarakat luas.',
    ],
  },
  {
    slug: 'inkubasi-pemasaran-digital',
    category: 'Produk',
    published_date: '19 Sep 2026',
    title: 'Optimalisasi Pemasaran Digital Produk Unit Usaha P2B Bersama Mahasiswa Magang',
    excerpt:
      'Kolaborasi tim komunikasi dan teknologi informasi mahasiswa mendorong perluasan jangkauan informasi produk serta layanan komersial kampus.',
    image_url: NEWS_PLACEHOLDER_LOGO,
    is_logo_placeholder: 1,
    content: [
      'Unit layanan komersial P2B UIN Salatiga mengintegrasikan strategi komunikasi digital dalam memperkenalkan produk Air Mineral, layanan reservasi Gedung Auditorium, serta fasilitas Klinik Mitra Insani kepada publik.',
      'Kegiatan ini menjadi ruang pembelajaran praktik langsung bagi mahasiswa magang pada bidang pemasaran digital, teknologi informasi, komunikasi publik, bisnis, dan akuntansi.',
      'Pendekatan ini memperkuat budaya inovasi serta mempercepat transformasi layanan P2B yang responsif terhadap kebutuhan pengguna.',
    ],
  },
];

const SEED_PARTNER_LOGOS = [
  {
    name: 'UIN Salatiga',
    logo_url: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/2022-Web-UIN-Logo-1.png',
    link_url: 'https://uinsalatiga.ac.id',
    sort_order: 1,
  },
  {
    name: 'P2B UIN Salatiga',
    logo_url: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Logo.webp',
    link_url: '',
    sort_order: 2,
  },
  {
    name: 'Pusat Pengembangan Bisnis',
    logo_url: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2023/08/logo_ico_2.png',
    link_url: '',
    sort_order: 3,
  },
];

interface SessionPayload {
  userId: number;
  username: string;
  displayName: string;
  role: string;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  cmsUser?: SessionPayload;
}

function signSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as SessionPayload;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const pairs = cookieHeader.split(';');
    for (const pair of pairs) {
      const idx = pair.indexOf('=');
      if (idx === -1) continue;
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      if (key === SESSION_COOKIE_NAME) {
        return decodeURIComponent(val);
      }
    }
  }
  return null;
}

function requireCmsAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ ok: false, message: 'Sesi login tidak ditemukan.' });
    return;
  }
  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ ok: false, message: 'Sesi login tidak valid atau telah berakhir.' });
    return;
  }
  req.cmsUser = payload;
  next();
}

let dbReady = false;
let dbInitError: string | null = null;

async function ensureDatabaseReady(): Promise<void> {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    dbInitError = 'Variabel environment database belum dikonfigurasi.';
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        display_name VARCHAR(120) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(40) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(140) NOT NULL UNIQUE,
        category VARCHAR(32) NOT NULL DEFAULT 'Fasilitas',
        published_date VARCHAR(40) NOT NULL,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT NOT NULL,
        image_url TEXT NOT NULL,
        is_logo_placeholder TINYINT(1) NOT NULL DEFAULT 0,
        content_json LONGTEXT NOT NULL,
        content_html LONGTEXT NULL,
        gallery_json LONGTEXT NULL,
        attachments_json LONGTEXT NULL,
        is_published TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(
      'ALTER TABLE cms_news ADD COLUMN IF NOT EXISTS content_html LONGTEXT NULL AFTER content_json'
    );
    await pool.query(
      'ALTER TABLE cms_news ADD COLUMN IF NOT EXISTS gallery_json LONGTEXT NULL AFTER content_html'
    );
    await pool.query(
      'ALTER TABLE cms_news ADD COLUMN IF NOT EXISTS attachments_json LONGTEXT NULL AFTER gallery_json'
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_media (
        id VARCHAR(48) PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255) NULL,
        mime_type VARCHAR(120) NOT NULL,
        size_bytes INT NOT NULL,
        data LONGBLOB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(
      'ALTER TABLE cms_media ADD COLUMN IF NOT EXISTS alt_text VARCHAR(255) NULL AFTER original_name'
    );

    await pool.query('DROP TABLE IF EXISTS cms_contact_messages');
    await pool.query('DROP TABLE IF EXISTS cms_newsletter_subscribers');
    await pool.query('DROP TABLE IF EXISTS cms_org_members');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_news_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(80) NOT NULL UNIQUE,
        sort_order INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_partner_logos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        logo_url TEXT NOT NULL,
        link_url TEXT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_site_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Seed initial admin user if empty
    const [userCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM cms_users'
    );
    if (Number(userCountRows[0]?.total || 0) === 0) {
      const initialPassword =
        process.env.CMS_ADMIN_PASSWORD || process.env.DB_PASSWORD || 'P2bSalatiga#2026';
      const hash = await bcrypt.hash(initialPassword, 10);
      await pool.query(
        'INSERT INTO cms_users (username, display_name, password_hash, role) VALUES (?, ?, ?, ?)',
        ['admin', 'Administrator P2B', hash, 'Super Admin']
      );
    }

    // Seed news if empty
    const [newsCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM cms_news'
    );
    if (Number(newsCountRows[0]?.total || 0) === 0) {
      for (let i = 0; i < SEED_NEWS.length; i++) {
        const item = SEED_NEWS[i];
        await pool.query(
          `INSERT INTO cms_news
            (slug, category, published_date, title, excerpt, image_url, is_logo_placeholder, content_json, is_published, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          [
            item.slug,
            item.category,
            item.published_date,
            item.title,
            item.excerpt,
            item.image_url,
            item.is_logo_placeholder,
            JSON.stringify(item.content),
            i + 1,
          ]
        );
      }
    }

    // Seed news categories if empty and sync existing news categories
    const [catCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM cms_news_categories'
    );
    if (Number(catCountRows[0]?.total || 0) === 0) {
      const defaults = ['Fasilitas', 'Layanan', 'Produk'];
      for (let i = 0; i < defaults.length; i++) {
        await pool.query(
          'INSERT IGNORE INTO cms_news_categories (name, sort_order) VALUES (?, ?)',
          [defaults[i], i + 1]
        );
      }
    }
    const [existingNewsCats] = await pool.query<RowDataPacket[]>(
      'SELECT DISTINCT category FROM cms_news WHERE category IS NOT NULL AND TRIM(category) != ""'
    );
    for (const row of existingNewsCats) {
      const catName = String(row.category).trim().slice(0, 80);
      if (catName) {
        await pool.query(
          'INSERT IGNORE INTO cms_news_categories (name, sort_order) VALUES (?, 99)',
          [catName]
        );
      }
    }

    // Seed partner logos if empty
    const [logoCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM cms_partner_logos'
    );
    if (Number(logoCountRows[0]?.total || 0) === 0) {
      for (const logo of SEED_PARTNER_LOGOS) {
        await pool.query(
          `INSERT INTO cms_partner_logos (name, logo_url, link_url, sort_order, is_active)
           VALUES (?, ?, ?, ?, 1)`,
          [logo.name, logo.logo_url, logo.link_url || null, logo.sort_order]
        );
      }
    }

    // Sync official clinic name "Klinik Mitra Insani" in seeded news
    await pool.query(
      "UPDATE cms_news SET title = REPLACE(title, 'Klinik UIN SAGA', 'Klinik Mitra Insani'), excerpt = REPLACE(excerpt, 'Klinik UIN SAGA', 'Klinik Mitra Insani'), content_json = REPLACE(content_json, 'Klinik UIN SAGA', 'Klinik Mitra Insani') WHERE title LIKE '%Klinik UIN SAGA%' OR excerpt LIKE '%Klinik UIN SAGA%' OR content_json LIKE '%Klinik UIN SAGA%'"
    );

    dbReady = true;
    dbInitError = null;
  } catch (err) {
    dbInitError = err instanceof Error ? err.message : 'Gagal menghubungkan ke database.';
    dbReady = false;
    console.error('[CMS DB Init Error]:', dbInitError);
  }
}

function htmlToParagraphs(html: string, fallbackText: string): string[] {
  const plain = html
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
  const parts = plain
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [fallbackText];
}

function mapNewsRow(row: RowDataPacket) {
  let content: string[] = [];
  try {
    const parsed = JSON.parse(String(row.content_json || '[]'));
    if (Array.isArray(parsed)) {
      content = parsed.map((p) => String(p));
    }
  } catch {
    content = [String(row.content_json || '')];
  }

  let gallery: { url: string; caption?: string }[] = [];
  if (row.gallery_json) {
    try {
      const parsedGallery = JSON.parse(String(row.gallery_json));
      if (Array.isArray(parsedGallery)) {
        gallery = parsedGallery
          .filter((g) => g && typeof g.url === 'string' && g.url.trim())
          .map((g) => ({
            url: String(g.url).trim(),
            caption: g.caption ? String(g.caption).trim() : '',
          }));
      }
    } catch {
      gallery = [];
    }
  }

  let attachments: {
    id: string;
    title: string;
    url: string;
    fileName?: string;
    sizeBytes?: number;
  }[] = [];
  if (row.attachments_json) {
    try {
      const parsedAtt = JSON.parse(String(row.attachments_json));
      if (Array.isArray(parsedAtt)) {
        attachments = parsedAtt
          .filter((a) => a && typeof a.url === 'string' && a.url.trim())
          .map((a, idx) => ({
            id: String(a.id || `att-${idx + 1}`),
            title: String(a.title || a.fileName || `Lampiran PDF ${idx + 1}`).trim(),
            url: String(a.url).trim(),
            fileName: a.fileName ? String(a.fileName) : undefined,
            sizeBytes: typeof a.sizeBytes === 'number' ? a.sizeBytes : undefined,
          }));
      }
    } catch {
      attachments = [];
    }
  }

  return {
    dbId: Number(row.id),
    id: String(row.slug),
    category: String(row.category) as 'Fasilitas' | 'Layanan' | 'Produk',
    date: String(row.published_date),
    title: String(row.title),
    excerpt: String(row.excerpt),
    image: String(row.image_url),
    isLogoPlaceholder: Boolean(row.is_logo_placeholder),
    isPublished: Boolean(row.is_published),
    sortOrder: Number(row.sort_order),
    content,
    contentHtml: row.content_html ? String(row.content_html) : undefined,
    gallery,
    attachments,
  };
}

function mapPartnerLogoRow(row: RowDataPacket) {
  return {
    id: Number(row.id),
    name: String(row.name),
    logoUrl: String(row.logo_url),
    linkUrl: row.link_url ? String(row.link_url) : '',
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
  };
}

function slugifyTitle(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${base || 'berita-p2b'}-${Date.now().toString(36).slice(-4)}`;
}

function formatDateIndonesian(dateInput: Date): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(dateInput);
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  const monthNum = Number(parts.find((p) => p.type === 'month')?.value || '1');
  const year = parts.find((p) => p.type === 'year')?.value || String(dateInput.getFullYear());
  const month = months[monthNum - 1] || 'Jan';
  return `${day} ${month} ${year}`;
}

let cmsRevision = 1;
let lastMutationAt = new Date().toISOString();
const realtimeClients = new Set<WebSocket>();

async function fetchSiteSettingsMap(): Promise<Record<string, string>> {
  if (!dbReady) return {};
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT setting_key, setting_value FROM cms_site_settings'
    );
    const result: Record<string, string> = {};
    for (const row of rows) {
      const key = String(row.setting_key || '').trim();
      if (key) {
        result[key] = String(row.setting_value ?? '');
      }
    }
    return result;
  } catch {
    return {};
  }
}

async function getPublicDataVersion(): Promise<{
  version: string;
  revision: number;
  updatedAt: string;
}> {
  if (!dbReady) {
    return {
      version: `mem-${cmsRevision}`,
      revision: cmsRevision,
      updatedAt: lastMutationAt,
    };
  }
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        (SELECT COUNT(*) FROM cms_news) AS news_count,
        (SELECT COALESCE(MAX(updated_at), '1970-01-01') FROM cms_news) AS news_ts,
        (SELECT COUNT(*) FROM cms_news_categories) AS cat_count,
        (SELECT COALESCE(MAX(created_at), '1970-01-01') FROM cms_news_categories) AS cat_ts,
        (SELECT COUNT(*) FROM cms_partner_logos) AS logo_count,
        (SELECT COALESCE(MAX(updated_at), '1970-01-01') FROM cms_partner_logos) AS logo_ts,
        (SELECT COUNT(*) FROM cms_site_settings) AS settings_count,
        (SELECT COALESCE(MAX(updated_at), '1970-01-01') FROM cms_site_settings) AS settings_ts,
        (SELECT COUNT(*) FROM cms_media) AS media_count
    `);
    const r = rows[0] || {};
    const signature = [
      r.news_count,
      r.news_ts,
      r.cat_count,
      r.cat_ts,
      r.logo_count,
      r.logo_ts,
      r.settings_count,
      r.settings_ts,
      r.media_count,
    ].join('|');
    const hash = crypto.createHash('sha1').update(signature).digest('hex').slice(0, 12);
    return {
      version: `${cmsRevision}-${hash}`,
      revision: cmsRevision,
      updatedAt: lastMutationAt,
    };
  } catch {
    return {
      version: `rev-${cmsRevision}`,
      revision: cmsRevision,
      updatedAt: lastMutationAt,
    };
  }
}

async function notifyCmsDataCommitted(
  domain: 'news' | 'categories' | 'logos' | 'media' | 'settings',
  action: string,
  entityId?: string | number
): Promise<void> {
  cmsRevision += 1;
  lastMutationAt = new Date().toISOString();
  const versionInfo = await getPublicDataVersion();
  const payload = JSON.stringify({
    type: 'cms:committed',
    domain,
    action,
    entityId: entityId ?? null,
    version: versionInfo.version,
    revision: versionInfo.revision,
    timestamp: versionInfo.updatedAt,
  });

  for (const client of realtimeClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

async function startServer() {
  await ensureDatabaseReady();

  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws/realtime' });

  const heartbeatInterval = setInterval(() => {
    for (const client of realtimeClients) {
      const tracked = client as WebSocket & { isAlive?: boolean };
      if (tracked.isAlive === false) {
        realtimeClients.delete(client);
        client.terminate();
        continue;
      }
      tracked.isAlive = false;
      client.ping();
    }
  }, 25000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (ws) => {
    const tracked = ws as WebSocket & { isAlive?: boolean };
    tracked.isAlive = true;
    realtimeClients.add(ws);

    ws.on('pong', () => {
      tracked.isAlive = true;
    });

    ws.on('close', () => {
      realtimeClients.delete(ws);
    });

    ws.on('error', () => {
      realtimeClients.delete(ws);
    });

    void getPublicDataVersion().then((versionInfo) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'realtime:connected',
            version: versionInfo.version,
            revision: versionInfo.revision,
            timestamp: versionInfo.updatedAt,
          })
        );
      }
    });
  });

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '50mb' }));

  const ALLOWED_UPLOAD_MIMES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
  ]);

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 12 * 1024 * 1024 },
  });

  // Serve uploaded photos and PDFs stored in MariaDB
  const serveMediaHandler = async (req: Request, res: Response) => {
    const mediaId = String(req.params.id || '').trim();
    if (!mediaId) {
      res.status(404).send('Media tidak ditemukan.');
      return;
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT original_name, mime_type, size_bytes, data FROM cms_media WHERE id = ? LIMIT 1',
        [mediaId]
      );
      if (rows.length === 0) {
        res.status(404).send('Media tidak ditemukan.');
        return;
      }
      const row = rows[0];
      const buffer = Buffer.isBuffer(row.data)
        ? row.data
        : Buffer.from(row.data as Uint8Array);
      const safeName = String(row.original_name || 'file').replace(/"/g, '');
      const isDownload = req.query.download === '1';

      res.setHeader('Content-Type', String(row.mime_type || 'application/octet-stream'));
      res.setHeader('Content-Length', String(buffer.length));
      res.setHeader(
        'Content-Disposition',
        `${isDownload ? 'attachment' : 'inline'}; filename="${safeName}"`
      );
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(buffer);
    } catch {
      res.status(500).send('Gagal memuat media.');
    }
  };

  app.get('/api/media/:id', serveMediaHandler);
  app.get('/api/media/:id/:filename', serveMediaHandler);

  // Authenticated CMS upload endpoint for photos and PDF documents
  app.post('/api/cms/upload', requireCmsAuth, (req: AuthenticatedRequest, res: Response) => {
    upload.single('file')(req, res, async (uploadErr: unknown) => {
      if (uploadErr) {
        const errMsg =
          uploadErr instanceof Error
            ? uploadErr.message
            : 'Gagal mengunggah berkas.';
        res.status(400).json({
          ok: false,
          message: errMsg.includes('File too large')
            ? 'Ukuran berkas maksimal 12 MB.'
            : errMsg,
        });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ ok: false, message: 'Tidak ada berkas yang dipilih.' });
        return;
      }

      if (!ALLOWED_UPLOAD_MIMES.has(file.mimetype)) {
        res.status(400).json({
          ok: false,
          message: 'Format berkas harus berupa gambar (JPG/PNG/WebP/GIF) atau PDF.',
        });
        return;
      }

      const id = crypto.randomBytes(12).toString('hex');
      const cleanName =
        path
          .basename(file.originalname || 'dokumen')
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .slice(0, 120) || 'berkas';
      const altText =
        typeof req.body?.altText === 'string'
          ? req.body.altText.trim().slice(0, 255)
          : '';

      try {
        await pool.query(
          'INSERT INTO cms_media (id, original_name, alt_text, mime_type, size_bytes, data) VALUES (?, ?, ?, ?, ?, ?)',
          [id, cleanName, altText || null, file.mimetype, file.size, file.buffer]
        );
        await notifyCmsDataCommitted('media', 'uploaded', id);

        res.status(201).json({
          ok: true,
          media: {
            id,
            url: `/api/media/${id}/${encodeURIComponent(cleanName)}`,
            fileName: file.originalname,
            altText,
            mimeType: file.mimetype,
            sizeBytes: file.size,
          },
        });
      } catch (err) {
        res.status(500).json({
          ok: false,
          message:
            err instanceof Error
              ? err.message
              : 'Gagal menyimpan berkas ke database.',
        });
      }
    });
  });

  // CMS Media Library Management: List, Export, Import, Update (metadata or file replacement), Delete
  app.get('/api/cms/media', requireCmsAuth, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, original_name, alt_text, mime_type, size_bytes, created_at FROM cms_media ORDER BY created_at DESC'
      );
      res.json({
        ok: true,
        items: rows.map((r) => {
          const id = String(r.id);
          const originalName = String(r.original_name);
          return {
            id,
            originalName,
            altText: String(r.alt_text || ''),
            mimeType: String(r.mime_type),
            sizeBytes: Number(r.size_bytes),
            url: `/api/media/${id}/${encodeURIComponent(originalName)}`,
            createdAt: String(r.created_at),
          };
        }),
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat pustaka media.',
      });
    }
  });

  app.get('/api/cms/media/export', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const idsParam = typeof req.query.ids === 'string' ? req.query.ids.trim() : '';
      const idList = idsParam
        ? idsParam.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      let rows: RowDataPacket[];
      if (idList.length > 0) {
        const placeholders = idList.map(() => '?').join(',');
        const [result] = await pool.query<RowDataPacket[]>(
          `SELECT id, original_name, alt_text, mime_type, size_bytes, data, created_at FROM cms_media WHERE id IN (${placeholders}) ORDER BY created_at DESC`,
          idList
        );
        rows = result;
      } else {
        const [result] = await pool.query<RowDataPacket[]>(
          'SELECT id, original_name, alt_text, mime_type, size_bytes, data, created_at FROM cms_media ORDER BY created_at DESC'
        );
        rows = result;
      }

      const items = rows.map((r) => {
        const buf = Buffer.isBuffer(r.data) ? r.data : Buffer.from(r.data as Uint8Array);
        return {
          id: String(r.id),
          originalName: String(r.original_name),
          altText: String(r.alt_text || ''),
          mimeType: String(r.mime_type),
          sizeBytes: Number(r.size_bytes),
          createdAt: String(r.created_at),
          dataBase64: buf.toString('base64'),
        };
      });

      const dateStamp = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="p2b-media-export-${dateStamp}.json"`
      );
      res.send(
        JSON.stringify({
          format: 'p2b-media-bundle-v1',
          exportedAt: new Date().toISOString(),
          count: items.length,
          items,
        })
      );
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal mengekspor media.',
      });
    }
  });

  app.post('/api/cms/media/import', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { items, mode } = req.body as {
      mode?: 'upsert' | 'skip_existing';
      items?: {
        id?: string;
        originalName?: string;
        altText?: string;
        mimeType?: string;
        sizeBytes?: number;
        dataBase64?: string;
      }[];
    };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ ok: false, message: 'Data media impor kosong atau tidak valid.' });
      return;
    }

    let importedCount = 0;
    let skippedCount = 0;

    try {
      for (const entry of items) {
        if (!entry || typeof entry.dataBase64 !== 'string' || !entry.dataBase64.trim()) {
          skippedCount++;
          continue;
        }
        const mimeType = String(entry.mimeType || 'application/octet-stream');
        if (!ALLOWED_UPLOAD_MIMES.has(mimeType)) {
          skippedCount++;
          continue;
        }
        const buf = Buffer.from(entry.dataBase64, 'base64');
        if (buf.length === 0 || buf.length > 12 * 1024 * 1024) {
          skippedCount++;
          continue;
        }

        const id =
          typeof entry.id === 'string' && /^[a-zA-Z0-9_-]{4,48}$/.test(entry.id)
            ? entry.id
            : crypto.randomBytes(12).toString('hex');

        const cleanName =
          path
            .basename(String(entry.originalName || 'berkas'))
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .slice(0, 120) || 'berkas';
        const altText = entry.altText ? String(entry.altText).trim().slice(0, 255) : null;

        if (mode === 'skip_existing') {
          const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM cms_media WHERE id = ? LIMIT 1',
            [id]
          );
          if (existing.length > 0) {
            skippedCount++;
            continue;
          }
        }

        await pool.query(
          `INSERT INTO cms_media (id, original_name, alt_text, mime_type, size_bytes, data)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             original_name = VALUES(original_name),
             alt_text = VALUES(alt_text),
             mime_type = VALUES(mime_type),
             size_bytes = VALUES(size_bytes),
             data = VALUES(data)`,
          [id, cleanName, altText, mimeType, buf.length, buf]
        );
        importedCount++;
      }

      if (importedCount > 0) {
        await notifyCmsDataCommitted('media', 'imported');
      }
      res.json({ ok: true, importedCount, skippedCount });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal mengimpor media.',
      });
    }
  });

  app.put('/api/cms/media/:id', requireCmsAuth, (req: AuthenticatedRequest, res: Response) => {
    const mediaId = String(req.params.id || '').trim();
    if (!mediaId) {
      res.status(400).json({ ok: false, message: 'ID media tidak valid.' });
      return;
    }

    const contentType = req.headers['content-type'] || '';
    const processUpdate = async (
      nextNameInput?: string,
      nextAltInput?: string,
      replacementFile?: Express.Multer.File
    ) => {
      try {
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT id, original_name, alt_text, mime_type, size_bytes, created_at FROM cms_media WHERE id = ? LIMIT 1',
          [mediaId]
        );
        if (rows.length === 0) {
          res.status(404).json({ ok: false, message: 'Media tidak ditemukan.' });
          return;
        }
        const current = rows[0];
        const rawName =
          nextNameInput?.trim() ||
          replacementFile?.originalname ||
          String(current.original_name);
        const cleanName =
          path
            .basename(rawName)
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .slice(0, 120) || String(current.original_name);
        const nextAlt =
          typeof nextAltInput === 'string'
            ? nextAltInput.trim().slice(0, 255) || null
            : (current.alt_text ? String(current.alt_text) : null);

        if (replacementFile) {
          if (!ALLOWED_UPLOAD_MIMES.has(replacementFile.mimetype)) {
            res.status(400).json({
              ok: false,
              message: 'Format berkas pengganti harus berupa gambar atau PDF.',
            });
            return;
          }
          await pool.query(
            'UPDATE cms_media SET original_name = ?, alt_text = ?, mime_type = ?, size_bytes = ?, data = ? WHERE id = ?',
            [
              cleanName,
              nextAlt,
              replacementFile.mimetype,
              replacementFile.size,
              replacementFile.buffer,
              mediaId,
            ]
          );
        } else {
          await pool.query(
            'UPDATE cms_media SET original_name = ?, alt_text = ? WHERE id = ?',
            [cleanName, nextAlt, mediaId]
          );
        }

        const [updatedRows] = await pool.query<RowDataPacket[]>(
          'SELECT id, original_name, alt_text, mime_type, size_bytes, created_at FROM cms_media WHERE id = ? LIMIT 1',
          [mediaId]
        );
        const updated = updatedRows[0];
        await notifyCmsDataCommitted('media', 'updated', mediaId);
        res.json({
          ok: true,
          item: {
            id: String(updated.id),
            originalName: String(updated.original_name),
            altText: String(updated.alt_text || ''),
            mimeType: String(updated.mime_type),
            sizeBytes: Number(updated.size_bytes),
            url: `/api/media/${mediaId}/${encodeURIComponent(String(updated.original_name))}`,
            createdAt: String(updated.created_at),
          },
        });
      } catch (err) {
        res.status(500).json({
          ok: false,
          message: err instanceof Error ? err.message : 'Gagal memperbarui media.',
        });
      }
    };

    if (contentType.includes('multipart/form-data')) {
      upload.single('file')(req, res, (uploadErr: unknown) => {
        if (uploadErr) {
          res.status(400).json({
            ok: false,
            message:
              uploadErr instanceof Error ? uploadErr.message : 'Gagal memproses berkas.',
          });
          return;
        }
        const body = req.body as { originalName?: string; altText?: string };
        void processUpdate(body?.originalName, body?.altText, req.file);
      });
    } else {
      const body = req.body as { originalName?: string; altText?: string };
      void processUpdate(body?.originalName, body?.altText);
    }
  });

  app.delete('/api/cms/media/:id', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const mediaId = String(req.params.id || '').trim();
    if (!mediaId) {
      res.status(400).json({ ok: false, message: 'ID media tidak valid.' });
      return;
    }
    try {
      await pool.query('DELETE FROM cms_media WHERE id = ?', [mediaId]);
      await notifyCmsDataCommitted('media', 'deleted', mediaId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus media.',
      });
    }
  });

  // Lightweight public version endpoint for polling & reconnect reconciliation
  app.get('/api/public/version', async (_req: Request, res: Response) => {
    if (!dbReady) {
      await ensureDatabaseReady();
    }
    res.setHeader('Cache-Control', 'no-store');
    const versionInfo = await getPublicDataVersion();
    res.json({
      ok: true,
      dbReady,
      ...versionInfo,
    });
  });

  // Public bootstrap (news + site settings)
  app.get('/api/public/bootstrap', async (_req: Request, res: Response) => {
    if (!dbReady) {
      await ensureDatabaseReady();
    }
    if (!dbReady) {
      res.status(503).json({
        ok: false,
        message: 'Database belum terhubung, menggunakan konten cadangan.',
      });
      return;
    }

    try {
      res.setHeader('Cache-Control', 'no-store');
      const [newsRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_news WHERE is_published = 1 ORDER BY sort_order ASC, id DESC'
      );
      const [categoryRows] = await pool.query<RowDataPacket[]>(
        'SELECT id, name, sort_order FROM cms_news_categories ORDER BY sort_order ASC, id ASC'
      );
      const [logoRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_partner_logos WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
      );
      const [settings, versionInfo] = await Promise.all([
        fetchSiteSettingsMap(),
        getPublicDataVersion(),
      ]);

      res.json({
        ok: true,
        version: versionInfo.version,
        revision: versionInfo.revision,
        news: newsRows.map(mapNewsRow),
        settings,
        partnerLogos: logoRows.map(mapPartnerLogoRow),
        categories: categoryRows.map((c) => ({
          id: Number(c.id),
          name: String(c.name),
          sortOrder: Number(c.sort_order),
        })),
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat konten.',
      });
    }
  });

  // CMS Authentication
  app.post('/api/cms/login', async (req: Request, res: Response) => {
    if (!dbReady) {
      await ensureDatabaseReady();
    }
    if (!dbReady) {
      res.status(503).json({
        ok: false,
        message: `Database tidak dapat diakses: ${dbInitError || 'Periksa koneksi tunnel MariaDB.'}`,
      });
      return;
    }

    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username?.trim() || !password) {
      res.status(400).json({ ok: false, message: 'Username dan password wajib diisi.' });
      return;
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, username, display_name, password_hash, role FROM cms_users WHERE username = ? LIMIT 1',
        [username.trim()]
      );

      if (rows.length === 0) {
        res.status(401).json({ ok: false, message: 'Username atau password salah.' });
        return;
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, String(user.password_hash));
      if (!match) {
        res.status(401).json({ ok: false, message: 'Username atau password salah.' });
        return;
      }

      const token = signSessionToken({
        userId: Number(user.id),
        username: String(user.username),
        displayName: String(user.display_name),
        role: String(user.role),
      });

      const isHttps =
        req.secure || req.headers['x-forwarded-proto'] === 'https';

      res.cookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: isHttps ? 'none' : 'lax',
        secure: isHttps,
        maxAge: SESSION_TTL_MS,
        path: '/',
      });

      res.json({
        ok: true,
        token,
        user: {
          id: Number(user.id),
          username: String(user.username),
          displayName: String(user.display_name),
          role: String(user.role),
        },
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memproses login.',
      });
    }
  });

  app.post('/api/cms/logout', (req: Request, res: Response) => {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: isHttps ? 'none' : 'lax',
      secure: isHttps,
      path: '/',
    });
    res.json({ ok: true });
  });

  app.get('/api/cms/me', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [verRows] = await pool.query<RowDataPacket[]>('SELECT VERSION() AS ver');
      res.json({
        ok: true,
        user: req.cmsUser,
        database: {
          connected: true,
          host: process.env.DB_HOST || '-',
          port: process.env.DB_PORT || '-',
          name: DB_NAME,
          version: String(verRows[0]?.ver || 'MariaDB'),
        },
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memeriksa sesi.',
      });
    }
  });

  app.put('/api/cms/password', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({
        ok: false,
        message: 'Password baru minimal 6 karakter dan password lama wajib diisi.',
      });
      return;
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT password_hash FROM cms_users WHERE id = ? LIMIT 1',
        [req.cmsUser?.userId]
      );
      if (rows.length === 0) {
        res.status(404).json({ ok: false, message: 'Akun tidak ditemukan.' });
        return;
      }
      const valid = await bcrypt.compare(currentPassword, String(rows[0].password_hash));
      if (!valid) {
        res.status(401).json({ ok: false, message: 'Password saat ini tidak sesuai.' });
        return;
      }
      const nextHash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE cms_users SET password_hash = ? WHERE id = ?', [
        nextHash,
        req.cmsUser?.userId,
      ]);
      res.json({ ok: true, message: 'Password berhasil diperbarui.' });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui password.',
      });
    }
  });

  // CMS Overview stats
  app.get('/api/cms/overview', requireCmsAuth, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [[newsCount]] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total, SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) AS published FROM cms_news'
      );

      res.json({
        ok: true,
        stats: {
          totalNews: Number(newsCount?.total || 0),
          publishedNews: Number(newsCount?.published || 0),
        },
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal mengambil ringkasan CMS.',
      });
    }
  });

  // CMS News CRUD
  app.get('/api/cms/news', requireCmsAuth, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_news ORDER BY sort_order ASC, id DESC'
      );
      res.json({ ok: true, items: rows.map(mapNewsRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat berita CMS.',
      });
    }
  });

  // Export complete News bundle (article contents + all referenced cms_media binaries)
  app.get('/api/cms/news/export', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const idParam = req.query.id ? Number(req.query.id) : null;
      const idsParam = typeof req.query.ids === 'string' ? req.query.ids.trim() : '';
      const idList = idsParam
        ? idsParam
            .split(',')
            .map((v) => Number(v.trim()))
            .filter((n) => Number.isFinite(n) && n > 0)
        : [];

      let newsRows: RowDataPacket[];
      if (idList.length > 0) {
        const placeholders = idList.map(() => '?').join(',');
        const [rows] = await pool.query<RowDataPacket[]>(
          `SELECT * FROM cms_news WHERE id IN (${placeholders}) ORDER BY sort_order ASC, id DESC`,
          idList
        );
        newsRows = rows;
      } else if (idParam && Number.isFinite(idParam)) {
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT * FROM cms_news WHERE id = ? ORDER BY sort_order ASC, id DESC',
          [idParam]
        );
        newsRows = rows;
      } else {
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT * FROM cms_news ORDER BY sort_order ASC, id DESC'
        );
        newsRows = rows;
      }

      const mappedNews = newsRows.map(mapNewsRow);
      const referencedIds = new Set<string>();
      const mediaIdRegex = /\/api\/media\/([a-zA-Z0-9_-]+)/g;

      const collectFromText = (text?: string) => {
        if (!text) return;
        let match: RegExpExecArray | null;
        mediaIdRegex.lastIndex = 0;
        while ((match = mediaIdRegex.exec(text)) !== null) {
          if (match[1]) referencedIds.add(match[1]);
        }
      };

      for (const item of mappedNews) {
        collectFromText(item.image);
        collectFromText(item.contentHtml);
        for (const g of item.gallery || []) collectFromText(g.url);
        for (const a of item.attachments || []) collectFromText(a.url);
      }

      let mediaItems: {
        id: string;
        originalName: string;
        altText: string;
        mimeType: string;
        sizeBytes: number;
        createdAt: string;
        dataBase64: string;
      }[] = [];

      if (referencedIds.size > 0) {
        const ids = Array.from(referencedIds);
        const placeholders = ids.map(() => '?').join(',');
        const [mediaRows] = await pool.query<RowDataPacket[]>(
          `SELECT id, original_name, alt_text, mime_type, size_bytes, data, created_at FROM cms_media WHERE id IN (${placeholders})`,
          ids
        );
        mediaItems = mediaRows.map((r) => {
          const buf = Buffer.isBuffer(r.data) ? r.data : Buffer.from(r.data as Uint8Array);
          return {
            id: String(r.id),
            originalName: String(r.original_name),
            altText: String(r.alt_text || ''),
            mimeType: String(r.mime_type),
            sizeBytes: Number(r.size_bytes),
            createdAt: String(r.created_at),
            dataBase64: buf.toString('base64'),
          };
        });
      }

      const dateStamp = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="p2b-berita-lengkap-${dateStamp}.json"`
      );
      res.send(
        JSON.stringify({
          format: 'p2b-news-bundle-v1',
          exportedAt: new Date().toISOString(),
          newsCount: mappedNews.length,
          mediaCount: mediaItems.length,
          news: mappedNews,
          media: mediaItems,
        })
      );
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal mengekspor berita dan media.',
      });
    }
  });

  // Import complete News bundle (restores referenced media first, then upserts/inserts articles)
  app.post('/api/cms/news/import', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { news, media, mode } = req.body as {
      mode?: 'upsert' | 'skip_existing';
      news?: {
        id?: string;
        slug?: string;
        category?: string;
        date?: string;
        title?: string;
        excerpt?: string;
        image?: string;
        isLogoPlaceholder?: boolean;
        content?: string[];
        contentHtml?: string;
        gallery?: { url: string; caption?: string }[];
        attachments?: {
          id: string;
          title: string;
          url: string;
          fileName?: string;
          sizeBytes?: number;
        }[];
        isPublished?: boolean;
        sortOrder?: number;
      }[];
      media?: {
        id?: string;
        originalName?: string;
        altText?: string;
        mimeType?: string;
        dataBase64?: string;
      }[];
    };

    if (!Array.isArray(news) || news.length === 0) {
      res.status(400).json({ ok: false, message: 'Berkas impor berita kosong atau format tidak sesuai.' });
      return;
    }

    let importedMedia = 0;
    let importedNews = 0;
    let skippedNews = 0;

    try {
      if (Array.isArray(media)) {
        for (const m of media) {
          if (!m || !m.id || typeof m.dataBase64 !== 'string' || !m.dataBase64.trim()) {
            continue;
          }
          const mimeType = String(m.mimeType || 'application/octet-stream');
          if (!ALLOWED_UPLOAD_MIMES.has(mimeType)) continue;
          const buf = Buffer.from(m.dataBase64, 'base64');
          if (buf.length === 0 || buf.length > 12 * 1024 * 1024) continue;
          const cleanName =
            path
              .basename(String(m.originalName || 'berkas'))
              .replace(/[^a-zA-Z0-9._-]/g, '_')
              .slice(0, 120) || 'berkas';
          const altText = m.altText ? String(m.altText).trim().slice(0, 255) : null;

          await pool.query(
            `INSERT INTO cms_media (id, original_name, alt_text, mime_type, size_bytes, data)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               original_name = VALUES(original_name),
               alt_text = VALUES(alt_text),
               mime_type = VALUES(mime_type),
               size_bytes = VALUES(size_bytes),
               data = VALUES(data)`,
            [String(m.id).slice(0, 48), cleanName, altText, mimeType, buf.length, buf]
          );
          importedMedia++;
        }
      }

      for (let i = 0; i < news.length; i++) {
        const entry = news[i];
        if (!entry || !entry.title?.trim() || !entry.excerpt?.trim()) {
          skippedNews++;
          continue;
        }
        const slug = String(entry.id || entry.slug || slugifyTitle(entry.title)).trim().slice(0, 140);
        if (!slug) {
          skippedNews++;
          continue;
        }

        if (mode === 'skip_existing') {
          const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM cms_news WHERE slug = ? LIMIT 1',
            [slug]
          );
          if (existing.length > 0) {
            skippedNews++;
            continue;
          }
        }

        const trimmedHtml = typeof entry.contentHtml === 'string' ? entry.contentHtml.trim() : '';
        const cleanContent =
          Array.isArray(entry.content) && entry.content.length > 0
            ? entry.content.map((p) => String(p).trim()).filter(Boolean)
            : trimmedHtml
              ? htmlToParagraphs(trimmedHtml, entry.excerpt.trim())
              : [entry.excerpt.trim()];
        const useLogo = Boolean(entry.isLogoPlaceholder) || !entry.image?.trim();
        const imgUrl = useLogo ? NEWS_PLACEHOLDER_LOGO : entry.image!.trim();
        const cleanGallery = Array.isArray(entry.gallery) ? entry.gallery : [];
        const cleanAttachments = Array.isArray(entry.attachments) ? entry.attachments : [];

        const catName = (entry.category || 'Fasilitas').trim().slice(0, 80) || 'Fasilitas';
        await pool.query(
          'INSERT IGNORE INTO cms_news_categories (name, sort_order) VALUES (?, 99)',
          [catName]
        );

        await pool.query(
          `INSERT INTO cms_news
            (slug, category, published_date, title, excerpt, image_url, is_logo_placeholder, content_json, content_html, gallery_json, attachments_json, is_published, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             category = VALUES(category),
             published_date = VALUES(published_date),
             title = VALUES(title),
             excerpt = VALUES(excerpt),
             image_url = VALUES(image_url),
             is_logo_placeholder = VALUES(is_logo_placeholder),
             content_json = VALUES(content_json),
             content_html = VALUES(content_html),
             gallery_json = VALUES(gallery_json),
             attachments_json = VALUES(attachments_json),
             is_published = VALUES(is_published),
             sort_order = VALUES(sort_order)`,
          [
            slug,
            catName,
            entry.date?.trim() || formatDateIndonesian(new Date()),
            entry.title.trim(),
            entry.excerpt.trim(),
            imgUrl,
            useLogo ? 1 : 0,
            JSON.stringify(cleanContent.length > 0 ? cleanContent : [entry.excerpt.trim()]),
            trimmedHtml || null,
            JSON.stringify(cleanGallery),
            JSON.stringify(cleanAttachments),
            entry.isPublished === false ? 0 : 1,
            typeof entry.sortOrder === 'number' ? entry.sortOrder : i + 1,
          ]
        );
        importedNews++;
      }

      if (importedNews > 0 || importedMedia > 0) {
        await notifyCmsDataCommitted('news', 'imported');
      }
      res.json({ ok: true, importedNews, skippedNews, importedMedia });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal mengimpor paket berita.',
      });
    }
  });

  app.post('/api/cms/news', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const {
      category,
      date,
      title,
      excerpt,
      image,
      isLogoPlaceholder,
      content,
      contentHtml,
      gallery,
      attachments,
      isPublished,
    } = req.body as {
      category?: string;
      date?: string;
      title?: string;
      excerpt?: string;
      image?: string;
      isLogoPlaceholder?: boolean;
      content?: string[];
      contentHtml?: string;
      gallery?: { url: string; caption?: string }[];
      attachments?: {
        id: string;
        title: string;
        url: string;
        fileName?: string;
        sizeBytes?: number;
      }[];
      isPublished?: boolean;
    };

    if (!title?.trim() || !excerpt?.trim()) {
      res.status(400).json({ ok: false, message: 'Judul dan ringkasan berita wajib diisi.' });
      return;
    }

    const slug = slugifyTitle(title);
    const trimmedHtml = typeof contentHtml === 'string' ? contentHtml.trim() : '';
    const cleanContent = Array.isArray(content) && content.length > 0
      ? content.map((p) => p.trim()).filter(Boolean)
      : trimmedHtml
        ? htmlToParagraphs(trimmedHtml, excerpt.trim())
        : [excerpt.trim()];

    const cleanGallery = Array.isArray(gallery)
      ? gallery
          .filter((g) => g && typeof g.url === 'string' && g.url.trim())
          .map((g) => ({
            url: g.url.trim(),
            caption: g.caption ? String(g.caption).trim() : '',
          }))
      : [];

    const cleanAttachments = Array.isArray(attachments)
      ? attachments
          .filter((a) => a && typeof a.url === 'string' && a.url.trim())
          .map((a, idx) => ({
            id: String(a.id || `att-${Date.now()}-${idx}`),
            title: String(a.title || a.fileName || `Lampiran PDF ${idx + 1}`).trim(),
            url: a.url.trim(),
            fileName: a.fileName ? String(a.fileName) : undefined,
            sizeBytes: typeof a.sizeBytes === 'number' ? a.sizeBytes : undefined,
          }))
      : [];

    const useLogo = Boolean(isLogoPlaceholder) || !image?.trim();
    const imgUrl = useLogo ? NEWS_PLACEHOLDER_LOGO : image!.trim();

    try {
      const [minRows] = await pool.query<RowDataPacket[]>(
        'SELECT COALESCE(MIN(sort_order), 1) AS minOrder FROM cms_news'
      );
      const nextOrder = Number(minRows[0]?.minOrder || 1) - 1;
      const autoUploadDate = formatDateIndonesian(new Date());
      const cleanCategory = (category || '').trim().slice(0, 80) || 'Fasilitas';

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO cms_news
          (slug, category, published_date, title, excerpt, image_url, is_logo_placeholder, content_json, content_html, gallery_json, attachments_json, is_published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          slug,
          cleanCategory,
          autoUploadDate,
          title.trim(),
          excerpt.trim(),
          imgUrl,
          useLogo ? 1 : 0,
          JSON.stringify(cleanContent.length > 0 ? cleanContent : [excerpt.trim()]),
          trimmedHtml || null,
          JSON.stringify(cleanGallery),
          JSON.stringify(cleanAttachments),
          isPublished === false ? 0 : 1,
          nextOrder,
        ]
      );

      const [inserted] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_news WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      await notifyCmsDataCommitted('news', 'created', result.insertId);
      res.status(201).json({ ok: true, item: mapNewsRow(inserted[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal membuat berita.',
      });
    }
  });

  app.put('/api/cms/news/:id', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const dbId = Number(req.params.id);
    if (!Number.isFinite(dbId)) {
      res.status(400).json({ ok: false, message: 'ID berita tidak valid.' });
      return;
    }

    const {
      category,
      title,
      excerpt,
      image,
      isLogoPlaceholder,
      content,
      contentHtml,
      gallery,
      attachments,
      isPublished,
    } = req.body as {
      category?: string;
      title?: string;
      excerpt?: string;
      image?: string;
      isLogoPlaceholder?: boolean;
      content?: string[];
      contentHtml?: string;
      gallery?: { url: string; caption?: string }[];
      attachments?: {
        id: string;
        title: string;
        url: string;
        fileName?: string;
        sizeBytes?: number;
      }[];
      isPublished?: boolean;
    };

    if (!title?.trim() || !excerpt?.trim()) {
      res.status(400).json({ ok: false, message: 'Judul dan ringkasan berita wajib diisi.' });
      return;
    }

    const useLogo = Boolean(isLogoPlaceholder) || !image?.trim();
    const imgUrl = useLogo ? NEWS_PLACEHOLDER_LOGO : image!.trim();
    const trimmedHtml = typeof contentHtml === 'string' ? contentHtml.trim() : '';
    const cleanContent = Array.isArray(content) && content.length > 0
      ? content.map((p) => p.trim()).filter(Boolean)
      : trimmedHtml
        ? htmlToParagraphs(trimmedHtml, excerpt.trim())
        : [excerpt.trim()];

    const cleanGallery = Array.isArray(gallery)
      ? gallery
          .filter((g) => g && typeof g.url === 'string' && g.url.trim())
          .map((g) => ({
            url: g.url.trim(),
            caption: g.caption ? String(g.caption).trim() : '',
          }))
      : [];

    const cleanAttachments = Array.isArray(attachments)
      ? attachments
          .filter((a) => a && typeof a.url === 'string' && a.url.trim())
          .map((a, idx) => ({
            id: String(a.id || `att-${Date.now()}-${idx}`),
            title: String(a.title || a.fileName || `Lampiran PDF ${idx + 1}`).trim(),
            url: a.url.trim(),
            fileName: a.fileName ? String(a.fileName) : undefined,
            sizeBytes: typeof a.sizeBytes === 'number' ? a.sizeBytes : undefined,
          }))
      : [];

    const cleanCategory = (category || '').trim().slice(0, 80) || 'Fasilitas';
    const fallbackAutoDate = formatDateIndonesian(new Date());

    try {
      await pool.query(
        `UPDATE cms_news
         SET category = ?, published_date = COALESCE(NULLIF(published_date, ''), ?), title = ?, excerpt = ?, image_url = ?, is_logo_placeholder = ?, content_json = ?, content_html = ?, gallery_json = ?, attachments_json = ?, is_published = ?
         WHERE id = ?`,
        [
          cleanCategory,
          fallbackAutoDate,
          title.trim(),
          excerpt.trim(),
          imgUrl,
          useLogo ? 1 : 0,
          JSON.stringify(cleanContent.length > 0 ? cleanContent : [excerpt.trim()]),
          trimmedHtml || null,
          JSON.stringify(cleanGallery),
          JSON.stringify(cleanAttachments),
          isPublished === false ? 0 : 1,
          dbId,
        ]
      );

      const [updated] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_news WHERE id = ? LIMIT 1',
        [dbId]
      );
      if (updated.length === 0) {
        res.status(404).json({ ok: false, message: 'Berita tidak ditemukan.' });
        return;
      }
      await notifyCmsDataCommitted('news', 'updated', dbId);
      res.json({ ok: true, item: mapNewsRow(updated[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui berita.',
      });
    }
  });

  app.post('/api/cms/news/bulk-delete', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { ids } = req.body as { ids?: unknown[] };
    const cleanIds = Array.isArray(ids)
      ? Array.from(
          new Set(
            ids
              .map((v) => Number(v))
              .filter((n) => Number.isInteger(n) && n > 0)
          )
        )
      : [];

    if (cleanIds.length === 0) {
      res.status(400).json({ ok: false, message: 'Pilih minimal satu berita untuk dihapus.' });
      return;
    }

    try {
      const placeholders = cleanIds.map(() => '?').join(',');
      const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM cms_news WHERE id IN (${placeholders})`,
        cleanIds
      );
      await notifyCmsDataCommitted('news', 'bulk-deleted');
      res.json({ ok: true, deletedCount: result.affectedRows || 0 });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus berita terpilih.',
      });
    }
  });

  app.delete('/api/cms/news/:id', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const dbId = Number(req.params.id);
    if (!Number.isFinite(dbId)) {
      res.status(400).json({ ok: false, message: 'ID berita tidak valid.' });
      return;
    }
    try {
      await pool.query('DELETE FROM cms_news WHERE id = ?', [dbId]);
      await notifyCmsDataCommitted('news', 'deleted', dbId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus berita.',
      });
    }
  });

  // CMS Custom News Categories CRUD
  app.get('/api/cms/categories', requireCmsAuth, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT c.id, c.name, c.sort_order, COUNT(n.id) AS articleCount
         FROM cms_news_categories c
         LEFT JOIN cms_news n ON n.category = c.name
         GROUP BY c.id, c.name, c.sort_order
         ORDER BY c.sort_order ASC, c.id ASC`
      );
      res.json({
        ok: true,
        items: rows.map((r) => ({
          id: Number(r.id),
          name: String(r.name),
          sortOrder: Number(r.sort_order),
          articleCount: Number(r.articleCount || 0),
        })),
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat kategori berita.',
      });
    }
  });

  app.post('/api/cms/categories', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { name } = req.body as { name?: string };
    const cleanName = (name || '').trim().slice(0, 60);
    if (!cleanName) {
      res.status(400).json({ ok: false, message: 'Nama kategori wajib diisi.' });
      return;
    }
    if (cleanName.toLowerCase() === 'semua') {
      res.status(400).json({ ok: false, message: 'Nama "Semua" dicadangkan untuk filter arsip.' });
      return;
    }

    try {
      const [dupRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM cms_news_categories WHERE LOWER(name) = LOWER(?) LIMIT 1',
        [cleanName]
      );
      if (dupRows.length > 0) {
        res.status(409).json({ ok: false, message: 'Kategori dengan nama tersebut sudah ada.' });
        return;
      }

      const [maxRows] = await pool.query<RowDataPacket[]>(
        'SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM cms_news_categories'
      );
      const nextOrder = Number(maxRows[0]?.maxOrder || 0) + 1;

      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO cms_news_categories (name, sort_order) VALUES (?, ?)',
        [cleanName, nextOrder]
      );
      await notifyCmsDataCommitted('categories', 'created', result.insertId);
      res.status(201).json({
        ok: true,
        item: {
          id: result.insertId,
          name: cleanName,
          sortOrder: nextOrder,
          articleCount: 0,
        },
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menambahkan kategori.',
      });
    }
  });

  app.put('/api/cms/categories/:id', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const catId = Number(req.params.id);
    if (!Number.isFinite(catId)) {
      res.status(400).json({ ok: false, message: 'ID kategori tidak valid.' });
      return;
    }
    const { name } = req.body as { name?: string };
    const cleanName = (name || '').trim().slice(0, 60);
    if (!cleanName) {
      res.status(400).json({ ok: false, message: 'Nama kategori tidak boleh kosong.' });
      return;
    }
    if (cleanName.toLowerCase() === 'semua') {
      res.status(400).json({ ok: false, message: 'Nama "Semua" dicadangkan untuk filter arsip.' });
      return;
    }

    try {
      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT id, name, sort_order FROM cms_news_categories WHERE id = ? LIMIT 1',
        [catId]
      );
      if (existingRows.length === 0) {
        res.status(404).json({ ok: false, message: 'Kategori tidak ditemukan.' });
        return;
      }
      const oldName = String(existingRows[0].name);

      const [dupRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM cms_news_categories WHERE LOWER(name) = LOWER(?) AND id != ? LIMIT 1',
        [cleanName, catId]
      );
      if (dupRows.length > 0) {
        res.status(409).json({ ok: false, message: 'Nama kategori tersebut sudah digunakan.' });
        return;
      }

      await pool.query('UPDATE cms_news_categories SET name = ? WHERE id = ?', [cleanName, catId]);
      if (oldName !== cleanName) {
        await pool.query('UPDATE cms_news SET category = ? WHERE category = ?', [cleanName, oldName]);
      }
      await notifyCmsDataCommitted('categories', 'updated', catId);

      res.json({
        ok: true,
        oldName,
        item: {
          id: catId,
          name: cleanName,
          sortOrder: Number(existingRows[0].sort_order || 1),
        },
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui kategori.',
      });
    }
  });

  app.delete('/api/cms/categories/:id', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const catId = Number(req.params.id);
    if (!Number.isFinite(catId)) {
      res.status(400).json({ ok: false, message: 'ID kategori tidak valid.' });
      return;
    }

    try {
      const [allRows] = await pool.query<RowDataPacket[]>(
        'SELECT id, name FROM cms_news_categories ORDER BY sort_order ASC, id ASC'
      );
      const target = allRows.find((r) => Number(r.id) === catId);
      if (!target) {
        res.status(404).json({ ok: false, message: 'Kategori tidak ditemukan.' });
        return;
      }
      if (allRows.length <= 1) {
        res.status(400).json({
          ok: false,
          message: 'Minimal harus tersedia 1 kategori berita aktif.',
        });
        return;
      }

      const fallback = allRows.find((r) => Number(r.id) !== catId);
      const fallbackName = fallback ? String(fallback.name) : 'Umum';

      const [reassigned] = await pool.query<ResultSetHeader>(
        'UPDATE cms_news SET category = ? WHERE category = ?',
        [fallbackName, String(target.name)]
      );
      await pool.query('DELETE FROM cms_news_categories WHERE id = ?', [catId]);
      await notifyCmsDataCommitted('categories', 'deleted', catId);

      res.json({
        ok: true,
        deletedName: String(target.name),
        reassignedTo: fallbackName,
        reassignedCount: reassigned.affectedRows || 0,
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus kategori.',
      });
    }
  });

  // CMS Partner Logos CRUD & Reordering
  app.get('/api/cms/partner-logos', requireCmsAuth, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_partner_logos ORDER BY sort_order ASC, id ASC'
      );
      res.json({ ok: true, items: rows.map(mapPartnerLogoRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat daftar logo mitra.',
      });
    }
  });

  app.post('/api/cms/partner-logos', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { name, logoUrl, linkUrl, sortOrder, isActive } = req.body as {
      name?: string;
      logoUrl?: string;
      linkUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    };

    if (!name?.trim() || !logoUrl?.trim()) {
      res.status(400).json({ ok: false, message: 'Nama logo dan URL/berkas logo wajib diisi.' });
      return;
    }

    try {
      let nextOrder = Number(sortOrder);
      if (!Number.isFinite(nextOrder) || nextOrder <= 0) {
        const [maxRows] = await pool.query<RowDataPacket[]>(
          'SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM cms_partner_logos'
        );
        nextOrder = Number(maxRows[0]?.maxOrder || 0) + 1;
      }

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO cms_partner_logos (name, logo_url, link_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        [
          name.trim().slice(0, 160),
          logoUrl.trim(),
          (linkUrl || '').trim() || null,
          nextOrder,
          isActive === false ? 0 : 1,
        ]
      );

      const [inserted] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_partner_logos WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      await notifyCmsDataCommitted('logos', 'created', result.insertId);
      res.status(201).json({ ok: true, item: mapPartnerLogoRow(inserted[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menambahkan logo mitra.',
      });
    }
  });

  app.patch('/api/cms/partner-logos/reorder', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { orderedIds } = req.body as { orderedIds?: unknown[] };
    const cleanIds = Array.isArray(orderedIds)
      ? orderedIds.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0)
      : [];

    if (cleanIds.length === 0) {
      res.status(400).json({ ok: false, message: 'Urutan ID logo tidak valid.' });
      return;
    }

    try {
      const caseParts = cleanIds.map(() => 'WHEN ? THEN ?').join(' ');
      const inPlaceholders = cleanIds.map(() => '?').join(', ');
      const caseParams: number[] = [];
      cleanIds.forEach((id, idx) => {
        caseParams.push(id, idx + 1);
      });
      await pool.query(
        `UPDATE cms_partner_logos SET sort_order = CASE id ${caseParts} ELSE sort_order END WHERE id IN (${inPlaceholders})`,
        [...caseParams, ...cleanIds]
      );
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_partner_logos ORDER BY sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('logos', 'reordered');
      res.json({ ok: true, items: rows.map(mapPartnerLogoRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menyimpan urutan logo mitra.',
      });
    }
  });

  app.put('/api/cms/partner-logos/:id', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const logoId = Number(req.params.id);
    if (!Number.isFinite(logoId)) {
      res.status(400).json({ ok: false, message: 'ID logo tidak valid.' });
      return;
    }

    const { name, logoUrl, linkUrl, sortOrder, isActive } = req.body as {
      name?: string;
      logoUrl?: string;
      linkUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    };

    if (!name?.trim() || !logoUrl?.trim()) {
      res.status(400).json({ ok: false, message: 'Nama logo dan URL/berkas logo wajib diisi.' });
      return;
    }

    const orderNum =
      Number.isFinite(Number(sortOrder)) && Number(sortOrder) > 0 ? Number(sortOrder) : 1;

    try {
      await pool.query(
        `UPDATE cms_partner_logos
         SET name = ?, logo_url = ?, link_url = ?, sort_order = ?, is_active = ?
         WHERE id = ?`,
        [
          name.trim().slice(0, 160),
          logoUrl.trim(),
          (linkUrl || '').trim() || null,
          orderNum,
          isActive === false ? 0 : 1,
          logoId,
        ]
      );

      const [updated] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_partner_logos WHERE id = ? LIMIT 1',
        [logoId]
      );
      if (updated.length === 0) {
        res.status(404).json({ ok: false, message: 'Logo tidak ditemukan.' });
        return;
      }
      await notifyCmsDataCommitted('logos', 'updated', logoId);
      res.json({ ok: true, item: mapPartnerLogoRow(updated[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui logo mitra.',
      });
    }
  });

  app.delete('/api/cms/partner-logos/:id', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const logoId = Number(req.params.id);
    if (!Number.isFinite(logoId)) {
      res.status(400).json({ ok: false, message: 'ID logo tidak valid.' });
      return;
    }
    try {
      await pool.query('DELETE FROM cms_partner_logos WHERE id = ?', [logoId]);
      await notifyCmsDataCommitted('logos', 'deleted', logoId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus logo mitra.',
      });
    }
  });

  // CMS Site Settings Read & Update
  app.get('/api/cms/settings', requireCmsAuth, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const settings = await fetchSiteSettingsMap();
      res.json({ ok: true, settings });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat pengaturan situs.',
      });
    }
  });

  app.put('/api/cms/settings', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { settings } = req.body as { settings?: Record<string, unknown> };
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      res.status(400).json({ ok: false, message: 'Format pengaturan situs tidak valid.' });
      return;
    }

    try {
      for (const [rawKey, rawVal] of Object.entries(settings)) {
        const key = String(rawKey || '').trim().slice(0, 100);
        if (!/^[a-z0-9_]+$/i.test(key)) continue;
        const val = typeof rawVal === 'string' ? rawVal.trim() : String(rawVal ?? '').trim();
        if (!val) {
          await pool.query('DELETE FROM cms_site_settings WHERE setting_key = ?', [key]);
        } else {
          await pool.query(
            `INSERT INTO cms_site_settings (setting_key, setting_value)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
            [key, val.slice(0, 4000)]
          );
        }
      }

      const updatedSettings = await fetchSiteSettingsMap();
      await notifyCmsDataCommitted('settings', 'updated');
      res.json({ ok: true, settings: updatedSettings });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menyimpan pengaturan situs.',
      });
    }
  });

  // Dynamic SEO Helpers (robots.txt, sitemap.xml, OpenGraph & Schema.org JSON-LD injection)
  const DEFAULT_OG_IMAGE =
    'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png';

  const escapeAttr = (value: string): string =>
    value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const escapeXml = (value: string): string =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const resolveBaseUrl = (req: Request): string => {
    const host = req.get('host');
    const protoHeader = req.headers['x-forwarded-proto'];
    const proto =
      typeof protoHeader === 'string' && protoHeader.trim()
        ? protoHeader.split(',')[0].trim()
        : req.protocol || 'https';
    if (host) return `${proto}://${host}`;
    const envUrl = process.env.APP_URL?.trim();
    if (envUrl && envUrl !== 'MY_APP_URL') return envUrl.replace(/\/+$/, '');
    return `http://localhost:${PORT}`;
  };

  const toAbsoluteSeoUrl = (baseUrl: string, maybeRelative?: string): string => {
    const val = (maybeRelative || '').trim();
    if (!val) return DEFAULT_OG_IMAGE;
    if (/^https?:\/\//i.test(val)) return val;
    return `${baseUrl}${val.startsWith('/') ? '' : '/'}${val}`;
  };

  const buildSeoHeadBlock = async (
    reqPath: string,
    baseUrl: string
  ): Promise<{ html: string; status: number }> => {
    const cleanPath = reqPath.replace(/\/+$/, '') || '/';
    let status = 200;
    let title = 'P2B UIN Salatiga — Pusat Pengembangan Bisnis PTN BLU';
    let description =
      'Pusat Pengembangan Bisnis (P2B) UIN Salatiga — Unit strategis optimalisasi aset, layanan komersial, kemitraan, dan inovasi bisnis PTN BLU.';
    let ogType: 'website' | 'article' = 'website';
    let ogImage = DEFAULT_OG_IMAGE;
    let robots =
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    let articleSection = '';
    let publishedIso = '';
    let jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Pusat Pengembangan Bisnis (P2B) UIN Salatiga',
      alternateName: 'P2B UIN Salatiga',
      url: baseUrl,
      logo: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2023/08/logo_ico_2.png',
      telephone: '0811-2520-4371',
      email: 'p2b@uinsalatiga.ac.id',
      address: {
        '@type': 'PostalAddress',
        streetAddress:
          'Gedung Auditorium & Student Center Prof. Dr. H. Achmadi, Jl. Lingkar Selatan Km. 02, Pulutan, Sidorejo',
        addressLocality: 'Kota Salatiga',
        addressRegion: 'Jawa Tengah',
        postalCode: '50716',
        addressCountry: 'ID',
      },
      sameAs: ['https://www.instagram.com/p2b.uinsalatiga'],
      description,
    };

    if (cleanPath === '/silahkanmasuk' || cleanPath === '/cms') {
      title =
        cleanPath === '/cms'
          ? 'CMS Panel — P2B UIN Salatiga'
          : 'Masuk Portal Redaksi — P2B UIN Salatiga';
      robots = 'noindex, nofollow';
    } else if (cleanPath === '/tentang-kami') {
      title = 'Tentang P2B UIN Salatiga — Profil & Pilar Bisnis PTN BLU';
      description =
        'Mengenal profil resmi Pusat Pengembangan Bisnis (P2B) UIN Salatiga dalam pengelolaan aset, layanan komersial, dan kemitraan strategis.';
    } else if (cleanPath === '/visi-misi') {
      title = 'Visi & Misi — Pusat Pengembangan Bisnis UIN Salatiga';
      description =
        'Arah strategis, visi kelembagaan, dan misi pelayanan profesional Pusat Pengembangan Bisnis (P2B) Universitas Islam Negeri Salatiga.';
    } else if (cleanPath === '/struktur-organisasi') {
      title = 'Struktur Organisasi — P2B UIN Salatiga';
      description =
        'Susunan manajemen, tata kelola, dan unit pelaksana bisnis di lingkungan Pusat Pengembangan Bisnis UIN Salatiga.';
    } else if (cleanPath === '/semua-berita') {
      title = 'Semua Berita & Update — P2B UIN Salatiga';
      description =
        'Arsip berita resmi, pengembangan fasilitas, inovasi layanan komersial, dan program kemitraan P2B UIN Salatiga.';
    } else if (cleanPath.startsWith('/berita/') && dbReady) {
      const slug = decodeURIComponent(cleanPath.slice('/berita/'.length));
      try {
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT slug, category, published_date, title, excerpt, image_url, created_at, updated_at FROM cms_news WHERE slug = ? AND is_published = 1 LIMIT 1',
          [slug]
        );
        if (rows.length > 0) {
          const row = rows[0];
          const artTitle = String(row.title);
          const artExcerpt = String(row.excerpt);
          title = `${artTitle} — P2B UIN Salatiga`;
          description = artExcerpt.slice(0, 160);
          ogType = 'article';
          ogImage = toAbsoluteSeoUrl(baseUrl, String(row.image_url || ''));
          articleSection = String(row.category || 'Berita');
          publishedIso = new Date(String(row.created_at || Date.now())).toISOString();
          const modifiedIso = new Date(String(row.updated_at || Date.now())).toISOString();

          jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: artTitle,
            description: artExcerpt,
            image: [ogImage],
            datePublished: publishedIso,
            dateModified: modifiedIso,
            articleSection,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${baseUrl}${cleanPath}`,
            },
            author: {
              '@type': 'Organization',
              name: 'P2B UIN Salatiga',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Pusat Pengembangan Bisnis UIN Salatiga',
              logo: {
                '@type': 'ImageObject',
                url: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2023/08/logo_ico_2.png',
              },
            },
          };
        } else {
          status = 404;
          title = '404 — Halaman Tidak Ditemukan · P2B UIN Salatiga';
          description =
            'Halaman berita yang Anda cari tidak tersedia atau telah dipindahkan dari portal P2B UIN Salatiga.';
          robots = 'noindex, nofollow';
        }
      } catch {
        // Fallback to default metadata
      }
    } else if (cleanPath.startsWith('/berita/')) {
      // No DB fallback: allow client router to resolve bundled articles
    } else if (cleanPath === '/') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'P2B UIN Salatiga',
        url: baseUrl,
        description,
        publisher: {
          '@type': 'Organization',
          name: 'Pusat Pengembangan Bisnis UIN Salatiga',
          logo: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2023/08/logo_ico_2.png',
          telephone: '0811-2520-4371',
          email: 'p2b@uinsalatiga.ac.id',
          address: {
            '@type': 'PostalAddress',
            streetAddress:
              'Gedung Auditorium & Student Center Prof. Dr. H. Achmadi, Jl. Lingkar Selatan Km. 02, Pulutan, Sidorejo',
            addressLocality: 'Kota Salatiga',
            addressRegion: 'Jawa Tengah',
            postalCode: '50716',
            addressCountry: 'ID',
          },
        },
      };
    } else if (cleanPath !== '/') {
      status = 404;
      title = '404 — Halaman Tidak Ditemukan · P2B UIN Salatiga';
      description =
        'Halaman yang Anda cari tidak tersedia atau telah dipindahkan dari portal Pusat Pengembangan Bisnis UIN Salatiga.';
      robots = 'noindex, nofollow';
    }

    const canonicalUrl = `${baseUrl}${cleanPath}`;
    const safeTitle = escapeAttr(title);
    const safeDesc = escapeAttr(description);
    const safeCanonical = escapeAttr(canonicalUrl);
    const safeImage = escapeAttr(ogImage);
    const safeJsonLd = JSON.stringify(jsonLd).replace(/<\/script>/gi, '<\\/script>');

    const articleMeta =
      ogType === 'article'
        ? [
            publishedIso
              ? `    <meta property="article:published_time" content="${escapeAttr(publishedIso)}" />`
              : '',
            articleSection
              ? `    <meta property="article:section" content="${escapeAttr(articleSection)}" />`
              : '',
          ]
            .filter(Boolean)
            .join('\n')
        : '';

    const html = [
      `    <title>${safeTitle}</title>`,
      `    <meta name="description" content="${safeDesc}" />`,
      `    <meta name="robots" content="${escapeAttr(robots)}" />`,
      `    <link rel="canonical" href="${safeCanonical}" />`,
      `    <meta property="og:locale" content="id_ID" />`,
      `    <meta property="og:site_name" content="P2B UIN Salatiga" />`,
      `    <meta property="og:type" content="${ogType}" />`,
      `    <meta property="og:url" content="${safeCanonical}" />`,
      `    <meta property="og:title" content="${safeTitle}" />`,
      `    <meta property="og:description" content="${safeDesc}" />`,
      `    <meta property="og:image" content="${safeImage}" />`,
      articleMeta,
      `    <meta name="twitter:card" content="summary_large_image" />`,
      `    <meta name="twitter:title" content="${safeTitle}" />`,
      `    <meta name="twitter:description" content="${safeDesc}" />`,
      `    <meta name="twitter:image" content="${safeImage}" />`,
      `    <script id="p2b-dynamic-jsonld" type="application/ld+json">${safeJsonLd}</script>`,
    ]
      .filter(Boolean)
      .join('\n');

    return { html, status };
  };

  const injectSeoIntoHtml = (html: string, seoHeadBlock: string): string => {
    const markerRegex =
      /<!-- P2B_SEO_HEAD_START -->[\s\S]*?<!-- P2B_SEO_HEAD_END -->/;
    if (markerRegex.test(html)) {
      return html.replace(
        markerRegex,
        `<!-- P2B_SEO_HEAD_START -->\n${seoHeadBlock}\n    <!-- P2B_SEO_HEAD_END -->`
      );
    }
    return html.replace('</head>', `${seoHeadBlock}\n  </head>`);
  };

  app.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = resolveBaseUrl(req);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /cms',
        'Disallow: /silahkanmasuk',
        'Disallow: /api/cms/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    const baseUrl = resolveBaseUrl(req);
    const staticPaths = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/tentang-kami', priority: '0.8', changefreq: 'monthly' },
      { path: '/visi-misi', priority: '0.8', changefreq: 'monthly' },
      { path: '/struktur-organisasi', priority: '0.8', changefreq: 'monthly' },
      { path: '/semua-berita', priority: '0.9', changefreq: 'daily' },
    ];

    const urlEntries: string[] = staticPaths.map(
      (item) => `  <url>
    <loc>${escapeXml(`${baseUrl}${item.path}`)}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    );

    if (dbReady) {
      try {
        const [newsRows] = await pool.query<RowDataPacket[]>(
          'SELECT slug, updated_at FROM cms_news WHERE is_published = 1 ORDER BY sort_order ASC, id DESC'
        );
        for (const row of newsRows) {
          const lastMod = new Date(String(row.updated_at || Date.now())).toISOString();
          urlEntries.push(`  <url>
    <loc>${escapeXml(`${baseUrl}/berita/${encodeURIComponent(String(row.slug))}`)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
        }
      } catch {
        // Fallback to static paths only if DB query fails
      }
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>`
    );
  });

  // Vite dev middleware vs static production serving with SSR OpenGraph & SEO head injection
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        const rawHtml = fs.readFileSync(templatePath, 'utf-8');
        const baseUrl = resolveBaseUrl(req);
        const seoResult = await buildSeoHeadBlock(req.path, baseUrl);
        const withSeo = injectSeoIntoHtml(rawHtml, seoResult.html);
        const transformed = await vite.transformIndexHtml(req.originalUrl, withSeo);
        res
          .status(seoResult.status)
          .set({ 'Content-Type': 'text/html; charset=utf-8' })
          .end(transformed);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false }));
    app.get('*', async (req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexFile)) {
        res.status(404).send('Build output not found.');
        return;
      }
      const rawHtml = fs.readFileSync(indexFile, 'utf-8');
      const baseUrl = resolveBaseUrl(req);
      const seoResult = await buildSeoHeadBlock(req.path, baseUrl);
      const withSeo = injectSeoIntoHtml(rawHtml, seoResult.html);
      res
        .status(seoResult.status)
        .set({ 'Content-Type': 'text/html; charset=utf-8' })
        .end(withSeo);
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[P2B Server] Listening on http://0.0.0.0:${PORT} (DB ready: ${dbReady}, WS: /ws/realtime)`);
  });
}

startServer().catch((err) => {
  console.error('[P2B Server Fatal]:', err);
  process.exit(1);
});
