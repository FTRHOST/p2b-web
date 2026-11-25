export type BuilderPageSlug =
  | 'home'
  | 'about'
  | 'visi-misi'
  | 'struktur-organisasi';

export const BUILDER_PAGE_SLUGS: BuilderPageSlug[] = [
  'home',
  'about',
  'visi-misi',
  'struktur-organisasi',
];

export const BUILDER_PAGE_SLUG_SET = new Set<string>(BUILDER_PAGE_SLUGS);

export const BUILDER_PAGES: {
  slug: BuilderPageSlug;
  label: string;
  shortLabel: string;
  path: string;
  description: string;
}[] = [
  {
    slug: 'home',
    label: 'Beranda',
    shortLabel: 'Beranda',
    path: '/',
    description: 'Halaman utama website P2B UIN Salatiga.',
  },
  {
    slug: 'about',
    label: 'Profil · Tentang Kami',
    shortLabel: 'Tentang Kami',
    path: '/tentang-kami',
    description: 'Profil kelembagaan, narasi P2B, foto banner, dan nilai tata kelola.',
  },
  {
    slug: 'visi-misi',
    label: 'Profil · Visi & Misi',
    shortLabel: 'Visi & Misi',
    path: '/visi-misi',
    description: 'Arah strategis, kartu visi, dan lima fokus misi P2B UIN Salatiga.',
  },
  {
    slug: 'struktur-organisasi',
    label: 'Profil · Struktur Organisasi',
    shortLabel: 'Struktur Organisasi',
    path: '/struktur-organisasi',
    description: 'Bagan organisasi SK Rektor No. 56/2026 dan unit usaha operasional.',
  },
];

export type HomeBlockType =
  | 'hero'
  | 'page_hero'
  | 'logo_marquee'
  | 'who_we_are'
  | 'about_intro'
  | 'dual_banners'
  | 'governance_values'
  | 'visi_card'
  | 'misi_grid'
  | 'org_chart'
  | 'unit_divisions'
  | 'news_updates'
  | 'location_map'
  | 'magang_gallery'
  | 'magang_positions'
  | 'editorial_split'
  | 'feature_cards'
  | 'cta_banner'
  | 'stats_row';

export interface HomeHeroBlockConfig {
  title: string;
  subtitle: string;
  imageUrl: string;
  cornerLabel: string;
  cornerActionLabel: string;
  cornerHref: string;
}

export interface PageHeroBlockConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  cornerLabel: string;
  cornerActionLabel: string;
  cornerHref: string;
}

export interface HomeLogoMarqueeBlockConfig {
  ariaLabel: string;
}

export interface HomeFocusCardConfig {
  id: string;
  title: string;
  subtitle: string;
  linkLabel: string;
  href: string;
  image: string;
  description: string;
  highlights: string[];
}

export interface HomeWhoWeAreBlockConfig {
  eyebrow: string;
  heading: string;
  paragraph1: string;
  paragraph2: string;
  cards: HomeFocusCardConfig[];
}

export interface AboutIntroBlockConfig {
  eyebrow: string;
  heading: string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
}

export interface DualBannersBlockConfig {
  image1Url: string;
  image1Alt: string;
  image2Url: string;
  image2Alt: string;
}

export interface GovernanceValueEntry {
  id: string;
  number: string;
  emblem: 'ledger' | 'prism' | 'pillar' | 'bridge';
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
}

export interface GovernanceValuesBlockConfig {
  eyebrow: string;
  heading: string;
  items: GovernanceValueEntry[];
}

export interface HomeVisiBlockConfig {
  label: string;
  text: string;
  subtext: string;
  icon: 'compass' | 'target' | 'shield' | 'layers';
}

export interface MisiItemEntry {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface MisiGridBlockConfig {
  eyebrow: string;
  heading: string;
  description: string;
  items: MisiItemEntry[];
}

export interface OrgChartBlockConfig {
  eyebrow: string;
  heading: string;
  legalEyebrow: string;
  legalTitle: string;
  decreeLabel: string;
  pdfUrl: string;
}

export interface UnitDivisionEntry {
  id: string;
  icon: string;
  code: string;
  title: string;
  responsibilities: string[];
}

export interface UnitDivisionsBlockConfig {
  eyebrow: string;
  heading: string;
  items: UnitDivisionEntry[];
}

export interface HomeNewsBlockConfig {
  eyebrow: string;
  heading: string;
  ctaLabel: string;
  maxItems: number;
}

export interface HomeLocationBlockConfig {
  eyebrow: string;
  heading: string;
  description: string;
  cardLabel: string;
  cardTitle: string;
  address: string;
  lat: string;
  lng: string;
  mapsUrl: string;
  cornerLabel: string;
  cornerActionLabel: string;
}

export interface MagangGalleryBlockConfig {
  eyebrow: string;
  heading: string;
  description: string;
  maxItems: number;
}

export interface MagangPositionsBlockConfig {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface HomeEditorialSplitBlockConfig {
  eyebrow: string;
  heading: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: 'left' | 'right';
  ctaLabel: string;
  ctaHref: string;
}

export interface HomeFeatureCardEntry {
  id: string;
  kicker: string;
  title: string;
  description: string;
  imageUrl: string;
  linkLabel: string;
  linkHref: string;
}

export interface HomeFeatureCardsBlockConfig {
  eyebrow: string;
  heading: string;
  description: string;
  columns: 2 | 3;
  cards: HomeFeatureCardEntry[];
}

export interface HomeCtaBannerBlockConfig {
  eyebrow: string;
  heading: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface HomeStatEntry {
  id: string;
  value: string;
  label: string;
  note: string;
}

export interface HomeStatsRowBlockConfig {
  eyebrow: string;
  heading: string;
  stats: HomeStatEntry[];
}

export interface HomeBlockItem {
  id: number;
  pageSlug: BuilderPageSlug;
  blockType: HomeBlockType;
  label: string;
  config: Record<string, unknown>;
  sortOrder: number;
  isVisible: boolean;
}

export interface HomeBlockPresetItem {
  id: number;
  name: string;
  description: string;
  blockType: HomeBlockType;
  config: Record<string, unknown>;
  createdAt?: string;
}

export interface HomeBlockCatalogEntry {
  type: HomeBlockType;
  name: string;
  description: string;
  category: 'Bagian Utama' | 'Elemen Profil & Program' | 'Blok Kustom';
  defaultLabel: string;
  defaultConfig: Record<string, unknown>;
}

export const HOME_BLOCK_CATALOG: HomeBlockCatalogEntry[] = [
  {
    type: 'hero',
    name: 'Hero Utama (Beranda)',
    description:
      'Banner pembuka layar penuh khas Beranda dengan gambar latar, judul besar, deskripsi, dan tombol pojok.',
    category: 'Bagian Utama',
    defaultLabel: 'Hero Utama Beranda',
    defaultConfig: {
      title: 'Pusat Pengembangan Bisnis',
      subtitle:
        'Unit strategis UIN Salatiga dalam optimalisasi aset, layanan komersial, kemitraan, dan inovasi bisnis mendukung kemandirian PTN BLU yang profesional serta berkelanjutan.',
      imageUrl:
        'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png',
      cornerLabel: 'Profil P2B',
      cornerActionLabel: 'Tentang Kami',
      cornerHref: '/tentang-kami',
    },
  },
  {
    type: 'page_hero',
    name: 'Hero Halaman (PageHero)',
    description:
      'Header banner halaman sekunder (Tentang Kami, Visi Misi, Struktur Organisasi) lengkap dengan eyebrow dan tautan pojok.',
    category: 'Bagian Utama',
    defaultLabel: 'Hero Halaman',
    defaultConfig: {
      eyebrow: 'Profil Resmi · P2B UIN Salatiga',
      title: 'Pusat Pengembangan Bisnis',
      subtitle:
        'Penggerak pengembangan bisnis, optimalisasi aset, layanan komersial, serta ekosistem entrepreneurial university UIN Salatiga.',
      imageUrl:
        'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png',
      imageAlt: 'Pusat Pengembangan Bisnis UIN Salatiga',
      cornerLabel: 'Arah Strategis',
      cornerActionLabel: 'Visi & Misi P2B',
      cornerHref: '/visi-misi',
    },
  },
  {
    type: 'logo_marquee',
    name: 'Marquee Logo Mitra',
    description:
      'Deretan logo mitra & unit usaha berjalan otomatis yang tersinkron dari tab Logo Mitra.',
    category: 'Bagian Utama',
    defaultLabel: 'Marquee Logo Mitra',
    defaultConfig: {
      ariaLabel: 'Logo Mitra & Unit P2B UIN Salatiga',
    },
  },
  {
    type: 'who_we_are',
    name: 'Tentang P2B & Kartu Fokus',
    description:
      'Seksi pengantar profil P2B disertai kartu fokus visual berpotongan sudut khas P2B.',
    category: 'Bagian Utama',
    defaultLabel: 'Tentang P2B & Kartu Fokus',
    defaultConfig: {
      eyebrow: 'Tentang P2B · UIN Salatiga',
      heading: 'Penggerak Ekosistem Bisnis PTN BLU',
      paragraph1:
        'Pusat Pengembangan Bisnis (P2B) Universitas Islam Negeri (UIN) Salatiga merupakan unit strategis universitas yang berperan dalam mengembangkan, mengelola, dan mengoptimalkan potensi bisnis serta layanan komersial universitas dalam mendukung penguatan kelembagaan sebagai Perguruan Tinggi Negeri Badan Layanan Umum (PTN BLU).',
      paragraph2:
        'Sebagai bagian dari ekosistem entrepreneurial university, P2B hadir melalui pengelolaan aset, pengembangan layanan, pembangunan kemitraan, dan penciptaan inovasi bisnis secara transparan, akuntabel, profesional, serta berkelanjutan untuk mendukung kemandirian universitas dan memperluas manfaat bagi sivitas akademika maupun masyarakat.',
      cards: [
        {
          id: 'aset-layanan',
          title: 'Optimalisasi Aset & Layanan',
          subtitle: 'Auditorium, Sewa Aset, Klinik Mitra Insani & Kantin',
          linkLabel: 'Jelajahi Aset & Layanan',
          href: '#layanan-aset',
          image:
            'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp',
          description:
            'P2B UIN Salatiga mengelola aset dan unit layanan komersial universitas—mulai dari fasilitas sewa ruang, produk Air Mineral, hingga Klinik Mitra Insani dan Kantin—dengan tata kelola PTN BLU yang transparan dan berorientasi kepuasan pelanggan.',
          highlights: [
            'Pemanfaatan fasilitas, gedung pertemuan, dan sarana pendukung kegiatan',
            'Klinik Mitra Insani, Kantin kampus, dan produk Air Mineral terstandar',
            'Sistem pemesanan sewa aset & tiket yang akuntabel',
          ],
        },
        {
          id: 'kemitraan-talenta',
          title: 'Kemitraan & Talenta Mahasiswa',
          subtitle: 'Kolaborasi strategis & magang profesional',
          linkLabel: 'Lihat Program Kemitraan',
          href: '#kemitraan-talenta',
          image:
            'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2025/01/2025-Slider-2.png',
          description:
            'Sebagai penggerak ekosistem entrepreneurial university, P2B menjembatani kolaborasi bersama dunia industri, pemerintah, alumni, dan masyarakat sekaligus menghadirkan ruang praktik nyata bagi mahasiswa UIN Salatiga.',
          highlights: [
            'Kemitraan strategis bersama industri, pemerintah, dan alumni',
            'Program magang profesional & keterlibatan langsung di unit bisnis',
            'Pengembangan kompetensi IT, komunikasi, pemasaran digital, bisnis & akuntansi',
          ],
        },
      ],
    },
  },
  {
    type: 'news_updates',
    name: 'Berita & Update Terbaru',
    description:
      'Menampilkan daftar berita terbaru yang diterbitkan dari menu Kelola Berita.',
    category: 'Bagian Utama',
    defaultLabel: 'News & Update',
    defaultConfig: {
      eyebrow: 'Berita & Informasi Terbaru',
      heading: 'News & Update',
      ctaLabel: 'Lihat Semua Berita',
      maxItems: 3,
    },
  },
  {
    type: 'location_map',
    name: 'Peta & Lokasi Kampus',
    description:
      'Peta interaktif lokasi kantor P2B dengan kartu informasi kontak dan tautan petunjuk arah.',
    category: 'Bagian Utama',
    defaultLabel: 'Peta & Lokasi P2B',
    defaultConfig: {
      eyebrow: 'Lokasi Resmi',
      heading: 'Peta & Lokasi P2B',
      description:
        'Kunjungi kantor P2B UIN Salatiga di Gedung Auditorium & Student Center Prof. Dr. H. Achmadi untuk konsultasi sewa aset, kemitraan usaha, dan layanan komersial.',
      cardLabel: 'Alamat Kantor P2B',
      cardTitle: 'Gedung Auditorium & Student Center Prof. Dr. H. Achmadi',
      address: '',
      lat: '',
      lng: '',
      mapsUrl: '',
      cornerLabel: 'Petunjuk Arah',
      cornerActionLabel: 'Buka Maps',
    },
  },
  {
    type: 'visi_card',
    name: 'Kartu Visi Kelembagaan',
    description:
      'Kartu pernyataan visi berwarna hijau zamrud gelap dengan ornamen pola sudut.',
    category: 'Bagian Utama',
    defaultLabel: 'Kartu Visi P2B',
    defaultConfig: {
      label: 'Visi P2B',
      text: 'Menjadi pusat pengembangan bisnis universitas yang profesional, inovatif, dan berkelanjutan dalam mendukung kemandirian serta peningkatan nilai tambah kelembagaan UIN Salatiga.',
      subtext:
        'Sebagai bagian dari ekosistem entrepreneurial university PTN BLU, P2B menyelaraskan pertumbuhan pendapatan universitas dengan peningkatan kualitas layanan publik serta pengembangan kompetensi generasi muda.',
      icon: 'compass',
    },
  },
  {
    type: 'about_intro',
    name: 'Narasi Profil Kelembagaan (2 Kolom)',
    description:
      'Kartu narasi profil resmi dengan heading dan 4 paragraf dalam tata letak 2 kolom.',
    category: 'Elemen Profil & Program',
    defaultLabel: 'Narasi Profil Kelembagaan',
    defaultConfig: {
      eyebrow: 'Profil Kelembagaan · PTN BLU',
      heading: 'Mengenal Pusat Pengembangan Bisnis (P2B) UIN Salatiga',
      p1: 'Pusat Pengembangan Bisnis (P2B) Universitas Islam Negeri (UIN) Salatiga merupakan unit strategis universitas yang berperan dalam mengembangkan, mengelola, dan mengoptimalkan potensi bisnis serta layanan komersial universitas dalam mendukung penguatan kelembagaan sebagai Perguruan Tinggi Negeri Badan Layanan Umum (PTN BLU).',
      p2: 'P2B hadir sebagai penggerak pengembangan bisnis universitas melalui pengelolaan aset, pengembangan layanan, pembangunan kemitraan, serta penciptaan inovasi bisnis yang memberikan nilai tambah bagi universitas, sivitas akademika, dan masyarakat.',
      p3: 'Sebagai bagian dari ekosistem entrepreneurial university, P2B tidak hanya berorientasi pada pengembangan pendapatan universitas, tetapi juga berperan dalam membangun budaya inovasi, kewirausahaan, kolaborasi, dan pemanfaatan potensi universitas secara profesional dan berkelanjutan.',
      p4: 'Melalui tata kelola yang transparan, akuntabel, profesional, dan berorientasi layanan, P2B mengembangkan berbagai unit bisnis dan layanan komersial yang mendukung kemandirian universitas serta memperluas manfaat keberadaan UIN Salatiga bagi masyarakat.',
    },
  },
  {
    type: 'dual_banners',
    name: 'Galeri Banner Foto Ganda',
    description:
      'Dua kartu foto arsitektural berdampingan rasio 4:3 untuk menampilkan fasilitas atau aktivitas utama.',
    category: 'Elemen Profil & Program',
    defaultLabel: 'Banner Foto Ganda',
    defaultConfig: {
      image1Url:
        'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp',
      image1Alt: 'Optimalisasi Aset & Fasilitas P2B UIN Salatiga',
      image2Url:
        'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2025/01/2025-Slider-2.png',
      image2Alt: 'Kolaborasi & Talenta Mahasiswa P2B UIN Salatiga',
    },
  },
  {
    type: 'governance_values',
    name: 'Grid Nilai Pengelolaan Bisnis',
    description:
      'Grid kartu bernomor (01–04+) berisi prinsip tata kelola dengan ikon emblem dan tautan arah.',
    category: 'Elemen Profil & Program',
    defaultLabel: 'Nilai Pengelolaan Bisnis',
    defaultConfig: {
      eyebrow: 'Prinsip & Tata Kelola',
      heading: 'Nilai Pengelolaan Bisnis Universitas',
      items: [
        {
          id: 'gv-1',
          number: '01',
          emblem: 'ledger',
          title: 'Transparan & Akuntabel',
          description:
            'Setiap pengelolaan unit bisnis, tarif layanan, dan optimalisasi aset dijalankan sesuai standar tata kelola PTN BLU yang terukur dan dapat dipertanggungjawabkan.',
          linkLabel: 'Visi & Misi P2B',
          linkHref: '/visi-misi',
        },
        {
          id: 'gv-2',
          number: '02',
          emblem: 'prism',
          title: 'Inovasi & Kewirausahaan',
          description:
            'Membangun ekosistem entrepreneurial university yang mendorong budaya inovasi, kolaborasi lintas unit, serta penciptaan nilai tambah berkelanjutan.',
          linkLabel: 'Visi & Misi P2B',
          linkHref: '/visi-misi',
        },
        {
          id: 'gv-3',
          number: '03',
          emblem: 'pillar',
          title: 'Profesional & Berorientasi Layanan',
          description:
            'Mengembangkan layanan komersial berbasis kebutuhan nyata sivitas akademika dan masyarakat dengan mengutamakan mutu serta kepuasan pelanggan.',
          linkLabel: 'Visi & Misi P2B',
          linkHref: '/visi-misi',
        },
        {
          id: 'gv-4',
          number: '04',
          emblem: 'bridge',
          title: 'Kolaborasi Strategis',
          description:
            'Membuka kemitraan produktif bersama dunia industri, pemerintah, alumni, dan masyarakat sekaligus menghadirkan ruang praktik magang profesional mahasiswa.',
          linkLabel: 'Visi & Misi P2B',
          linkHref: '/visi-misi',
        },
      ],
    },
  },
  {
    type: 'misi_grid',
    name: 'Grid Fokus Misi Strategis',
    description:
      'Daftar kartu Misi bernomor (MISI 01..05+) berlatar kaca transparan dan pola ornamen sudut.',
    category: 'Elemen Profil & Program',
    defaultLabel: 'Lima Fokus Misi P2B',
    defaultConfig: {
      eyebrow: 'Misi P2B',
      heading: 'Lima Fokus Misi Pengembangan Bisnis',
      description:
        'Langkah operasional yang dijalankan P2B dalam menggerakkan potensi aset, unit usaha, kemitraan, dan inovasi kampus.',
      items: [
        {
          id: 'misi-1',
          number: '01',
          title: 'Tata Kelola Bisnis Profesional',
          description:
            'Mengembangkan tata kelola bisnis universitas yang profesional, transparan, dan akuntabel.',
        },
        {
          id: 'misi-2',
          number: '02',
          title: 'Optimalisasi Aset & Potensi',
          description:
            'Mengoptimalkan aset dan potensi universitas menjadi layanan dan produk bernilai tambah.',
        },
        {
          id: 'misi-3',
          number: '03',
          title: 'Inovasi Bisnis & Layanan',
          description:
            'Mengembangkan inovasi bisnis dan layanan berbasis kebutuhan masyarakat.',
        },
        {
          id: 'misi-4',
          number: '04',
          title: 'Kemitraan Strategis',
          description:
            'Membangun kemitraan strategis dengan berbagai pihak.',
        },
        {
          id: 'misi-5',
          number: '05',
          title: 'Kewirausahaan & Kompetensi Mahasiswa',
          description:
            'Mendukung pengembangan budaya kewirausahaan dan kompetensi profesional mahasiswa.',
        },
      ],
    },
  },
  {
    type: 'org_chart',
    name: 'Bagan Struktur Organisasi & SK',
    description:
      'Diagram hierarki resmi Struktur Organisasi P2B BLU UIN Salatiga disertai dokumen SK Rektor yang dapat diunduh.',
    category: 'Elemen Profil & Program',
    defaultLabel: 'Bagan Struktur Organisasi',
    defaultConfig: {
      eyebrow: 'Lampiran Keputusan Rektor Nomor 56 Tahun 2026',
      heading: 'Struktur Organisasi Pusat Pengembangan Bisnis',
      legalEyebrow: 'Dasar Penetapan Resmi · 02 Januari 2026',
      legalTitle:
        'Keputusan Rektor UIN Salatiga Nomor 56 Tahun 2026 tentang Struktur Organisasi Pusat Pengembangan Bisnis BLU',
      decreeLabel: 'SK Rektor UIN Salatiga No. 56 Tahun 2026',
      pdfUrl: '/assets/aistudio/56-_SK_Struktur_Organisasi_P2b-BLU-UIN_9b2304d4.PDF',
    },
  },
  {
    type: 'unit_divisions',
    name: 'Grid Ruang Lingkup Unit Usaha',
    description:
      'Daftar kartu unit usaha operasional (UNIT 01..04+) lengkap dengan ikon, judul, dan daftar tanggung jawab.',
    category: 'Elemen Profil & Program',
    defaultLabel: 'Ruang Lingkup Unit Usaha',
    defaultConfig: {
      eyebrow: 'Diktum Kedua · Pengembangan Unit Bisnis',
      heading: 'Ruang Lingkup Layanan & Unit Usaha P2B',
      items: [
        {
          id: 'unit-1',
          icon: 'mdi:office-building-outline',
          code: 'UNIT 01',
          title: 'Optimalisasi Aset & Fasilitas',
          responsibilities: [
            'Pengelolaan reservasi Gedung Auditorium Student Centre dan ruang pertemuan kampus.',
            'Inventarisasi serta pemanfaatan aset fisik universitas agar memiliki nilai tambah ekonomi.',
            'Pemeliharaan standar kelayakan sarana pendukung kegiatan internal maupun eksternal.',
          ],
        },
        {
          id: 'unit-2',
          icon: 'mdi:briefcase-outline',
          code: 'UNIT 02',
          title: 'Layanan Komersial & Unit Usaha',
          responsibilities: [
            'Operasional Klinik Mitra Insani, Kantin kampus higienis, produk Air Mineral, dan layanan Tiket.',
            'Pengembangan unit bisnis baru melalui kajian kelayakan serta evaluasi kinerja berkala.',
            'Penjaminan mutu pelayanan dan kepuasan pelanggan sesuai tata kelola PTN BLU.',
          ],
        },
        {
          id: 'unit-3',
          icon: 'mdi:handshake-outline',
          code: 'UNIT 03',
          title: 'Kemitraan Strategis & Pemasaran',
          responsibilities: [
            'Menjalin kerja sama produktif dengan dunia industri, pemerintah, alumni, dan masyarakat.',
            'Penyusunan skema kolaborasi usaha yang memberikan manfaat bersama secara transparan.',
            'Pengelolaan komunikasi publik dan pemasaran layanan komersial P2B UIN Salatiga.',
          ],
        },
        {
          id: 'unit-4',
          icon: 'mdi:school-outline',
          code: 'UNIT 04',
          title: 'Talenta, Magang & Inovasi Mahasiswa',
          responsibilities: [
            'Penyelenggaraan program magang profesional mahasiswa pada unit bisnis P2B.',
            'Pendampingan praktik bidang teknologi informasi, komunikasi, pemasaran digital, bisnis, dan akuntansi.',
            'Inkubasi ide kewirausahaan untuk memperkuat ekosistem entrepreneurial university.',
          ],
        },
      ],
    },
  },
  {
    type: 'magang_gallery',
    name: 'Galeri Kegiatan Magang P2B',
    description:
      'Menampilkan dokumentasi foto kegiatan mahasiswa magang secara dinamis dari tab Magang P2B.',
    category: 'Elemen Profil & Program',
    defaultLabel: 'Galeri Magang P2B',
    defaultConfig: {
      eyebrow: 'Dokumentasi Aktivitas',
      heading: 'Keseharian Tim & Mahasiswa Magang',
      description:
        'Kolaborasi nyata mahasiswa bersama unit bisnis Pusat Pengembangan Bisnis UIN Salatiga.',
      maxItems: 6,
    },
  },
  {
    type: 'magang_positions',
    name: 'Daftar Posisi Magang Aktif',
    description:
      'Menampilkan formasi dan posisi magang yang tersedia secara real-time dari modul Magang P2B.',
    category: 'Elemen Profil & Program',
    defaultLabel: 'Posisi Magang Tersedia',
    defaultConfig: {
      eyebrow: 'Peluang Pengembangan Talenta',
      heading: 'Bidang & Posisi Magang P2B',
      description:
        'Pilih posisi magang sesuai minat keahlian dan daftarkan diri Anda secara daring.',
      ctaLabel: 'Daftar Program Magang',
      ctaHref: '/magang/daftar',
    },
  },
  {
    type: 'editorial_split',
    name: 'Teks & Gambar Editorial',
    description:
      'Blok dua kolom seimbang berisi teks narasi, gambar pendukung (kiri/kanan), dan tombol CTA.',
    category: 'Blok Kustom',
    defaultLabel: 'Blok Editorial P2B',
    defaultConfig: {
      eyebrow: 'Program Unggulan · P2B',
      heading: 'Sinergi Layanan Kampus & Mitra Eksternal',
      body: 'Pusat Pengembangan Bisnis UIN Salatiga membuka peluang kolaborasi pemanfaatan fasilitas, layanan kesehatan, serta dukungan operasional acara yang terstandar.\n\nSetiap kerja sama dikelola dengan prinsip transparansi Badan Layanan Umum demi memberi dampak nyata bagi sivitas akademika dan mitra.',
      imageUrl:
        'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png',
      imageAlt: 'Layanan Unggulan P2B UIN Salatiga',
      imagePosition: 'right',
      ctaLabel: 'Lihat Daftar Kerjasama',
      ctaHref: '/kerjasama',
    },
  },
  {
    type: 'feature_cards',
    name: 'Grid Kartu Layanan / Informasi',
    description:
      'Seksi grid 2 atau 3 kolom kartu informasi lengkap dengan judul, deskripsi, gambar opsional, dan tautan.',
    category: 'Blok Kustom',
    defaultLabel: 'Grid Kartu Layanan',
    defaultConfig: {
      eyebrow: 'Portofolio Unit Usaha',
      heading: 'Layanan & Fasilitas P2B',
      description:
        'Berbagai unit layanan aktif di lingkungan Universitas Islam Negeri Salatiga.',
      columns: 3,
      cards: [
        {
          id: 'card-1',
          kicker: 'Kesehatan',
          title: 'Klinik Mitra Insani',
          description:
            'Layanan konsultasi medis umum, kesehatan gigi, serta pemeriksaan preventif untuk sivitas akademika dan masyarakat umum.',
          imageUrl: '',
          linkLabel: 'Lihat Tarif Klinik',
          linkHref: '/tarif-layanan/klinik-mitra-insani',
        },
        {
          id: 'card-2',
          kicker: 'Produk Kampus',
          title: 'UINSAGA Water',
          description:
            'Produk air mineral higienis yang mendukung agenda resmi universitas, unit kerja, serta distribusi kemitraan.',
          imageUrl: '',
          linkLabel: 'Lihat Berita Produk',
          linkHref: '/semua-berita',
        },
        {
          id: 'card-3',
          kicker: 'Pemanfaatan Aset',
          title: 'Sewa Aset & Kerjasama',
          description:
            'Pengelolaan pemanfaatan lahan, kantin, serta kerja sama operasional bersama mitra perbankan dan pelaku usaha.',
          imageUrl: '',
          linkLabel: 'Data Kerjasama',
          linkHref: '/kerjasama',
        },
      ],
    },
  },
  {
    type: 'cta_banner',
    name: 'Banner Ajakan (CTA)',
    description:
      'Blok ajakan bertindak bernuansa zamrud gelap dengan tombol aksi utama dan sekunder.',
    category: 'Blok Kustom',
    defaultLabel: 'Banner Ajakan Kemitraan',
    defaultConfig: {
      eyebrow: 'Kolaborasi & Layanan',
      heading: 'Siap Menjalin Kemitraan atau Menggunakan Layanan P2B?',
      description:
        'Pelajari ketentuan tarif layanan resmi atau ajukan penjajakan kerja sama bersama Pusat Pengembangan Bisnis UIN Salatiga.',
      primaryLabel: 'Lihat Tarif Layanan',
      primaryHref: '/tarif-layanan/penunjang-akademik',
      secondaryLabel: 'Program Magang P2B',
      secondaryHref: '/magang',
    },
  },
  {
    type: 'stats_row',
    name: 'Sorotan Angka & Fakta',
    description:
      'Baris sorotan statistik atau capaian kelembagaan dengan tipografi angka sejajar (tabular).',
    category: 'Blok Kustom',
    defaultLabel: 'Sorotan Angka P2B',
    defaultConfig: {
      eyebrow: 'Ikhtisar Kinerja',
      heading: 'Pilar Pengembangan Bisnis PTN BLU',
      stats: [
        {
          id: 'stat-1',
          value: '6+',
          label: 'Unit Layanan Aktif',
          note: 'Klinik, Air Mineral, Kantin, Sewa Aset, Tiket & Jurnal',
        },
        {
          id: 'stat-2',
          value: '3',
          label: 'Kampus Terlayani',
          note: 'Operasional terpadu di lingkungan UIN Salatiga',
        },
        {
          id: 'stat-3',
          value: '100%',
          label: 'Tata Kelola BLU',
          note: 'Tarif & pencatatan kerja sama transparan',
        },
      ],
    },
  },
];

export const HOME_BLOCK_TYPE_SET = new Set<string>(
  HOME_BLOCK_CATALOG.map((entry) => entry.type)
);

export function sanitizeBuilderHref(rawUrl?: string | null): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('#')) return trimmed;
  if (trimmed.startsWith('/')) {
    return trimmed.startsWith('//') ? '' : trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:' ||
      parsed.protocol === 'mailto:' ||
      parsed.protocol === 'tel:'
    ) {
      return trimmed;
    }
    return '';
  } catch {
    return '';
  }
}

export function sanitizeBuilderMediaUrl(rawUrl?: string | null): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) {
    return trimmed.startsWith('//') ? '' : trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      ? trimmed
      : '';
  } catch {
    return '';
  }
}

export function getCatalogEntry(blockType: HomeBlockType): HomeBlockCatalogEntry {
  return (
    HOME_BLOCK_CATALOG.find((item) => item.type === blockType) ||
    HOME_BLOCK_CATALOG[0]
  );
}

function cloneJson<T>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T;
}

export function buildDefaultBlocksForPage(
  pageSlug: BuilderPageSlug,
  settings?: Record<string, string>
): Omit<HomeBlockItem, 'id'>[] {
  const s = settings || {};

  if (pageSlug === 'about') {
    const heroBase = cloneJson(getCatalogEntry('page_hero').defaultConfig);
    const introBase = cloneJson(getCatalogEntry('about_intro').defaultConfig);
    const bannerBase = cloneJson(getCatalogEntry('dual_banners').defaultConfig);
    const govBase = cloneJson(getCatalogEntry('governance_values').defaultConfig);

    return [
      {
        pageSlug: 'about',
        blockType: 'page_hero',
        label: 'Hero Tentang Kami',
        sortOrder: 1,
        isVisible: true,
        config: {
          ...heroBase,
          eyebrow: s.page_about_eyebrow?.trim() || 'Tentang Kami · Profil Resmi',
          title: s.page_about_title?.trim() || 'Pusat Pengembangan Bisnis',
          subtitle:
            s.page_about_subtitle?.trim() ||
            'Penggerak pengembangan bisnis, optimalisasi aset, layanan komersial, serta ekosistem entrepreneurial university UIN Salatiga.',
          imageUrl:
            s.page_about_image?.trim() || (heroBase.imageUrl as string),
          cornerLabel: 'Arah Strategis',
          cornerActionLabel: 'Visi & Misi P2B',
          cornerHref: '/visi-misi',
        },
      },
      {
        pageSlug: 'about',
        blockType: 'about_intro',
        label: 'Narasi Profil Kelembagaan',
        sortOrder: 2,
        isVisible: true,
        config: {
          ...introBase,
          heading:
            s.page_about_intro_heading?.trim() ||
            (introBase.heading as string),
          p1: s.page_about_p1?.trim() || (introBase.p1 as string),
          p2: s.page_about_p2?.trim() || (introBase.p2 as string),
          p3: s.page_about_p3?.trim() || (introBase.p3 as string),
          p4: s.page_about_p4?.trim() || (introBase.p4 as string),
        },
      },
      {
        pageSlug: 'about',
        blockType: 'dual_banners',
        label: 'Galeri Banner Foto Ganda',
        sortOrder: 3,
        isVisible: true,
        config: {
          ...bannerBase,
          image1Url:
            s.page_about_banner_1?.trim() || (bannerBase.image1Url as string),
          image2Url:
            s.page_about_banner_2?.trim() || (bannerBase.image2Url as string),
        },
      },
      {
        pageSlug: 'about',
        blockType: 'governance_values',
        label: 'Nilai Pengelolaan Bisnis Universitas',
        sortOrder: 4,
        isVisible: true,
        config: govBase,
      },
    ];
  }

  if (pageSlug === 'visi-misi') {
    const heroBase = cloneJson(getCatalogEntry('page_hero').defaultConfig);
    const visiBase = cloneJson(getCatalogEntry('visi_card').defaultConfig);
    const misiBase = cloneJson(getCatalogEntry('misi_grid').defaultConfig);

    return [
      {
        pageSlug: 'visi-misi',
        blockType: 'page_hero',
        label: 'Hero Visi & Misi',
        sortOrder: 1,
        isVisible: true,
        config: {
          ...heroBase,
          eyebrow: s.page_visimisi_eyebrow?.trim() || 'Profil P2B · Arah Strategis',
          title: s.page_visimisi_title?.trim() || 'Visi & Misi P2B UIN Salatiga',
          subtitle:
            s.page_visimisi_subtitle?.trim() ||
            'Komitmen kelembagaan dalam membangun kemandirian PTN BLU, budaya inovasi kewirausahaan, dan layanan komersial unggul.',
          imageUrl:
            s.page_visimisi_image?.trim() ||
            'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp',
          imageAlt: 'Fasilitas dan Aset Strategis P2B UIN Salatiga',
          cornerLabel: 'Tata Kelola',
          cornerActionLabel: 'Struktur Organisasi',
          cornerHref: '/struktur-organisasi',
        },
      },
      {
        pageSlug: 'visi-misi',
        blockType: 'visi_card',
        label: 'Kartu Visi P2B',
        sortOrder: 2,
        isVisible: true,
        config: {
          ...visiBase,
          label: s.page_visimisi_visi_label?.trim() || 'Visi P2B',
          text:
            s.page_visimisi_visi_text?.trim() || (visiBase.text as string),
          subtext:
            s.page_visimisi_visi_subtext?.trim() ||
            (visiBase.subtext as string),
        },
      },
      {
        pageSlug: 'visi-misi',
        blockType: 'misi_grid',
        label: 'Lima Fokus Misi P2B',
        sortOrder: 3,
        isVisible: true,
        config: misiBase,
      },
    ];
  }

  if (pageSlug === 'struktur-organisasi') {
    const heroBase = cloneJson(getCatalogEntry('page_hero').defaultConfig);
    const orgBase = cloneJson(getCatalogEntry('org_chart').defaultConfig);
    const divBase = cloneJson(getCatalogEntry('unit_divisions').defaultConfig);

    return [
      {
        pageSlug: 'struktur-organisasi',
        blockType: 'page_hero',
        label: 'Hero Struktur Organisasi',
        sortOrder: 1,
        isVisible: true,
        config: {
          ...heroBase,
          eyebrow: 'Profil P2B · SK Rektor No. 56 Tahun 2026',
          title: 'Struktur Organisasi P2B',
          subtitle:
            'Susunan tata kelola statis Pusat Pengembangan Bisnis Badan Layanan Umum UIN Salatiga berdasarkan Keputusan Rektor UIN Salatiga Nomor 56 Tahun 2026.',
          imageUrl:
            s.page_org_image?.trim() ||
            'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2025/01/2025-Slider-2.png',
          imageAlt: 'Tim Kolaborasi dan Manajemen P2B UIN Salatiga',
          cornerLabel: 'Profil Lengkap',
          cornerActionLabel: 'Tentang Kami',
          cornerHref: '/tentang-kami',
        },
      },
      {
        pageSlug: 'struktur-organisasi',
        blockType: 'org_chart',
        label: 'Bagan Struktur Organisasi SK 56/2026',
        sortOrder: 2,
        isVisible: true,
        config: orgBase,
      },
      {
        pageSlug: 'struktur-organisasi',
        blockType: 'unit_divisions',
        label: 'Ruang Lingkup Layanan & Unit Usaha',
        sortOrder: 3,
        isVisible: true,
        config: divBase,
      },
    ];
  }

  // Default: 'home'
  const heroHome = cloneJson(getCatalogEntry('hero').defaultConfig);
  const marqueeHome = cloneJson(getCatalogEntry('logo_marquee').defaultConfig);
  const whoWeAreHome = cloneJson(getCatalogEntry('who_we_are').defaultConfig);
  const newsHome = cloneJson(getCatalogEntry('news_updates').defaultConfig);
  const locationHome = cloneJson(getCatalogEntry('location_map').defaultConfig);
  const visiHome = cloneJson(getCatalogEntry('visi_card').defaultConfig);

  const cards = (whoWeAreHome.cards as HomeFocusCardConfig[]).map((card, i) => {
    const idx = i + 1;
    return {
      ...card,
      title: s[`focus_card_${idx}_title`]?.trim() || card.title,
      subtitle: s[`focus_card_${idx}_subtitle`]?.trim() || card.subtitle,
      linkLabel: s[`focus_card_${idx}_link_label`]?.trim() || card.linkLabel,
      href: s[`focus_card_${idx}_href`]?.trim() || card.href,
      image: s[`focus_card_${idx}_image`]?.trim() || card.image,
      description:
        s[`focus_card_${idx}_description`]?.trim() || card.description,
    };
  });

  return [
    {
      pageSlug: 'home',
      blockType: 'hero',
      label: 'Hero Utama Beranda',
      sortOrder: 1,
      isVisible: true,
      config: {
        ...heroHome,
        title: s.hero_title?.trim() || (heroHome.title as string),
        subtitle: s.hero_subtitle?.trim() || (heroHome.subtitle as string),
        imageUrl: s.hero_image_url?.trim() || (heroHome.imageUrl as string),
      },
    },
    {
      pageSlug: 'home',
      blockType: 'logo_marquee',
      label: 'Marquee Logo Mitra',
      sortOrder: 2,
      isVisible: true,
      config: marqueeHome,
    },
    {
      pageSlug: 'home',
      blockType: 'who_we_are',
      label: 'Tentang P2B & Kartu Fokus',
      sortOrder: 3,
      isVisible: true,
      config: {
        ...whoWeAreHome,
        heading: s.about_heading?.trim() || (whoWeAreHome.heading as string),
        paragraph1: s.about_p1?.trim() || (whoWeAreHome.paragraph1 as string),
        paragraph2: s.about_p2?.trim() || (whoWeAreHome.paragraph2 as string),
        cards,
      },
    },
    {
      pageSlug: 'home',
      blockType: 'news_updates',
      label: 'News & Update',
      sortOrder: 4,
      isVisible: true,
      config: newsHome,
    },
    {
      pageSlug: 'home',
      blockType: 'location_map',
      label: 'Peta & Lokasi P2B',
      sortOrder: 5,
      isVisible: true,
      config: {
        ...locationHome,
        eyebrow: s.location_eyebrow?.trim() || 'Lokasi Resmi',
        heading: s.location_heading?.trim() || 'Peta & Lokasi P2B',
        description:
          s.location_description?.trim() ||
          (locationHome.description as string),
        cardLabel: s.location_card_label?.trim() || 'Alamat Kantor P2B',
        cardTitle:
          s.location_card_title?.trim() ||
          'Gedung Auditorium & Student Center Prof. Dr. H. Achmadi',
        address: s.location_address?.trim() || '',
        lat: s.location_lat?.trim() || '',
        lng: s.location_lng?.trim() || '',
        mapsUrl: s.location_maps_url?.trim() || '',
        cornerLabel: s.location_corner_label?.trim() || 'Petunjuk Arah',
        cornerActionLabel:
          s.location_corner_action_label?.trim() || 'Buka Maps',
      },
    },
    {
      pageSlug: 'home',
      blockType: 'visi_card',
      label: 'Kartu Visi P2B',
      sortOrder: 6,
      isVisible: true,
      config: {
        ...visiHome,
        label: s.page_visimisi_visi_label?.trim() || 'Visi P2B',
        text: s.page_visimisi_visi_text?.trim() || (visiHome.text as string),
        subtext:
          s.page_visimisi_visi_subtext?.trim() ||
          (visiHome.subtext as string),
      },
    },
  ];
}

export function getDefaultBlocksWithIds(
  pageSlug: BuilderPageSlug
): HomeBlockItem[] {
  return buildDefaultBlocksForPage(pageSlug).map((blk, idx) => ({
    ...blk,
    id: idx + 1,
  }));
}

export const DEFAULT_HOME_BLOCKS: HomeBlockItem[] =
  getDefaultBlocksWithIds('home');
