import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import { CardCornerPattern } from './CardCornerPattern';
import { defaultOrgMembers } from '../data/orgMembers';
import { OrgMemberItem, SiteSettings } from '../types/cms';

interface StrukturOrganisasiPageProps {
  members?: OrgMemberItem[];
  settings?: SiteSettings;
  onOpenAbout: () => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

const TIER_LABELS: Record<OrgMemberItem['tier'], string> = {
  rektor: 'Pimpinan Universitas',
  kepala_p2b: 'Pimpinan Unit P2B',
  manajemen: 'Manajemen & Sekretariat',
  divisi: 'Koordinator Divisi',
};

function getInitials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'P2B';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function MemberHeroCard({
  member,
  index,
  emphasized = false,
}: {
  member: OrgMemberItem;
  index: number;
  emphasized?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = Boolean(member.photoUrl && member.photoUrl.trim()) && !imgError;
  const orderNumber = String(index + 1).padStart(2, '0');
  const tierLabel = TIER_LABELS[member.tier] || 'Struktur Organisasi';

  return (
    <article
      className={`group relative aspect-[3/4] w-full rounded-[1.5rem] md:rounded-[2.25rem] overflow-hidden border flex flex-col justify-end transition-all duration-300 ${
        emphasized
          ? 'border-[#C9A45A]/55 shadow-[0_18px_42px_-20px_rgba(11,38,29,0.5)]'
          : 'border-[#C9A45A]/30 hover:border-[#C9A45A]/60'
      }`}
    >
      {/* Emerald Hero Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B261D] via-[#164234] to-[#1E5644]" />

      {/* Full-Bleed Personal Photo or Subtle Portrait Fallback */}
      {hasPhoto ? (
        <img
          src={member.photoUrl}
          alt={`Foto ${member.name} — ${member.positionTitle}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-14 select-none pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-[#FAF8F3]/8 border border-[#F4D993]/30 flex items-center justify-center text-[#F4D993]/80">
            <Icon icon="mdi:account-outline" className="w-9 h-9" />
          </div>
          <span className="mt-2.5 text-[11px] uppercase tracking-[0.22em] text-[#F4D993]/70">
            {getInitials(member.name)}
          </span>
        </div>
      )}

      {/* Deep Emerald Hero Gradient Scrim for Crisp Typography */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#081F17]/95 via-[#0E3125]/68 to-transparent pointer-events-none"
      />

      {/* Simple Bottom Foreground Copy */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[#F4D993]/90">
          <span className="tabular-nums">{orderNumber}</span>
          <span aria-hidden="true" className="text-[#F4D993]/50">
            ·
          </span>
          <span>{tierLabel}</span>
        </div>

        <h3 className="text-lg sm:text-xl font-normal text-[#FAF8F3] tracking-tight leading-snug">
          {member.name}
        </h3>

        <p className="text-xs sm:text-sm text-[#F6F3EC]/85 font-normal leading-snug">
          {member.positionTitle}
        </p>
      </div>
    </article>
  );
}

const divisions = [
  {
    icon: 'mdi:office-building-outline',
    code: 'DIVISI 01',
    title: 'Optimalisasi Aset & Fasilitas',
    responsibilities: [
      'Pengelolaan reservasi Gedung Auditorium Student Centre dan ruang pertemuan kampus.',
      'Inventarisasi serta pemanfaatan aset fisik universitas agar memiliki nilai tambah ekonomi.',
      'Pemeliharaan standar kelayakan sarana pendukung kegiatan internal maupun eksternal.',
    ],
  },
  {
    icon: 'mdi:briefcase-outline',
    code: 'DIVISI 02',
    title: 'Layanan Komersial & Unit Usaha',
    responsibilities: [
      'Operasional Klinik Mitra Insani, Kantin kampus higienis, produk Air Mineral, dan layanan Tiket.',
      'Pengembangan unit bisnis baru melalui kajian kelayakan serta evaluasi kinerja berkala.',
      'Penjaminan mutu pelayanan dan kepuasan pelanggan sesuai tata kelola PTN BLU.',
    ],
  },
  {
    icon: 'mdi:handshake-outline',
    code: 'DIVISI 03',
    title: 'Kemitraan Strategis & Pemasaran',
    responsibilities: [
      'Menjalin kerja sama produktif dengan dunia industri, pemerintah, alumni, dan masyarakat.',
      'Penyusunan skema kolaborasi usaha yang memberikan manfaat bersama secara transparan.',
      'Pengelolaan komunikasi publik dan pemasaran layanan komersial P2B UIN Salatiga.',
    ],
  },
  {
    icon: 'mdi:school-outline',
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
  members = defaultOrgMembers,
  settings,
  onOpenAbout,
  onNavigateSection,
}: StrukturOrganisasiPageProps) {
  const activeMembers = (members.length > 0 ? members : defaultOrgMembers)
    .filter((item) => item.isActive !== false)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const firstLeader = activeMembers[0] || null;
  const secondLeader = activeMembers[1] || null;
  const teamMembers = activeMembers.slice(2);

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow={settings?.page_org_eyebrow?.trim() || 'Profil P2B · Tata Kelola'}
        title={settings?.page_org_title?.trim() || 'Struktur Organisasi P2B'}
        subtitle={
          settings?.page_org_subtitle?.trim() ||
          'Susunan pimpinan, manajemen, dan koordinator divisi operasional Pusat Pengembangan Bisnis UIN Salatiga sesuai garis koordinasi kelembagaan.'
        }
        imageSrc={
          settings?.page_org_image?.trim() ||
          'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2025/01/2025-Slider-2.png'
        }
        imageAlt="Tim Kolaborasi dan Manajemen P2B UIN Salatiga"
        cornerLabel="Profil Lengkap"
        cornerActionLabel="Tentang Kami"
        cornerHref="/tentang-kami"
        onCornerClick={onOpenAbout}
      />

      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-10 md:gap-14">
          {/* Dynamic Organizational Hero Cards */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8 px-1 sm:px-3 md:px-6"
          >
            <div className="flex flex-col gap-1.5 text-center items-center max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                {settings?.page_org_section_eyebrow?.trim() || 'Garis Koordinasi Kelembagaan'}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight">
                {settings?.page_org_section_heading?.trim() || 'Susunan Pimpinan & Pengelola P2B'}
              </h2>
            </div>

            {activeMembers.length > 0 && (
              <div className="flex flex-col items-center">
                {/* Urutan #1: Rektor */}
                {firstLeader && (
                  <div className="w-full max-w-[300px] sm:max-w-[320px]">
                    <MemberHeroCard member={firstLeader} index={0} emphasized />
                  </div>
                )}

                {/* Urutan #2: Kepala P2B */}
                {secondLeader && (
                  <>
                    <div
                      aria-hidden="true"
                      className="w-px h-7 sm:h-9 bg-gradient-to-b from-[#C9A45A] to-[#C9A45A]/40"
                    />
                    <div className="w-full max-w-[300px] sm:max-w-[320px]">
                      <MemberHeroCard member={secondLeader} index={1} emphasized />
                    </div>
                  </>
                )}

                {/* Urutan #3+: Manajemen & Divisi */}
                {teamMembers.length > 0 && (
                  <>
                    <div
                      aria-hidden="true"
                      className="w-px h-7 sm:h-9 bg-[#C9A45A]/45"
                    />
                    <div
                      aria-hidden="true"
                      className="w-2/3 max-w-2xl h-px bg-gradient-to-r from-transparent via-[#C9A45A]/45 to-transparent mb-7"
                    />

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                      {teamMembers.map((member, idx) => (
                        <MemberHeroCard
                          key={member.id}
                          member={member}
                          index={idx + 2}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
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
              {divisions.map((div, idx) => (
                  <div
                    key={div.code}
                    className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2.25rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/25 hover:border-[#C9A45A]/55 p-6 md:p-8 flex flex-col gap-4 transition-colors"
                  >
                    <CardCornerPattern
                      index={idx}
                      position="bottom-right"
                      sizeClassName="w-44 h-44 sm:w-48 sm:h-48"
                      opacityClassName="opacity-[0.14] group-hover:opacity-[0.24]"
                    />
                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="w-11 h-11 rounded-full bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center shrink-0">
                        <Icon icon={div.icon} className="w-5 h-5 text-[#164234]" />
                      </div>
                      <span className="text-xs tracking-widest text-[#8F6D26]">
                        {div.code}
                      </span>
                    </div>

                    <h3 className="relative z-10 text-xl font-normal text-[#164234] tracking-tight">
                      {div.title}
                    </h3>

                    <ul className="relative z-10 flex flex-col gap-2 text-sm text-[#3E544B] leading-relaxed">
                      {div.responsibilities.map((item) => (
                        <li
                          key={item}
                          className="px-3.5 py-2.5 rounded-2xl bg-[#F6F3EC]/85 border border-[#C9A45A]/20"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer
        settings={settings}
        onNavigate={(target) => {
          onNavigateSection(target);
        }}
      />
    </div>
  );
}
