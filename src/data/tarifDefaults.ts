export type TarifCategorySlug = string;

export const DEFAULT_TARIF_HERO_IMAGE =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png';

export const DEFAULT_TARIF_EYEBROW = 'Transparansi Layanan · PTN BLU';
export const DEFAULT_TARIF_TITLE = 'Tarif Layanan P2B';
export const DEFAULT_TARIF_SUBTITLE =
  'Informasi resmi tarif layanan penunjang akademik, layanan kesehatan Klinik Mitra Insani, dan publikasi jurnal di lingkungan Pusat Pengembangan Bisnis UIN Salatiga.';
export const DEFAULT_TARIF_CORNER_LABEL = 'Dokumen Tarif';
export const DEFAULT_TARIF_CORNER_ACTION = 'Lihat PDF Tarif';

export const DEFAULT_TARIF_PENUNJANG_DRIVE_URL =
  'https://drive.google.com/file/d/1wKMAX7isG4ObkJf2u8od0OnIFZWroV_3/view';

export const DEFAULT_TARIF_PENUNJANG_LOCAL_PDF =
  '/assets/aistudio/SK-R-29-TH2024-Tarif_Layanan_Penunjang_Akademik_b447f880.pdf';

export interface TarifItem {
  id: number;
  slug: string;
  navLabel: string;
  shortLabel: string;
  title: string;
  docNumber: string;
  description: string;
  pdfUrl: string;
  localFallbackPdfUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export const DEFAULT_TARIF_ITEMS: TarifItem[] = [
  {
    id: 1,
    slug: 'penunjang-akademik',
    navLabel: 'Tarif Layanan Penunjang Akademik',
    shortLabel: 'Penunjang Akademik',
    title: 'Tarif Layanan Penunjang Akademik UIN Salatiga',
    docNumber: 'Keputusan Rektor UIN Salatiga Nomor 29 Tahun 2024',
    description:
      'Ketentuan resmi tarif pemanfaatan aset dan layanan penunjang akademik meliputi Gedung Auditorium Student Centre, Aula Kampus 1, Ruang Theater, Lapangan Olahraga, Ruang Kelas/Lab, Kantin, Bahasa, Lembaga Produk Halal, Poliklinik, dan layanan penunjang lainnya.',
    pdfUrl: DEFAULT_TARIF_PENUNJANG_DRIVE_URL,
    localFallbackPdfUrl: DEFAULT_TARIF_PENUNJANG_LOCAL_PDF,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    slug: 'klinik-mitra-insani',
    navLabel: 'Tarif Layanan Klinik Mitra Insani',
    shortLabel: 'Klinik Mitra Insani',
    title: 'Tarif Layanan Klinik Mitra Insani UIN Salatiga',
    docNumber: 'Standar Tarif Layanan Kesehatan P2B',
    description:
      'Daftar tarif pelayanan pemeriksaan kesehatan umum, poli gigi, poli ibu dan anak, pemeriksaan laboratorium dasar, serta layanan kesehatan Klinik Mitra Insani bagi sivitas akademika dan masyarakat umum.',
    pdfUrl: '',
    localFallbackPdfUrl: '',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    slug: 'jurnal',
    navLabel: 'Tarif Jurnal',
    shortLabel: 'Tarif Jurnal',
    title: 'Tarif Publikasi & Pengelolaan Jurnal Ilmiah',
    docNumber: 'Ketentuan Tarif Layanan Jurnal P2B UIN Salatiga',
    description:
      'Pedoman tarif layanan tata kelola, penerbitan, penyuntingan, proofreading, serta kerja sama pengelolaan jurnal ilmiah di lingkungan Universitas Islam Negeri Salatiga.',
    pdfUrl: '',
    localFallbackPdfUrl: '',
    sortOrder: 3,
    isActive: true,
  },
];

export function slugifyTarifLabel(input: string): string {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return cleaned || `tarif-${Date.now().toString(36).slice(-4)}`;
}

export function isValidTarifSlug(raw?: string | null): raw is TarifCategorySlug {
  const trimmed = (raw || '').trim();
  return /^[a-z0-9][a-z0-9-]{0,100}$/i.test(trimmed);
}

export function getTarifItemBySlug(
  items: TarifItem[],
  slug?: string | null
): TarifItem | null {
  const pool = items.length > 0 ? items : DEFAULT_TARIF_ITEMS;
  if (slug) {
    const exact = pool.find((item) => item.slug === slug);
    if (exact) return exact;
  }
  return pool[0] || null;
}

export interface ResolvedPdfSource {
  hasSource: boolean;
  isGoogleDrive: boolean;
  rawUrl: string;
  embedUrl: string;
  openUrl: string;
  downloadUrl: string;
}

export function extractGoogleDriveFileId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes('drive.google.com') && !host.includes('docs.google.com')) {
      return null;
    }

    const fileMatch = /\/file\/d\/([a-zA-Z0-9_-]+)/.exec(parsed.pathname);
    if (fileMatch?.[1]) return fileMatch[1];

    const idParam = parsed.searchParams.get('id');
    if (idParam && /^[a-zA-Z0-9_-]+$/.test(idParam)) return idParam;
  } catch {
    return null;
  }

  return null;
}

export function isSafePdfReference(rawUrl?: string | null): boolean {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function resolvePdfSource(rawUrl?: string | null): ResolvedPdfSource {
  const trimmed = (rawUrl || '').trim();
  if (!isSafePdfReference(trimmed)) {
    return {
      hasSource: false,
      isGoogleDrive: false,
      rawUrl: '',
      embedUrl: '',
      openUrl: '',
      downloadUrl: '',
    };
  }

  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    return {
      hasSource: true,
      isGoogleDrive: true,
      rawUrl: trimmed,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      openUrl: `https://drive.google.com/file/d/${driveId}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${driveId}`,
    };
  }

  const isInternalMedia = trimmed.startsWith('/api/media/');
  const downloadUrl = isInternalMedia
    ? trimmed.includes('?')
      ? `${trimmed}&download=1`
      : `${trimmed}?download=1`
    : trimmed;

  return {
    hasSource: true,
    isGoogleDrive: false,
    rawUrl: trimmed,
    embedUrl: trimmed,
    openUrl: trimmed,
    downloadUrl,
  };
}
