import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CmsDatabaseInfo,
  CmsMediaItem,
  CmsNewsItem,
  CmsStats,
  CmsUploadedMedia,
  CmsUser,
  MagangApplicationItem,
  MagangApplicationStatus,
  MagangGalleryItem,
  MagangPositionItem,
  NewsCategoryItem,
  PartnerLogoItem,
  SiteSettings,
} from '../types/cms';
import {
  DEFAULT_NEWS_CATEGORIES,
  NEWS_PLACEHOLDER_LOGO,
  NewsAttachment,
  NewsGalleryItem,
} from '../data/news';
import { DEFAULT_MAGANG_HERO_IMAGE } from '../data/magangDefaults';
import { TinyMceEditor } from './TinyMceEditor';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAutoTodayLabel(): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(new Date());
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  const monthNum = Number(parts.find((p) => p.type === 'month')?.value || '1');
  const year = parts.find((p) => p.type === 'year')?.value || String(new Date().getFullYear());
  return `${day} ${months[monthNum - 1] || 'Jan'} ${year}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function paragraphsToHtml(paragraphs: string[]): string {
  return paragraphs
    .filter((p) => p.trim())
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
}

type CmsTab =
  | 'overview'
  | 'news'
  | 'media'
  | 'logos'
  | 'magang'
  | 'settings'
  | 'security';

interface CmsDashboardProps {
  user: CmsUser;
  token: string;
  dbInfo: CmsDatabaseInfo | null;
  onViewPublicSite: () => void;
  onLogout: () => void;
  onPublicDataChanged: () => void;
}

const LOGO_URL = 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Logo.webp';

export function CmsDashboard({
  user,
  token,
  dbInfo,
  onViewPublicSite,
  onLogout,
  onPublicDataChanged,
}: CmsDashboardProps) {
  const [activeTab, setActiveTab] = useState<CmsTab>('overview');
  const [stats, setStats] = useState<CmsStats | null>(null);
  const [newsItems, setNewsItems] = useState<CmsNewsItem[]>([]);
  const [newsSearch, setNewsSearch] = useState('');
  const [mediaItems, setMediaItems] = useState<CmsMediaItem[]>([]);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'pdf'>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [bannerNotice, setBannerNotice] = useState('');

  // Media Management & Export/Import State
  const [uploadingLibraryMedia, setUploadingLibraryMedia] = useState(false);
  const [exportingMedia, setExportingMedia] = useState(false);
  const [mediaImportOpen, setMediaImportOpen] = useState(false);
  const [mediaImportMode, setMediaImportMode] = useState<'upsert' | 'skip_existing'>('upsert');
  const [mediaImportFile, setMediaImportFile] = useState<File | null>(null);
  const [importingMedia, setImportingMedia] = useState(false);
  const [mediaImportError, setMediaImportError] = useState('');
  const [editingMedia, setEditingMedia] = useState<CmsMediaItem | null>(null);
  const [editMediaName, setEditMediaName] = useState('');
  const [editMediaAlt, setEditMediaAlt] = useState('');
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);
  const [savingMediaEdit, setSavingMediaEdit] = useState(false);
  const [editMediaError, setEditMediaError] = useState('');
  const [confirmDeleteMediaId, setConfirmDeleteMediaId] = useState<string | null>(null);
  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null);

  // News Bundle Export/Import & Multi-Select State
  const [exportingNews, setExportingNews] = useState(false);
  const [newsImportOpen, setNewsImportOpen] = useState(false);
  const [newsImportMode, setNewsImportMode] = useState<'upsert' | 'skip_existing'>('upsert');
  const [newsImportFile, setNewsImportFile] = useState<File | null>(null);
  const [importingNews, setImportingNews] = useState(false);
  const [newsImportError, setNewsImportError] = useState('');
  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([]);
  const [confirmBulkDeleteNews, setConfirmBulkDeleteNews] = useState(false);
  const [deletingBulkNews, setDeletingBulkNews] = useState(false);

  // Dedicated Full-Page News Editor State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSessionKey, setEditorSessionKey] = useState('new-0');
  const [editingItem, setEditingItem] = useState<CmsNewsItem | null>(null);
  const [formCategory, setFormCategory] = useState<string>(DEFAULT_NEWS_CATEGORIES[0]);
  const [formTitle, setFormTitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formUseLogo, setFormUseLogo] = useState(true);
  const [formContentHtml, setFormContentHtml] = useState('');
  const [formGallery, setFormGallery] = useState<NewsGalleryItem[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [formAttachments, setFormAttachments] = useState<NewsAttachment[]>([]);
  const [newPdfTitle, setNewPdfTitle] = useState('');
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [uploadingTarget, setUploadingTarget] = useState<'cover' | 'gallery' | 'pdf' | null>(null);
  const [editorError, setEditorError] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [savingNews, setSavingNews] = useState(false);

  // Custom News Categories State
  const [newsCategories, setNewsCategories] = useState<NewsCategoryItem[]>(() =>
    DEFAULT_NEWS_CATEGORIES.map((name, idx) => ({ id: idx + 1, name, sortOrder: idx + 1 }))
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [savingCategoryId, setSavingCategoryId] = useState<number | null>(null);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<number | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [categoryError, setCategoryError] = useState('');

  // Partner Logos Marquee State
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogoItem[]>([]);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<PartnerLogoItem | null>(null);
  const [logoFormName, setLogoFormName] = useState('');
  const [logoFormUrl, setLogoFormUrl] = useState('');
  const [logoFormLinkUrl, setLogoFormLinkUrl] = useState('');
  const [logoFormSortOrder, setLogoFormSortOrder] = useState(1);
  const [logoFormIsActive, setLogoFormIsActive] = useState(true);
  const [uploadingLogoFile, setUploadingLogoFile] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const [savingLogoOrder, setSavingLogoOrder] = useState(false);
  const [logoOrderDirty, setLogoOrderDirty] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [confirmDeleteLogoId, setConfirmDeleteLogoId] = useState<number | null>(null);

  // Magang P2B Gallery & Positions State
  const [magangGallery, setMagangGallery] = useState<MagangGalleryItem[]>([]);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<MagangGalleryItem | null>(null);
  const [galleryFormTitle, setGalleryFormTitle] = useState('');
  const [galleryFormCaption, setGalleryFormCaption] = useState('');
  const [galleryFormImageUrl, setGalleryFormImageUrl] = useState('');
  const [galleryFormAltText, setGalleryFormAltText] = useState('');
  const [galleryFormSortOrder, setGalleryFormSortOrder] = useState(1);
  const [galleryFormIsActive, setGalleryFormIsActive] = useState(true);
  const [uploadingGalleryFile, setUploadingGalleryFile] = useState(false);
  const [savingGalleryItem, setSavingGalleryItem] = useState(false);
  const [savingGalleryOrder, setSavingGalleryOrder] = useState(false);
  const [galleryOrderDirty, setGalleryOrderDirty] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [confirmDeleteGalleryId, setConfirmDeleteGalleryId] = useState<number | null>(null);

  const [magangPositions, setMagangPositions] = useState<MagangPositionItem[]>([]);
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [editingPositionItem, setEditingPositionItem] = useState<MagangPositionItem | null>(null);
  const [posFormTitle, setPosFormTitle] = useState('');
  const [posFormDivision, setPosFormDivision] = useState('');
  const [posFormDescription, setPosFormDescription] = useState('');
  const [posFormImageUrl, setPosFormImageUrl] = useState('');
  const [posFormTasksText, setPosFormTasksText] = useState('');
  const [posFormSortOrder, setPosFormSortOrder] = useState(1);
  const [posFormIsActive, setPosFormIsActive] = useState(true);
  const [posFormIsAvailable, setPosFormIsAvailable] = useState(true);
  const [uploadingPosFile, setUploadingPosFile] = useState(false);
  const [savingPositionItem, setSavingPositionItem] = useState(false);
  const [savingPosOrder, setSavingPosOrder] = useState(false);
  const [posOrderDirty, setPosOrderDirty] = useState(false);
  const [positionError, setPositionError] = useState('');
  const [confirmDeletePositionId, setConfirmDeletePositionId] = useState<number | null>(null);

  // Magang Applications Inbox State
  const [magangApplications, setMagangApplications] = useState<MagangApplicationItem[]>([]);
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | MagangApplicationStatus>('all');
  const [appSearch, setAppSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<MagangApplicationItem | null>(null);
  const [updatingAppStatusId, setUpdatingAppStatusId] = useState<number | null>(null);
  const [confirmDeleteAppId, setConfirmDeleteAppId] = useState<number | null>(null);
  const [downloadingFileKey, setDownloadingFileKey] = useState<string | null>(null);

  // Site Settings State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({});
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
  const [uploadingMagangHero, setUploadingMagangHero] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);

  const lastLocalCommitAtRef = useRef<number>(0);
  const logoOrderDirtyRef = useRef(false);
  const magangGalleryOrderDirtyRef = useRef(false);
  const magangPosOrderDirtyRef = useRef(false);
  const settingsDirtyRef = useRef(false);

  useEffect(() => {
    logoOrderDirtyRef.current = logoOrderDirty;
  }, [logoOrderDirty]);

  useEffect(() => {
    magangGalleryOrderDirtyRef.current = galleryOrderDirty;
  }, [galleryOrderDirty]);

  useEffect(() => {
    magangPosOrderDirtyRef.current = posOrderDirty;
  }, [posOrderDirty]);

  useEffect(() => {
    settingsDirtyRef.current = settingsDirty;
  }, [settingsDirty]);

  const markLocalCommit = () => {
    lastLocalCommitAtRef.current = Date.now();
  };

  const authHeaders = useCallback(
    () => ({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const notify = useCallback((msg: string) => {
    setBannerNotice(msg);
    window.setTimeout(() => setBannerNotice(''), 3200);
  }, []);

  const loadAllCmsData = useCallback(
    async (options?: { preserveDirtyEdits?: boolean }) => {
      const preserveDirty = Boolean(options?.preserveDirtyEdits);
      try {
        const [
          ovRes,
          newsRes,
          catRes,
          mediaRes,
          logoRes,
          magangGalleryRes,
          magangPosRes,
          magangAppRes,
          settingsRes,
        ] = await Promise.all([
          fetch('/api/cms/overview', {
            headers: authHeaders(),
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch('/api/cms/news', {
            headers: authHeaders(),
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch('/api/cms/categories', {
            headers: authHeaders(),
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch('/api/cms/media', {
            headers: authHeaders(),
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch('/api/cms/partner-logos', {
            headers: authHeaders(),
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch('/api/cms/magang-gallery', {
            headers: authHeaders(),
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch('/api/cms/magang-positions', {
            headers: authHeaders(),
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch('/api/cms/magang-applications', {
            headers: authHeaders(),
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch('/api/cms/settings', {
            headers: authHeaders(),
            credentials: 'include',
            cache: 'no-store',
          }),
        ]);

        if (ovRes.ok) {
          const d = (await ovRes.json()) as { stats?: CmsStats };
          if (d.stats) setStats(d.stats);
        }
        if (newsRes.ok) {
          const d = (await newsRes.json()) as { items?: CmsNewsItem[] };
          if (d.items) setNewsItems(d.items);
        }
        if (catRes.ok) {
          const d = (await catRes.json()) as { items?: NewsCategoryItem[] };
          if (d.items && d.items.length > 0) setNewsCategories(d.items);
        }
        if (mediaRes.ok) {
          const d = (await mediaRes.json()) as { items?: CmsMediaItem[] };
          if (d.items) setMediaItems(d.items);
        }
        if (logoRes.ok && (!preserveDirty || !logoOrderDirtyRef.current)) {
          const d = (await logoRes.json()) as { items?: PartnerLogoItem[] };
          if (d.items) {
            setPartnerLogos(d.items);
            setLogoOrderDirty(false);
          }
        }
        if (
          magangGalleryRes.ok &&
          (!preserveDirty || !magangGalleryOrderDirtyRef.current)
        ) {
          const d = (await magangGalleryRes.json()) as {
            items?: MagangGalleryItem[];
          };
          if (d.items) {
            setMagangGallery(d.items);
            setGalleryOrderDirty(false);
          }
        }
        if (
          magangPosRes.ok &&
          (!preserveDirty || !magangPosOrderDirtyRef.current)
        ) {
          const d = (await magangPosRes.json()) as {
            items?: MagangPositionItem[];
          };
          if (d.items) {
            setMagangPositions(d.items);
            setPosOrderDirty(false);
          }
        }
        if (magangAppRes.ok) {
          const d = (await magangAppRes.json()) as {
            items?: MagangApplicationItem[];
          };
          if (d.items) {
            setMagangApplications(d.items);
          }
        }
        if (settingsRes.ok && (!preserveDirty || !settingsDirtyRef.current)) {
          const d = (await settingsRes.json()) as { settings?: SiteSettings };
          if (d.settings) {
            setSettingsForm(d.settings);
            setSettingsDirty(false);
          }
        }
      } catch {
        // Keep current state if transient network error
      }
    },
    [authHeaders]
  );

  useEffect(() => {
    void loadAllCmsData();
  }, [loadAllCmsData]);

  useRealtimeSync({
    enabled: true,
    pollIntervalMs: 15000,
    onSync: useCallback(async () => {
      if (Date.now() - lastLocalCommitAtRef.current < 1500) {
        return;
      }
      await loadAllCmsData({ preserveDirtyEdits: true });
      onPublicDataChanged();
      notify('Data diperbarui secara real-time dari server.');
    }, [loadAllCmsData, onPublicDataChanged, notify]),
  });

  const uploadSingleMedia = async (file: File): Promise<CmsUploadedMedia> => {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch('/api/cms/upload', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      media?: CmsUploadedMedia;
    };

    if (!res.ok || !data.ok || !data.media) {
      throw new Error(data.message || `Gagal mengunggah ${file.name}.`);
    }
    return data.media;
  };

  const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingTarget('cover');
    setEditorError('');
    try {
      const media = await uploadSingleMedia(file);
      setFormUseLogo(false);
      setFormImage(media.url);
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : 'Gagal mengunggah sampul.');
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleUploadGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadingTarget('gallery');
    setEditorError('');
    try {
      const uploadedItems: NewsGalleryItem[] = [];
      for (const file of files) {
        const media = await uploadSingleMedia(file);
        uploadedItems.push({ url: media.url, caption: '' });
      }
      setFormGallery((prev) => [...prev, ...uploadedItems]);
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : 'Gagal mengunggah foto dokumentasi.');
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleAddGalleryUrl = () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) return;
    setFormGallery((prev) => [...prev, { url: trimmed, caption: '' }]);
    setNewGalleryUrl('');
  };

  const handleMoveGalleryItem = (index: number, direction: -1 | 1) => {
    setFormGallery((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  const handleUploadPdfFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadingTarget('pdf');
    setEditorError('');
    try {
      const uploadedDocs: NewsAttachment[] = [];
      for (const file of files) {
        const media = await uploadSingleMedia(file);
        const defaultTitle = file.name.replace(/\.pdf$/i, '');
        uploadedDocs.push({
          id: media.id,
          title: defaultTitle || file.name,
          url: media.url,
          fileName: media.fileName,
          sizeBytes: media.sizeBytes,
        });
      }
      setFormAttachments((prev) => [...prev, ...uploadedDocs]);
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : 'Gagal mengunggah dokumen PDF.');
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleAddPdfUrl = () => {
    const trimmedUrl = newPdfUrl.trim();
    if (!trimmedUrl) return;
    const title = newPdfTitle.trim() || 'Dokumen Lampiran PDF';
    setFormAttachments((prev) => [
      ...prev,
      {
        id: `pdf-${Date.now()}`,
        title,
        url: trimmedUrl,
      },
    ]);
    setNewPdfTitle('');
    setNewPdfUrl('');
  };

  const openCreateNewsModal = () => {
    setEditingItem(null);
    setEditorSessionKey(`create-${Date.now()}`);
    setFormCategory(newsCategories[0]?.name || DEFAULT_NEWS_CATEGORIES[0]);
    setFormTitle('');
    setFormExcerpt('');
    setFormImage('');
    setFormUseLogo(true);
    setFormContentHtml('');
    setFormGallery([]);
    setNewGalleryUrl('');
    setFormAttachments([]);
    setNewPdfTitle('');
    setNewPdfUrl('');
    setEditorError('');
    setFormPublished(true);
    setActiveTab('news');
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditNewsModal = (item: CmsNewsItem) => {
    setEditingItem(item);
    setEditorSessionKey(`edit-${item.dbId}-${Date.now()}`);
    setFormCategory(item.category || newsCategories[0]?.name || DEFAULT_NEWS_CATEGORIES[0]);
    setFormTitle(item.title);
    setFormExcerpt(item.excerpt);
    setFormUseLogo(Boolean(item.isLogoPlaceholder));
    setFormImage(item.isLogoPlaceholder ? '' : item.image);
    setFormContentHtml(
      item.contentHtml?.trim()
        ? item.contentHtml
        : paragraphsToHtml(item.content || [])
    );
    setFormGallery(item.gallery ? item.gallery.map((g) => ({ ...g })) : []);
    setNewGalleryUrl('');
    setFormAttachments(
      item.attachments ? item.attachments.map((a) => ({ ...a })) : []
    );
    setNewPdfTitle('');
    setNewPdfUrl('');
    setEditorError('');
    setFormPublished(item.isPublished);
    setActiveTab('news');
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formExcerpt.trim()) {
      setEditorError('Judul dan ringkasan singkat wajib diisi.');
      return;
    }
    setSavingNews(true);
    setEditorError('');

    const payload = {
      category: formCategory,
      title: formTitle.trim(),
      excerpt: formExcerpt.trim(),
      image: formUseLogo ? NEWS_PLACEHOLDER_LOGO : formImage.trim(),
      isLogoPlaceholder: formUseLogo || !formImage.trim(),
      contentHtml: formContentHtml.trim(),
      gallery: formGallery.filter((g) => g.url.trim()),
      attachments: formAttachments.filter((a) => a.url.trim()),
      isPublished: formPublished,
    };

    try {
      const url = editingItem
        ? `/api/cms/news/${editingItem.dbId}`
        : '/api/cms/news';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (res.ok) {
        markLocalCommit();
        setEditorOpen(false);
        setActiveTab('news');
        await loadAllCmsData();
        onPublicDataChanged();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        notify(
          editingItem
            ? 'Berita berhasil diperbarui di database.'
            : 'Berita baru berhasil dipublikasikan.'
        );
      } else {
        setEditorError(data.message || 'Gagal menyimpan berita ke database.');
      }
    } catch {
      setEditorError('Tidak dapat terhubung ke server CMS.');
    } finally {
      setSavingNews(false);
    }
  };

  const handleDeleteNews = async (dbId: number) => {
    const res = await fetch(`/api/cms/news/${dbId}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      markLocalCommit();
      setSelectedNewsIds((prev) => prev.filter((id) => id !== dbId));
      await loadAllCmsData();
      onPublicDataChanged();
      notify('Berita dihapus dari database.');
    }
  };

  // Custom News Categories CRUD Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategoryName.trim();
    if (!clean) {
      setCategoryError('Nama kategori wajib diisi.');
      return;
    }
    setCreatingCategory(true);
    setCategoryError('');
    try {
      const res = await fetch('/api/cms/categories', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ name: clean }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        item?: NewsCategoryItem;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setCategoryError(data.message || 'Gagal menambah kategori.');
        return;
      }
      markLocalCommit();
      setNewCategoryName('');
      if (data.item) setFormCategory(data.item.name);
      await loadAllCmsData();
      onPublicDataChanged();
      notify(`Kategori "${clean}" berhasil ditambahkan.`);
    } catch {
      setCategoryError('Tidak dapat terhubung ke server.');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleUpdateCategory = async (catId: number) => {
    const clean = editingCategoryName.trim();
    if (!clean) {
      setCategoryError('Nama kategori tidak boleh kosong.');
      return;
    }
    setSavingCategoryId(catId);
    setCategoryError('');
    try {
      const res = await fetch(`/api/cms/categories/${catId}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ name: clean }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        oldName?: string;
        item?: NewsCategoryItem;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setCategoryError(data.message || 'Gagal memperbarui kategori.');
        return;
      }
      markLocalCommit();
      if (data.oldName && formCategory === data.oldName && data.item) {
        setFormCategory(data.item.name);
      }
      setEditingCategoryId(null);
      setEditingCategoryName('');
      await loadAllCmsData();
      onPublicDataChanged();
      notify(`Kategori diperbarui menjadi "${clean}".`);
    } catch {
      setCategoryError('Tidak dapat terhubung ke server.');
    } finally {
      setSavingCategoryId(null);
    }
  };

  const handleDeleteCategory = async (catId: number) => {
    setDeletingCategoryId(catId);
    setCategoryError('');
    try {
      const res = await fetch(`/api/cms/categories/${catId}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        deletedName?: string;
        reassignedTo?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setCategoryError(data.message || 'Gagal menghapus kategori.');
        return;
      }
      markLocalCommit();
      if (data.deletedName && formCategory === data.deletedName && data.reassignedTo) {
        setFormCategory(data.reassignedTo);
      }
      setConfirmDeleteCategoryId(null);
      await loadAllCmsData();
      onPublicDataChanged();
      notify(`Kategori "${data.deletedName || ''}" dihapus.`);
    } catch {
      setCategoryError('Tidak dapat terhubung ke server.');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleBulkDeleteNews = async () => {
    if (selectedNewsIds.length === 0) return;
    setDeletingBulkNews(true);
    try {
      const res = await fetch('/api/cms/news/bulk-delete', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ ids: selectedNewsIds }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        deletedCount?: number;
        message?: string;
      };
      if (res.ok && data.ok) {
        markLocalCommit();
        const count = data.deletedCount ?? selectedNewsIds.length;
        setSelectedNewsIds([]);
        setConfirmBulkDeleteNews(false);
        await loadAllCmsData();
        onPublicDataChanged();
        notify(`${count} berita terpilih berhasil dihapus dari database.`);
      } else {
        notify(data.message || 'Gagal menghapus berita terpilih.');
      }
    } finally {
      setDeletingBulkNews(false);
    }
  };

  const handleExportSelectedNews = async () => {
    if (selectedNewsIds.length === 0) return;
    setExportingNews(true);
    try {
      const dateStamp = new Date().toISOString().slice(0, 10);
      await downloadAuthenticatedBundle(
        `/api/cms/news/export?ids=${selectedNewsIds.join(',')}`,
        `p2b-berita-terpilih-${selectedNewsIds.length}-${dateStamp}.json`
      );
      notify(
        `${selectedNewsIds.length} berita terpilih lengkap dengan medianya berhasil diekspor.`
      );
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal mengekspor berita terpilih.');
    } finally {
      setExportingNews(false);
    }
  };

  const downloadAuthenticatedBundle = async (
    endpoint: string,
    fallbackFilename: string
  ) => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(endpoint, { headers, credentials: 'include' });
    if (!res.ok) {
      const errData = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(errData.message || 'Gagal mengunduh berkas ekspor.');
    }

    const disposition = res.headers.get('content-disposition') || '';
    const match = /filename="?([^"]+)"?/i.exec(disposition);
    const filename = match?.[1] || fallbackFilename;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportNewsBundle = async (singleItem?: CmsNewsItem) => {
    setExportingNews(true);
    try {
      const dateStamp = new Date().toISOString().slice(0, 10);
      const endpoint = singleItem
        ? `/api/cms/news/export?id=${singleItem.dbId}`
        : '/api/cms/news/export';
      const fallbackName = singleItem
        ? `p2b-berita-${singleItem.id}-${dateStamp}.json`
        : `p2b-berita-lengkap-${dateStamp}.json`;
      await downloadAuthenticatedBundle(endpoint, fallbackName);
      notify(
        singleItem
          ? `Paket berita "${singleItem.title}" & medianya berhasil diekspor.`
          : 'Seluruh berita lengkap dengan media berhasil diekspor.'
      );
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal mengekspor berita.');
    } finally {
      setExportingNews(false);
    }
  };

  const handleImportNewsBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsImportFile) {
      setNewsImportError('Pilih file JSON hasil ekspor berita terlebih dahulu.');
      return;
    }

    setImportingNews(true);
    setNewsImportError('');
    try {
      const rawText = await newsImportFile.text();
      const parsed = JSON.parse(rawText) as {
        format?: string;
        news?: unknown[];
        media?: unknown[];
      };
      if (!parsed || !Array.isArray(parsed.news)) {
        setNewsImportError('Format JSON tidak valid. Gunakan berkas ekspor berita P2B.');
        return;
      }

      const res = await fetch('/api/cms/news/import', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          mode: newsImportMode,
          news: parsed.news,
          media: Array.isArray(parsed.media) ? parsed.media : [],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        importedNews?: number;
        skippedNews?: number;
        importedMedia?: number;
      };

      if (!res.ok || !data.ok) {
        setNewsImportError(data.message || 'Gagal mengimpor paket berita.');
        return;
      }

      markLocalCommit();
      setNewsImportOpen(false);
      setNewsImportFile(null);
      await loadAllCmsData();
      onPublicDataChanged();
      notify(
        `Impor selesai: ${data.importedNews ?? 0} berita & ${data.importedMedia ?? 0} media diproses (${data.skippedNews ?? 0} dilewati).`
      );
    } catch {
      setNewsImportError('Berkas JSON tidak dapat dibaca atau rusak.');
    } finally {
      setImportingNews(false);
    }
  };

  const handleUploadLibraryMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadingLibraryMedia(true);
    try {
      markLocalCommit();
      for (const file of files) {
        await uploadSingleMedia(file);
      }
      await loadAllCmsData();
      notify(`${files.length} berkas media berhasil ditambahkan ke database.`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal mengunggah media.');
    } finally {
      setUploadingLibraryMedia(false);
    }
  };

  const handleExportMediaBundle = async () => {
    setExportingMedia(true);
    try {
      const dateStamp = new Date().toISOString().slice(0, 10);
      await downloadAuthenticatedBundle(
        '/api/cms/media/export',
        `p2b-media-export-${dateStamp}.json`
      );
      notify('Seluruh pustaka media berhasil diekspor.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal mengekspor media.');
    } finally {
      setExportingMedia(false);
    }
  };

  const handleImportMediaBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaImportFile) {
      setMediaImportError('Pilih file JSON hasil ekspor media terlebih dahulu.');
      return;
    }

    setImportingMedia(true);
    setMediaImportError('');
    try {
      const rawText = await mediaImportFile.text();
      const parsed = JSON.parse(rawText) as {
        items?: unknown[];
        media?: unknown[];
      };
      const entries = Array.isArray(parsed.items)
        ? parsed.items
        : Array.isArray(parsed.media)
          ? parsed.media
          : null;
      if (!entries) {
        setMediaImportError('Format JSON tidak valid. Gunakan berkas ekspor media P2B.');
        return;
      }

      const res = await fetch('/api/cms/media/import', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          mode: mediaImportMode,
          items: entries,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        importedCount?: number;
        skippedCount?: number;
      };
      if (!res.ok || !data.ok) {
        setMediaImportError(data.message || 'Gagal mengimpor media.');
        return;
      }

      markLocalCommit();
      setMediaImportOpen(false);
      setMediaImportFile(null);
      await loadAllCmsData();
      notify(
        `Impor media selesai: ${data.importedCount ?? 0} berhasil, ${data.skippedCount ?? 0} dilewati.`
      );
    } catch {
      setMediaImportError('Berkas JSON tidak dapat dibaca atau rusak.');
    } finally {
      setImportingMedia(false);
    }
  };

  const openEditMediaModal = (item: CmsMediaItem) => {
    setEditingMedia(item);
    setEditMediaName(item.originalName);
    setEditMediaAlt(item.altText || '');
    setEditMediaFile(null);
    setEditMediaError('');
  };

  const handleSaveMediaEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;
    if (!editMediaName.trim()) {
      setEditMediaError('Nama berkas wajib diisi.');
      return;
    }

    setSavingMediaEdit(true);
    setEditMediaError('');
    try {
      let res: Response;
      if (editMediaFile) {
        const fd = new FormData();
        fd.append('originalName', editMediaName.trim());
        fd.append('altText', editMediaAlt.trim());
        fd.append('file', editMediaFile);
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        res = await fetch(`/api/cms/media/${encodeURIComponent(editingMedia.id)}`, {
          method: 'PUT',
          headers,
          credentials: 'include',
          body: fd,
        });
      } else {
        res = await fetch(`/api/cms/media/${encodeURIComponent(editingMedia.id)}`, {
          method: 'PUT',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            originalName: editMediaName.trim(),
            altText: editMediaAlt.trim(),
          }),
        });
      }

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setEditMediaError(data.message || 'Gagal memperbarui media.');
        return;
      }

      markLocalCommit();
      setEditingMedia(null);
      await loadAllCmsData();
      onPublicDataChanged();
      notify('Data media berhasil diperbarui (tautan media tetap terjaga).');
    } catch {
      setEditMediaError('Tidak dapat terhubung ke server.');
    } finally {
      setSavingMediaEdit(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const res = await fetch(`/api/cms/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      markLocalCommit();
      setConfirmDeleteMediaId(null);
      await loadAllCmsData();
      notify('Berkas media dihapus dari database.');
    }
  };

  const handleCopyMediaUrl = async (item: CmsMediaItem) => {
    const absoluteUrl = `${window.location.origin}${item.url}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopiedMediaId(item.id);
      window.setTimeout(() => setCopiedMediaId(null), 2000);
    } catch {
      notify(`URL Media: ${absoluteUrl}`);
    }
  };

  // Partner Logos Marquee Handlers
  const openCreateLogoModal = () => {
    setEditingLogo(null);
    setLogoFormName('');
    setLogoFormUrl('');
    setLogoFormLinkUrl('');
    const maxOrder = partnerLogos.reduce((acc, l) => Math.max(acc, l.sortOrder), 0);
    setLogoFormSortOrder(maxOrder + 1);
    setLogoFormIsActive(true);
    setLogoError('');
    setLogoModalOpen(true);
  };

  const openEditLogoModal = (logo: PartnerLogoItem) => {
    setEditingLogo(logo);
    setLogoFormName(logo.name);
    setLogoFormUrl(logo.logoUrl);
    setLogoFormLinkUrl(logo.linkUrl || '');
    setLogoFormSortOrder(logo.sortOrder);
    setLogoFormIsActive(logo.isActive);
    setLogoError('');
    setLogoModalOpen(true);
  };

  const handleUploadLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogoFile(true);
    setLogoError('');
    try {
      markLocalCommit();
      const uploaded = await uploadSingleMedia(file);
      setLogoFormUrl(uploaded.url);
      if (!logoFormName.trim()) {
        setLogoFormName(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
      }
      await loadAllCmsData();
      notify('Berkas logo berhasil diunggah ke pustaka media.');
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Gagal mengunggah berkas logo.');
    } finally {
      setUploadingLogoFile(false);
      e.target.value = '';
    }
  };

  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFormName.trim() || !logoFormUrl.trim()) {
      setLogoError('Nama mitra/unit dan URL atau unggahan logo wajib diisi.');
      return;
    }
    setSavingLogo(true);
    setLogoError('');
    try {
      const endpoint = editingLogo
        ? `/api/cms/partner-logos/${editingLogo.id}`
        : '/api/cms/partner-logos';
      const method = editingLogo ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          name: logoFormName.trim(),
          logoUrl: logoFormUrl.trim(),
          linkUrl: logoFormLinkUrl.trim(),
          sortOrder: Number(logoFormSortOrder) > 0 ? Number(logoFormSortOrder) : 1,
          isActive: logoFormIsActive,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setLogoError(data.message || 'Gagal menyimpan logo mitra.');
        return;
      }
      markLocalCommit();
      setLogoModalOpen(false);
      await loadAllCmsData();
      onPublicDataChanged();
      notify(
        editingLogo
          ? 'Logo mitra diperbarui & tersinkron ke beranda.'
          : 'Logo mitra baru ditambahkan ke beranda.'
      );
    } catch {
      setLogoError('Tidak dapat terhubung ke server.');
    } finally {
      setSavingLogo(false);
    }
  };

  const handleToggleLogoActive = async (logo: PartnerLogoItem) => {
    const res = await fetch(`/api/cms/partner-logos/${logo.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        name: logo.name,
        logoUrl: logo.logoUrl,
        linkUrl: logo.linkUrl,
        sortOrder: logo.sortOrder,
        isActive: !logo.isActive,
      }),
    });
    if (res.ok) {
      markLocalCommit();
      await loadAllCmsData();
      onPublicDataChanged();
      notify(
        !logo.isActive
          ? `Logo "${logo.name}" ditampilkan di beranda.`
          : `Logo "${logo.name}" disembunyikan dari beranda.`
      );
    }
  };

  const handleMoveLogo = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= partnerLogos.length || savingLogoOrder) return;
    const reordered = [...partnerLogos];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setPartnerLogos(reordered.map((item, idx) => ({ ...item, sortOrder: idx + 1 })));
    setLogoOrderDirty(true);
  };

  const handleSaveLogoOrder = async () => {
    if (!logoOrderDirty || partnerLogos.length === 0 || savingLogoOrder) return;
    setSavingLogoOrder(true);
    try {
      const res = await fetch('/api/cms/partner-logos/reorder', {
        method: 'PATCH',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ orderedIds: partnerLogos.map((l) => l.id) }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        items?: PartnerLogoItem[];
        message?: string;
      };
      if (res.ok && data.ok && Array.isArray(data.items)) {
        markLocalCommit();
        setPartnerLogos(data.items);
        setLogoOrderDirty(false);
        onPublicDataChanged();
        notify('Urutan logo mitra disimpan ke MariaDB.');
      } else {
        notify(data.message || 'Gagal menyimpan urutan logo mitra.');
      }
    } catch {
      notify('Tidak dapat terhubung ke server untuk menyimpan urutan.');
    } finally {
      setSavingLogoOrder(false);
    }
  };

  const handleCancelLogoOrder = async () => {
    await loadAllCmsData();
    notify('Perubahan urutan logo dibatalkan.');
  };

  const handleDeleteLogo = async (id: number) => {
    const res = await fetch(`/api/cms/partner-logos/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      markLocalCommit();
      setConfirmDeleteLogoId(null);
      await loadAllCmsData();
      onPublicDataChanged();
      notify('Logo mitra dihapus dari database.');
    }
  };

  // Magang Gallery Handlers
  const openCreateGalleryModal = () => {
    setEditingGalleryItem(null);
    setGalleryFormTitle('');
    setGalleryFormCaption('');
    setGalleryFormImageUrl('');
    setGalleryFormAltText('');
    const maxOrder = magangGallery.reduce((acc, g) => Math.max(acc, g.sortOrder), 0);
    setGalleryFormSortOrder(maxOrder + 1);
    setGalleryFormIsActive(true);
    setGalleryError('');
    setGalleryModalOpen(true);
  };

  const openEditGalleryModal = (item: MagangGalleryItem) => {
    setEditingGalleryItem(item);
    setGalleryFormTitle(item.title);
    setGalleryFormCaption(item.caption || '');
    setGalleryFormImageUrl(item.imageUrl);
    setGalleryFormAltText(item.altText || '');
    setGalleryFormSortOrder(item.sortOrder);
    setGalleryFormIsActive(item.isActive);
    setGalleryError('');
    setGalleryModalOpen(true);
  };

  const handleUploadGalleryPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGalleryFile(true);
    setGalleryError('');
    try {
      markLocalCommit();
      const uploaded = await uploadSingleMedia(file);
      setGalleryFormImageUrl(uploaded.url);
      if (!galleryFormTitle.trim()) {
        setGalleryFormTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
      }
      await loadAllCmsData();
      notify('Foto galeri magang berhasil diunggah ke pustaka media.');
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : 'Gagal mengunggah foto galeri.');
    } finally {
      setUploadingGalleryFile(false);
      e.target.value = '';
    }
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFormTitle.trim() || !galleryFormImageUrl.trim()) {
      setGalleryError('Judul kegiatan dan URL/ungahan foto wajib diisi.');
      return;
    }
    setSavingGalleryItem(true);
    setGalleryError('');
    try {
      const endpoint = editingGalleryItem
        ? `/api/cms/magang-gallery/${editingGalleryItem.id}`
        : '/api/cms/magang-gallery';
      const method = editingGalleryItem ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: galleryFormTitle.trim(),
          caption: galleryFormCaption.trim(),
          imageUrl: galleryFormImageUrl.trim(),
          altText: galleryFormAltText.trim(),
          sortOrder: Number(galleryFormSortOrder) > 0 ? Number(galleryFormSortOrder) : 1,
          isActive: galleryFormIsActive,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setGalleryError(data.message || 'Gagal menyimpan foto galeri magang.');
        return;
      }
      markLocalCommit();
      setGalleryModalOpen(false);
      await loadAllCmsData();
      onPublicDataChanged();
      notify(
        editingGalleryItem
          ? 'Foto galeri magang diperbarui & tersinkron.'
          : 'Foto galeri magang baru ditambahkan.'
      );
    } catch {
      setGalleryError('Tidak dapat terhubung ke server.');
    } finally {
      setSavingGalleryItem(false);
    }
  };

  const handleToggleGalleryActive = async (item: MagangGalleryItem) => {
    const res = await fetch(`/api/cms/magang-gallery/${item.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        title: item.title,
        caption: item.caption,
        imageUrl: item.imageUrl,
        altText: item.altText,
        sortOrder: item.sortOrder,
        isActive: !item.isActive,
      }),
    });
    if (res.ok) {
      markLocalCommit();
      await loadAllCmsData();
      onPublicDataChanged();
      notify(
        !item.isActive
          ? `Foto "${item.title}" ditampilkan di halaman Magang.`
          : `Foto "${item.title}" disembunyikan.`
      );
    }
  };

  const handleMoveGalleryOrder = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= magangGallery.length || savingGalleryOrder) return;
    const reordered = [...magangGallery];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setMagangGallery(reordered.map((item, idx) => ({ ...item, sortOrder: idx + 1 })));
    setGalleryOrderDirty(true);
  };

  const handleSaveGalleryOrder = async () => {
    if (!galleryOrderDirty || magangGallery.length === 0 || savingGalleryOrder) return;
    setSavingGalleryOrder(true);
    try {
      const res = await fetch('/api/cms/magang-gallery/reorder', {
        method: 'PATCH',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ orderedIds: magangGallery.map((g) => g.id) }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        items?: MagangGalleryItem[];
        message?: string;
      };
      if (res.ok && data.ok && Array.isArray(data.items)) {
        markLocalCommit();
        setMagangGallery(data.items);
        setGalleryOrderDirty(false);
        onPublicDataChanged();
        notify('Urutan galeri foto magang disimpan ke MariaDB.');
      } else {
        notify(data.message || 'Gagal menyimpan urutan galeri foto.');
      }
    } catch {
      notify('Tidak dapat terhubung ke server untuk menyimpan urutan.');
    } finally {
      setSavingGalleryOrder(false);
    }
  };

  const handleCancelGalleryOrder = async () => {
    await loadAllCmsData();
    notify('Perubahan urutan galeri foto dibatalkan.');
  };

  const handleDeleteGalleryItem = async (id: number) => {
    const res = await fetch(`/api/cms/magang-gallery/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      markLocalCommit();
      setConfirmDeleteGalleryId(null);
      await loadAllCmsData();
      onPublicDataChanged();
      notify('Foto galeri magang dihapus dari database.');
    }
  };

  // Magang Positions Handlers
  const openCreatePositionModal = () => {
    setEditingPositionItem(null);
    setPosFormTitle('');
    setPosFormDivision('');
    setPosFormDescription('');
    setPosFormImageUrl('');
    setPosFormTasksText('');
    const maxOrder = magangPositions.reduce((acc, p) => Math.max(acc, p.sortOrder), 0);
    setPosFormSortOrder(maxOrder + 1);
    setPosFormIsActive(true);
    setPosFormIsAvailable(true);
    setPositionError('');
    setPositionModalOpen(true);
  };

  const openEditPositionModal = (item: MagangPositionItem) => {
    setEditingPositionItem(item);
    setPosFormTitle(item.title);
    setPosFormDivision(item.division || '');
    setPosFormDescription(item.description || '');
    setPosFormImageUrl(item.imageUrl);
    setPosFormTasksText((item.tasks || []).join('\n'));
    setPosFormSortOrder(item.sortOrder);
    setPosFormIsActive(item.isActive);
    setPosFormIsAvailable(item.isAvailable !== false);
    setPositionError('');
    setPositionModalOpen(true);
  };

  const handleUploadPositionPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPosFile(true);
    setPositionError('');
    try {
      markLocalCommit();
      const uploaded = await uploadSingleMedia(file);
      setPosFormImageUrl(uploaded.url);
      await loadAllCmsData();
      notify('Gambar posisi magang berhasil diunggah ke pustaka media.');
    } catch (err) {
      setPositionError(err instanceof Error ? err.message : 'Gagal mengunggah gambar posisi.');
    } finally {
      setUploadingPosFile(false);
      e.target.value = '';
    }
  };

  const handleSavePositionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posFormTitle.trim() || !posFormImageUrl.trim()) {
      setPositionError('Nama posisi dan URL/unggahan gambar posisi wajib diisi.');
      return;
    }
    setSavingPositionItem(true);
    setPositionError('');
    const parsedTasks = posFormTasksText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    try {
      const endpoint = editingPositionItem
        ? `/api/cms/magang-positions/${editingPositionItem.id}`
        : '/api/cms/magang-positions';
      const method = editingPositionItem ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: posFormTitle.trim(),
          division: posFormDivision.trim(),
          description: posFormDescription.trim(),
          imageUrl: posFormImageUrl.trim(),
          tasks: parsedTasks,
          sortOrder: Number(posFormSortOrder) > 0 ? Number(posFormSortOrder) : 1,
          isActive: posFormIsActive,
          isAvailable: posFormIsAvailable,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setPositionError(data.message || 'Gagal menyimpan posisi magang.');
        return;
      }
      markLocalCommit();
      setPositionModalOpen(false);
      await loadAllCmsData();
      onPublicDataChanged();
      notify(
        editingPositionItem
          ? 'Posisi magang diperbarui & tersinkron.'
          : 'Posisi magang baru ditambahkan.'
      );
    } catch {
      setPositionError('Tidak dapat terhubung ke server.');
    } finally {
      setSavingPositionItem(false);
    }
  };

  const handleTogglePositionActive = async (item: MagangPositionItem) => {
    const res = await fetch(`/api/cms/magang-positions/${item.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        title: item.title,
        division: item.division,
        description: item.description,
        imageUrl: item.imageUrl,
        tasks: item.tasks || [],
        sortOrder: item.sortOrder,
        isActive: !item.isActive,
        isAvailable: item.isAvailable !== false,
      }),
    });
    if (res.ok) {
      markLocalCommit();
      await loadAllCmsData();
      onPublicDataChanged();
      notify(
        !item.isActive
          ? `Posisi "${item.title}" ditampilkan di halaman Magang.`
          : `Posisi "${item.title}" disembunyikan.`
      );
    }
  };

  const handleTogglePositionAvailable = async (item: MagangPositionItem) => {
    const nextAvailable = item.isAvailable === false;
    const res = await fetch(`/api/cms/magang-positions/${item.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        title: item.title,
        division: item.division,
        description: item.description,
        imageUrl: item.imageUrl,
        tasks: item.tasks || [],
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        isAvailable: nextAvailable,
      }),
    });
    if (res.ok) {
      markLocalCommit();
      await loadAllCmsData();
      onPublicDataChanged();
      notify(
        nextAvailable
          ? `Opsi "${item.title}" dibuka pada formulir pendaftaran.`
          : `Opsi "${item.title}" ditandai tidak tersedia / penuh.`
      );
    }
  };

  const handleMovePositionOrder = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= magangPositions.length || savingPosOrder) return;
    const reordered = [...magangPositions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setMagangPositions(reordered.map((item, idx) => ({ ...item, sortOrder: idx + 1 })));
    setPosOrderDirty(true);
  };

  const handleSavePositionOrder = async () => {
    if (!posOrderDirty || magangPositions.length === 0 || savingPosOrder) return;
    setSavingPosOrder(true);
    try {
      const res = await fetch('/api/cms/magang-positions/reorder', {
        method: 'PATCH',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ orderedIds: magangPositions.map((p) => p.id) }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        items?: MagangPositionItem[];
        message?: string;
      };
      if (res.ok && data.ok && Array.isArray(data.items)) {
        markLocalCommit();
        setMagangPositions(data.items);
        setPosOrderDirty(false);
        onPublicDataChanged();
        notify('Urutan posisi magang disimpan ke MariaDB.');
      } else {
        notify(data.message || 'Gagal menyimpan urutan posisi magang.');
      }
    } catch {
      notify('Tidak dapat terhubung ke server untuk menyimpan urutan.');
    } finally {
      setSavingPosOrder(false);
    }
  };

  const handleCancelPositionOrder = async () => {
    await loadAllCmsData();
    notify('Perubahan urutan posisi magang dibatalkan.');
  };

  const handleDeletePositionItem = async (id: number) => {
    const res = await fetch(`/api/cms/magang-positions/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      markLocalCommit();
      setConfirmDeletePositionId(null);
      await loadAllCmsData();
      onPublicDataChanged();
      notify('Posisi magang dihapus dari database.');
    }
  };

  // Magang Applications Inbox Handlers
  const handleUpdateApplicationStatus = async (
    id: number,
    status: MagangApplicationStatus
  ) => {
    setUpdatingAppStatusId(id);
    try {
      const res = await fetch(`/api/cms/magang-applications/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        markLocalCommit();
        setMagangApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
        setSelectedApplicant((prev) =>
          prev && prev.id === id ? { ...prev, status } : prev
        );
        notify('Status pendaftar magang diperbarui.');
      }
    } finally {
      setUpdatingAppStatusId(null);
    }
  };

  const handleDeleteApplication = async (id: number) => {
    const res = await fetch(`/api/cms/magang-applications/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      markLocalCommit();
      setConfirmDeleteAppId(null);
      if (selectedApplicant?.id === id) setSelectedApplicant(null);
      await loadAllCmsData();
      notify('Data pendaftar magang dihapus dari database.');
    }
  };

  const handleDownloadApplicantFile = async (
    fileId: string,
    fallbackName: string
  ) => {
    setDownloadingFileKey(fileId);
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/cms/magang-files/${encodeURIComponent(fileId)}`, {
        headers,
        credentials: 'include',
      });
      if (!res.ok) {
        notify('Gagal mengunduh berkas pendaftar.');
        return;
      }
      const disposition = res.headers.get('content-disposition') || '';
      const match = /filename="?([^"]+)"?/i.exec(disposition);
      const filename = match?.[1] || fallbackName || 'berkas-pendaftar';
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify('Tidak dapat mengunduh berkas pendaftar.');
    } finally {
      setDownloadingFileKey(null);
    }
  };

  const handleExportApplicationsCsv = () => {
    if (magangApplications.length === 0) return;
    const csvEscape = (val: string | null | undefined) =>
      `"${String(val || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const headers = [
      'Kode Pendaftaran',
      'Status',
      'Nama Lengkap',
      'Email',
      'Nomor Telepon',
      'Program Studi',
      'Fakultas',
      'Posisi Diminati',
      'Pemahaman P2B',
      'Alasan Tertarik',
      'Harapan Magang',
      'Tautan/Berkas CV',
      'Tautan/Berkas Portofolio',
      'Tanggal Daftar',
    ];
    const rows = magangApplications.map((a) => [
      a.registrationCode,
      a.status,
      a.fullName,
      a.email,
      a.phone,
      a.studyProgram,
      a.faculty,
      a.positionTitle,
      a.aboutP2b,
      a.interestReason,
      a.expectations,
      a.resumeFileName || a.resumeUrl,
      a.portfolioFileName || a.portfolioUrl,
      a.createdAt,
    ]);
    const csvContent =
      '\uFEFF' +
      [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pendaftar-magang-p2b-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify('Data pendaftar magang berhasil diekspor ke CSV.');
  };

  // Site Settings Handlers
  const updateSettingField = (key: keyof SiteSettings, value: string) => {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
    setSettingsDirty(true);
    setSettingsError('');
  };

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingHeroBg(true);
    setSettingsError('');
    try {
      markLocalCommit();
      const media = await uploadSingleMedia(file);
      updateSettingField('hero_image_url', media.url);
      await loadAllCmsData({ preserveDirtyEdits: true });
      notify('Gambar hero beranda berhasil diunggah.');
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : 'Gagal mengunggah gambar hero.'
      );
    } finally {
      setUploadingHeroBg(false);
    }
  };

  const handleUploadMagangHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingMagangHero(true);
    setSettingsError('');
    try {
      markLocalCommit();
      const media = await uploadSingleMedia(file);
      updateSettingField('page_magang_image', media.url);
      await loadAllCmsData({ preserveDirtyEdits: true });
      notify('Gambar hero halaman Magang berhasil diunggah ke pustaka media.');
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : 'Gagal mengunggah gambar hero magang.'
      );
    } finally {
      setUploadingMagangHero(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsError('');
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ settings: settingsForm }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        settings?: SiteSettings;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setSettingsError(data.message || 'Gagal menyimpan pengaturan situs.');
        return;
      }
      markLocalCommit();
      setSettingsDirty(false);
      if (data.settings) setSettingsForm(data.settings);
      await loadAllCmsData();
      onPublicDataChanged();
      notify('Pengaturan situs berhasil disimpan dan disinkronkan secara real-time.');
    } catch {
      setSettingsError('Tidak dapat terhubung ke server CMS.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'err', msg: 'Password baru minimal 6 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'err', msg: 'Konfirmasi password tidak cocok.' });
      return;
    }

    const res = await fetch('/api/cms/password', {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (res.ok && data.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus({ type: 'ok', msg: 'Password admin CMS berhasil diperbarui.' });
    } else {
      setPasswordStatus({
        type: 'err',
        msg: data.message || 'Gagal memperbarui password.',
      });
    }
  };

  const filteredNews = newsItems.filter((item) => {
    const q = newsSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const filteredNewsIds = filteredNews.map((item) => item.dbId);
  const allFilteredNewsSelected =
    filteredNewsIds.length > 0 &&
    filteredNewsIds.every((id) => selectedNewsIds.includes(id));

  const toggleSelectNews = (dbId: number) => {
    setConfirmBulkDeleteNews(false);
    setSelectedNewsIds((prev) =>
      prev.includes(dbId) ? prev.filter((id) => id !== dbId) : [...prev, dbId]
    );
  };

  const toggleSelectAllFilteredNews = () => {
    setConfirmBulkDeleteNews(false);
    if (allFilteredNewsSelected) {
      setSelectedNewsIds((prev) => prev.filter((id) => !filteredNewsIds.includes(id)));
    } else {
      setSelectedNewsIds((prev) => Array.from(new Set([...prev, ...filteredNewsIds])));
    }
  };

  const filteredMedia = mediaItems.filter((item) => {
    const isPdf = item.mimeType === 'application/pdf';
    if (mediaFilter === 'pdf' && !isPdf) return false;
    if (mediaFilter === 'image' && isPdf) return false;
    const q = mediaSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      item.originalName.toLowerCase().includes(q) ||
      (item.altText || '').toLowerCase().includes(q) ||
      item.mimeType.toLowerCase().includes(q)
    );
  });

  const tabs: { id: CmsTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Ringkasan', icon: 'mdi:view-grid-outline' },
    { id: 'news', label: 'Kelola Berita', icon: 'mdi:newspaper-variant-outline' },
    { id: 'media', label: 'Kelola Media', icon: 'mdi:folder-open-outline' },
    { id: 'logos', label: 'Logo Mitra', icon: 'mdi:office-building-outline' },
    { id: 'magang', label: 'Magang P2B', icon: 'mdi:school-outline' },
    { id: 'settings', label: 'Pengaturan Situs', icon: 'mdi:compass-outline' },
    { id: 'security', label: 'Keamanan Akun', icon: 'mdi:lock-outline' },
  ];

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#164234] p-3 md:p-5 flex flex-col items-center">
      <div className="w-full max-w-[1536px] flex flex-col gap-6">
        {/* Top CMS Dark Emerald Glass Header */}
        <header className="rounded-[1.5rem] md:rounded-[2.25rem] bg-[#0B261D] border border-[#C9A45A]/35 px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-[#FAF8F3]">
          <div className="flex items-center gap-4">
            <img
              src={LOGO_URL}
              alt="Logo P2B UIN Salatiga"
              referrerPolicy="no-referrer"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xs uppercase tracking-[0.16em] text-[#F4D993]">
                CMS Panel
              </span>
              <span className="text-sm text-[#FAF8F3]/90">
                {user.displayName} ({user.role})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onViewPublicSite}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-[#F4D993]/35 text-xs sm:text-sm text-[#FAF8F3] transition-colors cursor-pointer"
            >
              <span>Lihat Website</span>
              <Icon icon="mdi:open-in-new" className="w-3.5 h-3.5 text-[#F4D993]" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F3] hover:bg-white text-[#164234] text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Icon icon="mdi:logout" className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Notice Toast */}
        <AnimatePresence>
          {bannerNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl bg-[#164234] text-[#F6F3EC] border border-[#C9A45A]/40 px-5 py-3 flex items-center gap-2.5 text-sm"
            >
              <Icon icon="mdi:check" className="w-4 h-4 text-[#F4D993] shrink-0" />
              <span>{bannerNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {editorOpen ? (
          /* Dedicated Full-Page News Editor (TinyMCE · Multi Foto & Lampiran PDF) */
          <form
            id="news-editor-page-form"
            onSubmit={handleSaveNews}
            className="flex flex-col gap-6"
          >
            {/* Sticky/Top Action Header Card */}
            <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/80 backdrop-blur-xl border border-[#C9A45A]/35 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditorOpen(false);
                    setActiveTab('news');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#164234] hover:text-[#8F6D26] transition-colors cursor-pointer w-fit"
                >
                  <Icon icon="mdi:arrow-left" className="w-4 h-4" />
                  <span>Kembali ke Kelola Berita</span>
                </button>
                <span className="text-xs uppercase tracking-wider text-[#8F6D26] pt-1">
                  Editor Berita TinyMCE · Multi Foto & Lampiran PDF
                </span>
                <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#164234]">
                  {editingItem ? 'Edit Berita' : 'Tambah Berita Baru'}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditorOpen(false);
                    setActiveTab('news');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.15)] text-[#164234] text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingNews || uploadingTarget !== null}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] disabled:opacity-60 text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <Icon icon="mdi:check" className="w-4 h-4 text-[#F4D993]" />
                  <span>{savingNews ? 'Menyimpan...' : 'Simpan Berita'}</span>
                </button>
              </div>
            </div>

            {editorError && (
              <div
                role="alert"
                className="px-5 py-3 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs sm:text-sm text-[#9b2c2c]"
              >
                {editorError}
              </div>
            )}

            {/* Foto Sampul Utama — Paling Atas */}
            <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-7 flex flex-col gap-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Foto Sampul Utama
                    </span>
                    <span className="text-xs text-[#3E544B]">
                      Tampil di kartu berita, hero halaman detail, dan OpenGraph saat dibagikan.
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs transition-colors cursor-pointer">
                    <Icon icon="mdi:upload-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                    <span>
                      {uploadingTarget === 'cover' ? 'Mengunggah...' : 'Unggah Sampul'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingTarget !== null}
                      onChange={(e) => void handleUploadCoverFile(e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <label className="inline-flex items-center gap-2 text-xs text-[#164234] cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={formUseLogo}
                    onChange={(e) => setFormUseLogo(e.target.checked)}
                    className="w-4 h-4 accent-[#164234]"
                  />
                  <span>Gunakan logo placeholder UIN Salatiga</span>
                </label>

                {!formUseLogo && (
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="URL gambar sampul atau unggah file di samping..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                )}
              </div>

              <div className="lg:col-span-5">
                {!formUseLogo ? (
                  formImage.trim() ? (
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[#C9A45A]/30 bg-[#EAE5D7]">
                      <img
                        src={formImage}
                        alt="Pratinjau sampul"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] rounded-2xl border border-dashed border-[#C9A45A]/45 bg-[#FAF8F3] flex items-center justify-center p-4 text-center text-xs text-[#8F6D26]">
                      Belum ada foto sampul dipilih. Unggah file atau masukkan URL gambar.
                    </div>
                  )
                ) : (
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[#C9A45A]/25 bg-gradient-to-br from-[#F4EFE3] via-[#EAE5D7] to-[#D9E2DA] flex items-center justify-center p-6">
                    <img
                      src={NEWS_PLACEHOLDER_LOGO}
                      alt="Logo Placeholder UIN Salatiga"
                      referrerPolicy="no-referrer"
                      className="max-h-20 w-auto object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Main Authoring Column */}
              <div className="xl:col-span-8 flex flex-col gap-6">
                <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Judul Berita
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Masukkan judul berita..."
                      className="px-4 py-3 rounded-2xl bg-white border border-[#C9A45A]/30 text-base text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Ringkasan Singkat
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formExcerpt}
                      onChange={(e) => setFormExcerpt(e.target.value)}
                      placeholder="Ringkasan yang tampil pada kartu berita dan pratinjau OpenGraph..."
                      className="px-4 py-3 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234] resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Isi Berita Lengkap (Editor TinyMCE — teks bebas, gambar sisipan, tautan, tabel & perataan)
                    </label>
                    <TinyMceEditor
                      editorKey={editorSessionKey}
                      value={formContentHtml}
                      onChange={setFormContentHtml}
                      authToken={token}
                    />
                  </div>
                </div>

                {/* Dokumentasi Foto (> 1 Foto) */}
                <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-7 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:image-multiple-outline" className="w-4 h-4 text-[#8F6D26]" />
                      <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                        Galeri Dokumentasi Foto ({formGallery.length} Foto)
                      </span>
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs transition-colors cursor-pointer">
                      <Icon icon="mdi:image-plus-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>
                        {uploadingTarget === 'gallery'
                          ? 'Mengunggah Foto...'
                          : 'Unggah Banyak Foto'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingTarget !== null}
                        onChange={(e) => void handleUploadGalleryFiles(e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="Atau tempel URL foto dokumentasi (https://...)..."
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="px-4 py-2.5 rounded-2xl bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      + Tambah URL Foto
                    </button>
                  </div>

                  {formGallery.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {formGallery.map((photo, idx) => (
                        <div
                          key={`${photo.url}-${idx}`}
                          className="rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/25 p-3 flex items-start gap-3"
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || `Dokumentasi ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-20 h-16 rounded-lg object-cover border border-[#C9A45A]/25 shrink-0"
                          />
                          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                            <input
                              type="text"
                              value={photo.caption || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormGallery((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, caption: val } : item
                                  )
                                );
                              }}
                              placeholder={`Keterangan foto #${idx + 1} (opsional)`}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#C9A45A]/25 text-xs text-[#164234] focus:outline-none"
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveGalleryItem(idx, -1)}
                                aria-label="Geser naik"
                                className="p-1 rounded-md bg-white border border-[#C9A45A]/25 text-[#164234] disabled:opacity-35 cursor-pointer"
                              >
                                <Icon icon="mdi:arrow-up" className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === formGallery.length - 1}
                                onClick={() => handleMoveGalleryItem(idx, 1)}
                                aria-label="Geser turun"
                                className="p-1 rounded-md bg-white border border-[#C9A45A]/25 text-[#164234] disabled:opacity-35 cursor-pointer"
                              >
                                <Icon icon="mdi:arrow-down" className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormGallery((prev) =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-[11px] transition-colors cursor-pointer"
                              >
                                <Icon icon="mdi:trash-can-outline" className="w-3 h-3" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lampiran Dokumen PDF */}
                <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-7 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:paperclip" className="w-4 h-4 text-[#8F6D26]" />
                      <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                        Lampiran Dokumen PDF ({formAttachments.length} File)
                      </span>
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs transition-colors cursor-pointer">
                      <Icon icon="mdi:file-document-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>
                        {uploadingTarget === 'pdf'
                          ? 'Mengunggah PDF...'
                          : 'Unggah File PDF'}
                      </span>
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        disabled={uploadingTarget !== null}
                        onChange={(e) => void handleUploadPdfFiles(e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={newPdfTitle}
                      onChange={(e) => setNewPdfTitle(e.target.value)}
                      placeholder="Judul dokumen PDF..."
                      className="sm:col-span-5 px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                    <input
                      type="url"
                      value={newPdfUrl}
                      onChange={(e) => setNewPdfUrl(e.target.value)}
                      placeholder="Atau URL file PDF (https://...)..."
                      className="sm:col-span-5 px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddPdfUrl}
                      className="sm:col-span-2 px-4 py-2.5 rounded-2xl bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      + Tambah PDF
                    </button>
                  </div>

                  {formAttachments.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1">
                      {formAttachments.map((att, idx) => (
                        <div
                          key={att.id || idx}
                          className="rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/25 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <Icon icon="mdi:file-document-outline" className="w-4 h-4 text-[#8F6D26] shrink-0" />
                            <input
                              type="text"
                              value={att.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormAttachments((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, title: val } : item
                                  )
                                );
                              }}
                              className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-[#C9A45A]/25 text-xs text-[#164234] focus:outline-none min-w-0"
                            />
                            {att.sizeBytes && (
                              <span className="text-[11px] text-[#3E544B] whitespace-nowrap">
                                {formatBytes(att.sizeBytes)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#164234] underline underline-offset-2"
                            >
                              Buka
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                setFormAttachments((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-[11px] transition-colors cursor-pointer"
                            >
                              <Icon icon="mdi:trash-can-outline" className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar Column: Kategori & Tanggal Otomatis */}
              <div className="xl:col-span-4 flex flex-col gap-6 xl:sticky xl:top-5">
                <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-7 flex flex-col gap-4">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Pengaturan Publikasi
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-[#3E544B]">Kategori Berita</label>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryError('');
                          setCategoryModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#8F6D26] hover:text-[#164234] underline underline-offset-2 cursor-pointer"
                      >
                        <Icon icon="mdi:tag-outline" className="w-3 h-3" />
                        <span>Kelola Kategori</span>
                      </button>
                    </div>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    >
                      {newsCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                      {formCategory &&
                        !newsCategories.some((c) => c.name === formCategory) && (
                          <option value={formCategory}>{formCategory}</option>
                        )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#3E544B]">Tanggal Upload</span>
                    <div className="px-4 py-2.5 rounded-2xl bg-[#F6F3EC]/90 border border-[#C9A45A]/25 text-xs sm:text-sm text-[#164234] flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {editingItem ? editingItem.date : getAutoTodayLabel()}
                      </span>
                      <span className="text-[11px] text-[#8F6D26]">
                        {editingItem ? 'Tercatat otomatis' : 'Otomatis hari ini'}
                      </span>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-[#164234] cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formPublished}
                      onChange={(e) => setFormPublished(e.target.checked)}
                      className="w-4 h-4 accent-[#164234]"
                    />
                    <span>Publikasikan berita di website utama</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <>
            {/* Tabs Navigation */}
            <nav
              aria-label="Menu navigasi CMS"
              className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 overflow-x-auto"
            >
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-normal whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#164234] text-[#F6F3EC]'
                        : 'text-[#3E544B] hover:text-[#164234] hover:bg-[#F6F3EC]'
                    }`}
                  >
                    <Icon icon={tab.icon} className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Tab Views */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  <div className="rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-[#C9A45A]/30 p-6 flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Total Berita
                    </span>
                    <span className="text-3xl font-normal tabular-nums text-[#164234]">
                      {stats?.totalNews ?? newsItems.length}
                    </span>
                    <span className="text-xs text-[#3E544B]">
                      {stats?.publishedNews ?? newsItems.filter((n) => n.isPublished).length}{' '}
                      artikel tayang di website
                    </span>
                  </div>

                  <div className="rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-[#C9A45A]/30 p-6 flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      Media & Dokumen
                    </span>
                    <span className="text-3xl font-normal tabular-nums text-[#164234]">
                      {mediaItems.length}
                    </span>
                    <span className="text-xs text-[#3E544B]">
                      {mediaItems.filter((m) => m.mimeType === 'application/pdf').length} file PDF tersimpan
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-[rgba(201,164,90,0.18)] border border-[#C9A45A]/40 flex items-center justify-center shrink-0">
                      <Icon icon="mdi:database-outline" className="w-5 h-5 text-[#164234]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                        Koneksi Basis Data Aktif
                      </span>
                      <h2 className="text-lg sm:text-xl font-normal text-[#164234]">
                        {dbInfo?.version || 'MariaDB Server'} · Database `{dbInfo?.name || 'p2b'}`
                      </h2>
                      <p className="text-xs sm:text-sm text-[#3E544B]">
                        Host: {dbInfo?.host || 'Configured'} : {dbInfo?.port || '—'} · Kredensial tersimpan aman di environment server.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('news')}
                    className="px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Kelola Artikel Sekarang
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-5">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 border border-[#C9A45A]/30 w-full xl:w-80">
                    <Icon icon="mdi:magnify" className="w-4 h-4 text-[#B89242] shrink-0" />
                    <input
                      type="search"
                      value={newsSearch}
                      onChange={(e) => setNewsSearch(e.target.value)}
                      placeholder="Cari judul atau kategori..."
                      className="w-full bg-transparent text-sm text-[#164234] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={exportingNews}
                      onClick={() => void handleExportNewsBundle()}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Icon icon="mdi:file-download-outline" className="w-4 h-4 text-[#B89242]" />
                      <span>{exportingNews ? 'Mengekspor...' : 'Export Semua + Media'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewsImportError('');
                        setNewsImportFile(null);
                        setNewsImportOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:file-upload-outline" className="w-4 h-4 text-[#B89242]" />
                      <span>Import Berita + Media</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCategoryError('');
                        setCategoryModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:tag-outline" className="w-4 h-4 text-[#B89242]" />
                      <span>Kelola Kategori ({newsCategories.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={openCreateNewsModal}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
                    >
                      <Icon icon="mdi:plus" className="w-4 h-4 text-[#F4D993]" />
                      <span>Tambah Berita Baru</span>
                    </button>
                  </div>
                </div>

                {/* Multi-select / Select All Toolbar */}
                <div className="rounded-2xl bg-[#FAF8F3]/90 border border-[#C9A45A]/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-[#164234] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allFilteredNewsSelected}
                        onChange={toggleSelectAllFilteredNews}
                        className="w-4 h-4 rounded accent-[#164234] cursor-pointer"
                      />
                      <span>
                        {allFilteredNewsSelected ? 'Batal Pilih Semua' : 'Pilih Semua'} ({filteredNews.length})
                      </span>
                    </label>

                    {selectedNewsIds.length > 0 && (
                      <span className="text-xs text-[#8F6D26] font-medium">
                        {selectedNewsIds.length} berita dipilih
                      </span>
                    )}
                  </div>

                  {selectedNewsIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={exportingNews}
                        onClick={() => void handleExportSelectedNews()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <Icon icon="mdi:file-download-outline" className="w-3.5 h-3.5 text-[#B89242]" />
                        <span>Export Terpilih ({selectedNewsIds.length})</span>
                      </button>

                      {!confirmBulkDeleteNews ? (
                        <button
                          type="button"
                          onClick={() => setConfirmBulkDeleteNews(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-xs transition-colors cursor-pointer"
                        >
                          <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />
                          <span>Hapus Terpilih ({selectedNewsIds.length})</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={deletingBulkNews}
                            onClick={() => void handleBulkDeleteNews()}
                            className="px-4 py-2 rounded-full bg-[#9b2c2c] hover:bg-[#7f2323] text-white text-xs cursor-pointer disabled:opacity-60"
                          >
                            {deletingBulkNews
                              ? 'Menghapus...'
                              : `Ya, Hapus ${selectedNewsIds.length} Berita`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmBulkDeleteNews(false)}
                            className="px-3.5 py-2 rounded-full bg-white border border-[#C9A45A]/30 text-[#164234] text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNewsIds([]);
                          setConfirmBulkDeleteNews(false);
                        }}
                        className="px-3 py-2 rounded-full text-xs text-[#3E544B] hover:text-[#164234] cursor-pointer"
                      >
                        Bersihkan Pilihan
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {filteredNews.map((item) => {
                    const isSelected = selectedNewsIds.includes(item.dbId);
                    return (
                      <div
                        key={item.dbId}
                        className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                          isSelected
                            ? 'bg-[#F4EFE3] border-[#164234]/50'
                            : 'bg-white/80 border-[#C9A45A]/25'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 max-w-3xl">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectNews(item.dbId)}
                            aria-label={`Pilih berita ${item.title}`}
                            className="mt-1.5 w-4 h-4 rounded accent-[#164234] cursor-pointer shrink-0"
                          />

                          <div className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-[#8F6D26]">{item.category}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#3E544B]">{item.date}</span>
                              <span aria-hidden="true">·</span>
                              <span
                                className={
                                  item.isPublished ? 'text-[#164234]' : 'text-[#9b2c2c]'
                                }
                              >
                                {item.isPublished ? 'Tayang' : 'Draf'}
                              </span>
                              {item.gallery && item.gallery.length > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-[#8F6D26]">
                                    {item.gallery.length} Foto Dokumentasi
                                  </span>
                                </>
                              )}
                              {item.attachments && item.attachments.length > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-[#164234]">
                                    {item.attachments.length} Lampiran PDF
                                  </span>
                                </>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-normal text-[#164234]">
                              {item.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#3E544B] line-clamp-1">
                              {item.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0 pl-7 md:pl-0">
                          <button
                            type="button"
                            onClick={() => void handleExportNewsBundle(item)}
                            title="Export berita ini beserta media terkait"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/30 text-xs transition-colors cursor-pointer"
                          >
                            <Icon icon="mdi:file-download-outline" className="w-3.5 h-3.5" />
                            <span>Export</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditNewsModal(item)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs transition-colors cursor-pointer"
                          >
                            <Icon icon="mdi:pencil-outline" className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteNews(item.dbId)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-xs transition-colors cursor-pointer"
                          >
                            <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

        {activeTab === 'media' && (
          <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                Pustaka Media MariaDB ({mediaItems.length} Berkas)
              </span>
              <h2 className="text-2xl font-normal text-[#164234]">
                Manajemen Foto & Dokumen PDF
              </h2>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 border border-[#C9A45A]/30 w-full sm:w-72">
                  <Icon icon="mdi:magnify" className="w-4 h-4 text-[#B89242] shrink-0" />
                  <input
                    type="search"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="Cari nama berkas atau alt text..."
                    className="w-full bg-transparent text-sm text-[#164234] focus:outline-none"
                  />
                </div>

                <div className="inline-flex items-center p-1 rounded-full bg-white/80 border border-[#C9A45A]/30">
                  {(
                    [
                      { id: 'all', label: 'Semua' },
                      { id: 'image', label: 'Gambar' },
                      { id: 'pdf', label: 'PDF' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setMediaFilter(f.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                        mediaFilter === f.id
                          ? 'bg-[#164234] text-[#F6F3EC]'
                          : 'text-[#3E544B] hover:text-[#164234]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={exportingMedia || mediaItems.length === 0}
                  onClick={() => void handleExportMediaBundle()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Icon icon="mdi:file-download-outline" className="w-4 h-4 text-[#B89242]" />
                  <span>{exportingMedia ? 'Mengekspor...' : 'Export Media'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMediaImportError('');
                    setMediaImportFile(null);
                    setMediaImportOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <Icon icon="mdi:file-upload-outline" className="w-4 h-4 text-[#B89242]" />
                  <span>Import Media</span>
                </button>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer">
                  <Icon icon="mdi:upload-outline" className="w-4 h-4 text-[#F4D993]" />
                  <span>
                    {uploadingLibraryMedia ? 'Mengunggah...' : 'Tambah Media'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    disabled={uploadingLibraryMedia}
                    onChange={(e) => void handleUploadLibraryMedia(e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {filteredMedia.length === 0 ? (
              <div className="rounded-2xl bg-white/70 border border-[#C9A45A]/25 p-8 text-center text-sm text-[#3E544B]">
                Belum ada media yang sesuai filter. Klik &ldquo;Tambah Media&rdquo; untuk mengunggah gambar atau PDF, atau gunakan &ldquo;Import Media&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedia.map((item) => {
                  const isPdf = item.mimeType === 'application/pdf';
                  const isConfirmDelete = confirmDeleteMediaId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white/85 border border-[#C9A45A]/25 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-[16/10] bg-gradient-to-br from-[#F4EFE3] to-[#E5ECE6] flex items-center justify-center overflow-hidden relative border-b border-[#C9A45A]/20">
                        {isPdf ? (
                          <div className="flex flex-col items-center gap-2 p-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[rgba(201,164,90,0.2)] border border-[#C9A45A]/40 flex items-center justify-center">
                              <Icon icon="mdi:file-document-outline" className="w-6 h-6 text-[#164234]" />
                            </div>
                            <span className="text-xs text-[#8F6D26] uppercase tracking-wider">
                              Dokumen PDF
                            </span>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.altText || item.originalName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                        <div className="flex flex-col gap-1">
                          <h3
                            title={item.originalName}
                            className="text-sm font-medium text-[#164234] truncate"
                          >
                            {item.originalName}
                          </h3>
                          {item.altText && (
                            <p className="text-xs text-[#3E544B] line-clamp-1">
                              Alt: {item.altText}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[11px] text-[#8F6D26]">
                            <span>{item.mimeType}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatBytes(item.sizeBytes)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#C9A45A]/20">
                          <button
                            type="button"
                            onClick={() => void handleCopyMediaUrl(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-[11px] transition-colors cursor-pointer"
                          >
                            {copiedMediaId === item.id ? (
                              <>
                                <Icon icon="mdi:check" className="w-3 h-3" />
                                <span>Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Icon icon="mdi:content-copy" className="w-3 h-3" />
                                <span>Salin URL</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`${item.url}?download=1`}
                            download={item.originalName}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-[11px] transition-colors"
                          >
                            <Icon icon="mdi:download-outline" className="w-3 h-3" />
                            <span>Unduh</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => openEditMediaModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-[11px] transition-colors cursor-pointer"
                          >
                            <Icon icon="mdi:pencil-outline" className="w-3 h-3" />
                            <span>Update</span>
                          </button>

                          {!isConfirmDelete ? (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteMediaId(item.id)}
                              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-[11px] transition-colors cursor-pointer"
                            >
                              <Icon icon="mdi:trash-can-outline" className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          ) : (
                            <div className="ml-auto flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => void handleDeleteMedia(item.id)}
                                className="px-2 py-1 rounded-lg bg-[#9b2c2c] text-white text-[11px] cursor-pointer"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteMediaId(null)}
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
        )}

        {activeTab === 'logos' && (
          <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Marquee Beranda Dinamis MariaDB ({partnerLogos.filter((l) => l.isActive).length} Aktif · {partnerLogos.length} Total)
                </span>
                <h2 className="text-2xl font-normal text-[#164234]">
                  Kelola Logo Mitra &amp; Unit Usaha
                </h2>
                <p className="text-xs sm:text-sm text-[#3E544B]">
                  Logo berjalan yang tampil tepat di bawah bagian Hero halaman utama. Unggah SVG/PNG/WebP transparan untuk hasil terbaik.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {logoOrderDirty && (
                  <button
                    type="button"
                    disabled={savingLogoOrder}
                    onClick={() => void handleCancelLogoOrder()}
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F6F3EC] text-[#3E544B] border border-[#C9A45A]/35 text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    Batalkan Urutan
                  </button>
                )}

                <button
                  type="button"
                  disabled={!logoOrderDirty || savingLogoOrder}
                  onClick={() => void handleSaveLogoOrder()}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    logoOrderDirty
                      ? 'bg-[#8F6D26] hover:bg-[#7A5B1D] text-[#FAF8F3] cursor-pointer shadow-sm'
                      : 'bg-white/80 text-[#3E544B]/60 border border-[#C9A45A]/25 cursor-not-allowed'
                  }`}
                >
                  <Icon icon="mdi:check" className="w-4 h-4" />
                  <span>{savingLogoOrder ? 'Menyimpan Urutan...' : 'Simpan Urutan'}</span>
                </button>

                <button
                  type="button"
                  onClick={openCreateLogoModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Icon icon="mdi:plus" className="w-4 h-4 text-[#F4D993]" />
                  <span>Tambah Logo</span>
                </button>
              </div>
            </div>

            {logoOrderDirty && (
              <div className="rounded-2xl bg-[#F4EFE3] border border-[#C9A45A]/45 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#164234]">
                <span>
                  Urutan logo telah diubah. Klik <strong>Simpan Urutan</strong> agar diterapkan pada marquee beranda.
                </span>
                <button
                  type="button"
                  disabled={savingLogoOrder}
                  onClick={() => void handleSaveLogoOrder()}
                  className="px-4 py-1.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs whitespace-nowrap cursor-pointer w-fit"
                >
                  {savingLogoOrder ? 'Menyimpan...' : 'Simpan Sekarang'}
                </button>
              </div>
            )}

            {partnerLogos.length === 0 ? (
              <div className="rounded-2xl bg-white/70 border border-[#C9A45A]/25 p-8 text-center text-sm text-[#3E544B]">
                Belum ada logo mitra atau unit usaha. Klik &ldquo;Tambah Logo&rdquo; untuk menampilkan deretan logo di bawah header beranda.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {partnerLogos.map((logo, index) => {
                  const isConfirmDelete = confirmDeleteLogoId === logo.id;
                  return (
                    <div
                      key={logo.id}
                      className="rounded-2xl bg-white/85 border border-[#C9A45A]/25 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-xs tabular-nums font-medium text-[#8F6D26]">
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0 || savingLogoOrder}
                              onClick={() => handleMoveLogo(index, -1)}
                              title="Naikkan urutan"
                              className="w-7 h-7 rounded-lg bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 flex items-center justify-center disabled:opacity-35 cursor-pointer transition-colors"
                            >
                              <Icon icon="mdi:arrow-up" className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === partnerLogos.length - 1 || savingLogoOrder}
                              onClick={() => handleMoveLogo(index, 1)}
                              title="Turunkan urutan"
                              className="w-7 h-7 rounded-lg bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 flex items-center justify-center disabled:opacity-35 cursor-pointer transition-colors"
                            >
                              <Icon icon="mdi:arrow-down" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="w-28 h-16 rounded-xl bg-[#F6F3EC] border border-[#C9A45A]/30 px-3 py-2 shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={logo.logoUrl}
                            alt={logo.name}
                            referrerPolicy="no-referrer"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-[#8F6D26]">
                            <span className={logo.isActive ? 'text-[#164234]' : 'text-[#9b2c2c]'}>
                              {logo.isActive ? 'Aktif di Beranda' : 'Disembunyikan'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums text-[#3E544B]">
                              Urutan DB: {logo.sortOrder}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-normal text-[#164234] truncate">
                            {logo.name}
                          </h3>
                          {logo.linkUrl ? (
                            <span className="text-xs text-[#3E544B] truncate flex items-center gap-1">
                              <Icon icon="mdi:link-variant" className="w-3 h-3 shrink-0 text-[#8F6D26]" />
                              <span className="truncate">{logo.linkUrl}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-[#3E544B]/70 truncate">
                              Tanpa tautan eksternal
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0 pl-12 md:pl-0">
                        <button
                          type="button"
                          onClick={() => void handleToggleLogoActive(logo)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 text-xs transition-colors cursor-pointer"
                        >
                          {logo.isActive ? <Icon icon="mdi:eye-off-outline" className="w-3.5 h-3.5" /> : <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />}
                          <span>{logo.isActive ? 'Sembunyikan' : 'Tampilkan'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditLogoModal(logo)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs transition-colors cursor-pointer"
                        >
                          <Icon icon="mdi:pencil-outline" className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {!isConfirmDelete ? (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteLogoId(logo.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-xs transition-colors cursor-pointer"
                          >
                            <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => void handleDeleteLogo(logo.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#9b2c2c] text-white text-xs cursor-pointer"
                            >
                              Ya, Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteLogoId(null)}
                              className="px-3 py-1.5 rounded-xl bg-[#F6F3EC] text-[#164234] text-xs cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'magang' && (
          <div className="flex flex-col gap-6">
            {/* Panel 0: Hero & Jadwal Khusus Halaman Magang (Eksklusif di Tab Magang) */}
            <form
              onSubmit={handleSaveSettings}
              className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C9A45A]/20 pb-5">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Eksklusif Halaman /magang · Sinkron Real-Time MariaDB
                  </span>
                  <h2 className="text-xl sm:text-2xl font-normal text-[#164234]">
                    Hero &amp; Pengaturan Program Magang
                  </h2>
                  <p className="text-xs sm:text-sm text-[#3E544B]">
                    Atur gambar hero khusus halaman Magang, teks pengantar, batas akhir pendaftaran, dan periode magang langsung dari modul ini.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {settingsDirty && (
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => {
                        setSettingsDirty(false);
                        void loadAllCmsData();
                      }}
                      className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F6F3EC] text-[#3E544B] border border-[#C9A45A]/35 text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Batalkan
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingSettings || uploadingMagangHero}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] disabled:opacity-60 text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Icon icon="mdi:check" className="w-4 h-4 text-[#F4D993]" />
                    <span>{savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Magang'}</span>
                  </button>
                </div>
              </div>

              {settingsError && (
                <div
                  role="alert"
                  className="px-4 py-3 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs sm:text-sm text-[#9b2c2c]"
                >
                  {settingsError}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Hero Image Preview & Upload */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[#C9A45A]/30 bg-[#EAE5D7]">
                    <img
                      src={settingsForm.page_magang_image?.trim() || DEFAULT_MAGANG_HERO_IMAGE}
                      alt="Pratinjau Gambar Hero Halaman Magang"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs cursor-pointer transition-colors">
                      <Icon icon="mdi:upload-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>
                        {uploadingMagangHero ? 'Mengunggah...' : 'Unggah Gambar Hero Magang'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingMagangHero}
                        onChange={(e) => void handleUploadMagangHeroImage(e)}
                        className="hidden"
                      />
                    </label>
                    {settingsForm.page_magang_image && (
                      <button
                        type="button"
                        onClick={() => updateSettingField('page_magang_image', '')}
                        className="px-3.5 py-2 rounded-full bg-[#F6F3EC] hover:bg-[#EAE3D2] text-[#9b2c2c] text-xs cursor-pointer transition-colors"
                      >
                        Reset ke Bawaan
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={settingsForm.page_magang_image || ''}
                    onChange={(e) => updateSettingField('page_magang_image', e.target.value)}
                    placeholder="Kosongkan untuk default (/assets/magang/hero_team.jpg) atau /api/media/..."
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />

                  {mediaItems.some((m) => m.mimeType.startsWith('image/')) && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-[#3E544B]">
                        Pilih cepat gambar hero dari Pustaka Media:
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {mediaItems
                          .filter((m) => m.mimeType.startsWith('image/'))
                          .slice(0, 12)
                          .map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => updateSettingField('page_magang_image', m.url)}
                              title={m.originalName}
                              className={`w-16 h-12 rounded-xl bg-white border overflow-hidden shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                                settingsForm.page_magang_image === m.url
                                  ? 'border-[#164234] ring-2 ring-[#164234]/20'
                                  : 'border-[#C9A45A]/25 hover:border-[#164234]/60'
                              }`}
                            >
                              <img
                                src={m.url}
                                alt={m.originalName}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Magang Hero Copy & Recruitment Schedule */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">Label Atas Hero (Eyebrow)</label>
                    <input
                      type="text"
                      value={settingsForm.page_magang_eyebrow || ''}
                      onChange={(e) => updateSettingField('page_magang_eyebrow', e.target.value)}
                      placeholder="Open Recruitment · Talenta Mahasiswa"
                      className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">Subjudul Hero Halaman Magang</label>
                    <textarea
                      rows={3}
                      value={settingsForm.page_magang_subtitle || ''}
                      onChange={(e) => updateSettingField('page_magang_subtitle', e.target.value)}
                      placeholder="Pusat Pengembangan Bisnis (P2B) UIN Salatiga membuka kesempatan magang..."
                      className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">Batas Akhir Pendaftaran</label>
                    <input
                      type="text"
                      value={settingsForm.magang_deadline || ''}
                      onChange={(e) => updateSettingField('magang_deadline', e.target.value)}
                      placeholder="Kamis, 22 Oktober 2026"
                      className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">Periode Program Magang</label>
                    <input
                      type="text"
                      value={settingsForm.magang_period || ''}
                      onChange={(e) => updateSettingField('magang_period', e.target.value)}
                      placeholder="Sampai dengan 30 April 2027"
                      className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Panel 1: Galeri Foto Anak Magang */}
            <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Galeri Foto Dinamis ({magangGallery.filter((g) => g.isActive).length} Aktif · {magangGallery.length} Total)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-normal text-[#164234]">
                    Galeri Foto Anak Magang
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3E544B]">
                    Atur dokumentasi kegiatan mahasiswa magang yang tampil pada bagian atas halaman /magang.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {galleryOrderDirty && (
                    <button
                      type="button"
                      disabled={savingGalleryOrder}
                      onClick={() => void handleCancelGalleryOrder()}
                      className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F6F3EC] text-[#3E544B] border border-[#C9A45A]/35 text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      Batalkan Urutan
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!galleryOrderDirty || savingGalleryOrder}
                    onClick={() => void handleSaveGalleryOrder()}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      galleryOrderDirty
                        ? 'bg-[#8F6D26] hover:bg-[#7A5B1D] text-[#FAF8F3] cursor-pointer shadow-sm'
                        : 'bg-white/80 text-[#3E544B]/60 border border-[#C9A45A]/25 cursor-not-allowed'
                    }`}
                  >
                    <Icon icon="mdi:check" className="w-4 h-4" />
                    <span>{savingGalleryOrder ? 'Menyimpan...' : 'Simpan Urutan'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={openCreateGalleryModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Icon icon="mdi:plus" className="w-4 h-4 text-[#F4D993]" />
                    <span>Tambah Foto Galeri</span>
                  </button>
                </div>
              </div>

              {galleryOrderDirty && (
                <div className="rounded-2xl bg-[#F4EFE3] border border-[#C9A45A]/45 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#164234]">
                  <span>
                    Urutan galeri foto telah diubah. Klik <strong>Simpan Urutan</strong> agar diterapkan ke halaman Magang.
                  </span>
                  <button
                    type="button"
                    disabled={savingGalleryOrder}
                    onClick={() => void handleSaveGalleryOrder()}
                    className="px-4 py-1.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs whitespace-nowrap cursor-pointer w-fit"
                  >
                    {savingGalleryOrder ? 'Menyimpan...' : 'Simpan Sekarang'}
                  </button>
                </div>
              )}

              {magangGallery.length === 0 ? (
                <div className="rounded-2xl bg-white/70 border border-[#C9A45A]/25 p-8 text-center text-sm text-[#3E544B]">
                  Belum ada foto galeri anak magang. Klik &ldquo;Tambah Foto Galeri&rdquo; untuk menambahkan dokumentasi.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {magangGallery.map((item, index) => {
                    const isConfirmDelete = confirmDeleteGalleryId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white/85 border border-[#C9A45A]/25 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <span className="text-xs tabular-nums font-medium text-[#8F6D26]">
                              #{String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0 || savingGalleryOrder}
                                onClick={() => handleMoveGalleryOrder(index, -1)}
                                title="Naikkan urutan"
                                className="w-7 h-7 rounded-lg bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 flex items-center justify-center disabled:opacity-35 cursor-pointer transition-colors"
                              >
                                <Icon icon="mdi:arrow-up" className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === magangGallery.length - 1 || savingGalleryOrder}
                                onClick={() => handleMoveGalleryOrder(index, 1)}
                                title="Turunkan urutan"
                                className="w-7 h-7 rounded-lg bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 flex items-center justify-center disabled:opacity-35 cursor-pointer transition-colors"
                              >
                                <Icon icon="mdi:arrow-down" className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="w-28 h-20 rounded-xl bg-[#EAE5D7] border border-[#C9A45A]/30 shrink-0 overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.altText || item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-[#8F6D26]">
                              <span className={item.isActive ? 'text-[#164234]' : 'text-[#9b2c2c]'}>
                                {item.isActive ? 'Tampil di Halaman Magang' : 'Disembunyikan'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums text-[#3E544B]">
                                Urutan DB: {item.sortOrder}
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-normal text-[#164234] truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-[#3E544B] line-clamp-2">
                              {item.caption || 'Tanpa keterangan singkat'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0 pl-12 md:pl-0">
                          <button
                            type="button"
                            onClick={() => void handleToggleGalleryActive(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 text-xs transition-colors cursor-pointer"
                          >
                            {item.isActive ? (
                              <Icon icon="mdi:eye-off-outline" className="w-3.5 h-3.5" />
                            ) : (
                              <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
                            )}
                            <span>{item.isActive ? 'Sembunyikan' : 'Tampilkan'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditGalleryModal(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs transition-colors cursor-pointer"
                          >
                            <Icon icon="mdi:pencil-outline" className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {!isConfirmDelete ? (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteGalleryId(item.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-xs transition-colors cursor-pointer"
                            >
                              <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => void handleDeleteGalleryItem(item.id)}
                                className="px-3 py-1.5 rounded-xl bg-[#9b2c2c] text-white text-xs cursor-pointer"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteGalleryId(null)}
                                className="px-3 py-1.5 rounded-xl bg-[#F6F3EC] text-[#164234] text-xs cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panel 2: Posisi Magang */}
            <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Open Recruitment ({magangPositions.filter((p) => p.isActive).length} Aktif · {magangPositions.length} Total)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-normal text-[#164234]">
                    Posisi Magang P2B
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3E544B]">
                    Kelola kartu posisi magang (judul, divisi, foto sampul, deskripsi, dan poin tugas).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {posOrderDirty && (
                    <button
                      type="button"
                      disabled={savingPosOrder}
                      onClick={() => void handleCancelPositionOrder()}
                      className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F6F3EC] text-[#3E544B] border border-[#C9A45A]/35 text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      Batalkan Urutan
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!posOrderDirty || savingPosOrder}
                    onClick={() => void handleSavePositionOrder()}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      posOrderDirty
                        ? 'bg-[#8F6D26] hover:bg-[#7A5B1D] text-[#FAF8F3] cursor-pointer shadow-sm'
                        : 'bg-white/80 text-[#3E544B]/60 border border-[#C9A45A]/25 cursor-not-allowed'
                    }`}
                  >
                    <Icon icon="mdi:check" className="w-4 h-4" />
                    <span>{savingPosOrder ? 'Menyimpan...' : 'Simpan Urutan'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={openCreatePositionModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Icon icon="mdi:plus" className="w-4 h-4 text-[#F4D993]" />
                    <span>Tambah Posisi</span>
                  </button>
                </div>
              </div>

              {posOrderDirty && (
                <div className="rounded-2xl bg-[#F4EFE3] border border-[#C9A45A]/45 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#164234]">
                  <span>
                    Urutan posisi magang telah diubah. Klik <strong>Simpan Urutan</strong> agar diterapkan ke halaman Magang.
                  </span>
                  <button
                    type="button"
                    disabled={savingPosOrder}
                    onClick={() => void handleSavePositionOrder()}
                    className="px-4 py-1.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs whitespace-nowrap cursor-pointer w-fit"
                  >
                    {savingPosOrder ? 'Menyimpan...' : 'Simpan Sekarang'}
                  </button>
                </div>
              )}

              {magangPositions.length === 0 ? (
                <div className="rounded-2xl bg-white/70 border border-[#C9A45A]/25 p-8 text-center text-sm text-[#3E544B]">
                  Belum ada posisi magang terdaftar. Klik &ldquo;Tambah Posisi&rdquo; untuk membuat kartu posisi baru.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {magangPositions.map((pos, index) => {
                    const isConfirmDelete = confirmDeletePositionId === pos.id;
                    return (
                      <div
                        key={pos.id}
                        className="rounded-2xl bg-white/85 border border-[#C9A45A]/25 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <span className="text-xs tabular-nums font-medium text-[#8F6D26]">
                              #{String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0 || savingPosOrder}
                                onClick={() => handleMovePositionOrder(index, -1)}
                                title="Naikkan urutan"
                                className="w-7 h-7 rounded-lg bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 flex items-center justify-center disabled:opacity-35 cursor-pointer transition-colors"
                              >
                                <Icon icon="mdi:arrow-up" className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === magangPositions.length - 1 || savingPosOrder}
                                onClick={() => handleMovePositionOrder(index, 1)}
                                title="Turunkan urutan"
                                className="w-7 h-7 rounded-lg bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 flex items-center justify-center disabled:opacity-35 cursor-pointer transition-colors"
                              >
                                <Icon icon="mdi:arrow-down" className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="w-28 h-20 rounded-xl bg-[#EAE5D7] border border-[#C9A45A]/30 shrink-0 overflow-hidden">
                            <img
                              src={pos.imageUrl}
                              alt={pos.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-[#8F6D26]">
                              <span className={pos.isActive ? 'text-[#164234]' : 'text-[#9b2c2c]'}>
                                {pos.isActive ? 'Tampil di Halaman' : 'Disembunyikan'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span
                                className={
                                  pos.isAvailable !== false
                                    ? 'text-[#164234] font-medium'
                                    : 'text-[#9b2c2c] font-medium'
                                }
                              >
                                {pos.isAvailable !== false
                                  ? 'Opsi Form Tersedia'
                                  : 'Opsi Form Penuh / Ditutup'}
                              </span>
                              {pos.division && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-[#8F6D26]">{pos.division}</span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums text-[#3E544B]">
                                {pos.tasks?.length || 0} Poin Tugas
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-normal text-[#164234] truncate">
                              {pos.title}
                            </h4>
                            <p className="text-xs text-[#3E544B] line-clamp-2">
                              {pos.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0 pl-12 md:pl-0">
                          <button
                            type="button"
                            onClick={() => void handleTogglePositionAvailable(pos)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-colors cursor-pointer whitespace-nowrap ${
                              pos.isAvailable !== false
                                ? 'bg-[#F4EFE3] hover:bg-[#8F6D26] text-[#8F6D26] hover:text-[#FAF8F3] border-[#C9A45A]/35'
                                : 'bg-[#164234] hover:bg-[#1E5644] text-[#FAF8F3] border-[#164234]'
                            }`}
                          >
                            <Icon
                              icon={pos.isAvailable !== false ? 'mdi:check' : 'mdi:plus'}
                              className="w-3.5 h-3.5"
                            />
                            <span>
                              {pos.isAvailable !== false ? 'Tutup Opsi Form' : 'Buka Opsi Form'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleTogglePositionActive(pos)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 text-xs transition-colors cursor-pointer"
                          >
                            {pos.isActive ? (
                              <Icon icon="mdi:eye-off-outline" className="w-3.5 h-3.5" />
                            ) : (
                              <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
                            )}
                            <span>{pos.isActive ? 'Sembunyikan' : 'Tampilkan'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditPositionModal(pos)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs transition-colors cursor-pointer"
                          >
                            <Icon icon="mdi:pencil-outline" className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {!isConfirmDelete ? (
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePositionId(pos.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-xs transition-colors cursor-pointer"
                            >
                              <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => void handleDeletePositionItem(pos.id)}
                                className="px-3 py-1.5 rounded-xl bg-[#9b2c2c] text-white text-xs cursor-pointer"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePositionId(null)}
                                className="px-3 py-1.5 rounded-xl bg-[#F6F3EC] text-[#164234] text-xs cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panel 3: Pendaftar Magang Masuk */}
            <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26] tabular-nums">
                    Data Pelamar Masuk · {magangApplications.length} Pendaftar
                  </span>
                  <h3 className="text-xl sm:text-2xl font-normal text-[#164234]">
                    Pendaftar Magang Masuk
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3E544B]">
                    Tinjau formulir pendaftar, ubah status seleksi, serta unduh berkas surat lamaran dan portofolio.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 border border-[#C9A45A]/30 w-full sm:w-72">
                    <Icon icon="mdi:magnify" className="w-4 h-4 text-[#B89242] shrink-0" />
                    <input
                      type="search"
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      placeholder="Cari nama, prodi, atau posisi..."
                      className="w-full bg-transparent text-xs sm:text-sm text-[#164234] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={magangApplications.length === 0}
                    onClick={handleExportApplicationsCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    <Icon icon="mdi:file-download-outline" className="w-4 h-4 text-[#8F6D26]" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: 'all', label: 'Semua' },
                    { id: 'baru', label: 'Baru' },
                    { id: 'ditinjau', label: 'Ditinjau' },
                    { id: 'diterima', label: 'Diterima' },
                    { id: 'ditolak', label: 'Ditolak' },
                  ] as const
                ).map((st) => {
                  const count =
                    st.id === 'all'
                      ? magangApplications.length
                      : magangApplications.filter((a) => a.status === st.id).length;
                  const active = appStatusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setAppStatusFilter(st.id)}
                      className={`px-4 py-2 rounded-full text-xs transition-colors cursor-pointer tabular-nums whitespace-nowrap ${
                        active
                          ? 'bg-[#164234] text-[#F6F3EC]'
                          : 'bg-white/80 hover:bg-[#F6F3EC] text-[#3E544B] border border-[#C9A45A]/25'
                      }`}
                    >
                      {st.label} ({count})
                    </button>
                  );
                })}
              </div>

              {(() => {
                const q = appSearch.trim().toLowerCase();
                const filteredApps = magangApplications.filter((a) => {
                  if (appStatusFilter !== 'all' && a.status !== appStatusFilter) {
                    return false;
                  }
                  if (!q) return true;
                  return (
                    a.fullName.toLowerCase().includes(q) ||
                    a.email.toLowerCase().includes(q) ||
                    a.positionTitle.toLowerCase().includes(q) ||
                    a.faculty.toLowerCase().includes(q) ||
                    a.studyProgram.toLowerCase().includes(q) ||
                    a.registrationCode.toLowerCase().includes(q)
                  );
                });

                if (filteredApps.length === 0) {
                  return (
                    <div className="rounded-2xl bg-white/70 border border-[#C9A45A]/25 p-8 text-center text-sm text-[#3E544B]">
                      {magangApplications.length === 0
                        ? 'Belum ada pendaftar magang yang masuk melalui formulir website.'
                        : 'Tidak ada pendaftar yang sesuai dengan filter atau pencarian.'}
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-3">
                    {filteredApps.map((app) => {
                      const isConfirmDelete = confirmDeleteAppId === app.id;
                      return (
                        <div
                          key={app.id}
                          className="rounded-2xl bg-white/85 border border-[#C9A45A]/25 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-[#8F6D26] tabular-nums">
                              <span className="font-mono text-[#164234]">
                                {app.registrationCode}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{app.positionTitle}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#3E544B]">
                                {new Date(app.createdAt).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>

                            <h4 className="text-base sm:text-lg font-normal text-[#164234] truncate">
                              {app.fullName}
                            </h4>

                            <p className="text-xs text-[#3E544B]">
                              {app.studyProgram} · Fakultas {app.faculty} · {app.email} · {app.phone}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <select
                              value={app.status}
                              disabled={updatingAppStatusId === app.id}
                              onChange={(e) =>
                                void handleUpdateApplicationStatus(
                                  app.id,
                                  e.target.value as MagangApplicationStatus
                                )
                              }
                              aria-label={`Ubah status ${app.fullName}`}
                              className="px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234] focus:outline-none cursor-pointer"
                            >
                              <option value="baru">Status: Baru</option>
                              <option value="ditinjau">Status: Ditinjau</option>
                              <option value="diterima">Status: Diterima</option>
                              <option value="ditolak">Status: Ditolak</option>
                            </select>

                            {app.resumeFileId && (
                              <button
                                type="button"
                                disabled={downloadingFileKey === app.resumeFileId}
                                onClick={() =>
                                  app.resumeFileId &&
                                  void handleDownloadApplicantFile(
                                    app.resumeFileId,
                                    app.resumeFileName || 'cv-lamaran'
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 text-xs transition-colors cursor-pointer"
                              >
                                <Icon icon="mdi:download-outline" className="w-3.5 h-3.5" />
                                <span>CV</span>
                              </button>
                            )}

                            {app.portfolioFileId && (
                              <button
                                type="button"
                                disabled={downloadingFileKey === app.portfolioFileId}
                                onClick={() =>
                                  app.portfolioFileId &&
                                  void handleDownloadApplicantFile(
                                    app.portfolioFileId,
                                    app.portfolioFileName || 'portofolio'
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F3EC] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/25 text-xs transition-colors cursor-pointer"
                              >
                                <Icon icon="mdi:download-outline" className="w-3.5 h-3.5" />
                                <span>Portofolio</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedApplicant(app)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs transition-colors cursor-pointer"
                            >
                              <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
                              <span>Lihat Detail</span>
                            </button>

                            {!isConfirmDelete ? (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteAppId(app.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-xs transition-colors cursor-pointer"
                              >
                                <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteApplication(app.id)}
                                  className="px-3 py-1.5 rounded-xl bg-[#9b2c2c] text-white text-xs cursor-pointer"
                                >
                                  Ya, Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteAppId(null)}
                                  className="px-3 py-1.5 rounded-xl bg-[#F6F3EC] text-[#164234] text-xs cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-8 flex flex-col gap-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C9A45A]/20 pb-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Konfigurasi Dinamis Website · Tersinkron Real-Time
                </span>
                <h2 className="text-2xl font-normal text-[#164234]">
                  Pengaturan Situs P2B UIN Salatiga
                </h2>
                <p className="text-xs sm:text-sm text-[#3E544B]">
                  Kosongkan kolom tertentu untuk menggunakan teks bawaan standar. Perubahan otomatis memperbarui halaman publik yang sedang terbuka.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {settingsDirty && (
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={() => {
                      setSettingsDirty(false);
                      void loadAllCmsData();
                    }}
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F6F3EC] text-[#3E544B] border border-[#C9A45A]/35 text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Batalkan
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingSettings || uploadingHeroBg}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] disabled:opacity-60 text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Icon icon="mdi:check" className="w-4 h-4 text-[#F4D993]" />
                  <span>{savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Situs'}</span>
                </button>
              </div>
            </div>

            {settingsError && (
              <div
                role="alert"
                className="px-4 py-3 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs sm:text-sm text-[#9b2c2c]"
              >
                {settingsError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hero & Identitas */}
              <div className="rounded-3xl bg-white/80 border border-[#C9A45A]/25 p-5 sm:p-6 flex flex-col gap-4">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Bagian Hero Beranda
                </span>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Judul Utama Hero</label>
                  <input
                    type="text"
                    value={settingsForm.hero_title || ''}
                    onChange={(e) => updateSettingField('hero_title', e.target.value)}
                    placeholder="Pusat Pengembangan Bisnis"
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Subjudul / Deskripsi Hero</label>
                  <textarea
                    rows={3}
                    value={settingsForm.hero_subtitle || ''}
                    onChange={(e) => updateSettingField('hero_subtitle', e.target.value)}
                    placeholder="Unit strategis UIN Salatiga dalam optimalisasi aset, layanan komersial, kemitraan..."
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-[#3E544B]">URL / Gambar Latar Hero</label>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs cursor-pointer transition-colors">
                      <Icon icon="mdi:upload-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>{uploadingHeroBg ? 'Mengunggah...' : 'Unggah Gambar'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingHeroBg}
                        onChange={(e) => void handleUploadHeroImage(e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settingsForm.hero_image_url || ''}
                    onChange={(e) => updateSettingField('hero_image_url', e.target.value)}
                    placeholder="https://... atau /api/media/..."
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>
              </div>

              {/* Kontak & Lokasi */}
              <div className="rounded-3xl bg-white/80 border border-[#C9A45A]/25 p-5 sm:p-6 flex flex-col gap-4">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Kontak & Lokasi Resmi
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">Nomor Telepon</label>
                    <input
                      type="text"
                      value={settingsForm.contact_phone || ''}
                      onChange={(e) => updateSettingField('contact_phone', e.target.value)}
                      placeholder="0811-2520-4371"
                      className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">Nomor WhatsApp</label>
                    <input
                      type="text"
                      value={settingsForm.contact_whatsapp || ''}
                      onChange={(e) => updateSettingField('contact_whatsapp', e.target.value)}
                      placeholder="0811-2520-4371"
                      className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#3E544B]">Email Resmi</label>
                    <input
                      type="email"
                      value={settingsForm.contact_email || ''}
                      onChange={(e) => updateSettingField('contact_email', e.target.value)}
                      placeholder="p2b@uinsalatiga.ac.id"
                      className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Alamat Kantor P2B</label>
                  <textarea
                    rows={2}
                    value={settingsForm.location_address || ''}
                    onChange={(e) => updateSettingField('location_address', e.target.value)}
                    placeholder="Gedung Auditorium & Student Center Prof. Dr. H. Achmadi..."
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Tautan Google Maps</label>
                  <input
                    type="text"
                    value={settingsForm.location_maps_url || ''}
                    onChange={(e) => updateSettingField('location_maps_url', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>
              </div>

              {/* Visi & Footer */}
              <div className="lg:col-span-2 rounded-3xl bg-white/80 border border-[#C9A45A]/25 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Visi Kelembagaan & Footer Website
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Teks Visi P2B</label>
                  <textarea
                    rows={3}
                    value={settingsForm.page_visimisi_visi_text || ''}
                    onChange={(e) =>
                      updateSettingField('page_visimisi_visi_text', e.target.value)
                    }
                    placeholder="Teks visi utama P2B UIN Salatiga..."
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Deskripsi Singkat Footer</label>
                  <textarea
                    rows={3}
                    value={settingsForm.footer_description || ''}
                    onChange={(e) =>
                      updateSettingField('footer_description', e.target.value)
                    }
                    placeholder="Deskripsi singkat P2B pada footer..."
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Teks Hak Cipta Footer</label>
                  <input
                    type="text"
                    value={settingsForm.footer_copyright || ''}
                    onChange={(e) =>
                      updateSettingField('footer_copyright', e.target.value)
                    }
                    placeholder="© 2026 Pusat Pengembangan Bisnis UIN Salatiga"
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Tautan Instagram Resmi</label>
                  <input
                    type="text"
                    value={settingsForm.footer_social_url || ''}
                    onChange={(e) =>
                      updateSettingField('footer_social_url', e.target.value)
                    }
                    placeholder="https://www.instagram.com/p2b.uinsalatiga"
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Tautan TikTok Resmi</label>
                  <input
                    type="text"
                    value={settingsForm.footer_tiktok_url || ''}
                    onChange={(e) =>
                      updateSettingField('footer_tiktok_url', e.target.value)
                    }
                    placeholder="https://www.tiktok.com/@p2b.uin.salatiga"
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <form
            onSubmit={handlePasswordChange}
            className="max-w-lg rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-8 flex flex-col gap-4"
          >
            <h2 className="text-2xl font-normal text-[#164234]">
              Ubah Password Akun CMS
            </h2>
            <p className="text-xs sm:text-sm text-[#3E544B]">
              Disarankan mengganti password default secara berkala demi keamanan panel CMS.
            </p>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Password saat ini"
              className="px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password baru (min. 6 karakter)"
              className="px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password baru"
              className="px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
            />

            {passwordStatus && (
              <div
                className={`px-4 py-2.5 rounded-2xl text-xs ${
                  passwordStatus.type === 'ok'
                    ? 'bg-[#164234]/10 text-[#164234]'
                    : 'bg-[#9b2c2c]/10 text-[#9b2c2c]'
                }`}
              >
                {passwordStatus.msg}
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-sm transition-colors cursor-pointer w-fit"
            >
              Simpan Password Baru
            </button>
          </form>
        )}
          </>
        )}
      </div>

      {/* Edit / Update Media Modal */}
      <AnimatePresence>
        {editingMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingMedia(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/35 p-6 sm:p-7 text-[#164234] shadow-xl relative"
            >
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                aria-label="Tutup modal edit media"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 mb-5 pr-10">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Perbarui Media
                </span>
                <h3 className="text-xl font-normal tracking-tight">
                  Edit Nama, Alt Text & Berkas
                </h3>
              </div>

              <form onSubmit={handleSaveMediaEdit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#3E544B]">Nama Berkas</label>
                  <input
                    type="text"
                    required
                    value={editMediaName}
                    onChange={(e) => setEditMediaName(e.target.value)}
                    className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#3E544B]">
                    Teks Alternatif / Keterangan SEO (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editMediaAlt}
                    onChange={(e) => setEditMediaAlt(e.target.value)}
                    placeholder="Contoh: Dokumentasi Gedung Auditorium UIN Salatiga"
                    className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">
                    Ganti Berkas Fisik (Opsional — URL lama tetap berlaku)
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setEditMediaFile(e.target.files?.[0] || null)}
                    className="px-3 py-2 rounded-2xl bg-white border border-[#C9A45A]/30 text-xs text-[#164234]"
                  />
                  {editMediaFile && (
                    <span className="text-[11px] text-[#8F6D26]">
                      Berkas pengganti dipilih: {editMediaFile.name} (
                      {formatBytes(editMediaFile.size)})
                    </span>
                  )}
                </div>

                {editMediaError && (
                  <div className="px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]">
                    {editMediaError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMedia(null)}
                    className="px-4 py-2 rounded-full bg-[rgba(22,66,52,0.08)] text-[#164234] text-xs sm:text-sm cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingMediaEdit}
                    className="px-5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm cursor-pointer disabled:opacity-60"
                  >
                    {savingMediaEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Media Modal */}
      <AnimatePresence>
        {mediaImportOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMediaImportOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/35 p-6 sm:p-7 text-[#164234] shadow-xl relative"
            >
              <button
                type="button"
                onClick={() => setMediaImportOpen(false)}
                aria-label="Tutup modal impor media"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 mb-5 pr-10">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Pemulihan & Migrasi Media
                </span>
                <h3 className="text-xl font-normal tracking-tight">
                  Import Pustaka Media (.json)
                </h3>
              </div>

              <form onSubmit={handleImportMediaBundle} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">
                    Pilih Berkas JSON Hasil Export Media
                  </label>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={(e) => {
                      setMediaImportFile(e.target.files?.[0] || null);
                      setMediaImportError('');
                    }}
                    className="px-3 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-xs text-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Mode Penanganan Duplikat</label>
                  <select
                    value={mediaImportMode}
                    onChange={(e) =>
                      setMediaImportMode(e.target.value as 'upsert' | 'skip_existing')
                    }
                    className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234] focus:outline-none"
                  >
                    <option value="upsert">Timpa / Perbarui Jika ID Sudah Ada</option>
                    <option value="skip_existing">Lewati Jika ID Sudah Ada</option>
                  </select>
                </div>

                {mediaImportError && (
                  <div className="px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]">
                    {mediaImportError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setMediaImportOpen(false)}
                    className="px-4 py-2 rounded-full bg-[rgba(22,66,52,0.08)] text-[#164234] text-xs sm:text-sm cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={importingMedia}
                    className="px-5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm cursor-pointer disabled:opacity-60"
                  >
                    {importingMedia ? 'Mengimpor...' : 'Mulai Import Media'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Complete News + Media Modal */}
      <AnimatePresence>
        {newsImportOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNewsImportOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/35 p-6 sm:p-7 text-[#164234] shadow-xl relative"
            >
              <button
                type="button"
                onClick={() => setNewsImportOpen(false)}
                aria-label="Tutup modal impor berita"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 mb-5 pr-10">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Paket Arsip Lengkap
                </span>
                <h3 className="text-xl font-normal tracking-tight">
                  Import Berita Lengkap & Media (.json)
                </h3>
                <p className="text-xs text-[#3E544B] mt-1">
                  Mengembalikan isi artikel TinyMCE, foto sampul, galeri dokumentasi, serta lampiran PDF secara bersamaan.
                </p>
              </div>

              <form onSubmit={handleImportNewsBundle} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">
                    Pilih Berkas JSON Hasil Export Berita
                  </label>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={(e) => {
                      setNewsImportFile(e.target.files?.[0] || null);
                      setNewsImportError('');
                    }}
                    className="px-3 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-xs text-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#3E544B]">Mode Penanganan Artikel Duplikat</label>
                  <select
                    value={newsImportMode}
                    onChange={(e) =>
                      setNewsImportMode(e.target.value as 'upsert' | 'skip_existing')
                    }
                    className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-xs sm:text-sm text-[#164234] focus:outline-none"
                  >
                    <option value="upsert">Timpa / Perbarui Jika Slug Sudah Ada</option>
                    <option value="skip_existing">Lewati Artikel Jika Slug Sudah Ada</option>
                  </select>
                </div>

                {newsImportError && (
                  <div className="px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]">
                    {newsImportError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewsImportOpen(false)}
                    className="px-4 py-2 rounded-full bg-[rgba(22,66,52,0.08)] text-[#164234] text-xs sm:text-sm cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={importingNews}
                    className="px-5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm cursor-pointer disabled:opacity-60"
                  >
                    {importingNews ? 'Mengimpor...' : 'Mulai Import Berita'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom News Categories Management Modal */}
      <AnimatePresence>
        {categoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCategoryModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/35 p-6 sm:p-7 text-[#164234] shadow-xl relative"
            >
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                aria-label="Tutup modal kategori berita"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 mb-5 pr-10">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Kategori Dinamis MariaDB
                </span>
                <h3 className="text-xl font-normal tracking-tight">
                  Kelola Kategori Berita
                </h3>
                <p className="text-xs text-[#3E544B] mt-0.5">
                  Tambah, ubah nama, atau hapus kategori berita. Perubahan otomatis memperbarui filter pada website.
                </p>
              </div>

              <form onSubmit={handleCreateCategory} className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setCategoryError('');
                  }}
                  placeholder="Nama kategori baru (mis. Pengumuman)..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                />
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  <Icon icon="mdi:plus" className="w-4 h-4 text-[#F4D993]" />
                  <span>{creatingCategory ? 'Menambah...' : 'Tambah'}</span>
                </button>
              </form>

              {categoryError && (
                <div className="mb-4 px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]">
                  {categoryError}
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                {newsCategories.map((cat) => {
                  const isEditing = editingCategoryId === cat.id;
                  const isConfirmDelete = confirmDeleteCategoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className="rounded-2xl bg-white border border-[#C9A45A]/25 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-sm text-[#164234] focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={savingCategoryId === cat.id}
                            onClick={() => void handleUpdateCategory(cat.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer disabled:opacity-60"
                          >
                            {savingCategoryId === cat.id ? 'Menyimpan...' : 'Simpan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(null);
                              setEditingCategoryName('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#F6F3EC] text-[#3E544B] text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon icon="mdi:tag-outline" className="w-3.5 h-3.5 text-[#8F6D26] shrink-0" />
                            <span className="text-sm font-medium text-[#164234] truncate">
                              {cat.name}
                            </span>
                            {typeof cat.articleCount === 'number' && (
                              <span className="text-[11px] text-[#3E544B] tabular-nums">
                                ({cat.articleCount} berita)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteCategoryId(null);
                                setEditingCategoryId(cat.id);
                                setEditingCategoryName(cat.name);
                                setCategoryError('');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs transition-colors cursor-pointer"
                            >
                              <Icon icon="mdi:pencil-outline" className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            {newsCategories.length > 1 && !isConfirmDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteCategoryId(cat.id);
                                  setCategoryError('');
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#9b2c2c]/10 hover:bg-[#9b2c2c] text-[#9b2c2c] hover:text-white text-xs transition-colors cursor-pointer"
                              >
                                <Icon icon="mdi:trash-can-outline" className="w-3 h-3" />
                                <span>Hapus</span>
                              </button>
                            )}

                            {isConfirmDelete && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={deletingCategoryId === cat.id}
                                  onClick={() => void handleDeleteCategory(cat.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#9b2c2c] text-white text-xs cursor-pointer disabled:opacity-60"
                                >
                                  {deletingCategoryId === cat.id ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteCategoryId(null)}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#F6F3EC] text-[#164234] text-xs cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Partner Logo Modal */}
      <AnimatePresence>
        {logoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLogoModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/35 p-6 sm:p-7 text-[#164234] shadow-xl relative"
            >
              <button
                type="button"
                onClick={() => setLogoModalOpen(false)}
                aria-label="Tutup modal logo mitra"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 mb-5 pr-10">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Marquee Logo Beranda
                </span>
                <h3 className="text-xl font-normal tracking-tight">
                  {editingLogo ? 'Edit Logo Mitra / Unit' : 'Tambah Logo Mitra Baru'}
                </h3>
              </div>

              <form onSubmit={handleSaveLogo} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-white border border-[#C9A45A]/25">
                  <div className="w-32 h-20 rounded-2xl bg-[#F6F3EC] border border-[#C9A45A]/35 px-3 py-2 shrink-0 flex items-center justify-center overflow-hidden">
                    {logoFormUrl ? (
                      <img
                        src={logoFormUrl}
                        alt="Pratinjau logo"
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Icon icon="mdi:office-building-outline" className="w-7 h-7 text-[#164234]/45" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-1 w-full">
                    <label className="text-xs text-[#3E544B]">
                      Berkas Logo (SVG, PNG, atau WebP transparan)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs cursor-pointer transition-colors">
                        <Icon icon="mdi:upload-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                        <span>
                          {uploadingLogoFile ? 'Mengunggah...' : 'Unggah Logo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.svg"
                          disabled={uploadingLogoFile}
                          onChange={(e) => void handleUploadLogoFile(e)}
                          className="hidden"
                        />
                      </label>
                      {logoFormUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoFormUrl('')}
                          className="px-3 py-2 rounded-full bg-[#F6F3EC] text-[#9b2c2c] text-xs cursor-pointer"
                        >
                          Bersihkan
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={logoFormUrl}
                      onChange={(e) => setLogoFormUrl(e.target.value)}
                      placeholder="/api/media/... atau https://..."
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/25 text-xs text-[#164234] focus:outline-none"
                    />
                  </div>
                </div>

                {mediaItems.some((m) => m.mimeType.startsWith('image/')) && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-[#3E544B]">
                      Atau pilih cepat dari Pustaka Media yang sudah diunggah:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {mediaItems
                        .filter((m) => m.mimeType.startsWith('image/'))
                        .slice(0, 10)
                        .map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setLogoFormUrl(m.url)}
                            title={m.originalName}
                            className={`w-16 h-12 rounded-xl bg-white border p-1.5 shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                              logoFormUrl === m.url
                                ? 'border-[#164234] ring-2 ring-[#164234]/20'
                                : 'border-[#C9A45A]/25 hover:border-[#164234]/60'
                            }`}
                          >
                            <img
                              src={m.url}
                              alt={m.originalName}
                              className="max-w-full max-h-full object-contain"
                            />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Nama Mitra / Unit Usaha</label>
                    <input
                      type="text"
                      required
                      value={logoFormName}
                      onChange={(e) => setLogoFormName(e.target.value)}
                      placeholder="Contoh: Bank Jateng Syariah"
                      className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Nomor Urut Tampil</label>
                    <input
                      type="number"
                      min={1}
                      value={logoFormSortOrder}
                      onChange={(e) =>
                        setLogoFormSortOrder(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#3E544B]">
                    Tautan Website Mitra (Opsional)
                  </label>
                  <input
                    type="text"
                    value={logoFormLinkUrl}
                    onChange={(e) => setLogoFormLinkUrl(e.target.value)}
                    placeholder="https://... (kosongkan jika logo tanpa link)"
                    className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                  />
                </div>

                <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-[#164234] cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={logoFormIsActive}
                    onChange={(e) => setLogoFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#164234] cursor-pointer"
                  />
                  <span>Tampilkan logo pada marquee beranda</span>
                </label>

                {logoError && (
                  <div className="px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]">
                    {logoError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setLogoModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-[rgba(22,66,52,0.08)] text-[#164234] text-xs sm:text-sm cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingLogo || uploadingLogoFile}
                    className="px-5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm cursor-pointer disabled:opacity-60"
                  >
                    {savingLogo ? 'Menyimpan...' : 'Simpan Logo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Magang Gallery Photo Modal */}
      <AnimatePresence>
        {galleryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGalleryModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/35 p-6 sm:p-7 text-[#164234] shadow-xl relative"
            >
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                aria-label="Tutup modal foto galeri magang"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 mb-5 pr-10">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Galeri Foto Anak Magang
                </span>
                <h3 className="text-xl font-normal tracking-tight">
                  {editingGalleryItem ? 'Edit Foto Galeri Magang' : 'Tambah Foto Galeri Magang'}
                </h3>
              </div>

              <form onSubmit={handleSaveGalleryItem} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-white border border-[#C9A45A]/25">
                  <div className="w-36 h-24 rounded-2xl bg-[#EAE5D7] border border-[#C9A45A]/35 shrink-0 flex items-center justify-center overflow-hidden">
                    {galleryFormImageUrl ? (
                      <img
                        src={galleryFormImageUrl}
                        alt="Pratinjau foto galeri"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon icon="mdi:image-multiple-outline" className="w-7 h-7 text-[#164234]/45" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-1 w-full">
                    <label className="text-xs text-[#3E544B]">
                      Berkas Foto Kegiatan (JPG, PNG, atau WebP)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs cursor-pointer transition-colors">
                        <Icon icon="mdi:upload-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                        <span>
                          {uploadingGalleryFile ? 'Mengunggah...' : 'Unggah Foto'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingGalleryFile}
                          onChange={(e) => void handleUploadGalleryPhotoFile(e)}
                          className="hidden"
                        />
                      </label>
                      {galleryFormImageUrl && (
                        <button
                          type="button"
                          onClick={() => setGalleryFormImageUrl('')}
                          className="px-3 py-2 rounded-full bg-[#F6F3EC] text-[#9b2c2c] text-xs cursor-pointer"
                        >
                          Bersihkan
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={galleryFormImageUrl}
                      onChange={(e) => setGalleryFormImageUrl(e.target.value)}
                      placeholder="/api/media/... atau /assets/magang/..."
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/25 text-xs text-[#164234] focus:outline-none"
                    />
                  </div>
                </div>

                {mediaItems.some((m) => m.mimeType.startsWith('image/')) && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-[#3E544B]">
                      Atau pilih cepat dari Pustaka Media:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {mediaItems
                        .filter((m) => m.mimeType.startsWith('image/'))
                        .slice(0, 12)
                        .map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setGalleryFormImageUrl(m.url)}
                            title={m.originalName}
                            className={`w-16 h-12 rounded-xl bg-white border overflow-hidden shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                              galleryFormImageUrl === m.url
                                ? 'border-[#164234] ring-2 ring-[#164234]/20'
                                : 'border-[#C9A45A]/25 hover:border-[#164234]/60'
                            }`}
                          >
                            <img
                              src={m.url}
                              alt={m.originalName}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Judul Kegiatan / Foto</label>
                    <input
                      type="text"
                      required
                      value={galleryFormTitle}
                      onChange={(e) => setGalleryFormTitle(e.target.value)}
                      placeholder="Contoh: Kolaborasi & Perencanaan Program"
                      className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Nomor Urut Tampil</label>
                    <input
                      type="number"
                      min={1}
                      value={galleryFormSortOrder}
                      onChange={(e) =>
                        setGalleryFormSortOrder(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#3E544B]">Keterangan / Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={galleryFormCaption}
                    onChange={(e) => setGalleryFormCaption(e.target.value)}
                    placeholder="Deskripsi aktivitas mahasiswa magang pada foto ini..."
                    className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#3E544B]">Teks Alternatif SEO (Opsional)</label>
                  <input
                    type="text"
                    value={galleryFormAltText}
                    onChange={(e) => setGalleryFormAltText(e.target.value)}
                    placeholder="Kosongkan untuk menggunakan judul foto secara otomatis"
                    className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                  />
                </div>

                <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-[#164234] cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={galleryFormIsActive}
                    onChange={(e) => setGalleryFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#164234] cursor-pointer"
                  />
                  <span>Tampilkan foto di galeri halaman Magang</span>
                </label>

                {galleryError && (
                  <div className="px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]">
                    {galleryError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setGalleryModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-[rgba(22,66,52,0.08)] text-[#164234] text-xs sm:text-sm cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingGalleryItem || uploadingGalleryFile}
                    className="px-5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm cursor-pointer disabled:opacity-60"
                  >
                    {savingGalleryItem ? 'Menyimpan...' : 'Simpan Foto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Magang Position Modal */}
      <AnimatePresence>
        {positionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPositionModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/35 p-6 sm:p-7 text-[#164234] shadow-xl relative"
            >
              <button
                type="button"
                onClick={() => setPositionModalOpen(false)}
                aria-label="Tutup modal posisi magang"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 mb-5 pr-10">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Open Recruitment Magang P2B
                </span>
                <h3 className="text-xl font-normal tracking-tight">
                  {editingPositionItem ? 'Edit Posisi Magang' : 'Tambah Posisi Magang'}
                </h3>
              </div>

              <form onSubmit={handleSavePositionItem} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-white border border-[#C9A45A]/25">
                  <div className="w-36 h-24 rounded-2xl bg-[#EAE5D7] border border-[#C9A45A]/35 shrink-0 flex items-center justify-center overflow-hidden">
                    {posFormImageUrl ? (
                      <img
                        src={posFormImageUrl}
                        alt="Pratinjau gambar posisi"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon icon="mdi:briefcase-outline" className="w-7 h-7 text-[#164234]/45" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-1 w-full">
                    <label className="text-xs text-[#3E544B]">
                      Foto Ilustrasi Posisi (JPG, PNG, atau WebP)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs cursor-pointer transition-colors">
                        <Icon icon="mdi:upload-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                        <span>
                          {uploadingPosFile ? 'Mengunggah...' : 'Unggah Gambar'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingPosFile}
                          onChange={(e) => void handleUploadPositionPhotoFile(e)}
                          className="hidden"
                        />
                      </label>
                      {posFormImageUrl && (
                        <button
                          type="button"
                          onClick={() => setPosFormImageUrl('')}
                          className="px-3 py-2 rounded-full bg-[#F6F3EC] text-[#9b2c2c] text-xs cursor-pointer"
                        >
                          Bersihkan
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={posFormImageUrl}
                      onChange={(e) => setPosFormImageUrl(e.target.value)}
                      placeholder="/api/media/... atau /assets/magang/..."
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/25 text-xs text-[#164234] focus:outline-none"
                    />
                  </div>
                </div>

                {mediaItems.some((m) => m.mimeType.startsWith('image/')) && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-[#3E544B]">
                      Atau pilih cepat dari Pustaka Media:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {mediaItems
                        .filter((m) => m.mimeType.startsWith('image/'))
                        .slice(0, 12)
                        .map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPosFormImageUrl(m.url)}
                            title={m.originalName}
                            className={`w-16 h-12 rounded-xl bg-white border overflow-hidden shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                              posFormImageUrl === m.url
                                ? 'border-[#164234] ring-2 ring-[#164234]/20'
                                : 'border-[#C9A45A]/25 hover:border-[#164234]/60'
                            }`}
                          >
                            <img
                              src={m.url}
                              alt={m.originalName}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Nama Posisi</label>
                    <input
                      type="text"
                      required
                      value={posFormTitle}
                      onChange={(e) => setPosFormTitle(e.target.value)}
                      placeholder="Contoh: Content Creator"
                      className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Divisi / Bidang</label>
                    <input
                      type="text"
                      value={posFormDivision}
                      onChange={(e) => setPosFormDivision(e.target.value)}
                      placeholder="Contoh: Media & Publikasi Digital"
                      className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs text-[#3E544B]">Deskripsi Peran</label>
                    <textarea
                      rows={3}
                      required
                      value={posFormDescription}
                      onChange={(e) => setPosFormDescription(e.target.value)}
                      placeholder="Uraikan tanggung jawab utama posisi magang ini..."
                      className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#3E544B]">Nomor Urut Tampil</label>
                    <input
                      type="number"
                      min={1}
                      value={posFormSortOrder}
                      onChange={(e) =>
                        setPosFormSortOrder(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#3E544B]">
                    Daftar Ruang Lingkup / Tugas (1 poin per baris)
                  </label>
                  <textarea
                    rows={4}
                    value={posFormTasksText}
                    onChange={(e) => setPosFormTasksText(e.target.value)}
                    placeholder={`Produksi video reels, TikTok, dan liputan kegiatan unit bisnis\nPenulisan skrip kreatif serta copywriting publikasi digital\nKolaborasi kampanye promosi bersama tim desain grafis`}
                    className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-[#164234] cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={posFormIsActive}
                      onChange={(e) => setPosFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#164234] cursor-pointer"
                    />
                    <span>Tampilkan posisi pada halaman Magang P2B</span>
                  </label>

                  <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-[#164234] cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={posFormIsAvailable}
                      onChange={(e) => setPosFormIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#164234] cursor-pointer"
                    />
                    <span>Opsi posisi tersedia untuk dipilih di formulir pendaftaran</span>
                  </label>
                </div>

                {positionError && (
                  <div className="px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]">
                    {positionError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setPositionModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-[rgba(22,66,52,0.08)] text-[#164234] text-xs sm:text-sm cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingPositionItem || uploadingPosFile}
                    className="px-5 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm cursor-pointer disabled:opacity-60"
                  >
                    {savingPositionItem ? 'Menyimpan...' : 'Simpan Posisi'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applicant Detail Modal */}
      <AnimatePresence>
        {selectedApplicant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedApplicant(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/35 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/35 p-6 sm:p-8 text-[#164234] shadow-xl relative flex flex-col gap-5"
            >
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                aria-label="Tutup detail pendaftar"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 pr-10">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26] font-mono">
                  {selectedApplicant.registrationCode} · {selectedApplicant.positionTitle}
                </span>
                <h3 className="text-2xl font-normal tracking-tight">
                  {selectedApplicant.fullName}
                </h3>
                <p className="text-xs sm:text-sm text-[#3E544B]">
                  {selectedApplicant.studyProgram} · Fakultas {selectedApplicant.faculty}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-white border border-[#C9A45A]/25 p-4 text-xs sm:text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#8F6D26]">
                    Email
                  </span>
                  <span className="break-all">{selectedApplicant.email}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#8F6D26]">
                    Nomor Telepon
                  </span>
                  <span className="tabular-nums">{selectedApplicant.phone}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#8F6D26]">
                    Status Seleksi
                  </span>
                  <select
                    value={selectedApplicant.status}
                    disabled={updatingAppStatusId === selectedApplicant.id}
                    onChange={(e) =>
                      void handleUpdateApplicationStatus(
                        selectedApplicant.id,
                        e.target.value as MagangApplicationStatus
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/30 text-xs text-[#164234] focus:outline-none cursor-pointer"
                  >
                    <option value="baru">Baru</option>
                    <option value="ditinjau">Ditinjau</option>
                    <option value="diterima">Diterima</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4 text-sm">
                <div className="rounded-2xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Pemahaman tentang P2B UIN Salatiga
                  </span>
                  <p className="text-[#164234] leading-relaxed whitespace-pre-line">
                    {selectedApplicant.aboutP2b}
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Alasan Tertarik pada Posisi {selectedApplicant.positionTitle}
                  </span>
                  <p className="text-[#164234] leading-relaxed whitespace-pre-line">
                    {selectedApplicant.interestReason}
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Harapan Selama Magang di P2B UIN Salatiga
                  </span>
                  <p className="text-[#164234] leading-relaxed whitespace-pre-line">
                    {selectedApplicant.expectations}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Surat Lamaran / Resume
                  </span>
                  {selectedApplicant.resumeFileId && (
                    <button
                      type="button"
                      disabled={downloadingFileKey === selectedApplicant.resumeFileId}
                      onClick={() =>
                        selectedApplicant.resumeFileId &&
                        void handleDownloadApplicantFile(
                          selectedApplicant.resumeFileId,
                          selectedApplicant.resumeFileName || 'cv-lamaran'
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:download-outline" className="w-4 h-4 text-[#F4D993]" />
                      <span className="truncate">
                        Unduh {selectedApplicant.resumeFileName || 'Berkas CV'}
                      </span>
                    </button>
                  )}
                  {selectedApplicant.resumeUrl && (
                    <a
                      href={selectedApplicant.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#164234] underline underline-offset-2 break-all"
                    >
                      <Icon icon="mdi:link-variant" className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedApplicant.resumeUrl}</span>
                    </a>
                  )}
                </div>

                <div className="rounded-2xl bg-white border border-[#C9A45A]/25 p-4 flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Portofolio Pelamar
                  </span>
                  {selectedApplicant.portfolioFileId && (
                    <button
                      type="button"
                      disabled={downloadingFileKey === selectedApplicant.portfolioFileId}
                      onClick={() =>
                        selectedApplicant.portfolioFileId &&
                        void handleDownloadApplicantFile(
                          selectedApplicant.portfolioFileId,
                          selectedApplicant.portfolioFileName || 'portofolio'
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:download-outline" className="w-4 h-4 text-[#F4D993]" />
                      <span className="truncate">
                        Unduh {selectedApplicant.portfolioFileName || 'Portofolio'}
                      </span>
                    </button>
                  )}
                  {selectedApplicant.portfolioUrl && (
                    <a
                      href={selectedApplicant.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#164234] underline underline-offset-2 break-all"
                    >
                      <Icon icon="mdi:link-variant" className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedApplicant.portfolioUrl}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedApplicant(null)}
                  className="px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
