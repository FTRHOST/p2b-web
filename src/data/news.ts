export type NewsCategory = string;

export const DEFAULT_NEWS_CATEGORIES: string[] = ['Fasilitas', 'Layanan', 'Produk'];

export interface NewsGalleryItem {
  url: string;
  caption?: string;
}

export interface NewsAttachment {
  id: string;
  title: string;
  url: string;
  fileName?: string;
  sizeBytes?: number;
}

export interface NewsArticle {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  isLogoPlaceholder?: boolean;
  content: string[];
  contentHtml?: string;
  gallery?: NewsGalleryItem[];
  attachments?: NewsAttachment[];
}

export const NEWS_PLACEHOLDER_LOGO =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/2022-Web-UIN-Logo-1.png';

export const allNewsArticles: NewsArticle[] = [
  {
    id: 'auditorium-modernisasi',
    category: 'Fasilitas',
    date: '14 Nov 2026',
    title: 'Modernisasi Sistem Akustik & Reservasi Digital Gedung Auditorium Salatiga',
    excerpt:
      'Peningkatan tata suara dan sistem pemesanan terpadu kini memudahkan penyelenggaraan seminar nasional hingga wisuda dengan konfirmasi jadwal real-time.',
    image:
      'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/09/auditorium-2con.png',
    isLogoPlaceholder: false,
    content: [
      'Gedung Auditorium Student Centre di Salatiga resmi mengoperasikan pembaruan panel akustik arsitektural serta sistem pencahayaan panggung hemat energi untuk mendukung beragam agenda akademik maupun publik.',
      'Melalui kanal Pelayanan Sewa Aset dan Tiket terpadu P2B UIN Salatiga, panitia acara maupun mitra eksternal kini dapat meninjau ketersediaan tanggal, kapasitas ruang, serta paket dukungan teknis secara transparan.',
      'Langkah ini menjadi bagian dari komitmen berkelanjutan dalam menghadirkan infrastruktur kegiatan berstandar profesional bagi civitas dan masyarakat luas.',
    ],
  },
  {
    id: 'klinik-uin-saga',
    category: 'Layanan',
    date: '09 Nov 2026',
    title: 'Klinik Mitra Insani Perluas Jam Layanan Konsultasi & Pemeriksaan Preventif',
    excerpt:
      'Penambahan jadwal praktik dokter umum dan layanan skrining kesehatan berkala hadir untuk meningkatkan akses kesehatan civitas serta warga sekitar.',
    image: NEWS_PLACEHOLDER_LOGO,
    isLogoPlaceholder: true,
    content: [
      'Klinik Mitra Insani membuka perluasan jam operasional layanan rawat jalan dan pemeriksaan preventif guna menjawab meningkatnya kebutuhan konsultasi kesehatan harian.',
      'Area tunggu dan ruang konsultasi dirancang ulang dengan partisi kaca higienis dan alur pendaftaran digital agar pasien memperoleh pengalaman layanan yang tenang dan efisien.',
      'Civitas akademika maupun masyarakat umum dapat memanfaatkan layanan pemeriksaan dasar, konsultasi gizi, serta rujukan terstruktur setiap hari kerja.',
    ],
  },
  {
    id: 'produk-air-mineral',
    category: 'Produk',
    date: '02 Nov 2026',
    title: 'Distribusi Air Mineral Kemasan Ramah Lingkungan Resmi Menjangkau Area Kantin',
    excerpt:
      'Inisiatif produksi air mineral berstandar higienis tinggi mulai dipasok ke seluruh unit kantin dan kegiatan resmi auditorium kampus.',
    image:
      'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp',
    isLogoPlaceholder: false,
    content: [
      'Unit produksi Air Mineral P2B UIN Salatiga resmi meluncurkan lini kemasan terbarunya yang mengedepankan proses filtrasi berlapis dan pengawasan mutu laboratorium berkala.',
      'Seluruh gerai Kantin serta penyelenggaraan acara di Gedung Auditorium kini memperoleh pasokan langsung dengan skema distribusi yang lebih ringkas dan terjangkau.',
      'Program ini turut mendukung pengurangan limbah kemasan sekali pakai melalui sistem pengumpulan ulang di titik-titik layanan utama.',
    ],
  },
  {
    id: 'optimalisasi-sewa-aset',
    category: 'Fasilitas',
    date: '25 Okt 2026',
    title: 'Skema Baru Pelayanan Sewa Aset & Ruang Kolaborasi bagi Mitra Eksternal',
    excerpt:
      'P2B membuka akses pemanfaatan ruang seminar, studio, dan sarana pendukung kegiatan universitas dengan tarif PTN BLU yang transparan.',
    image: NEWS_PLACEHOLDER_LOGO,
    isLogoPlaceholder: true,
    content: [
      'Melalui unit Pelayanan Sewa Aset, P2B UIN Salatiga menata ulang katalog pemanfaatan ruang rapat eksekutif, aula seminar, dan fasilitas pendukung acara agar mudah diakses oleh lembaga mitra maupun komunitas profesional.',
      'Optimalisasi aset ini dirancang sesuai prinsip tata kelola Badan Layanan Umum (PTN BLU) sehingga memberikan nilai ekonomi berkelanjutan bagi penguatan kelembagaan universitas.',
      'Calon penyewa dapat mengajukan jadwal survei lokasi serta konsultasi kebutuhan perlengkapan secara langsung melalui tim layanan P2B.',
    ],
  },
  {
    id: 'revitalisasi-kantin-sehat',
    category: 'Layanan',
    date: '18 Okt 2026',
    title: 'Revitalisasi Kantin Kampus Hadirkan Konsep Kuliner Higienis & Pembayaran Nontunai',
    excerpt:
      'Penataan ulang area kantin universitas kini mengintegrasikan standar sanitasi dapur modern dan sistem transaksi QRIS terpadu.',
    image: NEWS_PLACEHOLDER_LOGO,
    isLogoPlaceholder: true,
    content: [
      'Unit usaha Kantin di bawah pengelolaan P2B UIN Salatiga menyelesaikan penataan area duduk yang lebih terang dan nyaman bagi mahasiswa, dosen, serta tamu kampus.',
      'Setiap mitra tenant wajib memenuhi standar kebersihan penyajian makanan, sertifikasi halal, serta mendukung pembayaran digital agar antrean jam makan siang berlangsung lebih cepat.',
      'Kantin juga menjadi lokasi uji coba pemasaran produk UMKM binaan serta hasil inovasi mahasiswa.',
    ],
  },
  {
    id: 'program-magang-tiket',
    category: 'Produk',
    date: '10 Okt 2026',
    title: 'Peluncuran Layanan Tiket Terpadu & Rekrutmen Magang Talenta Mahasiswa P2B',
    excerpt:
      'Integrasi loket tiket acara kampus membuka kesempatan magang profesional bagi mahasiswa bidang IT, komunikasi, pemasaran digital, dan akuntansi.',
    image: NEWS_PLACEHOLDER_LOGO,
    isLogoPlaceholder: true,
    content: [
      'P2B UIN Salatiga menghadirkan layanan Tiket terpadu untuk mendukung pengelolaan tiket kegiatan seminar, pertunjukan, hingga akses fasilitas kampus secara tertib.',
      'Sejalan dengan pilar Pengembangan Talenta dan Inovasi Mahasiswa, operasional layanan digital ini melibatkan mahasiswa magang aktif dari program studi teknologi informasi, komunikasi, bisnis, dan akuntansi.',
      'Melalui pengalaman langsung dalam unit bisnis nyata, mahasiswa memperoleh bekal kompetensi profesional sekaligus berkontribusi dalam ekosistem entrepreneurial university.',
    ],
  },
  {
    id: 'kajian-unit-bisnis-blu',
    category: 'Fasilitas',
    date: '03 Okt 2026',
    title: 'Kajian Kelayakan Pengembangan Unit Bisnis Baru & Sarana Pendukung Kampus',
    excerpt:
      'Tim P2B UIN Salatiga menyusun peta jalan pengembangan unit bisnis baru berbasis tata kelola PTN BLU yang transparan dan berkelanjutan.',
    image: NEWS_PLACEHOLDER_LOGO,
    isLogoPlaceholder: true,
    content: [
      'Sebagai bagian dari penguatan kelembagaan PTN BLU, Pusat Pengembangan Bisnis (P2B) UIN Salatiga melaksanakan kajian kelayakan terhadap sejumlah potensi pengembangan unit bisnis baru di lingkungan kampus.',
      'Setiap rencana pembukaan layanan dan pemanfaatan sarana pendukung dikaji dari sisi manfaat akademik, proyeksi keberlanjutan ekonomi, serta kesesuaiannya dengan prinsip tata kelola bisnis yang baik.',
      'Hasil kajian ini menjadi dasar penyusunan standar operasional dan skema kerja sama strategis di tahun berjalan.',
    ],
  },
  {
    id: 'forum-kemitraan-alumni',
    category: 'Layanan',
    date: '26 Sep 2026',
    title: 'Penguatan Kemitraan Strategis Bersama Industri, Pemerintah, dan Jaringan Alumni',
    excerpt:
      'P2B membuka forum kolaborasi lintas sektor untuk memperluas pemanfaatan layanan komersial serta proyek inovasi bersama sivitas akademika.',
    image: NEWS_PLACEHOLDER_LOGO,
    isLogoPlaceholder: true,
    content: [
      'Pusat Pengembangan Bisnis (P2B) UIN Salatiga menggelar pertemuan penjajakan kemitraan bersama perwakilan dunia usaha, instansi pemerintah daerah, dan ikatan alumni.',
      'Kolaborasi ini diarahkan pada pemanfaatan fasilitas kampus secara profesional, distribusi produk unit bisnis universitas, serta program pendampingan kewirausahaan bagi sivitas akademika.',
      'Melalui sinergi berkelanjutan, keberadaan P2B diharapkan memberi nilai tambah nyata bagi kemandirian universitas dan masyarakat luas.',
    ],
  },
  {
    id: 'inkubasi-pemasaran-digital',
    category: 'Produk',
    date: '19 Sep 2026',
    title: 'Optimalisasi Pemasaran Digital Produk Unit Usaha P2B Bersama Mahasiswa Magang',
    excerpt:
      'Kolaborasi tim komunikasi dan teknologi informasi mahasiswa mendorong perluasan jangkauan informasi produk serta layanan komersial kampus.',
    image: NEWS_PLACEHOLDER_LOGO,
    isLogoPlaceholder: true,
    content: [
      'Unit layanan komersial P2B UIN Salatiga mengintegrasikan strategi komunikasi digital dalam memperkenalkan produk Air Mineral, layanan reservasi Gedung Auditorium, serta fasilitas Klinik Mitra Insani kepada publik.',
      'Kegiatan ini menjadi ruang pembelajaran praktik langsung bagi mahasiswa magang pada bidang pemasaran digital, teknologi informasi, komunikasi publik, bisnis, dan akuntansi.',
      'Pendekatan ini memperkuat budaya inovasi serta mempercepat transformasi layanan P2B yang responsif terhadap kebutuhan pengguna.',
    ],
  },
];
