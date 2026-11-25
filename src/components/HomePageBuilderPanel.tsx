import { useState } from 'react';
import { Icon } from '@iconify/react';
import {
  ArrowDown,
  ArrowUp,
  BookmarkPlus,
  Copy,
  Eye,
  EyeOff,
  Layers,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BUILDER_PAGES,
  BuilderPageSlug,
  GovernanceValueEntry,
  HOME_BLOCK_CATALOG,
  HomeBlockItem,
  HomeBlockPresetItem,
  HomeBlockType,
  HomeFeatureCardEntry,
  HomeFocusCardConfig,
  HomeStatEntry,
  MisiItemEntry,
  UnitDivisionEntry,
  getCatalogEntry,
} from '../data/homeBuilderDefaults';
import { CmsMediaItem, CmsUploadedMedia } from '../types/cms';

interface HomePageBuilderPanelProps {
  activePageSlug: BuilderPageSlug;
  setActivePageSlug: (slug: BuilderPageSlug) => void;
  blocks: HomeBlockItem[];
  setBlocks: React.Dispatch<React.SetStateAction<HomeBlockItem[]>>;
  presets: HomeBlockPresetItem[];
  setPresets: React.Dispatch<React.SetStateAction<HomeBlockPresetItem[]>>;
  selectedBlockId: number | null;
  setSelectedBlockId: React.Dispatch<React.SetStateAction<number | null>>;
  labelDraft: string;
  setLabelDraft: React.Dispatch<React.SetStateAction<string>>;
  configDraft: Record<string, unknown>;
  setConfigDraft: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  visibleDraft: boolean;
  setVisibleDraft: React.Dispatch<React.SetStateAction<boolean>>;
  dirty: boolean;
  setDirty: React.Dispatch<React.SetStateAction<boolean>>;
  mediaItems: CmsMediaItem[];
  token: string;
  uploadSingleMedia: (file: File) => Promise<CmsUploadedMedia>;
  reloadCmsData: (options?: { preserveDirtyEdits?: boolean }) => Promise<void>;
  onCommitted: (msg: string) => void;
  onViewPage: (path: string) => void;
  onSwitchTab: (tab: 'logos' | 'news' | 'magang') => void;
}

function cloneConfig<T>(val: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(val);
  }
  return JSON.parse(JSON.stringify(val)) as T;
}

function ImageFieldControl({
  label,
  value,
  placeholder,
  mediaImages,
  uploading,
  onChange,
  onUploadFile,
}: {
  label: string;
  value: string;
  placeholder?: string;
  mediaImages: CmsMediaItem[];
  uploading: boolean;
  onChange: (nextUrl: string) => void;
  onUploadFile: (file: File) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs text-[#3E544B]">{label}</label>
        <div className="flex flex-wrap items-center gap-2">
          {mediaImages.length > 0 && (
            <button
              type="button"
              onClick={() => setPickerOpen((prev) => !prev)}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#F6F3EC] border border-[#C9A45A]/35 text-[11px] text-[#164234] transition-colors cursor-pointer"
            >
              {pickerOpen ? 'Tutup Pustaka' : 'Pilih dari Media'}
            </button>
          )}
          <label className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-[11px] transition-colors cursor-pointer">
            <Icon icon="mdi:upload-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
            <span>{uploading ? 'Mengunggah...' : 'Unggah'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) onUploadFile(file);
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'https://... atau /uploads/...'}
        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
      />

      {value.trim() && (
        <div className="h-28 rounded-xl overflow-hidden border border-[#C9A45A]/25 bg-[#EAE5D7]">
          <img
            src={value}
            alt="Pratinjau gambar blok"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {pickerOpen && mediaImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-white border border-[#C9A45A]/30 max-h-48 overflow-y-auto">
          {mediaImages.slice(0, 16).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChange(m.url);
                setPickerOpen(false);
              }}
              title={m.originalName}
              className="group relative aspect-video rounded-lg overflow-hidden border border-[#C9A45A]/25 hover:border-[#164234] cursor-pointer"
            >
              <img
                src={m.url}
                alt={m.altText || m.originalName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function HomePageBuilderPanel({
  activePageSlug,
  setActivePageSlug,
  blocks,
  setBlocks,
  presets,
  setPresets,
  selectedBlockId,
  setSelectedBlockId,
  labelDraft,
  setLabelDraft,
  configDraft,
  setConfigDraft,
  visibleDraft,
  setVisibleDraft,
  dirty,
  setDirty,
  mediaItems,
  token,
  uploadSingleMedia,
  reloadCmsData,
  onCommitted,
  onViewPage,
  onSwitchTab,
}: HomePageBuilderPanelProps) {
  const [savingBlock, setSavingBlock] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-registration preset states
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');
  const [savingPreset, setSavingPreset] = useState(false);
  const [deletingPresetId, setDeletingPresetId] = useState<number | null>(null);

  // Create custom element inline + auto-register preset inside modal
  const [customBaseType, setCustomBaseType] = useState<HomeBlockType>('editorial_split');
  const [customElemName, setCustomElemName] = useState('');
  const [customElemDesc, setCustomElemDesc] = useState('');
  const [creatingCustomElem, setCreatingCustomElem] = useState(false);

  // Copy block to another page
  const [copyTargetSlug, setCopyTargetSlug] = useState<BuilderPageSlug>('about');

  const mediaImages = mediaItems.filter((m) => m.mimeType !== 'application/pdf');
  const pdfMedia = mediaItems.filter((m) => m.mimeType === 'application/pdf');

  const activePageInfo =
    BUILDER_PAGES.find((p) => p.slug === activePageSlug) || BUILDER_PAGES[0];

  const pageBlocks = blocks
    .filter((b) => (b.pageSlug || 'home') === activePageSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const selectedBlock =
    pageBlocks.find((b) => b.id === selectedBlockId) || pageBlocks[0] || null;

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const hydrateDraftFromBlock = (block: HomeBlockItem) => {
    setSelectedBlockId(block.id);
    setLabelDraft(block.label);
    setConfigDraft(cloneConfig(block.config || {}));
    setVisibleDraft(block.isVisible);
    setDirty(false);
    setErrorMsg('');
  };

  const handleSelectPageSlug = (nextSlug: BuilderPageSlug) => {
    setActivePageSlug(nextSlug);
    setConfirmDeleteId(null);
    setConfirmReset(false);
    setErrorMsg('');
    const nextList = blocks
      .filter((b) => (b.pageSlug || 'home') === nextSlug)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    if (nextList.length > 0) {
      hydrateDraftFromBlock(nextList[0]);
    } else {
      setSelectedBlockId(null);
      setLabelDraft('');
      setConfigDraft({});
      setVisibleDraft(true);
      setDirty(false);
    }
    const otherPage = BUILDER_PAGES.find((p) => p.slug !== nextSlug)?.slug || 'home';
    setCopyTargetSlug(otherPage);
  };

  const setConfigField = (key: string, value: unknown) => {
    setConfigDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setErrorMsg('');
  };

  const handleUploadFieldFile = async (
    keyId: string,
    file: File,
    applyUrl: (url: string) => void
  ) => {
    setUploadingKey(keyId);
    setErrorMsg('');
    try {
      const uploaded = await uploadSingleMedia(file);
      applyUrl(uploaded.url);
      await reloadCmsData({ preserveDirtyEdits: true });
      onCommitted('Berkas berhasil diunggah dan dipasang ke elemen.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal mengunggah berkas elemen.'
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const handleAddBlock = async (
    blockType: HomeBlockType,
    overrideLabel?: string,
    overrideConfig?: Record<string, unknown>,
    keyTag?: string
  ) => {
    const entry = getCatalogEntry(blockType);
    setAddingKey(keyTag || blockType);
    setErrorMsg('');
    try {
      const res = await fetch('/api/cms/home-blocks', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          pageSlug: activePageSlug,
          blockType,
          label: (overrideLabel || entry.defaultLabel).trim(),
          config: cloneConfig(overrideConfig || entry.defaultConfig),
          isVisible: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        item?: HomeBlockItem;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.item) {
        setErrorMsg(data.message || 'Gagal menambah elemen baru.');
        return;
      }
      const created = data.item;
      setBlocks((prev) =>
        [...prev, created].sort(
          (a, b) =>
            a.pageSlug.localeCompare(b.pageSlug) ||
            a.sortOrder - b.sortOrder ||
            a.id - b.id
        )
      );
      hydrateDraftFromBlock(created);
      setAddModalOpen(false);
      await reloadCmsData({ preserveDirtyEdits: true });
      onCommitted(
        `Elemen "${created.label}" ditambahkan ke ${activePageInfo.shortLabel}.`
      );
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server untuk menambah elemen.');
    } finally {
      setAddingKey(null);
    }
  };

  const handleCreateCustomAndAutoRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = customElemName.trim();
    if (!cleanName) {
      setErrorMsg('Nama elemen kustom wajib diisi.');
      return;
    }
    const baseEntry = getCatalogEntry(customBaseType);
    const cleanConfig = cloneConfig(baseEntry.defaultConfig);
    setCreatingCustomElem(true);
    setErrorMsg('');
    try {
      // 1. Auto-register preset to project catalog
      const presetRes = await fetch('/api/cms/builder-presets', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          name: cleanName,
          description:
            customElemDesc.trim() ||
            `Elemen kustom berbasis ${baseEntry.name} · siap digunakan di semua halaman.`,
          blockType: customBaseType,
          config: cleanConfig,
        }),
      });
      const presetData = (await presetRes.json().catch(() => ({}))) as {
        ok?: boolean;
        item?: HomeBlockPresetItem;
        message?: string;
      };
      if (!presetRes.ok || !presetData.ok || !presetData.item) {
        setErrorMsg(presetData.message || 'Gagal mendaftarkan elemen ke katalog.');
        return;
      }
      setPresets((prev) => [presetData.item!, ...prev]);

      // 2. Also insert directly onto active page
      const addRes = await fetch('/api/cms/home-blocks', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          pageSlug: activePageSlug,
          blockType: customBaseType,
          label: cleanName,
          config: cleanConfig,
          isVisible: true,
        }),
      });
      const addData = (await addRes.json().catch(() => ({}))) as {
        ok?: boolean;
        item?: HomeBlockItem;
        message?: string;
      };
      if (addRes.ok && addData.ok && addData.item) {
        setBlocks((prev) =>
          [...prev, addData.item!].sort(
            (a, b) =>
              a.pageSlug.localeCompare(b.pageSlug) ||
              a.sortOrder - b.sortOrder ||
              a.id - b.id
          )
        );
        hydrateDraftFromBlock(addData.item);
      }

      setCustomElemName('');
      setCustomElemDesc('');
      setAddModalOpen(false);
      await reloadCmsData({ preserveDirtyEdits: true });
      onCommitted(
        `Elemen "${cleanName}" otomatis terdaftar di Katalog Proyek dan ditambahkan ke ${activePageInfo.shortLabel}.`
      );
    } catch {
      setErrorMsg('Gagal mendaftarkan elemen baru ke server.');
    } finally {
      setCreatingCustomElem(false);
    }
  };

  const handleSaveSelectedAsPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlock) return;
    const cleanName = (presetName || labelDraft || selectedBlock.label).trim();
    if (!cleanName) return;
    setSavingPreset(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/cms/builder-presets', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          name: cleanName,
          description:
            presetDesc.trim() ||
            `Tersimpan dari ${activePageInfo.shortLabel} (${getCatalogEntry(selectedBlock.blockType).name}).`,
          blockType: selectedBlock.blockType,
          config: cloneConfig(configDraft),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        item?: HomeBlockPresetItem;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.item) {
        setErrorMsg(data.message || 'Gagal mendaftarkan elemen ke katalog proyek.');
        return;
      }
      setPresets((prev) => [data.item!, ...prev]);
      setSavePresetOpen(false);
      setPresetName('');
      setPresetDesc('');
      onCommitted(`Elemen "${cleanName}" resmi terdaftar otomatis di Katalog Proyek.`);
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server.');
    } finally {
      setSavingPreset(false);
    }
  };

  const handleDeletePreset = async (presetId: number) => {
    setDeletingPresetId(presetId);
    try {
      const res = await fetch(`/api/cms/builder-presets/${presetId}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        items?: HomeBlockPresetItem[];
      };
      if (res.ok && data.ok && Array.isArray(data.items)) {
        setPresets(data.items);
        onCommitted('Elemen kustom dihapus dari Katalog Proyek.');
      }
    } finally {
      setDeletingPresetId(null);
    }
  };

  const handleSaveSelected = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlock) return;
    setSavingBlock(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/cms/home-blocks/${selectedBlock.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          label: labelDraft.trim() || selectedBlock.label,
          config: configDraft,
          isVisible: visibleDraft,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        item?: HomeBlockItem;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.item) {
        setErrorMsg(data.message || 'Gagal menyimpan perubahan elemen.');
        return;
      }
      const saved = data.item;
      setBlocks((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
      hydrateDraftFromBlock(saved);
      await reloadCmsData();
      onCommitted(
        `Elemen "${saved.label}" disimpan dan langsung tayang di ${activePageInfo.shortLabel}.`
      );
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server CMS.');
    } finally {
      setSavingBlock(false);
    }
  };

  const handleDuplicate = async (
    blockId: number,
    targetPageSlug?: BuilderPageSlug
  ) => {
    setDuplicatingId(blockId);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/cms/home-blocks/${blockId}/duplicate`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(targetPageSlug ? { targetPageSlug } : {}),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        newId?: number;
        targetPageSlug?: BuilderPageSlug;
        items?: HomeBlockItem[];
        message?: string;
      };
      if (!res.ok || !data.ok || !Array.isArray(data.items)) {
        setErrorMsg(data.message || 'Gagal menduplikasi elemen.');
        return;
      }
      setBlocks(data.items);
      if (targetPageSlug && targetPageSlug !== activePageSlug) {
        const destInfo =
          BUILDER_PAGES.find((p) => p.slug === targetPageSlug) || activePageInfo;
        onCommitted(`Elemen berhasil disalin ke halaman ${destInfo.shortLabel}.`);
      } else {
        const clone = data.items.find((item) => item.id === data.newId);
        if (clone) hydrateDraftFromBlock(clone);
        onCommitted('Elemen berhasil diduplikasi tepat di bawah aslinya.');
      }
      await reloadCmsData({ preserveDirtyEdits: true });
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server saat menduplikasi.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= pageBlocks.length) return;
    const nextPageList = [...pageBlocks];
    const [moved] = nextPageList.splice(index, 1);
    nextPageList.splice(targetIdx, 0, moved);
    const optimisticIds = nextPageList.map((b) => b.id);

    setBlocks((prev) =>
      prev.map((b) => {
        const newIdx = optimisticIds.indexOf(b.id);
        return newIdx >= 0 ? { ...b, sortOrder: newIdx + 1 } : b;
      })
    );
    setReordering(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/cms/home-blocks/reorder', {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          orderedIds: optimisticIds,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        items?: HomeBlockItem[];
        message?: string;
      };
      if (!res.ok || !data.ok || !Array.isArray(data.items)) {
        setErrorMsg(data.message || 'Gagal memperbarui urutan elemen.');
        await reloadCmsData({ preserveDirtyEdits: true });
        return;
      }
      setBlocks(data.items);
      await reloadCmsData({ preserveDirtyEdits: true });
      onCommitted(`Urutan elemen ${activePageInfo.shortLabel} diperbarui.`);
    } catch {
      setErrorMsg('Gagal menyimpan urutan elemen ke server.');
    } finally {
      setReordering(false);
    }
  };

  const handleToggleVisible = async (block: HomeBlockItem) => {
    const nextVisible = !block.isVisible;
    setTogglingId(block.id);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/cms/home-blocks/${block.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ isVisible: nextVisible }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        item?: HomeBlockItem;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.item) {
        setErrorMsg(data.message || 'Gagal mengubah visibilitas elemen.');
        return;
      }
      const updated = data.item;
      setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      if (selectedBlock?.id === updated.id) {
        setVisibleDraft(updated.isVisible);
      }
      await reloadCmsData({ preserveDirtyEdits: true });
      onCommitted(
        updated.isVisible
          ? `Elemen "${updated.label}" sekarang tampil di ${activePageInfo.shortLabel}.`
          : `Elemen "${updated.label}" disembunyikan sementara.`
      );
    } catch {
      setErrorMsg('Tidak dapat memperbarui visibilitas elemen.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (blockId: number) => {
    setDeletingId(blockId);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/cms/home-blocks/${blockId}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        items?: HomeBlockItem[];
        message?: string;
      };
      if (!res.ok || !data.ok || !Array.isArray(data.items)) {
        setErrorMsg(data.message || 'Gagal menghapus elemen.');
        return;
      }
      setBlocks(data.items);
      setConfirmDeleteId(null);
      if (selectedBlock?.id === blockId) {
        const remainingForPage = data.items
          .filter((b) => (b.pageSlug || 'home') === activePageSlug)
          .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
        if (remainingForPage.length > 0) {
          hydrateDraftFromBlock(remainingForPage[0]);
        } else {
          setSelectedBlockId(null);
          setLabelDraft('');
          setConfigDraft({});
          setDirty(false);
        }
      }
      await reloadCmsData({ preserveDirtyEdits: true });
      onCommitted(`Elemen dihapus dari ${activePageInfo.shortLabel}.`);
    } catch {
      setErrorMsg('Gagal menghapus elemen.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetDefaults = async () => {
    setResetting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/cms/home-blocks/reset', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ pageSlug: activePageSlug }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        items?: HomeBlockItem[];
        message?: string;
      };
      if (!res.ok || !data.ok || !Array.isArray(data.items)) {
        setErrorMsg(data.message || 'Gagal mereset susunan elemen.');
        return;
      }
      setBlocks(data.items);
      const nextForPage = data.items.filter(
        (b) => (b.pageSlug || 'home') === activePageSlug
      );
      if (nextForPage.length > 0) {
        hydrateDraftFromBlock(nextForPage[0]);
      }
      setConfirmReset(false);
      await reloadCmsData();
      onCommitted(
        `Susunan ${activePageInfo.shortLabel} dikembalikan ke tata letak standar P2B.`
      );
    } catch {
      setErrorMsg('Tidak dapat mereset susunan halaman.');
    } finally {
      setResetting(false);
    }
  };

  const getStr = (key: string, fallback = '') =>
    typeof configDraft[key] === 'string'
      ? (configDraft[key] as string)
      : fallback;

  const focusCards = Array.isArray(configDraft.cards)
    ? (configDraft.cards as HomeFocusCardConfig[])
    : [];

  const featureCards = Array.isArray(configDraft.cards)
    ? (configDraft.cards as HomeFeatureCardEntry[])
    : [];

  const statsEntries = Array.isArray(configDraft.stats)
    ? (configDraft.stats as HomeStatEntry[])
    : [];

  const governanceItems = Array.isArray(configDraft.items)
    ? (configDraft.items as GovernanceValueEntry[])
    : [];

  const misiItems = Array.isArray(configDraft.items)
    ? (configDraft.items as MisiItemEntry[])
    : [];

  const unitDivisions = Array.isArray(configDraft.items)
    ? (configDraft.items as UnitDivisionEntry[])
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar + Page Switcher */}
      <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
              Multi-Page Builder · Beranda &amp; Profil Terintegrasi MariaDB
            </span>
            <h2 className="text-2xl font-normal text-[#164234]">
              {activePageInfo.label}
            </h2>
            <p className="text-xs sm:text-sm text-[#3E544B] max-w-2xl">
              {activePageInfo.description} Semua elemen proyek masuk ke katalog builder dan setiap elemen baru yang dibuat otomatis terdaftar di Katalog Proyek.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F4D993]" />
              <span>Tambah / Buat Elemen</span>
            </button>

            <button
              type="button"
              onClick={() => onViewPage(activePageInfo.path)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF8F3] text-[#164234] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <span>Lihat {activePageInfo.shortLabel}</span>
              <Icon icon="mdi:open-in-new" className="w-3.5 h-3.5 text-[#8F6D26]" />
            </button>

            <button
              type="button"
              onClick={() => void reloadCmsData()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF8F3] text-[#3E544B] border border-[#C9A45A]/30 text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang</span>
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2.5 rounded-full bg-white hover:bg-[#9b2c2c]/10 text-[#9b2c2c] border border-[#9b2c2c]/25 text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Reset Halaman Ini
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#FAF8F3] border border-[#9b2c2c]/30 rounded-full px-3 py-1.5">
                <span className="text-xs text-[#9b2c2c]">Reset {activePageInfo.shortLabel}?</span>
                <button
                  type="button"
                  disabled={resetting}
                  onClick={() => void handleResetDefaults()}
                  className="px-3 py-1 rounded-full bg-[#9b2c2c] text-white text-xs cursor-pointer"
                >
                  {resetting ? 'Mereset...' : 'Ya, Reset'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 rounded-full bg-white text-[#164234] text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Selector Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-[#C9A45A]/20">
          {BUILDER_PAGES.map((pg) => {
            const isActive = pg.slug === activePageSlug;
            const count = blocks.filter((b) => (b.pageSlug || 'home') === pg.slug).length;
            return (
              <button
                key={pg.slug}
                type="button"
                onClick={() => handleSelectPageSlug(pg.slug)}
                className={`text-left rounded-2xl border px-4 py-3 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-[#164234] border-[#164234] text-[#F6F3EC]'
                    : 'bg-[#FAF8F3] border-[#C9A45A]/30 hover:border-[#164234] text-[#164234]'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-[11px] uppercase tracking-wider ${
                      isActive ? 'text-[#F4D993]' : 'text-[#8F6D26]'
                    }`}
                  >
                    {pg.path}
                  </span>
                  <span className="text-sm font-medium truncate">{pg.shortLabel}</span>
                </div>
                <span
                  className={`text-xs tabular-nums shrink-0 ${
                    isActive ? 'text-[#FAF8F3]/85' : 'text-[#3E544B]'
                  }`}
                >
                  {count} elemen
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="px-5 py-3 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs sm:text-sm text-[#9b2c2c]"
        >
          {errorMsg}
        </div>
      )}

      {/* Main Split Builder Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Section Stack / Layer Tree */}
        <div className="lg:col-span-5 rounded-[1.5rem] md:rounded-[2.25rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 border-b border-[#C9A45A]/20 pb-3.5">
            <div className="flex items-center gap-2 text-[#164234]">
              <Layers className="w-4 h-4 text-[#8F6D26]" />
              <span className="text-sm font-medium">
                Elemen {activePageInfo.shortLabel} (<span className="tabular-nums">{pageBlocks.length}</span>)
              </span>
            </div>
            {reordering && (
              <span className="text-xs text-[#8F6D26]">Menyimpan urutan...</span>
            )}
          </div>

          {pageBlocks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#C9A45A]/45 bg-[#FAF8F3] p-6 text-center flex flex-col items-center gap-3">
              <p className="text-sm text-[#3E544B]">
                Belum ada elemen aktif di halaman {activePageInfo.shortLabel}.
              </p>
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#F4D993]" />
                <span>Tambah Elemen Pertama</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {pageBlocks.map((block, index) => {
                const isSelected = selectedBlock?.id === block.id;
                const catalog = getCatalogEntry(block.blockType);
                const isConfirmingDel = confirmDeleteId === block.id;
                return (
                  <div
                    key={block.id}
                    className={`rounded-2xl border p-3.5 transition-colors flex flex-col gap-3 ${
                      isSelected
                        ? 'bg-[#FAF8F3] border-[#164234] shadow-sm'
                        : 'bg-white/85 border-[#C9A45A]/25 hover:border-[#C9A45A]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => hydrateDraftFromBlock(block)}
                      className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`mt-0.5 text-xs font-medium tabular-nums shrink-0 ${
                            isSelected ? 'text-[#164234]' : 'text-[#8F6D26]'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-medium text-[#164234] truncate">
                            {block.label}
                          </span>
                          <span className="text-xs text-[#3E544B] truncate">
                            {catalog.name}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] shrink-0 ${
                          block.isVisible ? 'text-[#164234]' : 'text-[#9b2c2c]'
                        }`}
                      >
                        {block.isVisible ? 'Tampil' : 'Disembunyikan'}
                      </span>
                    </button>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#C9A45A]/15">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0 || reordering}
                          onClick={() => void handleMove(index, -1)}
                          title="Geser ke atas"
                          className="p-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#EAE5D7] disabled:opacity-40 text-[#164234] transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === pageBlocks.length - 1 || reordering}
                          onClick={() => void handleMove(index, 1)}
                          title="Geser ke bawah"
                          className="p-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#EAE5D7] disabled:opacity-40 text-[#164234] transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={togglingId === block.id}
                          onClick={() => void handleToggleVisible(block)}
                          title={
                            block.isVisible
                              ? 'Sembunyikan sementara'
                              : 'Tampilkan di halaman'
                          }
                          className="p-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#EAE5D7] text-[#164234] transition-colors cursor-pointer"
                        >
                          {block.isVisible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-[#9b2c2c]" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={duplicatingId === block.id}
                          onClick={() => void handleDuplicate(block.id)}
                          title="Duplikasi elemen ini"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F6F3EC] hover:bg-[#EAE5D7] text-[#164234] text-xs transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{duplicatingId === block.id ? '...' : 'Duplikat'}</span>
                        </button>

                        {!isConfirmingDel ? (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(block.id)}
                            title="Hapus elemen"
                            className="p-1.5 rounded-lg bg-[#9b2c2c]/10 hover:bg-[#9b2c2c]/20 text-[#9b2c2c] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={deletingId === block.id}
                              onClick={() => void handleDelete(block.id)}
                              className="px-2 py-1 rounded-lg bg-[#9b2c2c] text-white text-[11px] cursor-pointer"
                            >
                              Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg bg-[#F6F3EC] text-[#164234] text-[11px] cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Element Inspector */}
        <div className="lg:col-span-7 rounded-[1.5rem] md:rounded-[2.25rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-7">
          {!selectedBlock ? (
            <div className="py-16 text-center text-sm text-[#3E544B]">
              Pilih salah satu elemen di sebelah kiri untuk mengedit konten dan pengaturannya.
            </div>
          ) : (
            <form onSubmit={handleSaveSelected} className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C9A45A]/20 pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    {getCatalogEntry(selectedBlock.blockType).category} ·{' '}
                    {getCatalogEntry(selectedBlock.blockType).name}
                  </span>
                  <h3 className="text-xl font-normal text-[#164234]">
                    {labelDraft || selectedBlock.label}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPresetName(labelDraft || selectedBlock.label);
                      setPresetDesc('');
                      setSavePresetOpen((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#FAF8F3] border border-[#C9A45A]/35 text-[#164234] text-xs cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-[#8F6D26]" />
                    <span>Daftarkan ke Katalog</span>
                  </button>

                  <button
                    type="button"
                    disabled={duplicatingId === selectedBlock.id}
                    onClick={() => void handleDuplicate(selectedBlock.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#FAF8F3] border border-[#C9A45A]/35 text-[#164234] text-xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplikat</span>
                  </button>

                  {dirty && (
                    <button
                      type="button"
                      onClick={() => hydrateDraftFromBlock(selectedBlock)}
                      className="px-3.5 py-2 rounded-full bg-white hover:bg-[#F6F3EC] border border-[#C9A45A]/35 text-[#3E544B] text-xs cursor-pointer"
                    >
                      Urungkan
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={savingBlock || uploadingKey !== null}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] disabled:opacity-60 text-[#F6F3EC] text-xs sm:text-sm cursor-pointer"
                  >
                    <Icon icon="mdi:check" className="w-4 h-4 text-[#F4D993]" />
                    <span>{savingBlock ? 'Menyimpan...' : 'Simpan Elemen'}</span>
                  </button>
                </div>
              </div>

              {savePresetOpen && (
                <div className="rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/40 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Simpan &amp; Daftarkan Otomatis ke Katalog Proyek
                    </span>
                    <button
                      type="button"
                      onClick={() => setSavePresetOpen(false)}
                      className="text-xs text-[#3E544B] cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Nama template elemen di katalog..."
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={presetDesc}
                      onChange={(e) => setPresetDesc(e.target.value)}
                      placeholder="Catatan singkat kegunaan (opsional)"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={savingPreset || !presetName.trim()}
                      onClick={(e) => void handleSaveSelectedAsPreset(e)}
                      className="px-4 py-2 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer disabled:opacity-50"
                    >
                      {savingPreset ? 'Mendaftarkan...' : 'Simpan ke Katalog Proyek'}
                    </button>
                  </div>
                </div>
              )}

              {/* Copy block across pages */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FAF8F3]/80 border border-[#C9A45A]/20 px-4 py-2.5 text-xs">
                <span className="text-[#3E544B]">
                  Salin elemen ini ke halaman lain:
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={copyTargetSlug}
                    onChange={(e) => setCopyTargetSlug(e.target.value as BuilderPageSlug)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#C9A45A]/30 text-xs text-[#164234]"
                  >
                    {BUILDER_PAGES.filter((p) => p.slug !== activePageSlug).map((pg) => (
                      <option key={pg.slug} value={pg.slug}>
                        {pg.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={duplicatingId === selectedBlock.id}
                    onClick={() => void handleDuplicate(selectedBlock.id, copyTargetSlug)}
                    className="px-3 py-1.5 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer"
                  >
                    Salin ke Halaman
                  </button>
                </div>
              </div>

              {/* Meta Row: Admin Label & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-8 flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">
                    Nama Elemen di CMS (Label Internal)
                  </label>
                  <input
                    type="text"
                    value={labelDraft}
                    onChange={(e) => {
                      setLabelDraft(e.target.value);
                      setDirty(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleDraft}
                      onChange={(e) => {
                        setVisibleDraft(e.target.checked);
                        setDirty(true);
                      }}
                      className="w-4 h-4 accent-[#164234]"
                    />
                    <span>Tampilkan di Halaman</span>
                  </label>
                </div>
              </div>

              {/* 1. HERO (Beranda) */}
              {selectedBlock.blockType === 'hero' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">Judul Utama Hero</label>
                    <input
                      type="text"
                      value={getStr('title')}
                      onChange={(e) => setConfigField('title', e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">Subjudul / Deskripsi Hero</label>
                    <textarea
                      rows={3}
                      value={getStr('subtitle')}
                      onChange={(e) => setConfigField('subtitle', e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <ImageFieldControl
                    label="Gambar Latar Hero"
                    value={getStr('imageUrl')}
                    mediaImages={mediaImages}
                    uploading={uploadingKey === 'hero-img'}
                    onChange={(url) => setConfigField('imageUrl', url)}
                    onUploadFile={(file) =>
                      void handleUploadFieldFile('hero-img', file, (url) =>
                        setConfigField('imageUrl', url)
                      )
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={getStr('cornerLabel', 'Profil P2B')}
                      onChange={(e) => setConfigField('cornerLabel', e.target.value)}
                      placeholder="Label Pojok"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('cornerActionLabel', 'Tentang Kami')}
                      onChange={(e) =>
                        setConfigField('cornerActionLabel', e.target.value)
                      }
                      placeholder="Teks Tombol Pojok"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('cornerHref', '/tentang-kami')}
                      onChange={(e) => setConfigField('cornerHref', e.target.value)}
                      placeholder="/tentang-kami"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                    />
                  </div>
                </div>
              )}

              {/* 2. PAGE HERO (Profil & Subhalaman) */}
              {selectedBlock.blockType === 'page_hero' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Eyebrow</label>
                      <input
                        type="text"
                        value={getStr('eyebrow')}
                        onChange={(e) => setConfigField('eyebrow', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Judul Halaman</label>
                      <input
                        type="text"
                        value={getStr('title')}
                        onChange={(e) => setConfigField('title', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Subjudul</label>
                    <textarea
                      rows={3}
                      value={getStr('subtitle')}
                      onChange={(e) => setConfigField('subtitle', e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <ImageFieldControl
                    label="Gambar Banner Hero"
                    value={getStr('imageUrl')}
                    mediaImages={mediaImages}
                    uploading={uploadingKey === 'page-hero-img'}
                    onChange={(url) => setConfigField('imageUrl', url)}
                    onUploadFile={(file) =>
                      void handleUploadFieldFile('page-hero-img', file, (url) =>
                        setConfigField('imageUrl', url)
                      )
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={getStr('cornerLabel')}
                      onChange={(e) => setConfigField('cornerLabel', e.target.value)}
                      placeholder="Label Pojok"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('cornerActionLabel')}
                      onChange={(e) =>
                        setConfigField('cornerActionLabel', e.target.value)
                      }
                      placeholder="Teks Tombol Pojok"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('cornerHref')}
                      onChange={(e) => setConfigField('cornerHref', e.target.value)}
                      placeholder="/visi-misi"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                    />
                  </div>
                </div>
              )}

              {/* 3. LOGO MARQUEE */}
              {selectedBlock.blockType === 'logo_marquee' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">
                      Label Aksesibilitas Seksi Logo
                    </label>
                    <input
                      type="text"
                      value={getStr('ariaLabel', 'Logo Mitra & Unit P2B UIN Salatiga')}
                      onChange={(e) => setConfigField('ariaLabel', e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#C9A45A]/20">
                    <p className="text-xs text-[#3E544B]">
                      Daftar logo yang ditampilkan pada marquee diambil otomatis dari menu Logo Mitra.
                    </p>
                    <button
                      type="button"
                      onClick={() => onSwitchTab('logos')}
                      className="px-4 py-2 rounded-full bg-white hover:bg-[#F6F3EC] border border-[#C9A45A]/35 text-xs text-[#164234] cursor-pointer"
                    >
                      Buka Kelola Logo Mitra
                    </button>
                  </div>
                </div>
              )}

              {/* 4. WHO WE ARE */}
              {selectedBlock.blockType === 'who_we_are' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Eyebrow</label>
                      <input
                        type="text"
                        value={getStr('eyebrow')}
                        onChange={(e) => setConfigField('eyebrow', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Judul Utama</label>
                      <input
                        type="text"
                        value={getStr('heading')}
                        onChange={(e) => setConfigField('heading', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={getStr('paragraph1')}
                    onChange={(e) => setConfigField('paragraph1', e.target.value)}
                    placeholder="Paragraf 1"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <textarea
                    rows={3}
                    value={getStr('paragraph2')}
                    onChange={(e) => setConfigField('paragraph2', e.target.value)}
                    placeholder="Paragraf 2"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-[#C9A45A]/20">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Kartu Fokus ({focusCards.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextCards: HomeFocusCardConfig[] = [
                          ...focusCards,
                          {
                            id: `fokus-${Date.now()}`,
                            title: 'Kartu Fokus Baru',
                            subtitle: 'Ringkasan singkat layanan atau unit P2B',
                            linkLabel: 'Pelajari Lebih Lanjut',
                            href: '/tentang-kami',
                            image: '',
                            description: 'Deskripsi lengkap fokus layanan.',
                            highlights: ['Poin keunggulan utama'],
                          },
                        ];
                        setConfigField('cards', nextCards);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>Tambah Kartu Fokus</span>
                    </button>
                  </div>

                  {focusCards.map((card, cIdx) => {
                    const updateCard = (patch: Partial<HomeFocusCardConfig>) => {
                      setConfigField(
                        'cards',
                        focusCards.map((c, idx) => (idx === cIdx ? { ...c, ...patch } : c))
                      );
                    };
                    return (
                      <div
                        key={card.id || `focus-${cIdx}`}
                        className="rounded-xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-[#164234] tabular-nums">
                            Kartu #{cIdx + 1}: {card.title || 'Tanpa Judul'}
                          </span>
                          {focusCards.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfigField(
                                  'cards',
                                  focusCards.filter((_, idx) => idx !== cIdx)
                                )
                              }
                              className="text-xs text-[#9b2c2c] hover:underline cursor-pointer"
                            >
                              Hapus Kartu
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateCard({ title: e.target.value })}
                            placeholder="Judul kartu"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                          <input
                            type="text"
                            value={card.subtitle}
                            onChange={(e) => updateCard({ subtitle: e.target.value })}
                            placeholder="Subjudul kartu"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                          <input
                            type="text"
                            value={card.linkLabel}
                            onChange={(e) => updateCard({ linkLabel: e.target.value })}
                            placeholder="Teks tombol pojok"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                          <input
                            type="text"
                            value={card.href}
                            onChange={(e) => updateCard({ href: e.target.value })}
                            placeholder="Tujuan tautan"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                        </div>
                        <ImageFieldControl
                          label={`Gambar Kartu #${cIdx + 1}`}
                          value={card.image || ''}
                          mediaImages={mediaImages}
                          uploading={uploadingKey === `focus-card-${cIdx}`}
                          onChange={(url) => updateCard({ image: url })}
                          onUploadFile={(file) =>
                            void handleUploadFieldFile(
                              `focus-card-${cIdx}`,
                              file,
                              (url) => updateCard({ image: url })
                            )
                          }
                        />
                        <textarea
                          rows={2}
                          value={card.description || ''}
                          onChange={(e) => updateCard({ description: e.target.value })}
                          placeholder="Deskripsi modal..."
                          className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                        />
                        <textarea
                          rows={2}
                          value={(card.highlights || []).join('\n')}
                          onChange={(e) =>
                            updateCard({
                              highlights: e.target.value
                                .split('\n')
                                .map((line) => line.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Poin sorotan (1 baris = 1 poin)"
                          className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234]"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 5. ABOUT INTRO */}
              {selectedBlock.blockType === 'about_intro' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Eyebrow</label>
                      <input
                        type="text"
                        value={getStr('eyebrow')}
                        onChange={(e) => setConfigField('eyebrow', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Judul Seksi</label>
                      <input
                        type="text"
                        value={getStr('heading')}
                        onChange={(e) => setConfigField('heading', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                  </div>
                  {(['p1', 'p2', 'p3', 'p4'] as const).map((pKey, idx) => (
                    <div key={pKey} className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B] tabular-nums">
                        Paragraf {idx + 1}
                      </label>
                      <textarea
                        rows={3}
                        value={getStr(pKey)}
                        onChange={(e) => setConfigField(pKey, e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 6. DUAL BANNERS */}
              {selectedBlock.blockType === 'dual_banners' && (
                <div className="flex flex-col gap-5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="flex flex-col gap-2">
                    <ImageFieldControl
                      label="Gambar Banner 1 (Kiri)"
                      value={getStr('image1Url')}
                      mediaImages={mediaImages}
                      uploading={uploadingKey === 'dual-img-1'}
                      onChange={(url) => setConfigField('image1Url', url)}
                      onUploadFile={(file) =>
                        void handleUploadFieldFile('dual-img-1', file, (url) =>
                          setConfigField('image1Url', url)
                        )
                      }
                    />
                    <input
                      type="text"
                      value={getStr('image1Alt')}
                      onChange={(e) => setConfigField('image1Alt', e.target.value)}
                      placeholder="Teks alternatif gambar 1"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                    />
                  </div>
                  <div className="flex flex-col gap-2 pt-3 border-t border-[#C9A45A]/20">
                    <ImageFieldControl
                      label="Gambar Banner 2 (Kanan)"
                      value={getStr('image2Url')}
                      mediaImages={mediaImages}
                      uploading={uploadingKey === 'dual-img-2'}
                      onChange={(url) => setConfigField('image2Url', url)}
                      onUploadFile={(file) =>
                        void handleUploadFieldFile('dual-img-2', file, (url) =>
                          setConfigField('image2Url', url)
                        )
                      }
                    />
                    <input
                      type="text"
                      value={getStr('image2Alt')}
                      onChange={(e) => setConfigField('image2Alt', e.target.value)}
                      placeholder="Teks alternatif gambar 2"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                    />
                  </div>
                </div>
              )}

              {/* 7. GOVERNANCE VALUES */}
              {selectedBlock.blockType === 'governance_values' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('eyebrow')}
                      onChange={(e) => setConfigField('eyebrow', e.target.value)}
                      placeholder="Eyebrow"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('heading')}
                      onChange={(e) => setConfigField('heading', e.target.value)}
                      placeholder="Judul Seksi"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#C9A45A]/20">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Kartu Pilar Tata Kelola ({governanceItems.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next: GovernanceValueEntry[] = [
                          ...governanceItems,
                          {
                            id: `gov-${Date.now()}`,
                            number: String(governanceItems.length + 1).padStart(2, '0'),
                            emblem: 'ledger',
                            title: 'Pilar Baru',
                            description: 'Deskripsi singkat prinsip tata kelola.',
                            linkLabel: 'Pelajari Lebih Lanjut',
                            linkHref: '/visi-misi',
                          },
                        ];
                        setConfigField('items', next);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>Tambah Pilar</span>
                    </button>
                  </div>

                  {governanceItems.map((item, idx) => {
                    const updateItem = (patch: Partial<GovernanceValueEntry>) => {
                      setConfigField(
                        'items',
                        governanceItems.map((entry, i) =>
                          i === idx ? { ...entry, ...patch } : entry
                        )
                      );
                    };
                    return (
                      <div
                        key={item.id || `gov-${idx}`}
                        className="rounded-xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#164234] tabular-nums">
                            Pilar {item.number || String(idx + 1).padStart(2, '0')}
                          </span>
                          {governanceItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfigField(
                                  'items',
                                  governanceItems.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-xs text-[#9b2c2c] hover:underline cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <input
                            type="text"
                            value={item.number}
                            onChange={(e) => updateItem({ number: e.target.value })}
                            placeholder="Nomor (01)"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234] tabular-nums"
                          />
                          <select
                            value={item.emblem}
                            onChange={(e) =>
                              updateItem({
                                emblem: e.target.value as GovernanceValueEntry['emblem'],
                              })
                            }
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234]"
                          >
                            <option value="ledger">Emblem Transparan</option>
                            <option value="prism">Emblem Profesional</option>
                            <option value="pillar">Emblem Inovatif</option>
                            <option value="bridge">Emblem Berkelanjutan</option>
                          </select>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItem({ title: e.target.value })}
                            placeholder="Judul Pilar"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => updateItem({ description: e.target.value })}
                          placeholder="Deskripsi pilar"
                          className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            value={item.linkLabel}
                            onChange={(e) => updateItem({ linkLabel: e.target.value })}
                            placeholder="Teks tombol pojok"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234]"
                          />
                          <input
                            type="text"
                            value={item.linkHref}
                            onChange={(e) => updateItem({ linkHref: e.target.value })}
                            placeholder="Tujuan tautan (/visi-misi dll.)"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 8. VISI CARD */}
              {selectedBlock.blockType === 'visi_card' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Label Kartu</label>
                      <input
                        type="text"
                        value={getStr('label', 'Visi P2B')}
                        onChange={(e) => setConfigField('label', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Ikon Kartu</label>
                      <select
                        value={getStr('icon', 'compass')}
                        onChange={(e) => setConfigField('icon', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      >
                        <option value="compass">Kompas (Visi)</option>
                        <option value="target">Target / Sasaran</option>
                        <option value="shield">Perisai Tata Kelola</option>
                        <option value="layers">Lapisan Strategis</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Pernyataan Utama</label>
                    <textarea
                      rows={3}
                      value={getStr('text')}
                      onChange={(e) => setConfigField('text', e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Keterangan Tambahan</label>
                    <textarea
                      rows={2}
                      value={getStr('subtext')}
                      onChange={(e) => setConfigField('subtext', e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                </div>
              )}

              {/* 9. MISI GRID */}
              {selectedBlock.blockType === 'misi_grid' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('eyebrow')}
                      onChange={(e) => setConfigField('eyebrow', e.target.value)}
                      placeholder="Eyebrow"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('heading')}
                      onChange={(e) => setConfigField('heading', e.target.value)}
                      placeholder="Judul Seksi"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={getStr('description')}
                    onChange={(e) => setConfigField('description', e.target.value)}
                    placeholder="Deskripsi pengantar grid misi"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-[#C9A45A]/20">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Daftar Kartu Misi ({misiItems.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next: MisiItemEntry[] = [
                          ...misiItems,
                          {
                            id: `misi-${Date.now()}`,
                            number: String(misiItems.length + 1).padStart(2, '0'),
                            title: 'Fokus Misi Baru',
                            description: 'Deskripsi sasaran strategis.',
                          },
                        ];
                        setConfigField('items', next);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>Tambah Misi</span>
                    </button>
                  </div>

                  {misiItems.map((item, idx) => {
                    const updateItem = (patch: Partial<MisiItemEntry>) => {
                      setConfigField(
                        'items',
                        misiItems.map((m, i) => (i === idx ? { ...m, ...patch } : m))
                      );
                    };
                    return (
                      <div
                        key={item.id || `misi-${idx}`}
                        className="rounded-xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#164234] tabular-nums">
                            Misi #{idx + 1}
                          </span>
                          {misiItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfigField(
                                  'items',
                                  misiItems.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-xs text-[#9b2c2c] hover:underline cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <input
                            type="text"
                            value={item.number}
                            onChange={(e) => updateItem({ number: e.target.value })}
                            placeholder="01"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234] tabular-nums"
                          />
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItem({ title: e.target.value })}
                            placeholder="Judul Misi"
                            className="sm:col-span-3 px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => updateItem({ description: e.target.value })}
                          placeholder="Deskripsi misi"
                          className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 10. ORG CHART */}
              {selectedBlock.blockType === 'org_chart' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Eyebrow Bagan</label>
                      <input
                        type="text"
                        value={getStr('eyebrow')}
                        onChange={(e) => setConfigField('eyebrow', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Judul Bagan</label>
                      <input
                        type="text"
                        value={getStr('heading')}
                        onChange={(e) => setConfigField('heading', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Label Dasar Hukum</label>
                      <input
                        type="text"
                        value={getStr('legalEyebrow')}
                        onChange={(e) => setConfigField('legalEyebrow', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Teks Tombol SK PDF</label>
                      <input
                        type="text"
                        value={getStr('decreeLabel')}
                        onChange={(e) => setConfigField('decreeLabel', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Judul Keputusan SK</label>
                    <input
                      type="text"
                      value={getStr('legalTitle')}
                      onChange={(e) => setConfigField('legalTitle', e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs text-[#3E544B]">
                        Tautan File PDF SK Struktur Organisasi
                      </label>
                      <label className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#164234] text-[#F6F3EC] text-[11px] cursor-pointer">
                        <Icon icon="mdi:upload-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                        <span>
                          {uploadingKey === 'org-pdf' ? 'Mengunggah...' : 'Unggah PDF SK'}
                        </span>
                        <input
                          type="file"
                          accept="application/pdf"
                          disabled={uploadingKey === 'org-pdf'}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (file) {
                              void handleUploadFieldFile('org-pdf', file, (url) =>
                                setConfigField('pdfUrl', url)
                              );
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={getStr('pdfUrl')}
                      onChange={(e) => setConfigField('pdfUrl', e.target.value)}
                      placeholder="/assets/aistudio/56-_SK_Struktur_Organisasi_P2b-BLU-UIN_9b2304d4.PDF"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                    />
                    {pdfMedia.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {pdfMedia.slice(0, 6).map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setConfigField('pdfUrl', m.url)}
                            className="px-2.5 py-1 rounded-full bg-white border border-[#C9A45A]/30 text-[11px] text-[#164234] cursor-pointer"
                          >
                            {m.originalName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 11. UNIT DIVISIONS */}
              {selectedBlock.blockType === 'unit_divisions' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('eyebrow')}
                      onChange={(e) => setConfigField('eyebrow', e.target.value)}
                      placeholder="Eyebrow"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('heading')}
                      onChange={(e) => setConfigField('heading', e.target.value)}
                      placeholder="Judul Seksi"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#C9A45A]/20">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Daftar Unit Operasional ({unitDivisions.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next: UnitDivisionEntry[] = [
                          ...unitDivisions,
                          {
                            id: `unit-${Date.now()}`,
                            icon: 'mdi:briefcase-outline',
                            code: `UNIT ${String(unitDivisions.length + 1).padStart(2, '0')}`,
                            title: 'Unit Layanan Baru',
                            responsibilities: ['Tanggung jawab utama unit'],
                          },
                        ];
                        setConfigField('items', next);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>Tambah Unit</span>
                    </button>
                  </div>

                  {unitDivisions.map((unit, idx) => {
                    const updateUnit = (patch: Partial<UnitDivisionEntry>) => {
                      setConfigField(
                        'items',
                        unitDivisions.map((u, i) => (i === idx ? { ...u, ...patch } : u))
                      );
                    };
                    return (
                      <div
                        key={unit.id || `unit-${idx}`}
                        className="rounded-xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#164234] tabular-nums">
                            {unit.code || `UNIT ${idx + 1}`}: {unit.title}
                          </span>
                          {unitDivisions.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfigField(
                                  'items',
                                  unitDivisions.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-xs text-[#9b2c2c] hover:underline cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <input
                            type="text"
                            value={unit.code}
                            onChange={(e) => updateUnit({ code: e.target.value })}
                            placeholder="UNIT 01"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234] tabular-nums"
                          />
                          <select
                            value={unit.icon}
                            onChange={(e) => updateUnit({ icon: e.target.value })}
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234]"
                          >
                            <option value="mdi:office-building-outline">Gedung / Aset</option>
                            <option value="mdi:handshake-outline">Kemitraan</option>
                            <option value="mdi:school-outline">Akademik &amp; Layanan</option>
                            <option value="mdi:briefcase-outline">Usaha &amp; Bisnis</option>
                          </select>
                          <input
                            type="text"
                            value={unit.title}
                            onChange={(e) => updateUnit({ title: e.target.value })}
                            placeholder="Nama Unit"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={(unit.responsibilities || []).join('\n')}
                          onChange={(e) =>
                            updateUnit({
                              responsibilities: e.target.value
                                .split('\n')
                                .map((l) => l.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Daftar tugas unit (1 baris = 1 poin)"
                          className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234]"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 12. NEWS UPDATES */}
              {selectedBlock.blockType === 'news_updates' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Eyebrow</label>
                      <input
                        type="text"
                        value={getStr('eyebrow', 'Berita & Informasi Terbaru')}
                        onChange={(e) => setConfigField('eyebrow', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Judul Seksi</label>
                      <input
                        type="text"
                        value={getStr('heading', 'News & Update')}
                        onChange={(e) => setConfigField('heading', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Teks Tombol Lihat Semua</label>
                      <input
                        type="text"
                        value={getStr('ctaLabel', 'Lihat Semua Berita')}
                        onChange={(e) => setConfigField('ctaLabel', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Jumlah Berita Ditampilkan</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={Number(configDraft.maxItems ?? 3)}
                        onChange={(e) =>
                          setConfigField(
                            'maxItems',
                            Math.max(1, Math.min(12, Number(e.target.value) || 3))
                          )
                        }
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] tabular-nums"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#C9A45A]/20">
                    <p className="text-xs text-[#3E544B]">
                      Konten artikel dikelola melalui menu Kelola Berita.
                    </p>
                    <button
                      type="button"
                      onClick={() => onSwitchTab('news')}
                      className="px-4 py-2 rounded-full bg-white hover:bg-[#F6F3EC] border border-[#C9A45A]/35 text-xs text-[#164234] cursor-pointer"
                    >
                      Buka Kelola Berita
                    </button>
                  </div>
                </div>
              )}

              {/* 13. LOCATION MAP */}
              {selectedBlock.blockType === 'location_map' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Eyebrow</label>
                      <input
                        type="text"
                        value={getStr('eyebrow', 'Lokasi Resmi')}
                        onChange={(e) => setConfigField('eyebrow', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#3E544B]">Judul Seksi</label>
                      <input
                        type="text"
                        value={getStr('heading', 'Peta & Lokasi P2B')}
                        onChange={(e) => setConfigField('heading', e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={getStr('description')}
                    onChange={(e) => setConfigField('description', e.target.value)}
                    placeholder="Deskripsi singkat"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('cardLabel', 'Alamat Kantor P2B')}
                      onChange={(e) => setConfigField('cardLabel', e.target.value)}
                      placeholder="Label Kartu Alamat"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('cardTitle')}
                      onChange={(e) => setConfigField('cardTitle', e.target.value)}
                      placeholder="Nama Gedung / Lokasi"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={getStr('address')}
                    onChange={(e) => setConfigField('address', e.target.value)}
                    placeholder="Alamat Lengkap (kosongkan untuk default Pengaturan Situs)"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={getStr('lat')}
                      onChange={(e) => setConfigField('lat', e.target.value)}
                      placeholder="Latitude (-7.31376)"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] tabular-nums"
                    />
                    <input
                      type="text"
                      value={getStr('lng')}
                      onChange={(e) => setConfigField('lng', e.target.value)}
                      placeholder="Longitude (110.4876)"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] tabular-nums"
                    />
                    <input
                      type="text"
                      value={getStr('mapsUrl')}
                      onChange={(e) => setConfigField('mapsUrl', e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                </div>
              )}

              {/* 14. MAGANG GALLERY */}
              {selectedBlock.blockType === 'magang_gallery' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('eyebrow')}
                      onChange={(e) => setConfigField('eyebrow', e.target.value)}
                      placeholder="Eyebrow"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('heading')}
                      onChange={(e) => setConfigField('heading', e.target.value)}
                      placeholder="Judul Galeri"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={getStr('description')}
                    onChange={(e) => setConfigField('description', e.target.value)}
                    placeholder="Deskripsi galeri kegiatan"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[#3E544B]">Maksimal Foto:</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={Number(configDraft.maxItems ?? 6)}
                        onChange={(e) =>
                          setConfigField(
                            'maxItems',
                            Math.max(1, Math.min(12, Number(e.target.value) || 6))
                          )
                        }
                        className="w-20 px-3 py-1.5 rounded-lg bg-white border border-[#C9A45A]/30 text-sm text-[#164234] tabular-nums"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onSwitchTab('magang')}
                      className="px-4 py-2 rounded-full bg-white hover:bg-[#F6F3EC] border border-[#C9A45A]/35 text-xs text-[#164234] cursor-pointer"
                    >
                      Kelola Foto Galeri Magang
                    </button>
                  </div>
                </div>
              )}

              {/* 15. MAGANG POSITIONS */}
              {selectedBlock.blockType === 'magang_positions' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('eyebrow')}
                      onChange={(e) => setConfigField('eyebrow', e.target.value)}
                      placeholder="Eyebrow"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('heading')}
                      onChange={(e) => setConfigField('heading', e.target.value)}
                      placeholder="Judul Seksi Posisi"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={getStr('description')}
                    onChange={(e) => setConfigField('description', e.target.value)}
                    placeholder="Deskripsi seksi"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('ctaLabel')}
                      onChange={(e) => setConfigField('ctaLabel', e.target.value)}
                      placeholder="Teks Tombol Daftar"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('ctaHref')}
                      onChange={(e) => setConfigField('ctaHref', e.target.value)}
                      placeholder="/magang/daftar"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                </div>
              )}

              {/* 16. EDITORIAL SPLIT */}
              {selectedBlock.blockType === 'editorial_split' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('eyebrow')}
                      onChange={(e) => setConfigField('eyebrow', e.target.value)}
                      placeholder="Eyebrow"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <select
                      value={getStr('imagePosition', 'right')}
                      onChange={(e) =>
                        setConfigField('imagePosition', e.target.value)
                      }
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    >
                      <option value="right">Gambar di Kanan</option>
                      <option value="left">Gambar di Kiri</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={getStr('heading')}
                    onChange={(e) => setConfigField('heading', e.target.value)}
                    placeholder="Judul Blok"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <textarea
                    rows={4}
                    value={getStr('body')}
                    onChange={(e) => setConfigField('body', e.target.value)}
                    placeholder="Isi paragraf (pisahkan baris kosong untuk paragraf baru)"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <ImageFieldControl
                    label="Gambar Pendukung"
                    value={getStr('imageUrl')}
                    mediaImages={mediaImages}
                    uploading={uploadingKey === 'split-img'}
                    onChange={(url) => setConfigField('imageUrl', url)}
                    onUploadFile={(file) =>
                      void handleUploadFieldFile('split-img', file, (url) =>
                        setConfigField('imageUrl', url)
                      )
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('ctaLabel')}
                      onChange={(e) => setConfigField('ctaLabel', e.target.value)}
                      placeholder="Teks Tombol CTA"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('ctaHref')}
                      onChange={(e) => setConfigField('ctaHref', e.target.value)}
                      placeholder="/kerjasama atau https://..."
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                </div>
              )}

              {/* 17. FEATURE CARDS */}
              {selectedBlock.blockType === 'feature_cards' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={getStr('eyebrow')}
                      onChange={(e) => setConfigField('eyebrow', e.target.value)}
                      placeholder="Eyebrow"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('heading')}
                      onChange={(e) => setConfigField('heading', e.target.value)}
                      placeholder="Judul Seksi"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <select
                      value={Number(configDraft.columns ?? 3)}
                      onChange={(e) =>
                        setConfigField('columns', Number(e.target.value) === 2 ? 2 : 3)
                      }
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    >
                      <option value={3}>3 Kolom</option>
                      <option value={2}>2 Kolom</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    value={getStr('description')}
                    onChange={(e) => setConfigField('description', e.target.value)}
                    placeholder="Deskripsi Seksi"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-[#C9A45A]/20">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Daftar Kartu ({featureCards.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next: HomeFeatureCardEntry[] = [
                          ...featureCards,
                          {
                            id: `fc-${Date.now()}`,
                            kicker: 'Unit P2B',
                            title: 'Layanan Baru',
                            description: 'Deskripsi singkat unit atau informasi layanan.',
                            imageUrl: '',
                            linkLabel: 'Selengkapnya',
                            linkHref: '/tarif-layanan/penunjang-akademik',
                          },
                        ];
                        setConfigField('cards', next);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>Tambah Kartu</span>
                    </button>
                  </div>

                  {featureCards.map((card, cIdx) => {
                    const updateCard = (patch: Partial<HomeFeatureCardEntry>) => {
                      setConfigField(
                        'cards',
                        featureCards.map((c, idx) =>
                          idx === cIdx ? { ...c, ...patch } : c
                        )
                      );
                    };
                    return (
                      <div
                        key={card.id || `fc-item-${cIdx}`}
                        className="rounded-xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-[#164234] tabular-nums">
                            Kartu #{cIdx + 1}: {card.title || 'Tanpa Judul'}
                          </span>
                          {featureCards.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfigField(
                                  'cards',
                                  featureCards.filter((_, idx) => idx !== cIdx)
                                )
                              }
                              className="text-xs text-[#9b2c2c] hover:underline cursor-pointer"
                            >
                              Hapus Kartu
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={card.kicker}
                            onChange={(e) => updateCard({ kicker: e.target.value })}
                            placeholder="Label kategori"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateCard({ title: e.target.value })}
                            placeholder="Judul kartu"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                          <input
                            type="text"
                            value={card.linkLabel}
                            onChange={(e) => updateCard({ linkLabel: e.target.value })}
                            placeholder="Teks tautan"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                          <input
                            type="text"
                            value={card.linkHref}
                            onChange={(e) => updateCard({ linkHref: e.target.value })}
                            placeholder="Tujuan tautan"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={card.description}
                          onChange={(e) => updateCard({ description: e.target.value })}
                          placeholder="Deskripsi kartu..."
                          className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                        />
                        <ImageFieldControl
                          label={`Gambar Kartu #${cIdx + 1} (Opsional)`}
                          value={card.imageUrl || ''}
                          mediaImages={mediaImages}
                          uploading={uploadingKey === `fc-img-${cIdx}`}
                          onChange={(url) => updateCard({ imageUrl: url })}
                          onUploadFile={(file) =>
                            void handleUploadFieldFile(
                              `fc-img-${cIdx}`,
                              file,
                              (url) => updateCard({ imageUrl: url })
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 18. CTA BANNER */}
              {selectedBlock.blockType === 'cta_banner' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <input
                    type="text"
                    value={getStr('eyebrow')}
                    onChange={(e) => setConfigField('eyebrow', e.target.value)}
                    placeholder="Eyebrow"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <input
                    type="text"
                    value={getStr('heading')}
                    onChange={(e) => setConfigField('heading', e.target.value)}
                    placeholder="Judul Banner Ajakan"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <textarea
                    rows={3}
                    value={getStr('description')}
                    onChange={(e) => setConfigField('description', e.target.value)}
                    placeholder="Deskripsi"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('primaryLabel')}
                      onChange={(e) => setConfigField('primaryLabel', e.target.value)}
                      placeholder="Label Tombol Utama"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('primaryHref')}
                      onChange={(e) => setConfigField('primaryHref', e.target.value)}
                      placeholder="Tautan Tombol Utama"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('secondaryLabel')}
                      onChange={(e) =>
                        setConfigField('secondaryLabel', e.target.value)
                      }
                      placeholder="Label Tombol Sekunder (opsional)"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('secondaryHref')}
                      onChange={(e) =>
                        setConfigField('secondaryHref', e.target.value)
                      }
                      placeholder="Tautan Tombol Sekunder"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>
                </div>
              )}

              {/* 19. STATS ROW */}
              {selectedBlock.blockType === 'stats_row' && (
                <div className="flex flex-col gap-4 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={getStr('eyebrow')}
                      onChange={(e) => setConfigField('eyebrow', e.target.value)}
                      placeholder="Eyebrow"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                    <input
                      type="text"
                      value={getStr('heading')}
                      onChange={(e) => setConfigField('heading', e.target.value)}
                      placeholder="Judul Sorotan"
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#C9A45A]/20">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Daftar Angka Statistik ({statsEntries.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next: HomeStatEntry[] = [
                          ...statsEntries,
                          {
                            id: `stat-${Date.now()}`,
                            value: '10+',
                            label: 'Metrik Baru',
                            note: 'Penjelasan ringkas capaian.',
                          },
                        ];
                        setConfigField('stats', next);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>Tambah Statistik</span>
                    </button>
                  </div>

                  {statsEntries.map((stat, sIdx) => {
                    const updateStat = (patch: Partial<HomeStatEntry>) => {
                      setConfigField(
                        'stats',
                        statsEntries.map((s, idx) =>
                          idx === sIdx ? { ...s, ...patch } : s
                        )
                      );
                    };
                    return (
                      <div
                        key={stat.id || `stat-entry-${sIdx}`}
                        className="rounded-xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#164234] tabular-nums">
                            Statistik #{sIdx + 1}
                          </span>
                          {statsEntries.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfigField(
                                  'stats',
                                  statsEntries.filter((_, idx) => idx !== sIdx)
                                )
                              }
                              className="text-xs text-[#9b2c2c] hover:underline cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => updateStat({ value: e.target.value })}
                            placeholder="Angka (mis. 6+)"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] tabular-nums"
                          />
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => updateStat({ label: e.target.value })}
                            placeholder="Label metrik"
                            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] sm:col-span-2"
                          />
                        </div>
                        <input
                          type="text"
                          value={stat.note}
                          onChange={(e) => updateStat({ note: e.target.value })}
                          placeholder="Catatan singkat di bawah angka"
                          className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Add Element Catalog & Auto-Registration Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B261D]/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !addingKey && !creatingCustomElem && setAddModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-[1.5rem] md:rounded-[2rem] bg-[#F6F3EC] border border-[#C9A45A]/45 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#C9A45A]/25 pb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Katalog Elemen Proyek ({HOME_BLOCK_CATALOG.length + presets.length} Elemen)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-normal text-[#164234]">
                    Tambahkan ke {activePageInfo.shortLabel}
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={addingKey !== null || creatingCustomElem}
                  onClick={() => setAddModalOpen(false)}
                  className="p-2 rounded-full bg-white hover:bg-[#EAE5D7] text-[#164234] cursor-pointer"
                >
                  <Icon icon="mdi:close" className="w-5 h-5" />
                </button>
              </div>

              {/* Create New Custom Element -> Auto-Registered */}
              <form
                onSubmit={handleCreateCustomAndAutoRegister}
                className="rounded-2xl bg-white border border-[#C9A45A]/40 p-5 flex flex-col gap-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Buat Elemen Baru &amp; Otomatis Terdaftar
                  </span>
                  <p className="text-xs text-[#3E544B]">
                    Elemen kustom yang dibuat di sini otomatis tersimpan ke Katalog Proyek dan langsung ditambahkan ke halaman {activePageInfo.shortLabel}.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <select
                    value={customBaseType}
                    onChange={(e) => setCustomBaseType(e.target.value as HomeBlockType)}
                    className="sm:col-span-4 px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                  >
                    {HOME_BLOCK_CATALOG.map((c) => (
                      <option key={c.type} value={c.type}>
                        Basis: {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={customElemName}
                    onChange={(e) => setCustomElemName(e.target.value)}
                    placeholder="Nama elemen baru (mis. Banner Layanan Halal)"
                    className="sm:col-span-4 px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                  />
                  <input
                    type="text"
                    value={customElemDesc}
                    onChange={(e) => setCustomElemDesc(e.target.value)}
                    placeholder="Keterangan singkat (opsional)"
                    className="sm:col-span-4 px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creatingCustomElem || !customElemName.trim()}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] disabled:opacity-50 text-[#F6F3EC] text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#F4D993]" />
                    <span>
                      {creatingCustomElem
                        ? 'Mendaftarkan...'
                        : 'Buat, Daftarkan Otomatis & Pasang'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Saved Auto-Registered Presets */}
              {presets.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Elemen Kustom Terdaftar di Proyek ({presets.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {presets.map((preset) => {
                      const keyTag = `preset-${preset.id}`;
                      const isAdding = addingKey === keyTag;
                      const base = getCatalogEntry(preset.blockType);
                      return (
                        <div
                          key={preset.id}
                          className="rounded-2xl bg-white border border-[#C9A45A]/35 p-4 flex flex-col justify-between gap-3"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-[#164234]">
                                {preset.name}
                              </span>
                              <span className="text-[11px] text-[#8F6D26]">
                                {base.name}
                              </span>
                            </div>
                            <p className="text-xs text-[#3E544B] leading-relaxed">
                              {preset.description || base.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#C9A45A]/15">
                            <button
                              type="button"
                              disabled={deletingPresetId === preset.id}
                              onClick={() => void handleDeletePreset(preset.id)}
                              className="text-xs text-[#9b2c2c] hover:underline cursor-pointer"
                            >
                              {deletingPresetId === preset.id
                                ? 'Menghapus...'
                                : 'Hapus dari Katalog'}
                            </button>
                            <button
                              type="button"
                              disabled={addingKey !== null}
                              onClick={() =>
                                void handleAddBlock(
                                  preset.blockType,
                                  preset.name,
                                  preset.config,
                                  keyTag
                                )
                              }
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#F4D993]" />
                              <span>{isAdding ? 'Menambah...' : 'Pasang Elemen'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Built-in Project Elements */}
              {(
                ['Bagian Utama', 'Elemen Profil & Program', 'Blok Kustom'] as const
              ).map((group) => (
                <div key={group} className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    {group}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HOME_BLOCK_CATALOG.filter((c) => c.category === group).map(
                      (entry) => {
                        const isAdding = addingKey === entry.type;
                        return (
                          <button
                            key={entry.type}
                            type="button"
                            disabled={addingKey !== null}
                            onClick={() => void handleAddBlock(entry.type)}
                            className="text-left rounded-2xl bg-white hover:bg-[#FAF8F3] border border-[#C9A45A]/30 hover:border-[#164234] p-4 flex flex-col justify-between gap-2 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-[#164234]">
                                {entry.name}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-[#8F6D26]">
                                <Plus className="w-3.5 h-3.5" />
                                <span>{isAdding ? 'Menambah...' : 'Tambah'}</span>
                              </span>
                            </div>
                            <p className="text-xs text-[#3E544B] leading-relaxed">
                              {entry.description}
                            </p>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
