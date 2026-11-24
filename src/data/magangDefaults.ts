import { MagangGalleryItem, MagangPositionItem } from '../types/cms';

export const DEFAULT_MAGANG_HERO_IMAGE = '/assets/magang/hero_team.jpg';

export const DEFAULT_MAGANG_GALLERY: MagangGalleryItem[] = [
  {
    id: 1,
    title: 'Kolaborasi & Perencanaan Program',
    caption:
      'Sesi brainstorming lintas divisi mahasiswa magang dalam merancang kampanye dan evaluasi unit usaha.',
    imageUrl: '/assets/magang/galeri_diskusi.jpg',
    altText: 'Mahasiswa magang P2B UIN Salatiga berdiskusi merencanakan program kerja tim',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    title: 'Produksi Konten Digital',
    caption:
      'Dokumentasi video pendek dan liputan aktivitas layanan P2B di area kampus.',
    imageUrl: '/assets/magang/role_konten.jpg',
    altText: 'Anak magang divisi Content Creator memproduksi video promosi unit usaha P2B',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    title: 'Eksplorasi Desain & Visual Branding',
    caption:
      'Penyusunan materi poster, identitas visual, dan konten grafis untuk publikasi resmi.',
    imageUrl: '/assets/magang/role_desain.jpg',
    altText: 'Anak magang divisi Graphic Designer mengerjakan layout publikasi visual',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 4,
    title: 'Koordinasi Administrasi Harian',
    caption:
      'Pengelolaan jadwal layanan, dokumentasi surat, dan pencatatan operasional kantor P2B.',
    imageUrl: '/assets/magang/role_admin.jpg',
    altText: 'Anak magang divisi Office Administrator mengelola jadwal dan arsip operasional',
    sortOrder: 4,
    isActive: true,
  },
];

export const DEFAULT_MAGANG_POSITIONS: MagangPositionItem[] = [
  {
    id: 1,
    title: 'Content Creator',
    division: 'Media & Publikasi Digital',
    description:
      'Merancang konsep kreatif, memproduksi video pendek, foto dokumentasi, serta konten media sosial untuk memperkenalkan unit usaha dan layanan P2B UIN Salatiga.',
    imageUrl: '/assets/magang/role_konten.jpg',
    tasks: [
      'Produksi video reels, TikTok, dan liputan kegiatan unit bisnis',
      'Penulisan skrip kreatif serta copywriting publikasi digital',
      'Kolaborasi kampanye promosi bersama tim desain grafis',
    ],
    sortOrder: 1,
    isActive: true,
    isAvailable: true,
  },
  {
    id: 2,
    title: 'Graphic Designer',
    division: 'Desain Komunikasi Visual',
    description:
      'Mengembangkan materi komunikasi visual resmi mulai dari poster acara, konten media sosial, hingga kebutuhan branding produk dan layanan komersial P2B.',
    imageUrl: '/assets/magang/role_desain.jpg',
    tasks: [
      'Perancangan poster, feed media sosial, dan media cetak',
      'Menjaga konsistensi identitas visual P2B UIN Salatiga',
      'Pengolahan materi presentasi serta promosi layanan usaha',
    ],
    sortOrder: 2,
    isActive: true,
    isAvailable: true,
  },
  {
    id: 3,
    title: 'Office Administrator',
    division: 'Tata Kelola & Administrasi',
    description:
      'Mendukung pengelolaan administrasi perkantoran, pengarsipan dokumen layanan, pencatatan jadwal operasional, serta koordinasi harian di lingkungan P2B.',
    imageUrl: '/assets/magang/role_admin.jpg',
    tasks: [
      'Pengarsipan dokumen resmi, surat-menyurat, dan berkas mitra',
      'Pendataan jadwal reservasi fasilitas dan koordinasi internal',
      'Penyusunan rekapitulasi laporan administrasi berkala',
    ],
    sortOrder: 3,
    isActive: true,
    isAvailable: true,
  },
];

export const MAGANG_FACULTIES: string[] = [
  'Ekonomi dan Bisnis Syariah',
  'Dakwah',
  'Tarbiah dan Ilmu Keguruan',
  'Ushuluddin, Adab dan Humaniora',
  'Syariah',
  'Sains dan Teknologi',
];

export const DEFAULT_MAGANG_BENEFITS: string[] = [
  'Sertifikat sesuai dengan pengalaman kerja nyata dan pengembangan skill profesional',
  'Kesempatan mengembangkan kreativitas dan portofolio',
  'Belajar langsung dalam lingkungan kerja profesional',
  'Memperluas relasi dan pengalaman berkolaborasi',
  'Mengasah komunikasi, kerja tim, dan problem-solving',
];
