import {
  Briefcase,
  Building2,
  GraduationCap,
  Handshake,
  Landmark,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';

interface StrukturOrganisasiPageProps {
  onOpenAbout: () => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

const divisions = [
  {
    icon: Building2,
    code: 'DIVISI 01',
    title: 'Optimalisasi Aset & Fasilitas',
    responsibilities: [
      'Pengelolaan reservasi Gedung Auditorium Student Centre dan ruang pertemuan kampus.',
      'Inventarisasi serta pemanfaatan aset fisik universitas agar memiliki nilai tambah ekonomi.',
      'Pemeliharaan standar kelayakan sarana pendukung kegiatan internal maupun eksternal.',
    ],
  },
  {
    icon: Briefcase,
    code: 'DIVISI 02',
    title: 'Layanan Komersial & Unit Usaha',
    responsibilities: [
      'Operasional Klinik UIN SAGA, Kantin kampus higienis, produk Air Mineral, dan layanan Tiket.',
      'Pengembangan unit bisnis baru melalui kajian kelayakan serta evaluasi kinerja berkala.',
      'Penjaminan mutu pelayanan dan kepuasan pelanggan sesuai tata kelola PTN BLU.',
    ],
  },
  {
    icon: Handshake,
    code: 'DIVISI 03',
    title: 'Kemitraan Strategis & Pemasaran',
    responsibilities: [
      'Menjalin kerja sama produktif dengan dunia industri, pemerintah, alumni, dan masyarakat.',
      'Penyusunan skema kolaborasi usaha yang memberikan manfaat bersama secara transparan.',
      'Pengelolaan komunikasi publik dan pemasaran layanan komersial P2B UIN Salatiga.',
    ],
  },
  {
    icon: GraduationCap,
    code: 'DIVISI 04',
    title: 'Talenta, Magang & Inovasi Mahasiswa',
    responsibilities: [
      'Penyelenggaraan program magang profesional mahasiswa pada unit bisnis P2B.',
      'Pendampingan praktik bidang teknologi informasi, komunikasi, pemasaran digital, bisnis, dan akuntansi.',
      'Inkubasi ide kewirausahaan untuk memperkuat ekosistem entrepreneurial university.',
    ],
  },
];

export function StrukturOrganisasiPage({
  onOpenAbout,
  onNavigateSection,
}: StrukturOrganisasiPageProps) {
  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow="Profil P2B · Tata Kelola"
        title="Struktur Organisasi P2B"
        subtitle="Susunan manajemen dan divisi operasional yang memisahkan fungsi perencanaan strategis, tata kelola PTN BLU, dan pengembangan unit usaha."
        imageSrc="https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2025/01/2025-Slider-2.png"
        imageAlt="Tim Kolaborasi dan Manajemen P2B UIN Salatiga"
        cornerLabel="Profil Lengkap"
        cornerActionLabel="Tentang Kami"
        cornerHref="#tentang-kami"
        onCornerClick={onOpenAbout}
      />

      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-10 md:gap-14">
          {/* Organizational Hierarchy Tier Cards */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[1.5rem] md:rounded-[3rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-12 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                Garis Koordinasi Kelembagaan
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight">
                Hierarki Pengelolaan Unit Bisnis
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="rounded-[1.5rem] bg-[#164234] text-[#FAF8F3] border border-[#C9A45A]/40 p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4D993]/15 border border-[#F4D993]/40 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-[#F4D993]" />
                </div>
                <span className="text-xs uppercase tracking-wider text-[#F4D993]">
                  Tingkat 01 · Pengarah
                </span>
                <h3 className="text-xl font-normal tracking-tight">
                  Pimpinan Universitas UIN Salatiga
                </h3>
                <p className="text-sm text-[#F6F3EC]/85 leading-relaxed">
                  Memberikan arahan kebijakan strategis, penetapan regulasi tarif PTN BLU, serta pengawasan kinerja pengembangan bisnis universitas.
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-white/80 border border-[#C9A45A]/30 p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#164234]" />
                </div>
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Tingkat 02 · Pimpinan Unit
                </span>
                <h3 className="text-xl font-normal text-[#164234] tracking-tight">
                  Kepala Pusat Pengembangan Bisnis
                </h3>
                <p className="text-sm text-[#3E544B] leading-relaxed">
                  Memimpin perencanaan bisnis, koordinasi lintas divisi, persetujuan kemitraan strategis, dan evaluasi portofolio unit komersial P2B.
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-white/80 border border-[#C9A45A]/30 p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#164234]" />
                </div>
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Tingkat 03 · Tata Usaha & Keuangan
                </span>
                <h3 className="text-xl font-normal text-[#164234] tracking-tight">
                  Sekretariat & Akuntabilitas BLU
                </h3>
                <p className="text-sm text-[#3E544B] leading-relaxed">
                  Menangani administrasi kontrak sewa, pencatatan transaksi pendapatan usaha, kepatuhan prosedur, serta pelaporan akuntabel PTN BLU.
                </p>
              </div>
            </div>
          </motion.section>

          {/* 4 Operational Divisions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="px-3 md:px-6 flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                Bidang Operasional
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight">
                Divisi Pelaksana Layanan & Usaha
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {divisions.map((div) => {
                const Icon = div.icon;
                return (
                  <div
                    key={div.code}
                    className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/25 p-6 md:p-8 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-11 h-11 rounded-full bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#164234]" />
                      </div>
                      <span className="text-xs tracking-widest text-[#8F6D26]">
                        {div.code}
                      </span>
                    </div>

                    <h3 className="text-xl font-normal text-[#164234] tracking-tight">
                      {div.title}
                    </h3>

                    <ul className="flex flex-col gap-2 text-sm text-[#3E544B] leading-relaxed">
                      {div.responsibilities.map((item) => (
                        <li
                          key={item}
                          className="px-3.5 py-2.5 rounded-2xl bg-[#F6F3EC]/80 border border-[#C9A45A]/20"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer
        onNavigate={(target) => {
          onNavigateSection(target);
        }}
      />
    </div>
  );
}
