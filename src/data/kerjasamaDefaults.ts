import { KerjasamaItem } from '../types/cms';

export const DEFAULT_KERJASAMA_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjfwTw9fR12XFZ1R3tYSai32rQdYb9ydZD7ciVqc9cD6nl4a9BIDj7jvD_901D3g/pub?gid=1878903189&single=true&output=csv';

export const DEFAULT_KERJASAMA_SHEET_LABEL = 'Sheet BPK';

export const DEFAULT_KERJASAMA_HERO_IMAGE =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png';

export const DEFAULT_KERJASAMA_EYEBROW =
  'Kemitraan & Optimalisasi Aset · PTN BLU';

export const DEFAULT_KERJASAMA_TITLE = 'Kerjasama & Sewa Aset';

export const DEFAULT_KERJASAMA_SUBTITLE =
  'Daftar kemitraan strategis, sewa lahan dan bangunan, serta kerja sama operasional dan manajemen di lingkungan Pusat Pengembangan Bisnis (P2B) UIN Salatiga.';

export const DEFAULT_KERJASAMA_CORNER_LABEL = 'Daftar Mitra';
export const DEFAULT_KERJASAMA_CORNER_ACTION = 'Lihat Tabel Kerjasama';

export const DEFAULT_KERJASAMA_SECTION_HEADING =
  'Daftar Kerjasama & Pemanfaatan Aset';
export const DEFAULT_KERJASAMA_SECTION_SUBTITLE =
  'Data tersinkronisasi dari Google Sheets (Publish to Web · CSV). Anda dapat menyaring jenis kerja sama, mencari nama mitra, mengurutkan tanggal maupun nama penyewa, serta membuka berkas perjanjian.';

export function isSafeHttpUrl(raw?: string | null): boolean {
  const trimmed = (raw || '').trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  januari: 0,
  january: 0,
  feb: 1,
  februari: 1,
  february: 1,
  mar: 2,
  maret: 2,
  march: 2,
  apr: 3,
  april: 3,
  mei: 4,
  may: 4,
  jun: 5,
  juni: 5,
  june: 5,
  jul: 6,
  juli: 6,
  july: 6,
  agu: 7,
  agst: 7,
  agt: 7,
  agustus: 7,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  des: 11,
  desember: 11,
  dec: 11,
  december: 11,
};

/**
 * Parses mixed Indonesian & English sheet dates such as:
 * "31 Jan 2024", "3 Februari 2025", "Jan 2026", "3 Maret", "2024-01-31", "31/01/2024".
 */
export function parseKerjasamaDateTimestamp(rawDate?: string | null): number | null {
  const raw = (rawDate || '').trim();
  if (!raw) return null;

  // ISO YYYY-MM-DD
  const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(raw);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return Date.UTC(year, month, day);
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmySlashMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/.exec(raw);
  if (dmySlashMatch) {
    const day = Number(dmySlashMatch[1]);
    const month = Number(dmySlashMatch[2]) - 1;
    let year = Number(dmySlashMatch[3]);
    if (year < 100) year += 2000;
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return Date.UTC(year, month, day);
    }
  }

  const tokens = raw
    .replace(/,/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // DD Month YYYY (e.g. "31 Jan 2024", "3 Februari 2025")
  if (tokens.length >= 3) {
    const day = Number(tokens[0]);
    const monthIdx = MONTH_MAP[tokens[1].toLowerCase()];
    const year = Number(tokens[2]);
    if (
      Number.isFinite(day) &&
      day >= 1 &&
      day <= 31 &&
      monthIdx !== undefined &&
      Number.isFinite(year) &&
      year >= 1900
    ) {
      return Date.UTC(year, monthIdx, day);
    }
  }

  // Month YYYY or DD Month
  if (tokens.length === 2) {
    const firstNum = Number(tokens[0]);
    const secondNum = Number(tokens[1]);
    const firstMonth = MONTH_MAP[tokens[0].toLowerCase()];
    const secondMonth = MONTH_MAP[tokens[1].toLowerCase()];

    // "Jan 2026"
    if (firstMonth !== undefined && Number.isFinite(secondNum) && secondNum >= 1900) {
      return Date.UTC(secondNum, firstMonth, 1);
    }

    // "3 Maret" (missing year -> assume 2025/current baseline for relative ordering)
    if (Number.isFinite(firstNum) && firstNum >= 1 && firstNum <= 31 && secondMonth !== undefined) {
      return Date.UTC(new Date().getUTCFullYear(), secondMonth, firstNum);
    }
  }

  // Fallback native Date.parse
  const fallback = Date.parse(raw);
  return Number.isNaN(fallback) ? null : fallback;
}

export type KerjasamaSortField = 'original' | 'nama' | 'jenis' | 'mulai' | 'selesai';
export type KerjasamaSortDirection = 'asc' | 'desc';

export function sortKerjasamaItems(
  items: KerjasamaItem[],
  sortBy: KerjasamaSortField,
  direction: KerjasamaSortDirection
): KerjasamaItem[] {
  if (sortBy === 'original') {
    return direction === 'asc' ? [...items] : [...items].reverse();
  }

  const factor = direction === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    if (sortBy === 'nama') {
      const cmp = a.namaPenyewa.localeCompare(b.namaPenyewa, 'id', { sensitivity: 'base' });
      return cmp !== 0 ? cmp * factor : a.rowIndex - b.rowIndex;
    }

    if (sortBy === 'jenis') {
      const cmpJenis = (a.jenis || '—').localeCompare(b.jenis || '—', 'id', {
        sensitivity: 'base',
      });
      if (cmpJenis !== 0) return cmpJenis * factor;
      return a.namaPenyewa.localeCompare(b.namaPenyewa, 'id', { sensitivity: 'base' });
    }

    const rawA = sortBy === 'mulai' ? a.tanggalMulai : a.tanggalSelesai;
    const rawB = sortBy === 'mulai' ? b.tanggalMulai : b.tanggalSelesai;
    const tsA = parseKerjasamaDateTimestamp(rawA);
    const tsB = parseKerjasamaDateTimestamp(rawB);

    if (tsA === null && tsB === null) {
      return (rawA || '').localeCompare(rawB || '', 'id') * factor;
    }
    if (tsA === null) return 1;
    if (tsB === null) return -1;
    if (tsA !== tsB) return (tsA - tsB) * factor;

    return a.namaPenyewa.localeCompare(b.namaPenyewa, 'id', { sensitivity: 'base' });
  });
}
