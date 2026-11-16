export type NewsCategory = 'Semua' | 'Fasilitas' | 'Layanan' | 'Produk';

export interface NewsArticle {
  id: string;
  category: Exclude<NewsCategory, 'Semua'>;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  image: string;
  content: string[];
}

export const allNewsArticles: NewsArticle[] = [
  {
    id: 'auditorium-modernisasi',
    category: 'Fasilitas',
    date: '14 Nov 2026',
    readTime: '3 mnt baca',
    title: 'Modernisasi Sistem Akustik & Reservasi Digital Gedung Auditorium Salatiga',
    excerpt:
      'Peningkatan tata suara dan sistem pemesanan terpadu kini memudahkan penyelenggaraan seminar nasional hingga wisuda dengan konfirmasi jadwal real-time.',
    image: '/src/assets/images/news_auditorium_launch_1794836860155.jpg',
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
    readTime: '4 mnt baca',
    title: 'Klinik UIN SAGA Perluas Jam Layanan Konsultasi & Pemeriksaan Preventif',
    excerpt:
      'Penambahan jadwal praktik dokter umum dan layanan skrining kesehatan berkala hadir untuk meningkatkan akses kesehatan civitas serta warga sekitar.',
    image: '/src/assets/images/news_klinik_service_1794836860824.jpg',
    content: [
      'Klinik UIN SAGA membuka perluasan jam operasional layanan rawat jalan dan pemeriksaan preventif guna menjawab meningkatnya kebutuhan konsultasi kesehatan harian.',
      'Area tunggu dan ruang konsultasi dirancang ulang dengan partisi kaca higienis dan alur pendaftaran digital agar pasien memperoleh pengalaman layanan yang tenang dan efisien.',
      'Civitas akademika maupun masyarakat umum dapat memanfaatkan layanan pemeriksaan dasar, konsultasi gizi, serta rujukan terstruktur setiap hari kerja.',
    ],
  },
  {
    id: 'produk-air-mineral',
    category: 'Produk',
    date: '02 Nov 2026',
    readTime: '3 mnt baca',
    title: 'Distribusi Air Mineral Kemasan Ramah Lingkungan Resmi Menjangkau Area Kantin',
    excerpt:
      'Inisiatif produksi air mineral berstandar higienis tinggi mulai dipasok ke seluruh unit kantin dan kegiatan resmi auditorium kampus.',
    image: '/src/assets/images/news_air_mineral_1794836860880.jpg',
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
    readTime: '4 mnt baca',
    title: 'Skema Baru Pelayanan Sewa Aset & Ruang Kolaborasi bagi Mitra Eksternal',
    excerpt:
      'P2B membuka akses pemanfaatan ruang seminar, studio, dan sarana pendukung kegiatan universitas dengan tarif PTN BLU yang transparan.',
    image: '/src/assets/images/news_sewa_aset_1794838910029.jpg',
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
    readTime: '3 mnt baca',
    title: 'Revitalisasi Kantin Kampus Hadirkan Konsep Kuliner Higienis & Pembayaran Nontunai',
    excerpt:
      'Penataan ulang area kantin universitas kini mengintegrasikan standar sanitasi dapur modern dan sistem transaksi QRIS terpadu.',
    image: '/src/assets/images/news_kantin_kampus_1794838910237.jpg',
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
    readTime: '4 mnt baca',
    title: 'Peluncuran Layanan Tiket Terpadu & Rekrutmen Magang Talenta Mahasiswa P2B',
    excerpt:
      'Integrasi loket tiket acara kampus membuka kesempatan magang profesional bagi mahasiswa bidang IT, komunikasi, pemasaran digital, dan akuntansi.',
    image: '/src/assets/images/news_tiket_magang_1794838909826.jpg',
    content: [
      'P2B UIN Salatiga menghadirkan layanan Tiket terpadu untuk mendukung pengelolaan tiket kegiatan seminar, pertunjukan, hingga akses fasilitas kampus secara tertib.',
      'Sejalan dengan pilar Pengembangan Talenta dan Inovasi Mahasiswa, operasional layanan digital ini melibatkan mahasiswa magang aktif dari program studi teknologi informasi, komunikasi, bisnis, dan akuntansi.',
      'Melalui pengalaman langsung dalam unit bisnis nyata, mahasiswa memperoleh bekal kompetensi profesional sekaligus berkontribusi dalam ekosistem entrepreneurial university.',
    ],
  },
];
