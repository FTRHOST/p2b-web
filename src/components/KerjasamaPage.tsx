import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import {
  DEFAULT_KERJASAMA_CORNER_ACTION,
  DEFAULT_KERJASAMA_CORNER_LABEL,
  DEFAULT_KERJASAMA_EYEBROW,
  DEFAULT_KERJASAMA_HERO_IMAGE,
  DEFAULT_KERJASAMA_SECTION_HEADING,
  DEFAULT_KERJASAMA_SECTION_SUBTITLE,
  DEFAULT_KERJASAMA_SHEET_LABEL,
  DEFAULT_KERJASAMA_SUBTITLE,
  DEFAULT_KERJASAMA_TITLE,
  KerjasamaSortDirection,
  KerjasamaSortField,
  isSafeHttpUrl,
  sortKerjasamaItems,
} from '../data/kerjasamaDefaults';
import { KerjasamaDataset, SiteSettings } from '../types/cms';

interface KerjasamaPageProps {
  settings?: SiteSettings;
  onNavigateSection: (
    target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b'
  ) => void;
}

export function KerjasamaPage({
  settings,
  onNavigateSection,
}: KerjasamaPageProps) {
  const [dataset, setDataset] = useState<KerjasamaDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJenis, setSelectedJenis] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<KerjasamaSortField>('original');
  const [sortDir, setSortDir] = useState<KerjasamaSortDirection>('asc');

  const eyebrow =
    settings?.page_kerjasama_eyebrow?.trim() || DEFAULT_KERJASAMA_EYEBROW;
  const heroTitle =
    settings?.page_kerjasama_title?.trim() || DEFAULT_KERJASAMA_TITLE;
  const heroSubtitle =
    settings?.page_kerjasama_subtitle?.trim() || DEFAULT_KERJASAMA_SUBTITLE;
  const heroImage =
    settings?.page_kerjasama_image?.trim() || DEFAULT_KERJASAMA_HERO_IMAGE;
  const cornerLabel =
    settings?.page_kerjasama_corner_label?.trim() ||
    DEFAULT_KERJASAMA_CORNER_LABEL;
  const cornerAction =
    settings?.page_kerjasama_corner_action?.trim() ||
    DEFAULT_KERJASAMA_CORNER_ACTION;
  const sectionHeading =
    settings?.kerjasama_section_heading?.trim() ||
    DEFAULT_KERJASAMA_SECTION_HEADING;
  const sectionSubtitle =
    settings?.kerjasama_section_subtitle?.trim() ||
    DEFAULT_KERJASAMA_SECTION_SUBTITLE;
  const configuredSheetLabel =
    settings?.kerjasama_sheet_label?.trim() || DEFAULT_KERJASAMA_SHEET_LABEL;
  const configuredCsvUrl = settings?.kerjasama_csv_url?.trim() || '';

  const loadKerjasamaData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg('');

    try {
      const res = await fetch('/api/public/kerjasama', { cache: 'no-store' });
      const data = (await res.json().catch(() => ({}))) as Partial<KerjasamaDataset>;
      if (!res.ok || !data.ok) {
        setErrorMsg(
          data.message ||
            'Gagal memuat data kerjasama dari Google Sheets. Silakan coba muat ulang.'
        );
        return;
      }

      setDataset({
        ok: true,
        title: data.title || 'Daftar Kerjasama',
        sheetLabel: data.sheetLabel || DEFAULT_KERJASAMA_SHEET_LABEL,
        csvUrl: data.csvUrl || '',
        fetchedAt: data.fetchedAt || new Date().toISOString(),
        items: Array.isArray(data.items) ? data.items : [],
      });
    } catch {
      setErrorMsg(
        'Tidak dapat terhubung ke server untuk membaca data kerjasama.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadKerjasamaData(false);
  }, [loadKerjasamaData, configuredCsvUrl, configuredSheetLabel]);

  const allItems = useMemo(() => dataset?.items ?? [], [dataset]);

  const jenisOptions = useMemo(() => {
    const unique = Array.from(
      new Set(allItems.map((item) => item.jenis.trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'id'));
    return ['Semua', ...unique];
  }, [allItems]);

  useEffect(() => {
    if (selectedJenis !== 'Semua' && !jenisOptions.includes(selectedJenis)) {
      setSelectedJenis('Semua');
    }
  }, [jenisOptions, selectedJenis]);

  const displayedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = allItems.filter((item) => {
      if (selectedJenis !== 'Semua' && item.jenis.trim() !== selectedJenis) {
        return false;
      }
      if (!q) return true;
      return (
        item.namaPenyewa.toLowerCase().includes(q) ||
        item.perihal.toLowerCase().includes(q) ||
        item.jenis.toLowerCase().includes(q) ||
        item.tanggalMulai.toLowerCase().includes(q) ||
        item.tanggalSelesai.toLowerCase().includes(q)
      );
    });
    return sortKerjasamaItems(filtered, sortBy, sortDir);
  }, [allItems, searchQuery, selectedJenis, sortBy, sortDir]);

  const handleSelectSortField = (field: KerjasamaSortField) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(field);
    setSortDir('asc');
  };

  const renderSortIcon = (field: KerjasamaSortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-55 shrink-0" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#C9A45A] shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#C9A45A] shrink-0" />
    );
  };

  const isDateSort = sortBy === 'mulai' || sortBy === 'selesai';
  const sortDirectionLabel = isDateSort
    ? sortDir === 'asc'
      ? 'Terlama → Terbaru'
      : 'Terbaru → Terlama'
    : sortBy === 'original'
      ? sortDir === 'asc'
        ? 'Urutan Sheet'
        : 'Urutan Terbalik'
      : sortDir === 'asc'
        ? 'A → Z'
        : 'Z → A';

  const formattedSyncTime = useMemo(() => {
    if (!dataset?.fetchedAt) return '';
    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dataset.fetchedAt));
    } catch {
      return '';
    }
  }, [dataset?.fetchedAt]);

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow={eyebrow}
        title={heroTitle}
        subtitle={heroSubtitle}
        imageSrc={heroImage}
        imageAlt={heroTitle}
        cornerLabel={cornerLabel}
        cornerActionLabel={cornerAction}
        cornerHref="#daftar-kerjasama"
        onCornerClick={() => {
          document
            .getElementById('daftar-kerjasama')
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main
        id="daftar-kerjasama"
        className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1"
      >
        <div className="w-full max-w-[1536px] flex flex-col gap-6 md:gap-8">
          {/* Section Header */}
          <div className="px-2 md:px-4 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
                <span>{configuredSheetLabel}</span>
                {dataset?.title && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{dataset.title}</span>
                  </>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal text-[#164234] tracking-tight leading-[1.1]">
                {sectionHeading}
              </h2>
              <p className="text-sm sm:text-base text-[#3E544B] leading-relaxed max-w-3xl mt-1">
                {sectionSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="text-xs text-[#3E544B] tabular-nums">
                <span className="font-medium text-[#164234]">
                  {displayedItems.length}
                </span>{' '}
                dari {allItems.length} data
                {formattedSyncTime && ` · Diperbarui ${formattedSyncTime}`}
              </div>

              <button
                type="button"
                disabled={refreshing || loading}
                onClick={() => void loadKerjasamaData(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                />
                <span>{refreshing ? 'Menyinkronkan...' : 'Muat Ulang'}</span>
              </button>
            </div>
          </div>

          {/* Filter, Search & Sorting Bar */}
          <div className="rounded-[1.5rem] md:rounded-[2rem] bg-[#FAF8F3] border border-[#C9A45A]/30 p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 w-full lg:max-w-md">
                <Icon
                  icon="mdi:magnify"
                  className="w-4 h-4 text-[#8F6D26] shrink-0"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama penyewa, perihal, atau jenis..."
                  aria-label="Cari data kerjasama"
                  className="w-full bg-transparent text-sm text-[#164234] placeholder:text-[#3E544B]/60 focus:outline-none"
                />
              </div>

              {/* Sort Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#3E544B] mr-1">Urutkan:</span>
                {(
                  [
                    { id: 'original', label: 'Default' },
                    { id: 'nama', label: 'Nama Penyewa' },
                    { id: 'jenis', label: 'Jenis' },
                    { id: 'mulai', label: 'Tanggal Mulai' },
                    { id: 'selesai', label: 'Tanggal Selesai' },
                  ] as const
                ).map((option) => {
                  const active = sortBy === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectSortField(option.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#164234] text-[#F6F3EC]'
                          : 'bg-white hover:bg-[#F6F3EC] text-[#164234] border border-[#C9A45A]/30'
                      }`}
                    >
                      <span>{option.label}</span>
                      {active &&
                        (sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#F4D993]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#F4D993]" />
                        ))}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  title="Balikkan arah pengurutan"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F3EC] hover:bg-[#EAE3D2] text-[#8F6D26] border border-[#C9A45A]/35 text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{sortDirectionLabel}</span>
                </button>
              </div>
            </div>

            {/* Jenis Filter Buttons */}
            {jenisOptions.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#C9A45A]/20">
                <span className="text-xs text-[#3E544B] mr-1">
                  Filter Jenis:
                </span>
                {jenisOptions.map((jenis) => {
                  const active = selectedJenis === jenis;
                  const count =
                    jenis === 'Semua'
                      ? allItems.length
                      : allItems.filter((item) => item.jenis.trim() === jenis)
                          .length;
                  return (
                    <button
                      key={jenis}
                      type="button"
                      onClick={() => setSelectedJenis(jenis)}
                      className={`px-3.5 py-1.5 rounded-full text-xs tabular-nums transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#164234] text-[#F6F3EC]'
                          : 'bg-white hover:bg-[#F6F3EC] text-[#3E544B] border border-[#C9A45A]/30'
                      }`}
                    >
                      {jenis} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Loading / Error / Data States */}
          {loading ? (
            <div className="rounded-[1.5rem] md:rounded-[2rem] bg-[#FAF8F3] border border-[#C9A45A]/30 p-12 text-center text-sm text-[#3E544B]">
              Memuat data kerjasama dari Google Sheets...
            </div>
          ) : errorMsg ? (
            <div className="rounded-[1.5rem] md:rounded-[2rem] bg-[#FAF8F3] border border-[#9b2c2c]/30 p-8 sm:p-10 flex flex-col items-center text-center gap-3">
              <p className="text-sm text-[#9b2c2c] max-w-xl">{errorMsg}</p>
              <button
                type="button"
                onClick={() => void loadKerjasamaData(true)}
                className="px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Coba Muat Ulang
              </button>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="rounded-[1.5rem] md:rounded-[2rem] bg-[#FAF8F3] border border-[#C9A45A]/30 p-10 text-center flex flex-col items-center gap-3">
              <p className="text-sm text-[#3E544B]">
                Tidak ada data kerjasama yang sesuai dengan pencarian atau
                filter jenis saat ini.
              </p>
              {(searchQuery || selectedJenis !== 'Semua') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedJenis('Semua');
                  }}
                  className="px-4 py-2 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs transition-colors cursor-pointer"
                >
                  Tampilkan Semua Data
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop & Tablet Table View */}
              <div className="hidden md:block rounded-[1.5rem] md:rounded-[2rem] bg-[#FAF8F3] border border-[#C9A45A]/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#164234] text-[#FAF8F3] text-xs uppercase tracking-wider">
                        <th
                          rowSpan={2}
                          className="py-3.5 px-4 font-normal border-b border-r border-[#C9A45A]/25 w-14 text-center"
                        >
                          No
                        </th>
                        <th
                          rowSpan={2}
                          className="py-3.5 px-4 font-normal border-b border-r border-[#C9A45A]/25 min-w-[200px]"
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectSortField('nama')}
                            className="inline-flex items-center gap-1.5 text-left uppercase tracking-wider font-normal text-[#FAF8F3] hover:text-[#F4D993] transition-colors cursor-pointer bg-transparent border-0 p-0"
                          >
                            <span>Nama Penyewa</span>
                            {renderSortIcon('nama')}
                          </button>
                        </th>
                        <th
                          colSpan={2}
                          className="py-2.5 px-4 font-normal border-b border-r border-[#C9A45A]/25 text-center"
                        >
                          Masa Sewa / Kerjasama
                        </th>
                        <th
                          rowSpan={2}
                          className="py-3.5 px-4 font-normal border-b border-r border-[#C9A45A]/25 min-w-[260px]"
                        >
                          Perihal
                        </th>
                        <th
                          rowSpan={2}
                          className="py-3.5 px-4 font-normal border-b border-r border-[#C9A45A]/25 w-36"
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectSortField('jenis')}
                            className="inline-flex items-center gap-1.5 text-left uppercase tracking-wider font-normal text-[#FAF8F3] hover:text-[#F4D993] transition-colors cursor-pointer bg-transparent border-0 p-0"
                          >
                            <span>Jenis</span>
                            {renderSortIcon('jenis')}
                          </button>
                        </th>
                        <th
                          rowSpan={2}
                          className="py-3.5 px-4 font-normal border-b border-[#C9A45A]/25 w-28 text-center"
                        >
                          Berkas
                        </th>
                      </tr>
                      <tr className="bg-[#0F3126] text-[#F4D993] text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-4 font-normal border-b border-r border-[#C9A45A]/25 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSelectSortField('mulai')}
                            className="inline-flex items-center gap-1.5 uppercase tracking-wider font-normal text-[#F4D993] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
                          >
                            <span>Mulai</span>
                            {renderSortIcon('mulai')}
                          </button>
                        </th>
                        <th className="py-2.5 px-4 font-normal border-b border-r border-[#C9A45A]/25 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSelectSortField('selesai')}
                            className="inline-flex items-center gap-1.5 uppercase tracking-wider font-normal text-[#F4D993] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
                          >
                            <span>Selesai</span>
                            {renderSortIcon('selesai')}
                          </button>
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#C9A45A]/20 text-sm text-[#164234]">
                      {displayedItems.map((item, idx) => {
                        const hasFile = isSafeHttpUrl(item.berkasUrl);
                        return (
                          <tr
                            key={`${item.rowIndex}-${item.namaPenyewa}-${idx}`}
                            className="bg-white/65 hover:bg-white transition-colors"
                          >
                            <td className="py-4 px-4 text-center text-xs tabular-nums text-[#3E544B] border-r border-[#C9A45A]/15 align-top">
                              {idx + 1}
                            </td>
                            <td className="py-4 px-4 font-medium text-[#164234] border-r border-[#C9A45A]/15 align-top">
                              {item.namaPenyewa || '—'}
                            </td>
                            <td className="py-4 px-4 text-xs sm:text-sm tabular-nums text-[#3E544B] whitespace-nowrap border-r border-[#C9A45A]/15 align-top">
                              {item.tanggalMulai || '—'}
                            </td>
                            <td className="py-4 px-4 text-xs sm:text-sm tabular-nums text-[#3E544B] whitespace-nowrap border-r border-[#C9A45A]/15 align-top">
                              {item.tanggalSelesai || '—'}
                            </td>
                            <td className="py-4 px-4 text-sm text-[#3E544B] leading-relaxed border-r border-[#C9A45A]/15 align-top">
                              {item.perihal || '—'}
                            </td>
                            <td className="py-4 px-4 text-xs font-medium uppercase tracking-wider text-[#8F6D26] border-r border-[#C9A45A]/15 align-top whitespace-nowrap">
                              {item.jenis || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-center align-top">
                              {hasFile ? (
                                <a
                                  href={item.berkasUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`Buka berkas kerjasama ${item.namaPenyewa}`}
                                  aria-label={`Buka berkas kerjasama ${item.namaPenyewa}`}
                                  className="inline-flex items-center justify-center gap-1.5 w-10 h-10 rounded-xl bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F4D993] border border-[#C9A45A]/45 transition-colors group"
                                >
                                  <FileText className="w-4 h-4 shrink-0" />
                                </a>
                              ) : (
                                <span
                                  className="text-xs text-[#3E544B]/45"
                                  aria-label="Berkas tidak tersedia"
                                >
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card Stack View */}
              <div className="md:hidden flex flex-col gap-3.5">
                {displayedItems.map((item, idx) => {
                  const hasFile = isSafeHttpUrl(item.berkasUrl);
                  return (
                    <article
                      key={`mob-${item.rowIndex}-${item.namaPenyewa}-${idx}`}
                      className="rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#8F6D26] tabular-nums">
                            <span>#{idx + 1}</span>
                            {item.jenis && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{item.jenis}</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-base font-medium text-[#164234] leading-snug">
                            {item.namaPenyewa || '—'}
                          </h3>
                        </div>

                        {hasFile && (
                          <a
                            href={item.berkasUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Buka berkas kerjasama ${item.namaPenyewa}`}
                            title={`Buka berkas kerjasama ${item.namaPenyewa}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#164234] text-[#F4D993] text-xs shrink-0"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Berkas</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#3E544B] leading-relaxed">
                        {item.perihal || '—'}
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#C9A45A]/20 text-xs tabular-nums">
                        <div>
                          <span className="block text-[11px] text-[#8F6D26]">
                            Mulai
                          </span>
                          <span className="text-[#164234]">
                            {item.tanggalMulai || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[11px] text-[#8F6D26]">
                            Selesai
                          </span>
                          <span className="text-[#164234]">
                            {item.tanggalSelesai || '—'}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer settings={settings} onNavigate={onNavigateSection} />
    </div>
  );
}
