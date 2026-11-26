import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import path from 'path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import multer from 'multer';
import { WebSocketServer, WebSocket } from 'ws';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { DB_NAME, pool } from './src/db/pool.ts';
import {
  auth,
  createFirstRunSuperAdmin,
  runBetterAuthMigrationsAndSeed,
} from './src/auth.ts';
import {
  getCmsRoleMeta,
  getPermissionsForRole,
  hasAnyCmsPermission,
  normalizeCmsRole,
  type CmsPermission,
  type CmsRoleKey,
} from './src/lib/authRoles.ts';
import { getEssentialSecurityHeaders } from './src/lib/securityHeaders.ts';
import {
  BUILDER_PAGE_SLUGS,
  BUILDER_PAGE_SLUG_SET,
  HOME_BLOCK_TYPE_SET,
  buildDefaultBlocksForPage,
  type BuilderPageSlug,
} from './src/data/homeBuilderDefaults.ts';
import {
  DEFAULT_TARIF_ITEMS,
  isSafePdfReference,
  isValidTarifSlug,
  slugifyTarifLabel,
} from './src/data/tarifDefaults.ts';

const PORT = Number(process.env.PORT || 3000);

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

const SEED_MAGANG_GALLERY = [
  {
    title: 'Kolaborasi & Perencanaan Program',
    caption:
      'Sesi brainstorming lintas divisi mahasiswa magang dalam merancang kampanye dan evaluasi unit usaha.',
    image_url: '/assets/magang/galeri_diskusi.jpg',
    alt_text: 'Mahasiswa magang P2B UIN Salatiga berdiskusi merencanakan program kerja tim',
    sort_order: 1,
  },
  {
    title: 'Produksi Konten Digital',
    caption: 'Dokumentasi video pendek dan liputan aktivitas layanan P2B di area kampus.',
    image_url: '/assets/magang/role_konten.jpg',
    alt_text: 'Anak magang divisi Content Creator memproduksi video promosi unit usaha P2B',
    sort_order: 2,
  },
  {
    title: 'Eksplorasi Desain & Visual Branding',
    caption:
      'Penyusunan materi poster, identitas visual, dan konten grafis untuk publikasi resmi.',
    image_url: '/assets/magang/role_desain.jpg',
    alt_text: 'Anak magang divisi Graphic Designer mengerjakan layout publikasi visual',
    sort_order: 3,
  },
  {
    title: 'Koordinasi Administrasi Harian',
    caption:
      'Pengelolaan jadwal layanan, dokumentasi surat, dan pencatatan operasional kantor P2B.',
    image_url: '/assets/magang/role_admin.jpg',
    alt_text: 'Anak magang divisi Office Administrator mengelola jadwal dan arsip operasional',
    sort_order: 4,
  },
];

const SEED_MAGANG_POSITIONS = [
  {
    title: 'Content Creator',
    division: 'Media & Publikasi Digital',
    description:
      'Merancang konsep kreatif, memproduksi video pendek, foto dokumentasi, serta konten media sosial untuk memperkenalkan unit usaha dan layanan P2B UIN Salatiga.',
    image_url: '/assets/magang/role_konten.jpg',
    tasks: [
      'Produksi video reels, TikTok, dan liputan kegiatan unit bisnis',
      'Penulisan skrip kreatif serta copywriting publikasi digital',
      'Kolaborasi kampanye promosi bersama tim desain grafis',
    ],
    sort_order: 1,
  },
  {
    title: 'Graphic Designer',
    division: 'Desain Komunikasi Visual',
    description:
      'Mengembangkan materi komunikasi visual resmi mulai dari poster acara, konten media sosial, hingga kebutuhan branding produk dan layanan komersial P2B.',
    image_url: '/assets/magang/role_desain.jpg',
    tasks: [
      'Perancangan poster, feed media sosial, dan media cetak',
      'Menjaga konsistensi identitas visual P2B UIN Salatiga',
      'Pengolahan materi presentasi serta promosi layanan usaha',
    ],
    sort_order: 2,
  },
  {
    title: 'Office Administrator',
    division: 'Tata Kelola & Administrasi',
    description:
      'Mendukung pengelolaan administrasi perkantoran, pengarsipan dokumen layanan, pencatatan jadwal operasional, serta koordinasi harian di lingkungan P2B.',
    image_url: '/assets/magang/role_admin.jpg',
    tasks: [
      'Pengarsipan dokumen resmi, surat-menyurat, dan berkas mitra',
      'Pendataan jadwal reservasi fasilitas dan koordinasi internal',
      'Penyusunan rekapitulasi laporan administrasi berkala',
    ],
    sort_order: 3,
  },
];

interface SessionPayload {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  role: CmsRoleKey;
  roleLabel: string;
}

interface AuthenticatedRequest extends Request {
  cmsUser?: SessionPayload;
}

async function resolveBetterAuthSession(req: Request): Promise<SessionPayload | null> {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!sessionData?.user) return null;
    const rawUser = sessionData.user as typeof sessionData.user & {
      username?: string | null;
      role?: string | null;
      banned?: boolean | null;
      banExpires?: Date | string | null;
    };
    if (rawUser.banned) {
      if (!rawUser.banExpires || new Date(rawUser.banExpires).getTime() > Date.now()) {
        return null;
      }
    }
    const role = normalizeCmsRole(rawUser.role);
    const meta = getCmsRoleMeta(role);
    return {
      userId: String(rawUser.id),
      username: String(rawUser.username || rawUser.email || '').trim(),
      displayName: String(rawUser.name || rawUser.username || 'Pengguna CMS'),
      email: String(rawUser.email || ''),
      role,
      roleLabel: meta.label,
    };
  } catch {
    return null;
  }
}

async function requireCmsAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!dbReady) {
    await ensureDatabaseReady();
  }
  if (!dbReady) {
    res.status(503).json({
      ok: false,
      message: `Database tidak dapat diakses: ${dbInitError || 'Periksa koneksi database.'}`,
    });
    return;
  }
  const user = await resolveBetterAuthSession(req);
  if (!user) {
    res.status(401).json({ ok: false, message: 'Sesi login tidak ditemukan atau telah berakhir.' });
    return;
  }
  req.cmsUser = user;
  next();
}

function requireCmsPermission(...permissions: CmsPermission[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!dbReady) {
      await ensureDatabaseReady();
    }
    if (!dbReady) {
      res.status(503).json({
        ok: false,
        message: `Database tidak dapat diakses: ${dbInitError || 'Periksa koneksi database.'}`,
      });
      return;
    }
    const user = await resolveBetterAuthSession(req);
    if (!user) {
      res.status(401).json({ ok: false, message: 'Sesi login tidak ditemukan atau telah berakhir.' });
      return;
    }
    if (!hasAnyCmsPermission(user.role, permissions)) {
      res.status(403).json({
        ok: false,
        message: `Profil "${user.roleLabel}" tidak memiliki izin untuk mengakses fitur ini.`,
      });
      return;
    }
    req.cmsUser = user;
    next();
  };
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_magang_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(180) NOT NULL,
        caption TEXT NOT NULL,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255) NULL,
        sort_order INT NOT NULL DEFAULT 100,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_magang_positions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(160) NOT NULL,
        division VARCHAR(160) NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        tasks_json LONGTEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        is_available TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [isAvailColRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'cms_magang_positions' AND COLUMN_NAME = 'is_available'`,
      [DB_NAME]
    );
    if (Number(isAvailColRows[0]?.cnt || 0) === 0) {
      await pool.query(
        'ALTER TABLE cms_magang_positions ADD COLUMN is_available TINYINT(1) NOT NULL DEFAULT 1 AFTER is_active'
      );
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_magang_applicant_files (
        id VARCHAR(48) PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(120) NOT NULL,
        size_bytes INT NOT NULL,
        data LONGBLOB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_magang_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        registration_code VARCHAR(32) NOT NULL UNIQUE,
        full_name VARCHAR(160) NOT NULL,
        email VARCHAR(180) NOT NULL,
        phone VARCHAR(40) NOT NULL,
        study_program VARCHAR(160) NOT NULL,
        faculty VARCHAR(160) NOT NULL,
        about_p2b TEXT NOT NULL,
        position_id INT NULL,
        position_title VARCHAR(160) NOT NULL,
        interest_reason TEXT NOT NULL,
        resume_file_id VARCHAR(48) NULL,
        resume_file_name VARCHAR(255) NULL,
        resume_url TEXT NULL,
        portfolio_file_id VARCHAR(48) NULL,
        portfolio_file_name VARCHAR(255) NULL,
        portfolio_url TEXT NULL,
        expectations TEXT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'baru',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_home_blocks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_slug VARCHAR(64) NOT NULL DEFAULT 'home',
        block_type VARCHAR(64) NOT NULL,
        block_label VARCHAR(160) NOT NULL,
        config_json LONGTEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [hbPageCol] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS col_exists
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'cms_home_blocks'
         AND COLUMN_NAME = 'page_slug'`
    );
    if (Number(hbPageCol[0]?.col_exists || 0) === 0) {
      await pool.query(
        "ALTER TABLE cms_home_blocks ADD COLUMN page_slug VARCHAR(64) NOT NULL DEFAULT 'home' AFTER id"
      );
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_builder_presets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        description VARCHAR(400) NOT NULL DEFAULT '',
        block_type VARCHAR(64) NOT NULL,
        config_json LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_tarif_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(120) NOT NULL UNIQUE,
        nav_label VARCHAR(200) NOT NULL,
        short_label VARCHAR(120) NOT NULL,
        title VARCHAR(255) NOT NULL,
        doc_number VARCHAR(255) NOT NULL DEFAULT '',
        description TEXT NOT NULL,
        pdf_url VARCHAR(1024) NOT NULL DEFAULT '',
        local_fallback_pdf_url VARCHAR(1024) NOT NULL DEFAULT '',
        sort_order INT NOT NULL DEFAULT 100,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Run Better Auth schema migrations & migrate legacy cms_users cleanly
    await runBetterAuthMigrationsAndSeed();

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

    // Seed magang gallery if empty
    const [magangGalleryCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM cms_magang_gallery'
    );
    if (Number(magangGalleryCountRows[0]?.total || 0) === 0) {
      for (const item of SEED_MAGANG_GALLERY) {
        await pool.query(
          `INSERT INTO cms_magang_gallery (title, caption, image_url, alt_text, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [item.title, item.caption, item.image_url, item.alt_text, item.sort_order]
        );
      }
    }

    // Seed magang positions if empty
    const [magangPosCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM cms_magang_positions'
    );
    if (Number(magangPosCountRows[0]?.total || 0) === 0) {
      for (const pos of SEED_MAGANG_POSITIONS) {
        await pool.query(
          `INSERT INTO cms_magang_positions (title, division, description, image_url, tasks_json, sort_order, is_active, is_available)
           VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
          [
            pos.title,
            pos.division,
            pos.description,
            pos.image_url,
            JSON.stringify(pos.tasks),
            pos.sort_order,
          ]
        );
      }
    }

    // Seed page builder blocks per page_slug (Beranda & Profil pages) if empty
    const [settingSeedRows] = await pool.query<RowDataPacket[]>(
      'SELECT setting_key, setting_value FROM cms_site_settings'
    );
    const existingSettings: Record<string, string> = {};
    for (const r of settingSeedRows) {
      existingSettings[String(r.setting_key)] = String(r.setting_value ?? '');
    }

    for (const pageSlug of BUILDER_PAGE_SLUGS) {
      const [pageBlockCountRows] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM cms_home_blocks WHERE page_slug = ?',
        [pageSlug]
      );
      if (Number(pageBlockCountRows[0]?.total || 0) === 0) {
        const initialBlocks = buildDefaultBlocksForPage(pageSlug, existingSettings);
        for (const blk of initialBlocks) {
          await pool.query(
            `INSERT INTO cms_home_blocks (page_slug, block_type, block_label, config_json, sort_order, is_visible)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [
              pageSlug,
              blk.blockType,
              blk.label,
              JSON.stringify(blk.config),
              blk.sortOrder,
            ]
          );
        }
      }
    }

    // Seed dynamic Tarif Layanan items if empty, migrating any prior settings overrides
    const [tarifCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM cms_tarif_items'
    );
    if (Number(tarifCountRows[0]?.total || 0) === 0) {
      const legacySettingPrefix: Record<string, string> = {
        'penunjang-akademik': 'tarif_penunjang',
        'klinik-mitra-insani': 'tarif_klinik',
        jurnal: 'tarif_jurnal',
      };
      for (const seedItem of DEFAULT_TARIF_ITEMS) {
        const prefix = legacySettingPrefix[seedItem.slug];
        const title =
          (prefix && existingSettings[`${prefix}_title`]?.trim()) || seedItem.title;
        const docNumber =
          (prefix && existingSettings[`${prefix}_doc_number`]?.trim()) ||
          seedItem.docNumber;
        const description =
          (prefix && existingSettings[`${prefix}_description`]?.trim()) ||
          seedItem.description;
        const pdfUrl =
          (prefix && existingSettings[`${prefix}_pdf_url`]?.trim()) ||
          seedItem.pdfUrl;

        await pool.query(
          `INSERT INTO cms_tarif_items
            (slug, nav_label, short_label, title, doc_number, description, pdf_url, local_fallback_pdf_url, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            seedItem.slug,
            seedItem.navLabel,
            seedItem.shortLabel,
            title,
            docNumber,
            description,
            pdfUrl,
            seedItem.localFallbackPdfUrl || '',
            seedItem.sortOrder,
            seedItem.isActive ? 1 : 0,
          ]
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

function mapMagangGalleryRow(row: RowDataPacket) {
  return {
    id: Number(row.id),
    title: String(row.title),
    caption: String(row.caption || ''),
    imageUrl: String(row.image_url),
    altText: row.alt_text ? String(row.alt_text) : String(row.title),
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
  };
}

function mapMagangPositionRow(row: RowDataPacket) {
  let tasks: string[] = [];
  if (row.tasks_json) {
    try {
      const parsed = JSON.parse(String(row.tasks_json));
      if (Array.isArray(parsed)) {
        tasks = parsed.map((t) => String(t).trim()).filter(Boolean);
      }
    } catch {
      tasks = [];
    }
  }
  return {
    id: Number(row.id),
    title: String(row.title),
    division: String(row.division || ''),
    description: String(row.description || ''),
    imageUrl: String(row.image_url),
    tasks,
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
    isAvailable: row.is_available === undefined ? true : Boolean(row.is_available),
  };
}

function mapMagangApplicationRow(row: RowDataPacket) {
  return {
    id: Number(row.id),
    registrationCode: String(row.registration_code),
    fullName: String(row.full_name),
    email: String(row.email),
    phone: String(row.phone),
    studyProgram: String(row.study_program),
    faculty: String(row.faculty),
    aboutP2b: String(row.about_p2b),
    positionId: row.position_id ? Number(row.position_id) : null,
    positionTitle: String(row.position_title),
    interestReason: String(row.interest_reason),
    resumeFileId: row.resume_file_id ? String(row.resume_file_id) : null,
    resumeFileName: row.resume_file_name ? String(row.resume_file_name) : null,
    resumeUrl: row.resume_url ? String(row.resume_url) : null,
    portfolioFileId: row.portfolio_file_id ? String(row.portfolio_file_id) : null,
    portfolioFileName: row.portfolio_file_name ? String(row.portfolio_file_name) : null,
    portfolioUrl: row.portfolio_url ? String(row.portfolio_url) : null,
    expectations: String(row.expectations),
    status: String(row.status || 'baru'),
    createdAt: String(row.created_at),
  };
}

function isSafeHttpUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizeHomeBlockConfigValue(val: unknown, depth = 0): unknown {
  if (depth > 5) return '';
  if (typeof val === 'string') return val.slice(0, 8000);
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'boolean') return val;
  if (Array.isArray(val)) {
    return val.slice(0, 24).map((entry) => sanitizeHomeBlockConfigValue(entry, depth + 1));
  }
  if (val && typeof val === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      const cleanKey = String(k).trim().slice(0, 80);
      if (!cleanKey) continue;
      clean[cleanKey] = sanitizeHomeBlockConfigValue(v, depth + 1);
    }
    return clean;
  }
  return '';
}

function mapHomeBlockRow(row: RowDataPacket) {
  let config: Record<string, unknown> = {};
  if (row.config_json) {
    try {
      const parsed = JSON.parse(String(row.config_json));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        config = parsed as Record<string, unknown>;
      }
    } catch {
      config = {};
    }
  }
  const rawSlug = String(row.page_slug || 'home').trim();
  const pageSlug: BuilderPageSlug = BUILDER_PAGE_SLUG_SET.has(rawSlug)
    ? (rawSlug as BuilderPageSlug)
    : 'home';
  return {
    id: Number(row.id),
    pageSlug,
    blockType: String(row.block_type),
    label: String(row.block_label || ''),
    config,
    sortOrder: Number(row.sort_order),
    isVisible: Boolean(row.is_visible),
  };
}

function mapBuilderPresetRow(row: RowDataPacket) {
  let config: Record<string, unknown> = {};
  if (row.config_json) {
    try {
      const parsed = JSON.parse(String(row.config_json));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        config = parsed as Record<string, unknown>;
      }
    } catch {
      config = {};
    }
  }
  return {
    id: Number(row.id),
    name: String(row.name || ''),
    description: String(row.description || ''),
    blockType: String(row.block_type),
    config,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
}

function mapTarifItemRow(row: RowDataPacket) {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    navLabel: String(row.nav_label || ''),
    shortLabel: String(row.short_label || ''),
    title: String(row.title || ''),
    docNumber: String(row.doc_number || ''),
    description: String(row.description || ''),
    pdfUrl: String(row.pdf_url || ''),
    localFallbackPdfUrl: String(row.local_fallback_pdf_url || ''),
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
        (SELECT COUNT(*) FROM cms_magang_gallery) AS mg_count,
        (SELECT COALESCE(MAX(updated_at), '1970-01-01') FROM cms_magang_gallery) AS mg_ts,
        (SELECT COUNT(*) FROM cms_magang_positions) AS mp_count,
        (SELECT COALESCE(MAX(updated_at), '1970-01-01') FROM cms_magang_positions) AS mp_ts,
        (SELECT COUNT(*) FROM cms_site_settings) AS settings_count,
        (SELECT COALESCE(MAX(updated_at), '1970-01-01') FROM cms_site_settings) AS settings_ts,
        (SELECT COUNT(*) FROM cms_home_blocks) AS hb_count,
        (SELECT COALESCE(MAX(updated_at), '1970-01-01') FROM cms_home_blocks) AS hb_ts,
        (SELECT COUNT(*) FROM cms_builder_presets) AS bp_count,
        (SELECT COUNT(*) FROM cms_tarif_items) AS tarif_count,
        (SELECT COALESCE(MAX(updated_at), '1970-01-01') FROM cms_tarif_items) AS tarif_ts,
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
      r.mg_count,
      r.mg_ts,
      r.mp_count,
      r.mp_ts,
      r.settings_count,
      r.settings_ts,
      r.hb_count,
      r.hb_ts,
      r.bp_count,
      r.tarif_count,
      r.tarif_ts,
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
  domain:
    | 'news'
    | 'categories'
    | 'logos'
    | 'magang_gallery'
    | 'magang_positions'
    | 'magang_applications'
    | 'home_blocks'
    | 'builder_presets'
    | 'tarif_items'
    | 'media'
    | 'settings',
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

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Global HTTP security headers including Content-Security-Policy (preserve iframe embed compatibility for preview)
  const isDevServer = process.env.NODE_ENV !== 'production';
  app.use((req: Request, res: Response, next: NextFunction) => {
    const fwdProto = String(req.headers['x-forwarded-proto'] || '')
      .split(',')[0]
      .trim()
      .toLowerCase();
    const isHttpsRequest = req.secure || fwdProto === 'https';
    const secHeaders = getEssentialSecurityHeaders({
      isDev: isDevServer,
      isHttps: isHttpsRequest,
    });
    for (const [headerName, headerValue] of Object.entries(secHeaders)) {
      res.setHeader(headerName, headerValue);
    }
    next();
  });

  // Bounded in-memory rate limiter for sensitive endpoints
  const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
  const rateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitBuckets.entries()) {
      if (entry.resetAt <= now) {
        rateLimitBuckets.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  rateLimitCleanup.unref();

  const createRateLimiter = (
    bucketPrefix: string,
    maxRequests: number,
    windowMs: number,
    message: string
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIp =
        (req.ip || req.socket.remoteAddress || 'unknown').trim().slice(0, 100) ||
        'unknown';
      const key = `${bucketPrefix}:${clientIp}`;
      const now = Date.now();
      let entry = rateLimitBuckets.get(key);

      if (!entry || entry.resetAt <= now) {
        if (rateLimitBuckets.size >= 10000) {
          rateLimitBuckets.clear();
        }
        entry = { count: 1, resetAt: now + windowMs };
        rateLimitBuckets.set(key, entry);
        next();
        return;
      }

      if (entry.count >= maxRequests) {
        const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
        res.setHeader('Retry-After', String(retryAfterSec));
        res.status(429).json({ ok: false, message });
        return;
      }

      entry.count += 1;
      next();
    };
  };

  const authRateLimiter = createRateLimiter(
    'auth',
    15,
    15 * 60 * 1000,
    'Terlalu banyak percobaan autentikasi. Silakan tunggu beberapa menit sebelum mencoba lagi.'
  );
  const magangApplyRateLimiter = createRateLimiter(
    'magang_apply',
    10,
    15 * 60 * 1000,
    'Terlalu banyak pengiriman pendaftaran dari jaringan ini. Silakan coba lagi beberapa menit lagi.'
  );
  const kerjasamaProxyRateLimiter = createRateLimiter(
    'kerjasama_proxy',
    60,
    60 * 1000,
    'Permintaan data kerjasama terlalu cepat. Silakan tunggu sebentar.'
  );

  // Protect login, password change, and initial setup endpoints before Better Auth mount
  app.post('/api/auth/sign-in/*', authRateLimiter);
  app.post('/api/auth/change-password', authRateLimiter);
  app.post('/api/auth-setup/claim', authRateLimiter);

  // Mount Better Auth handler BEFORE express.json() so request streams stay intact
  app.use('/api/auth', async (_req: Request, _res: Response, next: NextFunction) => {
    if (!dbReady) {
      await ensureDatabaseReady();
    }
    next();
  });
  app.all('/api/auth/*', toNodeHandler(auth));

  app.use(express.json({ limit: '50mb' }));

  // Verify same-origin on cookie-backed mutating CMS requests when Origin header is present
  app.use('/api/cms', (req: Request, res: Response, next: NextFunction) => {
    if (
      req.method === 'GET' ||
      req.method === 'HEAD' ||
      req.method === 'OPTIONS' ||
      req.headers.authorization?.startsWith('Bearer ')
    ) {
      next();
      return;
    }
    const originHeader = req.headers.origin;
    if (originHeader) {
      try {
        const originHost = new URL(originHeader).host.toLowerCase();
        const forwardedHost = String(req.headers['x-forwarded-host'] || '')
          .split(',')[0]
          .trim()
          .toLowerCase();
        const directHost = String(req.headers.host || '').trim().toLowerCase();
        if (originHost !== forwardedHost && originHost !== directHost) {
          res.status(403).json({
            ok: false,
            message: 'Permintaan lintas origin tidak diizinkan.',
          });
          return;
        }
      } catch {
        res.status(403).json({ ok: false, message: 'Header Origin tidak valid.' });
        return;
      }
    }
    next();
  });

  const ALLOWED_UPLOAD_MIMES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
  ]);

  const validateUploadedFileContent = (
    mimeType: string,
    buffer: Buffer
  ): { valid: boolean; reason?: string } => {
    if (!buffer || buffer.length === 0) {
      return { valid: false, reason: 'Berkas kosong atau rusak.' };
    }

    if (mimeType === 'image/jpeg') {
      const ok =
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff;
      return ok
        ? { valid: true }
        : { valid: false, reason: 'Isi berkas tidak sesuai format JPEG.' };
    }

    if (mimeType === 'image/png') {
      const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      const ok =
        buffer.length >= sig.length && sig.every((byte, idx) => buffer[idx] === byte);
      return ok
        ? { valid: true }
        : { valid: false, reason: 'Isi berkas tidak sesuai format PNG.' };
    }

    if (mimeType === 'image/gif') {
      const head = buffer.subarray(0, 6).toString('ascii');
      const ok = head === 'GIF87a' || head === 'GIF89a';
      return ok
        ? { valid: true }
        : { valid: false, reason: 'Isi berkas tidak sesuai format GIF.' };
    }

    if (mimeType === 'image/webp') {
      const ok =
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP';
      return ok
        ? { valid: true }
        : { valid: false, reason: 'Isi berkas tidak sesuai format WebP.' };
    }

    if (mimeType === 'application/pdf') {
      const headText = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1');
      return headText.includes('%PDF-')
        ? { valid: true }
        : { valid: false, reason: 'Isi berkas tidak sesuai format PDF.' };
    }

    if (mimeType === 'application/msword') {
      const ok =
        buffer.length >= 4 &&
        buffer[0] === 0xd0 &&
        buffer[1] === 0xcf &&
        buffer[2] === 0x11 &&
        buffer[3] === 0xe0;
      return ok
        ? { valid: true }
        : { valid: false, reason: 'Isi berkas tidak sesuai format DOC.' };
    }

    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const ok =
        buffer.length >= 4 &&
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07);
      return ok
        ? { valid: true }
        : { valid: false, reason: 'Isi berkas tidak sesuai format DOCX.' };
    }

    if (mimeType === 'image/svg+xml') {
      const svgText = buffer.toString('utf8');
      if (!/<svg[\s>]/i.test(svgText)) {
        return { valid: false, reason: 'Isi berkas bukan dokumen SVG yang valid.' };
      }
      if (
        /<script[\s>]/i.test(svgText) ||
        /<foreignObject[\s>]/i.test(svgText) ||
        /\son[a-z]+\s*=/i.test(svgText) ||
        /(?:javascript|vbscript|data:text\/html)\s*:/i.test(svgText)
      ) {
        return {
          valid: false,
          reason: 'Berkas SVG mengandung skrip atau elemen aktif yang tidak diizinkan.',
        };
      }
      return { valid: true };
    }

    return { valid: false, reason: 'Tipe berkas tidak diizinkan.' };
  };

  const sanitizeDispositionFilename = (rawName: unknown, fallback = 'file'): string =>
    String(rawName || fallback)
      .replace(/[\r\n";\\]/g, '_')
      .slice(0, 120) || fallback;

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
      const safeName = sanitizeDispositionFilename(row.original_name, 'file');
      const mimeType = String(row.mime_type || 'application/octet-stream');
      const isDownload = req.query.download === '1';

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', String(buffer.length));
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (mimeType === 'image/svg+xml') {
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'none'; style-src 'unsafe-inline'; sandbox"
        );
      }
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

  // Authenticated CMS upload endpoint for photos and PDF documents (allowed for Media Managers and News Editors)
  app.post('/api/cms/upload', requireCmsPermission('news', 'media_write'), (req: AuthenticatedRequest, res: Response) => {
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
          message: 'Format berkas harus berupa gambar (JPG/PNG/WebP/GIF/SVG) atau PDF.',
        });
        return;
      }

      const contentCheck = validateUploadedFileContent(file.mimetype, file.buffer);
      if (!contentCheck.valid) {
        res.status(400).json({
          ok: false,
          message: contentCheck.reason || 'Konten berkas tidak valid.',
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
  app.get('/api/cms/media', requireCmsPermission('news', 'media_read', 'media_write'), async (_req: AuthenticatedRequest, res: Response) => {
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

  app.get('/api/cms/media/export', requireCmsPermission('media_write'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.post('/api/cms/media/import', requireCmsPermission('media_write'), async (req: AuthenticatedRequest, res: Response) => {
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
        if (!validateUploadedFileContent(mimeType, buf).valid) {
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

  app.put('/api/cms/media/:id', requireCmsPermission('media_write'), (req: AuthenticatedRequest, res: Response) => {
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
          const contentCheck = validateUploadedFileContent(
            replacementFile.mimetype,
            replacementFile.buffer
          );
          if (!contentCheck.valid) {
            res.status(400).json({
              ok: false,
              message: contentCheck.reason || 'Isi berkas pengganti tidak valid.',
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

  app.delete('/api/cms/media/:id', requireCmsPermission('media_write'), async (req: AuthenticatedRequest, res: Response) => {
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
      const [magangGalleryRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_gallery WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
      );
      const [magangPositionRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_positions WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
      );
      const [homeBlockRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks WHERE is_visible = 1 ORDER BY page_slug ASC, sort_order ASC, id ASC'
      );
      const [tarifRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_tarif_items WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
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
        magangGallery: magangGalleryRows.map(mapMagangGalleryRow),
        magangPositions: magangPositionRows.map(mapMagangPositionRow),
        homeBlocks: homeBlockRows.map(mapHomeBlockRow),
        tarifItems: tarifRows.map(mapTarifItemRow),
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

  // Google Sheets Publish-to-Web CSV integration for /kerjasama
  const DEFAULT_KERJASAMA_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjfwTw9fR12XFZ1R3tYSai32rQdYb9ydZD7ciVqc9cD6nl4a9BIDj7jvD_901D3g/pub?gid=1878903189&single=true&output=csv';
  const DEFAULT_KERJASAMA_SHEET_LABEL = 'Sheet BPK';

  const isAllowedRemoteCsvUrl = (rawUrl: string): boolean => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return false;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return false;
      }
      const host = parsed.hostname.toLowerCase();
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host === '::1' ||
        host.endsWith('.local') ||
        host.endsWith('.internal') ||
        /^10\./.test(host) ||
        /^192\.168\./.test(host) ||
        /^169\.254\./.test(host) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(host)
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const sanitizeSheetExternalLink = (rawValue: string): string => {
    const trimmed = rawValue.trim();
    if (!trimmed) return '';
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
        ? parsed.toString()
        : '';
    } catch {
      return '';
    }
  };

  const parseCsvMatrix = (csvRaw: string): string[][] => {
    const text = csvRaw.replace(/^\uFEFF/, '');
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            currentCell += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          currentCell += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (ch === '\r') {
        if (text[i + 1] === '\n') i += 1;
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else if (ch === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += ch;
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }

    return rows;
  };

  const normalizeHeaderCell = (val: string): string =>
    val.toLowerCase().replace(/\s+/g, ' ').trim();

  const parseKerjasamaSheetCsv = (csvRaw: string) => {
    const rows = parseCsvMatrix(csvRaw);
    if (rows.length === 0) {
      return { title: 'Daftar Kerjasama', items: [] };
    }

    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(rows.length, 25); i += 1) {
      const normCells = rows[i].map(normalizeHeaderCell);
      const hasNama = normCells.some(
        (c) => c.includes('nama penyewa') || c === 'penyewa' || c === 'mitra'
      );
      const hasPerihal = normCells.some((c) => c.includes('perihal'));
      const hasJenis = normCells.some((c) => c === 'jenis' || c.includes('jenis'));
      const hasBerkas = normCells.some((c) => c.includes('berkas') || c.includes('dokumen'));
      if (hasNama && (hasPerihal || hasJenis || hasBerkas)) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx === -1) {
      headerRowIdx = 0;
    }

    const headerCells = (rows[headerRowIdx] || []).map(normalizeHeaderCell);
    const subHeaderCells = (rows[headerRowIdx + 1] || []).map(normalizeHeaderCell);

    const hasSubHeader = subHeaderCells.some(
      (c) => c === 'mulai' || c === 'selesai' || c.includes('tanggal mulai')
    );

    // Optional sheet title placed above the table header (e.g. Row 0: DAFTAR KERJASAMA SEWA)
    let sheetTitle = 'Daftar Kerjasama Sewa';
    for (let i = 0; i < headerRowIdx; i += 1) {
      const candidate = rows[i].find((cell) => cell.trim().length > 0);
      if (candidate) {
        sheetTitle = candidate.trim();
        break;
      }
    }

    const findCol = (matcher: (cell: string) => boolean, fallbackIdx: number): number => {
      const foundMain = headerCells.findIndex(matcher);
      if (foundMain >= 0) return foundMain;
      if (hasSubHeader) {
        const foundSub = subHeaderCells.findIndex(matcher);
        if (foundSub >= 0) return foundSub;
      }
      return fallbackIdx;
    };

    const idxNo = findCol((c) => c === 'no' || c === 'no.', 0);
    const idxNama = findCol((c) => c.includes('nama penyewa') || c === 'penyewa', 1);
    const idxMasa = findCol((c) => c.includes('masa sewa') || c.includes('kerjasama'), 2);
    const idxMulai = findCol((c) => c === 'mulai' || c.includes('mulai'), idxMasa);
    const idxSelesai = findCol((c) => c === 'selesai' || c.includes('selesai'), idxMulai + 1);
    const idxPerihal = findCol((c) => c.includes('perihal'), 4);
    const idxJenis = findCol((c) => c === 'jenis' || c.includes('jenis'), 5);
    const idxBerkas = findCol(
      (c) => c.includes('berkas') || c.includes('dokumen') || c.includes('link'),
      6
    );

    const dataStartIdx = hasSubHeader ? headerRowIdx + 2 : headerRowIdx + 1;
    const items: Array<{
      rowIndex: number;
      no: string;
      namaPenyewa: string;
      tanggalMulai: string;
      tanggalSelesai: string;
      perihal: string;
      jenis: string;
      berkasUrl: string;
    }> = [];

    for (let r = dataStartIdx; r < rows.length; r += 1) {
      const row = rows[r];
      if (!row || row.every((c) => !c.trim())) continue;

      const namaPenyewa = (row[idxNama] || '').trim();
      const perihal = (row[idxPerihal] || '').trim();
      if (!namaPenyewa && !perihal) continue;

      const normNama = normalizeHeaderCell(namaPenyewa);
      if (normNama === 'nama penyewa' || normNama === 'mulai') continue;

      const no = (row[idxNo] || '').trim() || String(items.length + 1);
      const tanggalMulai = (row[idxMulai] || '').trim();
      const tanggalSelesai = (row[idxSelesai] || '').trim();
      const jenis = (row[idxJenis] || '').trim();
      const rawBerkas = (row[idxBerkas] || '').trim();
      const berkasUrl = sanitizeSheetExternalLink(rawBerkas);

      items.push({
        rowIndex: items.length + 1,
        no,
        namaPenyewa,
        tanggalMulai,
        tanggalSelesai,
        perihal,
        jenis,
        berkasUrl,
      });
    }

    return { title: sheetTitle, items };
  };

  const fetchAndParseKerjasamaCsv = async (csvUrl: string) => {
    let currentUrl = csvUrl.trim();
    if (!isAllowedRemoteCsvUrl(currentUrl)) {
      throw new Error('Tautan CSV harus berupa URL publik http:// atau https:// yang valid.');
    }

    let upstream: globalThis.Response | null = null;
    for (let hop = 0; hop <= 3; hop += 1) {
      const response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(12000),
        headers: {
          Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8',
          'User-Agent': 'P2B-UIN-Salatiga-Portal/1.0',
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error('Respons pengalihan CSV tidak valid.');
        }
        const resolvedNext = new URL(location, currentUrl).toString();
        if (!isAllowedRemoteCsvUrl(resolvedNext)) {
          throw new Error('Pengalihan tautan CSV menuju alamat jaringan yang tidak diizinkan.');
        }
        currentUrl = resolvedNext;
        continue;
      }

      upstream = response;
      break;
    }

    if (!upstream) {
      throw new Error('Terlalu banyak pengalihan URL saat mengambil CSV Google Sheets.');
    }

    if (!upstream.ok) {
      throw new Error(
        `Gagal mengambil CSV dari Google Sheets (HTTP ${upstream.status}). Pastikan sheet sudah dipublikasikan sebagai CSV.`
      );
    }

    const rawText = await upstream.text();
    if (/^\s*<!doctype html/i.test(rawText) || /^\s*<html/i.test(rawText)) {
      throw new Error(
        'Tautan mengembalikan halaman HTML, bukan CSV. Pastikan opsi Publish to Web memilih format Comma-separated values (.csv).'
      );
    }

    return parseKerjasamaSheetCsv(rawText);
  };

  app.get('/api/public/kerjasama', kerjasamaProxyRateLimiter, async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    let csvUrl = DEFAULT_KERJASAMA_CSV_URL;
    let sheetLabel = DEFAULT_KERJASAMA_SHEET_LABEL;

    if (!dbReady) {
      await ensureDatabaseReady().catch(() => {});
    }

    if (dbReady) {
      try {
        const settings = await fetchSiteSettingsMap();
        if (settings.kerjasama_csv_url?.trim()) {
          csvUrl = settings.kerjasama_csv_url.trim();
        }
        if (settings.kerjasama_sheet_label?.trim()) {
          sheetLabel = settings.kerjasama_sheet_label.trim();
        }
      } catch {
        // Use defaults if settings query fails
      }
    }

    try {
      const parsed = await fetchAndParseKerjasamaCsv(csvUrl);
      res.json({
        ok: true,
        title: parsed.title,
        sheetLabel,
        csvUrl,
        fetchedAt: new Date().toISOString(),
        items: parsed.items,
      });
    } catch (err) {
      res.status(502).json({
        ok: false,
        title: 'Daftar Kerjasama',
        sheetLabel,
        csvUrl,
        fetchedAt: new Date().toISOString(),
        items: [],
        message:
          err instanceof Error
            ? err.message
            : 'Gagal membaca data kerjasama dari Google Sheets.',
      });
    }
  });

  app.post(
    '/api/cms/kerjasama/preview',
    requireCmsPermission('kerjasama', 'settings'),
    async (req: AuthenticatedRequest, res: Response) => {
      const body = req.body as { csvUrl?: string };
      let csvUrl = String(body?.csvUrl || '').trim();
      let sheetLabel = DEFAULT_KERJASAMA_SHEET_LABEL;

      if (!csvUrl && dbReady) {
        try {
          const settings = await fetchSiteSettingsMap();
          csvUrl = settings.kerjasama_csv_url?.trim() || DEFAULT_KERJASAMA_CSV_URL;
          sheetLabel = settings.kerjasama_sheet_label?.trim() || DEFAULT_KERJASAMA_SHEET_LABEL;
        } catch {
          csvUrl = DEFAULT_KERJASAMA_CSV_URL;
        }
      }
      if (!csvUrl) {
        csvUrl = DEFAULT_KERJASAMA_CSV_URL;
      }

      try {
        const parsed = await fetchAndParseKerjasamaCsv(csvUrl);
        res.json({
          ok: true,
          title: parsed.title,
          sheetLabel,
          csvUrl,
          fetchedAt: new Date().toISOString(),
          items: parsed.items,
        });
      } catch (err) {
        res.status(400).json({
          ok: false,
          title: 'Daftar Kerjasama',
          sheetLabel,
          csvUrl,
          fetchedAt: new Date().toISOString(),
          items: [],
          message:
            err instanceof Error
              ? err.message
              : 'Gagal memuat pratinjau CSV Google Sheets.',
        });
      }
    }
  );

  // Public Internship Application Submission (multipart/form-data with optional PDF/DOC/image resume & portfolio)
  const ALLOWED_APPLICANT_MIMES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]);
  const APPLICANT_FACULTIES = new Set([
    'Ekonomi dan Bisnis Syariah',
    'Dakwah',
    'Tarbiah dan Ilmu Keguruan',
    'Ushuluddin, Adab dan Humaniora',
    'Syariah',
    'Sains dan Teknologi',
  ]);

  app.post('/api/public/magang/apply', magangApplyRateLimiter, (req: Request, res: Response) => {
    upload.fields([
      { name: 'resumeFile', maxCount: 1 },
      { name: 'portfolioFile', maxCount: 1 },
    ])(req, res, async (uploadErr: unknown) => {
      if (uploadErr) {
        const msg = uploadErr instanceof Error ? uploadErr.message : 'Gagal mengunggah berkas pendaftaran.';
        res.status(400).json({
          ok: false,
          message: msg.includes('File too large')
            ? 'Ukuran masing-masing berkas maksimal 12 MB.'
            : msg,
        });
        return;
      }

      if (!dbReady) {
        await ensureDatabaseReady();
      }
      if (!dbReady) {
        res.status(503).json({
          ok: false,
          message: 'Layanan pendaftaran sedang mengalami gangguan koneksi database.',
        });
        return;
      }

      const body = (req.body || {}) as Record<string, unknown>;
      const fullName = String(body.fullName || '').trim().slice(0, 160);
      const email = String(body.email || '').trim().slice(0, 180);
      const phone = String(body.phone || '').trim().slice(0, 40);
      const studyProgram = String(body.studyProgram || '').trim().slice(0, 160);
      const faculty = String(body.faculty || '').trim().slice(0, 160);
      const aboutP2b = String(body.aboutP2b || '').trim().slice(0, 4000);
      const positionId = Number(body.positionId);
      const interestReason = String(body.interestReason || '').trim().slice(0, 4000);
      const resumeUrlRaw = String(body.resumeUrl || '').trim().slice(0, 1000);
      const portfolioUrlRaw = String(body.portfolioUrl || '').trim().slice(0, 1000);
      const expectations = String(body.expectations || '').trim().slice(0, 4000);

      if (!fullName || !email || !phone || !studyProgram || !faculty || !aboutP2b || !interestReason || !expectations) {
        res.status(400).json({
          ok: false,
          message: 'Seluruh kolom wajib formulir pendaftaran magang harus diisi.',
        });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ ok: false, message: 'Format alamat email tidak valid.' });
        return;
      }

      if (phone.replace(/[^0-9]/g, '').length < 8) {
        res.status(400).json({ ok: false, message: 'Nomor telepon minimal terdiri dari 8 digit.' });
        return;
      }

      if (!APPLICANT_FACULTIES.has(faculty)) {
        res.status(400).json({ ok: false, message: 'Pilihan fakultas tidak valid.' });
        return;
      }

      if (!Number.isInteger(positionId) || positionId <= 0) {
        res.status(400).json({ ok: false, message: 'Silakan pilih posisi magang yang tersedia.' });
        return;
      }

      const filesMap = (req.files || {}) as Record<string, Express.Multer.File[]>;
      const resumeFile = filesMap.resumeFile?.[0] || null;
      const portfolioFile = filesMap.portfolioFile?.[0] || null;

      if (resumeFile) {
        if (!ALLOWED_APPLICANT_MIMES.has(resumeFile.mimetype)) {
          res.status(400).json({
            ok: false,
            message: 'Format berkas lamaran/resume harus berupa PDF, DOC/DOCX, atau gambar (JPG/PNG/WebP).',
          });
          return;
        }
        const resumeCheck = validateUploadedFileContent(
          resumeFile.mimetype,
          resumeFile.buffer
        );
        if (!resumeCheck.valid) {
          res.status(400).json({
            ok: false,
            message: resumeCheck.reason || 'Isi berkas lamaran/resume tidak valid.',
          });
          return;
        }
      }
      if (portfolioFile) {
        if (!ALLOWED_APPLICANT_MIMES.has(portfolioFile.mimetype)) {
          res.status(400).json({
            ok: false,
            message: 'Format berkas portofolio harus berupa PDF, DOC/DOCX, atau gambar (JPG/PNG/WebP).',
          });
          return;
        }
        const portfolioCheck = validateUploadedFileContent(
          portfolioFile.mimetype,
          portfolioFile.buffer
        );
        if (!portfolioCheck.valid) {
          res.status(400).json({
            ok: false,
            message: portfolioCheck.reason || 'Isi berkas portofolio tidak valid.',
          });
          return;
        }
      }

      if (resumeUrlRaw && !isSafeHttpUrl(resumeUrlRaw)) {
        res.status(400).json({
          ok: false,
          message: 'Tautan surat lamaran/resume harus diawali http:// atau https://.',
        });
        return;
      }
      if (portfolioUrlRaw && !isSafeHttpUrl(portfolioUrlRaw)) {
        res.status(400).json({
          ok: false,
          message: 'Tautan portofolio harus diawali http:// atau https://.',
        });
        return;
      }

      if (!resumeFile && !resumeUrlRaw) {
        res.status(400).json({
          ok: false,
          message: 'Harap unggah berkas atau sertakan tautan surat lamaran/resume Anda.',
        });
        return;
      }
      if (!portfolioFile && !portfolioUrlRaw) {
        res.status(400).json({
          ok: false,
          message: 'Harap unggah berkas atau sertakan tautan portofolio Anda.',
        });
        return;
      }

      try {
        const [posRows] = await pool.query<RowDataPacket[]>(
          'SELECT id, title, is_active, is_available FROM cms_magang_positions WHERE id = ? LIMIT 1',
          [positionId]
        );
        if (posRows.length === 0 || !Boolean(posRows[0].is_active)) {
          res.status(400).json({
            ok: false,
            message: 'Posisi magang yang dipilih tidak ditemukan.',
          });
          return;
        }
        if (!Boolean(posRows[0].is_available)) {
          res.status(400).json({
            ok: false,
            message: `Maaf, posisi "${String(posRows[0].title)}" saat ini sedang tidak tersedia / kuota penuh.`,
          });
          return;
        }

        const positionTitle = String(posRows[0].title);
        let resumeFileId: string | null = null;
        let resumeFileName: string | null = null;
        let portfolioFileId: string | null = null;
        let portfolioFileName: string | null = null;

        if (resumeFile) {
          resumeFileId = crypto.randomBytes(12).toString('hex');
          resumeFileName =
            path
              .basename(resumeFile.originalname || 'resume.pdf')
              .replace(/[^a-zA-Z0-9._-]/g, '_')
              .slice(0, 120) || 'resume';
          await pool.query(
            'INSERT INTO cms_magang_applicant_files (id, original_name, mime_type, size_bytes, data) VALUES (?, ?, ?, ?, ?)',
            [resumeFileId, resumeFileName, resumeFile.mimetype, resumeFile.size, resumeFile.buffer]
          );
        }

        if (portfolioFile) {
          portfolioFileId = crypto.randomBytes(12).toString('hex');
          portfolioFileName =
            path
              .basename(portfolioFile.originalname || 'portofolio.pdf')
              .replace(/[^a-zA-Z0-9._-]/g, '_')
              .slice(0, 120) || 'portofolio';
          await pool.query(
            'INSERT INTO cms_magang_applicant_files (id, original_name, mime_type, size_bytes, data) VALUES (?, ?, ?, ?, ?)',
            [
              portfolioFileId,
              portfolioFileName,
              portfolioFile.mimetype,
              portfolioFile.size,
              portfolioFile.buffer,
            ]
          );
        }

        const registrationCode = `MGG-${new Date().getFullYear()}-${crypto
          .randomBytes(3)
          .toString('hex')
          .toUpperCase()}`;

        const [insertResult] = await pool.query<ResultSetHeader>(
          `INSERT INTO cms_magang_applications
            (registration_code, full_name, email, phone, study_program, faculty, about_p2b, position_id, position_title, interest_reason, resume_file_id, resume_file_name, resume_url, portfolio_file_id, portfolio_file_name, portfolio_url, expectations, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'baru')`,
          [
            registrationCode,
            fullName,
            email,
            phone,
            studyProgram,
            faculty,
            aboutP2b,
            positionId,
            positionTitle,
            interestReason,
            resumeFileId,
            resumeFileName,
            resumeUrlRaw || null,
            portfolioFileId,
            portfolioFileName,
            portfolioUrlRaw || null,
            expectations,
          ]
        );

        await notifyCmsDataCommitted('magang_applications', 'created', insertResult.insertId);
        res.status(201).json({
          ok: true,
          registrationCode,
          positionTitle,
          message: 'Pendaftaran magang Anda berhasil dikirim.',
        });
      } catch (err) {
        res.status(500).json({
          ok: false,
          message:
            err instanceof Error
              ? err.message
              : 'Gagal menyimpan pendaftaran magang.',
        });
      }
    });
  });

  // Better Auth First-Run Super Admin Setup (locked once any user exists)
  app.get('/api/auth-setup/status', async (_req: Request, res: Response) => {
    if (!dbReady) {
      await ensureDatabaseReady();
    }
    if (!dbReady) {
      res.status(503).json({
        ok: false,
        needsSetup: false,
        message: `Database tidak dapat diakses: ${dbInitError || 'Periksa koneksi database.'}`,
      });
      return;
    }
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM `user`');
      const totalUsers = Number(rows[0]?.total || 0);
      res.json({ ok: true, needsSetup: totalUsers === 0 });
    } catch (err) {
      res.status(500).json({
        ok: false,
        needsSetup: false,
        message: err instanceof Error ? err.message : 'Gagal memeriksa status akun.',
      });
    }
  });

  app.post('/api/auth-setup/claim', async (req: Request, res: Response) => {
    if (!dbReady) {
      await ensureDatabaseReady();
    }
    if (!dbReady) {
      res.status(503).json({
        ok: false,
        message: `Database tidak dapat diakses: ${dbInitError || 'Periksa koneksi database.'}`,
      });
      return;
    }

    const { username, displayName, email, password } = req.body as {
      username?: string;
      displayName?: string;
      email?: string;
      password?: string;
    };

    const cleanUsername = String(username || '').trim();
    if (!cleanUsername || cleanUsername.length < 3 || !/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
      res.status(400).json({
        ok: false,
        message: 'Username minimal 3 karakter dan hanya boleh menggunakan huruf, angka, titik, atau garis bawah.',
      });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({
        ok: false,
        message: 'Password minimal 6 karakter.',
      });
      return;
    }

    try {
      const created = await createFirstRunSuperAdmin({
        username: cleanUsername,
        displayName: String(displayName || cleanUsername).trim(),
        email,
        password,
      });
      res.status(201).json({ ok: true, user: created });
    } catch (err) {
      if (err instanceof Error && err.message === 'ALREADY_INITIALIZED') {
        res.status(409).json({
          ok: false,
          message: 'Akun Super Admin sudah terdaftar. Silakan masuk melalui formulir login.',
        });
        return;
      }
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal membuat akun Super Admin.',
      });
    }
  });

  // CMS Session & Profile Introspection
  app.post('/api/cms/logout', async (req: Request, res: Response) => {
    try {
      await auth.api.signOut({ headers: fromNodeHeaders(req.headers) });
    } catch {
      // ignore if already signed out
    }
    res.json({ ok: true });
  });

  app.get('/api/cms/me', requireCmsAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [verRows] = await pool.query<RowDataPacket[]>('SELECT VERSION() AS ver');
      const user = req.cmsUser!;
      res.json({
        ok: true,
        user: {
          id: user.userId,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          roleLabel: user.roleLabel,
          permissions: getPermissionsForRole(user.role),
        },
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
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        },
        headers: fromNodeHeaders(req.headers),
      });
      res.json({ ok: true, message: 'Password berhasil diperbarui.' });
    } catch (err) {
      res.status(400).json({
        ok: false,
        message:
          err instanceof Error && err.message
            ? err.message
            : 'Password saat ini tidak sesuai atau gagal memperbarui password.',
      });
    }
  });

  // CMS Overview stats
  app.get('/api/cms/overview', requireCmsPermission('overview'), async (_req: AuthenticatedRequest, res: Response) => {
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
  app.get('/api/cms/news', requireCmsPermission('news'), async (_req: AuthenticatedRequest, res: Response) => {
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
  app.get('/api/cms/news/export', requireCmsPermission('news'), async (req: AuthenticatedRequest, res: Response) => {
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
  app.post('/api/cms/news/import', requireCmsPermission('news'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.post('/api/cms/news', requireCmsPermission('news'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.put('/api/cms/news/:id', requireCmsPermission('news'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.post('/api/cms/news/bulk-delete', requireCmsPermission('news'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.delete('/api/cms/news/:id', requireCmsPermission('news'), async (req: AuthenticatedRequest, res: Response) => {
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
  app.get('/api/cms/categories', requireCmsPermission('news'), async (_req: AuthenticatedRequest, res: Response) => {
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

  app.post('/api/cms/categories', requireCmsPermission('news'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.put('/api/cms/categories/:id', requireCmsPermission('news'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.delete('/api/cms/categories/:id', requireCmsPermission('news'), async (req: AuthenticatedRequest, res: Response) => {
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
  app.get('/api/cms/partner-logos', requireCmsPermission('logos'), async (_req: AuthenticatedRequest, res: Response) => {
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

  app.post('/api/cms/partner-logos', requireCmsPermission('logos'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.patch('/api/cms/partner-logos/reorder', requireCmsPermission('logos'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.put('/api/cms/partner-logos/:id', requireCmsPermission('logos'), async (req: AuthenticatedRequest, res: Response) => {
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

  app.delete('/api/cms/partner-logos/:id', requireCmsPermission('logos'), async (req: AuthenticatedRequest, res: Response) => {
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

  // CMS Magang Gallery CRUD & Reordering
  app.get('/api/cms/magang-gallery', requireCmsPermission('magang'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_gallery ORDER BY sort_order ASC, id ASC'
      );
      res.json({ ok: true, items: rows.map(mapMagangGalleryRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat galeri foto magang.',
      });
    }
  });

  app.post('/api/cms/magang-gallery', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const { title, caption, imageUrl, altText, sortOrder, isActive } = req.body as {
      title?: string;
      caption?: string;
      imageUrl?: string;
      altText?: string;
      sortOrder?: number;
      isActive?: boolean;
    };

    if (!title?.trim() || !imageUrl?.trim()) {
      res.status(400).json({ ok: false, message: 'Judul foto dan gambar galeri wajib diisi.' });
      return;
    }

    try {
      let nextOrder = Number(sortOrder);
      if (!Number.isFinite(nextOrder) || nextOrder <= 0) {
        const [maxRows] = await pool.query<RowDataPacket[]>(
          'SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM cms_magang_gallery'
        );
        nextOrder = Number(maxRows[0]?.maxOrder || 0) + 1;
      }

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO cms_magang_gallery (title, caption, image_url, alt_text, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title.trim().slice(0, 180),
          (caption || '').trim(),
          imageUrl.trim(),
          (altText || title).trim().slice(0, 255),
          nextOrder,
          isActive === false ? 0 : 1,
        ]
      );

      const [inserted] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_gallery WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      await notifyCmsDataCommitted('magang_gallery', 'created', result.insertId);
      res.status(201).json({ ok: true, item: mapMagangGalleryRow(inserted[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menambahkan foto galeri magang.',
      });
    }
  });

  app.patch('/api/cms/magang-gallery/reorder', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const { orderedIds } = req.body as { orderedIds?: unknown[] };
    const cleanIds = Array.isArray(orderedIds)
      ? orderedIds.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0)
      : [];

    if (cleanIds.length === 0) {
      res.status(400).json({ ok: false, message: 'Urutan ID foto galeri tidak valid.' });
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
        `UPDATE cms_magang_gallery SET sort_order = CASE id ${caseParts} ELSE sort_order END WHERE id IN (${inPlaceholders})`,
        [...caseParams, ...cleanIds]
      );
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_gallery ORDER BY sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('magang_gallery', 'reordered');
      res.json({ ok: true, items: rows.map(mapMagangGalleryRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menyimpan urutan galeri magang.',
      });
    }
  });

  app.put('/api/cms/magang-gallery/:id', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const itemId = Number(req.params.id);
    if (!Number.isFinite(itemId)) {
      res.status(400).json({ ok: false, message: 'ID foto galeri tidak valid.' });
      return;
    }

    const { title, caption, imageUrl, altText, sortOrder, isActive } = req.body as {
      title?: string;
      caption?: string;
      imageUrl?: string;
      altText?: string;
      sortOrder?: number;
      isActive?: boolean;
    };

    if (!title?.trim() || !imageUrl?.trim()) {
      res.status(400).json({ ok: false, message: 'Judul foto dan gambar galeri wajib diisi.' });
      return;
    }

    const orderNum =
      Number.isFinite(Number(sortOrder)) && Number(sortOrder) > 0 ? Number(sortOrder) : 1;

    try {
      await pool.query(
        `UPDATE cms_magang_gallery
         SET title = ?, caption = ?, image_url = ?, alt_text = ?, sort_order = ?, is_active = ?
         WHERE id = ?`,
        [
          title.trim().slice(0, 180),
          (caption || '').trim(),
          imageUrl.trim(),
          (altText || title).trim().slice(0, 255),
          orderNum,
          isActive === false ? 0 : 1,
          itemId,
        ]
      );

      const [updated] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_gallery WHERE id = ? LIMIT 1',
        [itemId]
      );
      if (updated.length === 0) {
        res.status(404).json({ ok: false, message: 'Foto galeri tidak ditemukan.' });
        return;
      }
      await notifyCmsDataCommitted('magang_gallery', 'updated', itemId);
      res.json({ ok: true, item: mapMagangGalleryRow(updated[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui foto galeri.',
      });
    }
  });

  app.delete('/api/cms/magang-gallery/:id', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const itemId = Number(req.params.id);
    if (!Number.isFinite(itemId)) {
      res.status(400).json({ ok: false, message: 'ID foto galeri tidak valid.' });
      return;
    }
    try {
      await pool.query('DELETE FROM cms_magang_gallery WHERE id = ?', [itemId]);
      await notifyCmsDataCommitted('magang_gallery', 'deleted', itemId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus foto galeri.',
      });
    }
  });

  // CMS Magang Positions CRUD & Reordering
  app.get('/api/cms/magang-positions', requireCmsPermission('magang'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_positions ORDER BY sort_order ASC, id ASC'
      );
      res.json({ ok: true, items: rows.map(mapMagangPositionRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat posisi magang.',
      });
    }
  });

  app.post('/api/cms/magang-positions', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const { title, division, description, imageUrl, tasks, sortOrder, isActive, isAvailable } = req.body as {
      title?: string;
      division?: string;
      description?: string;
      imageUrl?: string;
      tasks?: unknown[];
      sortOrder?: number;
      isActive?: boolean;
      isAvailable?: boolean;
    };

    if (!title?.trim() || !description?.trim() || !imageUrl?.trim()) {
      res.status(400).json({ ok: false, message: 'Nama posisi, deskripsi, dan gambar wajib diisi.' });
      return;
    }

    const cleanTasks = Array.isArray(tasks)
      ? tasks.map((t) => String(t).trim()).filter(Boolean)
      : [];

    try {
      let nextOrder = Number(sortOrder);
      if (!Number.isFinite(nextOrder) || nextOrder <= 0) {
        const [maxRows] = await pool.query<RowDataPacket[]>(
          'SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM cms_magang_positions'
        );
        nextOrder = Number(maxRows[0]?.maxOrder || 0) + 1;
      }

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO cms_magang_positions (title, division, description, image_url, tasks_json, sort_order, is_active, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim().slice(0, 160),
          (division || 'Unit Bisnis P2B').trim().slice(0, 160),
          description.trim(),
          imageUrl.trim(),
          JSON.stringify(cleanTasks),
          nextOrder,
          isActive === false ? 0 : 1,
          isAvailable === false ? 0 : 1,
        ]
      );

      const [inserted] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_positions WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      await notifyCmsDataCommitted('magang_positions', 'created', result.insertId);
      res.status(201).json({ ok: true, item: mapMagangPositionRow(inserted[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menambahkan posisi magang.',
      });
    }
  });

  app.patch('/api/cms/magang-positions/reorder', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const { orderedIds } = req.body as { orderedIds?: unknown[] };
    const cleanIds = Array.isArray(orderedIds)
      ? orderedIds.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0)
      : [];

    if (cleanIds.length === 0) {
      res.status(400).json({ ok: false, message: 'Urutan ID posisi magang tidak valid.' });
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
        `UPDATE cms_magang_positions SET sort_order = CASE id ${caseParts} ELSE sort_order END WHERE id IN (${inPlaceholders})`,
        [...caseParams, ...cleanIds]
      );
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_positions ORDER BY sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('magang_positions', 'reordered');
      res.json({ ok: true, items: rows.map(mapMagangPositionRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menyimpan urutan posisi magang.',
      });
    }
  });

  app.put('/api/cms/magang-positions/:id', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const posId = Number(req.params.id);
    if (!Number.isFinite(posId)) {
      res.status(400).json({ ok: false, message: 'ID posisi magang tidak valid.' });
      return;
    }

    const { title, division, description, imageUrl, tasks, sortOrder, isActive, isAvailable } = req.body as {
      title?: string;
      division?: string;
      description?: string;
      imageUrl?: string;
      tasks?: unknown[];
      sortOrder?: number;
      isActive?: boolean;
      isAvailable?: boolean;
    };

    if (!title?.trim() || !description?.trim() || !imageUrl?.trim()) {
      res.status(400).json({ ok: false, message: 'Nama posisi, deskripsi, dan gambar wajib diisi.' });
      return;
    }

    const cleanTasks = Array.isArray(tasks)
      ? tasks.map((t) => String(t).trim()).filter(Boolean)
      : [];
    const orderNum =
      Number.isFinite(Number(sortOrder)) && Number(sortOrder) > 0 ? Number(sortOrder) : 1;

    try {
      await pool.query(
        `UPDATE cms_magang_positions
         SET title = ?, division = ?, description = ?, image_url = ?, tasks_json = ?, sort_order = ?, is_active = ?, is_available = ?
         WHERE id = ?`,
        [
          title.trim().slice(0, 160),
          (division || 'Unit Bisnis P2B').trim().slice(0, 160),
          description.trim(),
          imageUrl.trim(),
          JSON.stringify(cleanTasks),
          orderNum,
          isActive === false ? 0 : 1,
          isAvailable === false ? 0 : 1,
          posId,
        ]
      );

      const [updated] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_positions WHERE id = ? LIMIT 1',
        [posId]
      );
      if (updated.length === 0) {
        res.status(404).json({ ok: false, message: 'Posisi magang tidak ditemukan.' });
        return;
      }
      await notifyCmsDataCommitted('magang_positions', 'updated', posId);
      res.json({ ok: true, item: mapMagangPositionRow(updated[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui posisi magang.',
      });
    }
  });

  app.delete('/api/cms/magang-positions/:id', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const posId = Number(req.params.id);
    if (!Number.isFinite(posId)) {
      res.status(400).json({ ok: false, message: 'ID posisi magang tidak valid.' });
      return;
    }
    try {
      await pool.query('DELETE FROM cms_magang_positions WHERE id = ?', [posId]);
      await notifyCmsDataCommitted('magang_positions', 'deleted', posId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus posisi magang.',
      });
    }
  });

  // CMS Magang Applications Review & Secure File Download
  app.get('/api/cms/magang-applications', requireCmsPermission('magang'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_applications ORDER BY created_at DESC, id DESC'
      );
      res.json({ ok: true, items: rows.map(mapMagangApplicationRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat daftar pendaftar magang.',
      });
    }
  });

  app.patch('/api/cms/magang-applications/:id/status', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const appId = Number(req.params.id);
    const { status } = req.body as { status?: string };
    const allowedStatuses = new Set(['baru', 'ditinjau', 'diterima', 'ditolak']);
    if (!Number.isFinite(appId) || !status || !allowedStatuses.has(status)) {
      res.status(400).json({ ok: false, message: 'ID atau status pendaftaran tidak valid.' });
      return;
    }
    try {
      await pool.query('UPDATE cms_magang_applications SET status = ? WHERE id = ?', [status, appId]);
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_magang_applications WHERE id = ? LIMIT 1',
        [appId]
      );
      if (rows.length === 0) {
        res.status(404).json({ ok: false, message: 'Data pendaftar tidak ditemukan.' });
        return;
      }
      await notifyCmsDataCommitted('magang_applications', 'status_updated', appId);
      res.json({ ok: true, item: mapMagangApplicationRow(rows[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui status pendaftar.',
      });
    }
  });

  app.delete('/api/cms/magang-applications/:id', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const appId = Number(req.params.id);
    if (!Number.isFinite(appId)) {
      res.status(400).json({ ok: false, message: 'ID pendaftar tidak valid.' });
      return;
    }
    try {
      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT resume_file_id, portfolio_file_id FROM cms_magang_applications WHERE id = ? LIMIT 1',
        [appId]
      );
      await pool.query('DELETE FROM cms_magang_applications WHERE id = ?', [appId]);
      const fileIds = [
        existingRows[0]?.resume_file_id ? String(existingRows[0].resume_file_id) : '',
        existingRows[0]?.portfolio_file_id ? String(existingRows[0].portfolio_file_id) : '',
      ].filter(Boolean);
      if (fileIds.length > 0) {
        const placeholders = fileIds.map(() => '?').join(',');
        await pool.query(
          `DELETE FROM cms_magang_applicant_files WHERE id IN (${placeholders})`,
          fileIds
        );
      }
      await notifyCmsDataCommitted('magang_applications', 'deleted', appId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus data pendaftar.',
      });
    }
  });

  app.get('/api/cms/magang-files/:id', requireCmsPermission('magang'), async (req: AuthenticatedRequest, res: Response) => {
    const fileId = String(req.params.id || '').trim();
    if (!fileId || !/^[a-zA-Z0-9_-]{4,48}$/.test(fileId)) {
      res.status(400).json({ ok: false, message: 'ID berkas tidak valid.' });
      return;
    }
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT original_name, mime_type, size_bytes, data FROM cms_magang_applicant_files WHERE id = ? LIMIT 1',
        [fileId]
      );
      if (rows.length === 0) {
        res.status(404).send('Berkas pendaftar tidak ditemukan.');
        return;
      }
      const row = rows[0];
      const buffer = Buffer.isBuffer(row.data)
        ? row.data
        : Buffer.from(row.data as Uint8Array);
      const safeName = sanitizeDispositionFilename(row.original_name, 'berkas');
      res.setHeader('Content-Type', String(row.mime_type || 'application/octet-stream'));
      res.setHeader('Content-Length', String(buffer.length));
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
      res.send(buffer);
    } catch {
      res.status(500).send('Gagal mengunduh berkas pendaftar.');
    }
  });

  // CMS Site Settings Read & Update
  app.get('/api/cms/settings', requireCmsPermission('settings', 'kerjasama', 'tarif'), async (_req: AuthenticatedRequest, res: Response) => {
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

  app.put('/api/cms/settings', requireCmsPermission('settings', 'kerjasama', 'tarif'), async (req: AuthenticatedRequest, res: Response) => {
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

  // CMS Multi-Page Page Builder CRUD, Duplicate, Reorder & Reset
  app.get('/api/cms/home-blocks', requireCmsPermission('homebuilder'), async (req: AuthenticatedRequest, res: Response) => {
    const rawPageSlug = typeof req.query.pageSlug === 'string' ? req.query.pageSlug.trim() : '';
    try {
      if (rawPageSlug) {
        if (!BUILDER_PAGE_SLUG_SET.has(rawPageSlug)) {
          res.status(400).json({ ok: false, message: 'Halaman builder tidak valid.' });
          return;
        }
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT * FROM cms_home_blocks WHERE page_slug = ? ORDER BY sort_order ASC, id ASC',
          [rawPageSlug]
        );
        res.json({ ok: true, items: rows.map(mapHomeBlockRow) });
        return;
      }

      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks ORDER BY page_slug ASC, sort_order ASC, id ASC'
      );
      res.json({ ok: true, items: rows.map(mapHomeBlockRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat elemen halaman.',
      });
    }
  });

  app.post('/api/cms/home-blocks', requireCmsPermission('homebuilder'), async (req: AuthenticatedRequest, res: Response) => {
    const { pageSlug, blockType, label, config, isVisible } = req.body as {
      pageSlug?: string;
      blockType?: string;
      label?: string;
      config?: Record<string, unknown>;
      isVisible?: boolean;
    };

    const cleanPageSlug = String(pageSlug || 'home').trim();
    if (!BUILDER_PAGE_SLUG_SET.has(cleanPageSlug)) {
      res.status(400).json({ ok: false, message: 'Target halaman builder tidak valid.' });
      return;
    }

    const cleanType = String(blockType || '').trim();
    if (!HOME_BLOCK_TYPE_SET.has(cleanType)) {
      res.status(400).json({ ok: false, message: 'Tipe elemen builder tidak valid.' });
      return;
    }

    const cleanLabel = String(label || cleanType).trim().slice(0, 160) || cleanType;
    const cleanConfig =
      config && typeof config === 'object' && !Array.isArray(config)
        ? (sanitizeHomeBlockConfigValue(config) as Record<string, unknown>)
        : {};

    try {
      const [maxRows] = await pool.query<RowDataPacket[]>(
        'SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM cms_home_blocks WHERE page_slug = ?',
        [cleanPageSlug]
      );
      const nextOrder = Number(maxRows[0]?.max_order || 0) + 1;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO cms_home_blocks (page_slug, block_type, block_label, config_json, sort_order, is_visible)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          cleanPageSlug,
          cleanType,
          cleanLabel,
          JSON.stringify(cleanConfig),
          nextOrder,
          isVisible === false ? 0 : 1,
        ]
      );

      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      await notifyCmsDataCommitted('home_blocks', 'created', result.insertId);
      res.status(201).json({ ok: true, item: mapHomeBlockRow(rows[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menambah elemen halaman.',
      });
    }
  });

  app.put('/api/cms/home-blocks/reorder', requireCmsPermission('homebuilder'), async (req: AuthenticatedRequest, res: Response) => {
    const { orderedIds } = req.body as { orderedIds?: unknown[] };
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ ok: false, message: 'Daftar urutan elemen tidak valid.' });
      return;
    }

    const cleanIds = orderedIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
    if (cleanIds.length === 0) {
      res.status(400).json({ ok: false, message: 'ID elemen urutan tidak valid.' });
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
        `UPDATE cms_home_blocks SET sort_order = CASE id ${caseParts} ELSE sort_order END WHERE id IN (${inPlaceholders})`,
        [...caseParams, ...cleanIds]
      );
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks ORDER BY page_slug ASC, sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('home_blocks', 'reordered');
      res.json({ ok: true, items: rows.map(mapHomeBlockRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menyimpan urutan elemen halaman.',
      });
    }
  });

  app.put('/api/cms/home-blocks/:id', requireCmsPermission('homebuilder'), async (req: AuthenticatedRequest, res: Response) => {
    const blockId = Number(req.params.id);
    if (!Number.isFinite(blockId) || blockId <= 0) {
      res.status(400).json({ ok: false, message: 'ID elemen tidak valid.' });
      return;
    }

    const { label, config, isVisible } = req.body as {
      label?: string;
      config?: Record<string, unknown>;
      isVisible?: boolean;
    };

    try {
      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks WHERE id = ? LIMIT 1',
        [blockId]
      );
      if (existingRows.length === 0) {
        res.status(404).json({ ok: false, message: 'Elemen halaman tidak ditemukan.' });
        return;
      }

      const current = mapHomeBlockRow(existingRows[0]);
      const nextLabel =
        typeof label === 'string' && label.trim()
          ? label.trim().slice(0, 160)
          : current.label;
      const nextConfig =
        config && typeof config === 'object' && !Array.isArray(config)
          ? (sanitizeHomeBlockConfigValue(config) as Record<string, unknown>)
          : current.config;
      const nextVisible =
        typeof isVisible === 'boolean' ? isVisible : current.isVisible;

      await pool.query(
        `UPDATE cms_home_blocks
         SET block_label = ?, config_json = ?, is_visible = ?
         WHERE id = ?`,
        [nextLabel, JSON.stringify(nextConfig), nextVisible ? 1 : 0, blockId]
      );

      const [updatedRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks WHERE id = ? LIMIT 1',
        [blockId]
      );
      await notifyCmsDataCommitted('home_blocks', 'updated', blockId);
      res.json({ ok: true, item: mapHomeBlockRow(updatedRows[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui elemen halaman.',
      });
    }
  });

  app.post('/api/cms/home-blocks/:id/duplicate', requireCmsPermission('homebuilder'), async (req: AuthenticatedRequest, res: Response) => {
    const blockId = Number(req.params.id);
    if (!Number.isFinite(blockId) || blockId <= 0) {
      res.status(400).json({ ok: false, message: 'ID elemen tidak valid.' });
      return;
    }

    const { targetPageSlug } = (req.body || {}) as { targetPageSlug?: string };
    const cleanTargetSlug = targetPageSlug ? String(targetPageSlug).trim() : '';
    if (cleanTargetSlug && !BUILDER_PAGE_SLUG_SET.has(cleanTargetSlug)) {
      res.status(400).json({ ok: false, message: 'Halaman tujuan salinan tidak valid.' });
      return;
    }

    try {
      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks WHERE id = ? LIMIT 1',
        [blockId]
      );
      if (existingRows.length === 0) {
        res.status(404).json({ ok: false, message: 'Elemen yang akan diduplikasi tidak ditemukan.' });
        return;
      }

      const source = mapHomeBlockRow(existingRows[0]);
      const destPageSlug = (cleanTargetSlug || source.pageSlug) as BuilderPageSlug;
      const isSamePage = destPageSlug === source.pageSlug;
      const cloneLabel = isSamePage
        ? `${source.label} (Salinan)`.slice(0, 160)
        : source.label.slice(0, 160);

      let insertSortOrder = source.sortOrder + 1;
      if (isSamePage) {
        await pool.query(
          'UPDATE cms_home_blocks SET sort_order = sort_order + 1 WHERE page_slug = ? AND sort_order > ?',
          [destPageSlug, source.sortOrder]
        );
      } else {
        const [maxRows] = await pool.query<RowDataPacket[]>(
          'SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM cms_home_blocks WHERE page_slug = ?',
          [destPageSlug]
        );
        insertSortOrder = Number(maxRows[0]?.max_order || 0) + 1;
      }

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO cms_home_blocks (page_slug, block_type, block_label, config_json, sort_order, is_visible)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          destPageSlug,
          source.blockType,
          cloneLabel,
          JSON.stringify(source.config),
          insertSortOrder,
          source.isVisible ? 1 : 0,
        ]
      );

      const [allRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks ORDER BY page_slug ASC, sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('home_blocks', 'duplicated', result.insertId);
      res.status(201).json({
        ok: true,
        newId: result.insertId,
        targetPageSlug: destPageSlug,
        items: allRows.map(mapHomeBlockRow),
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menduplikasi elemen halaman.',
      });
    }
  });

  app.delete('/api/cms/home-blocks/:id', requireCmsPermission('homebuilder'), async (req: AuthenticatedRequest, res: Response) => {
    const blockId = Number(req.params.id);
    if (!Number.isFinite(blockId) || blockId <= 0) {
      res.status(400).json({ ok: false, message: 'ID elemen tidak valid.' });
      return;
    }

    try {
      await pool.query('DELETE FROM cms_home_blocks WHERE id = ?', [blockId]);
      const [allRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks ORDER BY page_slug ASC, sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('home_blocks', 'deleted', blockId);
      res.json({ ok: true, items: allRows.map(mapHomeBlockRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus elemen halaman.',
      });
    }
  });

  app.post('/api/cms/home-blocks/reset', requireCmsPermission('homebuilder'), async (req: AuthenticatedRequest, res: Response) => {
    const { pageSlug } = (req.body || {}) as { pageSlug?: string };
    const cleanPageSlug = pageSlug ? String(pageSlug).trim() : '';
    if (cleanPageSlug && !BUILDER_PAGE_SLUG_SET.has(cleanPageSlug)) {
      res.status(400).json({ ok: false, message: 'Halaman builder tidak valid.' });
      return;
    }

    try {
      const existingSettings = await fetchSiteSettingsMap();
      const targetSlugs: BuilderPageSlug[] = cleanPageSlug
        ? [cleanPageSlug as BuilderPageSlug]
        : [...BUILDER_PAGE_SLUGS];

      for (const slug of targetSlugs) {
        await pool.query('DELETE FROM cms_home_blocks WHERE page_slug = ?', [slug]);
        const defaults = buildDefaultBlocksForPage(slug, existingSettings);
        for (const blk of defaults) {
          await pool.query(
            `INSERT INTO cms_home_blocks (page_slug, block_type, block_label, config_json, sort_order, is_visible)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [slug, blk.blockType, blk.label, JSON.stringify(blk.config), blk.sortOrder]
          );
        }
      }

      const [allRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_home_blocks ORDER BY page_slug ASC, sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('home_blocks', 'reset');
      res.json({ ok: true, items: allRows.map(mapHomeBlockRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal mereset susunan elemen.',
      });
    }
  });

  // CMS Auto-Registered Custom Element Presets
  app.get('/api/cms/builder-presets', requireCmsPermission('homebuilder'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_builder_presets ORDER BY id DESC'
      );
      res.json({ ok: true, items: rows.map(mapBuilderPresetRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat katalog elemen tersimpan.',
      });
    }
  });

  app.post('/api/cms/builder-presets', requireCmsPermission('homebuilder'), async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, blockType, config } = req.body as {
      name?: string;
      description?: string;
      blockType?: string;
      config?: Record<string, unknown>;
    };

    const cleanType = String(blockType || '').trim();
    if (!HOME_BLOCK_TYPE_SET.has(cleanType)) {
      res.status(400).json({ ok: false, message: 'Tipe dasar elemen tidak valid.' });
      return;
    }

    const cleanName = String(name || '').trim().slice(0, 160);
    if (!cleanName) {
      res.status(400).json({ ok: false, message: 'Nama elemen untuk katalog wajib diisi.' });
      return;
    }

    const cleanDesc = String(description || '').trim().slice(0, 400);
    const cleanConfig =
      config && typeof config === 'object' && !Array.isArray(config)
        ? (sanitizeHomeBlockConfigValue(config) as Record<string, unknown>)
        : {};

    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO cms_builder_presets (name, description, block_type, config_json)
         VALUES (?, ?, ?, ?)`,
        [cleanName, cleanDesc, cleanType, JSON.stringify(cleanConfig)]
      );
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_builder_presets WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      await notifyCmsDataCommitted('builder_presets', 'created', result.insertId);
      res.status(201).json({ ok: true, item: mapBuilderPresetRow(rows[0]) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal mendaftarkan elemen ke katalog.',
      });
    }
  });

  app.delete('/api/cms/builder-presets/:id', requireCmsPermission('homebuilder'), async (req: AuthenticatedRequest, res: Response) => {
    const presetId = Number(req.params.id);
    if (!Number.isFinite(presetId) || presetId <= 0) {
      res.status(400).json({ ok: false, message: 'ID elemen katalog tidak valid.' });
      return;
    }

    try {
      await pool.query('DELETE FROM cms_builder_presets WHERE id = ?', [presetId]);
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_builder_presets ORDER BY id DESC'
      );
      await notifyCmsDataCommitted('builder_presets', 'deleted', presetId);
      res.json({ ok: true, items: rows.map(mapBuilderPresetRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus elemen dari katalog.',
      });
    }
  });

  // CMS Dynamic Tarif Layanan CRUD & Reorder
  app.get('/api/cms/tarif-items', requireCmsPermission('tarif'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_tarif_items ORDER BY sort_order ASC, id ASC'
      );
      res.json({ ok: true, items: rows.map(mapTarifItemRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memuat daftar kategori tarif.',
      });
    }
  });

  app.post('/api/cms/tarif-items', requireCmsPermission('tarif'), async (req: AuthenticatedRequest, res: Response) => {
    const {
      slug,
      navLabel,
      shortLabel,
      title,
      docNumber,
      description,
      pdfUrl,
      localFallbackPdfUrl,
      isActive,
    } = req.body as Record<string, unknown>;

    const cleanNav = String(navLabel || title || shortLabel || '').trim().slice(0, 200);
    if (!cleanNav) {
      res.status(400).json({ ok: false, message: 'Nama menu / kategori tarif wajib diisi.' });
      return;
    }

    const rawSlug = typeof slug === 'string' && slug.trim() ? slug.trim() : slugifyTarifLabel(cleanNav);
    const cleanSlug = rawSlug.toLowerCase().slice(0, 100);
    if (!isValidTarifSlug(cleanSlug)) {
      res.status(400).json({
        ok: false,
        message: 'Slug URL tarif hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).',
      });
      return;
    }

    const cleanPdfUrl = typeof pdfUrl === 'string' ? pdfUrl.trim().slice(0, 1024) : '';
    if (cleanPdfUrl && !isSafePdfReference(cleanPdfUrl)) {
      res.status(400).json({ ok: false, message: 'Tautan PDF atau Google Drive tidak valid.' });
      return;
    }

    const cleanLocalPdf =
      typeof localFallbackPdfUrl === 'string' ? localFallbackPdfUrl.trim().slice(0, 1024) : '';
    if (cleanLocalPdf && !isSafePdfReference(cleanLocalPdf)) {
      res.status(400).json({ ok: false, message: 'Tautan PDF lokal cadangan tidak valid.' });
      return;
    }

    try {
      const [dupRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM cms_tarif_items WHERE slug = ? LIMIT 1',
        [cleanSlug]
      );
      if (dupRows.length > 0) {
        res.status(409).json({
          ok: false,
          message: `Slug "/tarif-layanan/${cleanSlug}" sudah digunakan kategori tarif lain.`,
        });
        return;
      }

      const [maxRows] = await pool.query<RowDataPacket[]>(
        'SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM cms_tarif_items'
      );
      const nextOrder = Number(maxRows[0]?.max_order || 0) + 1;

      const cleanShort =
        String(shortLabel || cleanNav).trim().slice(0, 120) || cleanNav.slice(0, 120);
      const cleanTitle = String(title || cleanNav).trim().slice(0, 255) || cleanNav;
      const cleanDocNumber = String(docNumber || '').trim().slice(0, 255);
      const cleanDesc = String(description || '').trim().slice(0, 4000);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO cms_tarif_items
          (slug, nav_label, short_label, title, doc_number, description, pdf_url, local_fallback_pdf_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanSlug,
          cleanNav,
          cleanShort,
          cleanTitle,
          cleanDocNumber,
          cleanDesc,
          cleanPdfUrl,
          cleanLocalPdf,
          nextOrder,
          isActive === false ? 0 : 1,
        ]
      );

      const [allRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_tarif_items ORDER BY sort_order ASC, id ASC'
      );
      const [createdRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_tarif_items WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      await notifyCmsDataCommitted('tarif_items', 'created', result.insertId);
      res.status(201).json({
        ok: true,
        item: mapTarifItemRow(createdRows[0]),
        items: allRows.map(mapTarifItemRow),
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menambahkan kategori tarif.',
      });
    }
  });

  app.put('/api/cms/tarif-items/reorder', requireCmsPermission('tarif'), async (req: AuthenticatedRequest, res: Response) => {
    const { orderedIds } = req.body as { orderedIds?: unknown[] };
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ ok: false, message: 'Daftar urutan tarif tidak valid.' });
      return;
    }

    const cleanIds = orderedIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
    if (cleanIds.length === 0) {
      res.status(400).json({ ok: false, message: 'ID kategori tarif tidak valid.' });
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
        `UPDATE cms_tarif_items SET sort_order = CASE id ${caseParts} ELSE sort_order END WHERE id IN (${inPlaceholders})`,
        [...caseParams, ...cleanIds]
      );
      const [allRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_tarif_items ORDER BY sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('tarif_items', 'reordered');
      res.json({ ok: true, items: allRows.map(mapTarifItemRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui urutan kategori tarif.',
      });
    }
  });

  app.put('/api/cms/tarif-items/:id', requireCmsPermission('tarif'), async (req: AuthenticatedRequest, res: Response) => {
    const tarifId = Number(req.params.id);
    if (!Number.isFinite(tarifId) || tarifId <= 0) {
      res.status(400).json({ ok: false, message: 'ID kategori tarif tidak valid.' });
      return;
    }

    const {
      slug,
      navLabel,
      shortLabel,
      title,
      docNumber,
      description,
      pdfUrl,
      localFallbackPdfUrl,
      isActive,
    } = req.body as Record<string, unknown>;

    try {
      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_tarif_items WHERE id = ? LIMIT 1',
        [tarifId]
      );
      if (existingRows.length === 0) {
        res.status(404).json({ ok: false, message: 'Kategori tarif tidak ditemukan.' });
        return;
      }

      const current = mapTarifItemRow(existingRows[0]);
      const nextSlug =
        typeof slug === 'string' && slug.trim()
          ? slug.trim().toLowerCase().slice(0, 100)
          : current.slug;
      if (!isValidTarifSlug(nextSlug)) {
        res.status(400).json({
          ok: false,
          message: 'Slug URL tarif hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).',
        });
        return;
      }

      if (nextSlug !== current.slug) {
        const [dupRows] = await pool.query<RowDataPacket[]>(
          'SELECT id FROM cms_tarif_items WHERE slug = ? AND id != ? LIMIT 1',
          [nextSlug, tarifId]
        );
        if (dupRows.length > 0) {
          res.status(409).json({
            ok: false,
            message: `Slug "/tarif-layanan/${nextSlug}" sudah digunakan kategori tarif lain.`,
          });
          return;
        }
      }

      const nextNavLabel =
        typeof navLabel === 'string' && navLabel.trim()
          ? navLabel.trim().slice(0, 200)
          : current.navLabel;
      const nextShortLabel =
        typeof shortLabel === 'string' && shortLabel.trim()
          ? shortLabel.trim().slice(0, 120)
          : current.shortLabel;
      const nextTitle =
        typeof title === 'string' && title.trim()
          ? title.trim().slice(0, 255)
          : current.title;
      const nextDocNumber =
        typeof docNumber === 'string'
          ? docNumber.trim().slice(0, 255)
          : current.docNumber;
      const nextDescription =
        typeof description === 'string'
          ? description.trim().slice(0, 4000)
          : current.description;
      const nextPdfUrl =
        typeof pdfUrl === 'string' ? pdfUrl.trim().slice(0, 1024) : current.pdfUrl;
      if (nextPdfUrl && !isSafePdfReference(nextPdfUrl)) {
        res.status(400).json({ ok: false, message: 'Tautan PDF atau Google Drive tidak valid.' });
        return;
      }
      const nextLocalFallback =
        typeof localFallbackPdfUrl === 'string'
          ? localFallbackPdfUrl.trim().slice(0, 1024)
          : current.localFallbackPdfUrl;
      if (nextLocalFallback && !isSafePdfReference(nextLocalFallback)) {
        res.status(400).json({ ok: false, message: 'Tautan PDF lokal cadangan tidak valid.' });
        return;
      }

      const nextActive = typeof isActive === 'boolean' ? isActive : current.isActive;

      await pool.query(
        `UPDATE cms_tarif_items
         SET slug = ?, nav_label = ?, short_label = ?, title = ?, doc_number = ?, description = ?, pdf_url = ?, local_fallback_pdf_url = ?, is_active = ?
         WHERE id = ?`,
        [
          nextSlug,
          nextNavLabel,
          nextShortLabel,
          nextTitle,
          nextDocNumber,
          nextDescription,
          nextPdfUrl,
          nextLocalFallback,
          nextActive ? 1 : 0,
          tarifId,
        ]
      );

      const [updatedRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_tarif_items WHERE id = ? LIMIT 1',
        [tarifId]
      );
      const [allRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_tarif_items ORDER BY sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('tarif_items', 'updated', tarifId);
      res.json({
        ok: true,
        item: mapTarifItemRow(updatedRows[0]),
        items: allRows.map(mapTarifItemRow),
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal memperbarui kategori tarif.',
      });
    }
  });

  app.delete('/api/cms/tarif-items/:id', requireCmsPermission('tarif'), async (req: AuthenticatedRequest, res: Response) => {
    const tarifId = Number(req.params.id);
    if (!Number.isFinite(tarifId) || tarifId <= 0) {
      res.status(400).json({ ok: false, message: 'ID kategori tarif tidak valid.' });
      return;
    }

    try {
      await pool.query('DELETE FROM cms_tarif_items WHERE id = ?', [tarifId]);
      const [allRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM cms_tarif_items ORDER BY sort_order ASC, id ASC'
      );
      await notifyCmsDataCommitted('tarif_items', 'deleted', tarifId);
      res.json({ ok: true, items: allRows.map(mapTarifItemRow) });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : 'Gagal menghapus kategori tarif.',
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
      sameAs: [
        'https://www.instagram.com/p2b.uinsalatiga',
        'https://www.tiktok.com/@p2b.uin.salatiga',
      ],
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
    } else if (cleanPath === '/kerjasama') {
      title = 'Kerjasama & Sewa Aset — P2B UIN Salatiga';
      description =
        'Daftar kemitraan strategis, pemanfaatan lahan dan bangunan, serta kerja sama operasional di lingkungan Pusat Pengembangan Bisnis UIN Salatiga.';
    } else if (
      cleanPath === '/tarif-layanan' ||
      cleanPath === '/tarif-layanan/penunjang-akademik'
    ) {
      title = 'Tarif Layanan Penunjang Akademik — P2B UIN Salatiga';
      description =
        'Dokumen resmi tarif layanan penunjang akademik dan pemanfaatan aset P2B UIN Salatiga sesuai SK Rektor Nomor 29 Tahun 2024.';
    } else if (cleanPath === '/tarif-layanan/klinik-mitra-insani') {
      title = 'Tarif Layanan Klinik Mitra Insani — P2B UIN Salatiga';
      description =
        'Standar tarif layanan kesehatan Klinik Mitra Insani di lingkungan Pusat Pengembangan Bisnis UIN Salatiga.';
    } else if (cleanPath === '/tarif-layanan/jurnal') {
      title = 'Tarif Jurnal Ilmiah — P2B UIN Salatiga';
      description =
        'Pedoman tarif layanan tata kelola, penerbitan, dan pengelolaan jurnal ilmiah P2B UIN Salatiga.';
    } else if (cleanPath === '/magang') {
      title = 'Magang di P2B — Open Recruitment P2B UIN Salatiga';
      description =
        'Informasi open recruitment magang Pusat Pengembangan Bisnis (P2B) UIN Salatiga posisi Content Creator, Graphic Designer, dan Office Administrator.';
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
      { path: '/kerjasama', priority: '0.8', changefreq: 'weekly' },
      { path: '/tarif-layanan/penunjang-akademik', priority: '0.8', changefreq: 'monthly' },
      { path: '/tarif-layanan/klinik-mitra-insani', priority: '0.7', changefreq: 'monthly' },
      { path: '/tarif-layanan/jurnal', priority: '0.7', changefreq: 'monthly' },
      { path: '/magang', priority: '0.8', changefreq: 'weekly' },
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
