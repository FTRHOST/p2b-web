import { NewsArticle } from '../data/news';
import type { CmsPermission, CmsRoleKey } from '../lib/authRoles';
export type {
  BuilderPageSlug,
  HomeBlockType,
  HomeBlockItem,
  HomeBlockPresetItem,
} from '../data/homeBuilderDefaults';
export type { TarifItem } from '../data/tarifDefaults';
export type { CmsPermission, CmsRoleKey } from '../lib/authRoles';

export interface SiteSettings {
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  about_heading?: string;
  about_p1?: string;
  about_p2?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  contact_email?: string;
  location_address?: string;
  page_kerjasama_eyebrow?: string;
  page_kerjasama_title?: string;
  page_kerjasama_subtitle?: string;
  page_kerjasama_image?: string;
  page_kerjasama_corner_label?: string;
  page_kerjasama_corner_action?: string;
  kerjasama_csv_url?: string;
  kerjasama_sheet_label?: string;
  kerjasama_section_heading?: string;
  kerjasama_section_subtitle?: string;
  page_tarif_eyebrow?: string;
  page_tarif_title?: string;
  page_tarif_subtitle?: string;
  page_tarif_image?: string;
  page_tarif_corner_label?: string;
  page_tarif_corner_action?: string;
  tarif_penunjang_pdf_url?: string;
  tarif_penunjang_title?: string;
  tarif_penunjang_doc_number?: string;
  tarif_penunjang_description?: string;
  tarif_klinik_pdf_url?: string;
  tarif_klinik_title?: string;
  tarif_klinik_doc_number?: string;
  tarif_klinik_description?: string;
  tarif_jurnal_pdf_url?: string;
  tarif_jurnal_title?: string;
  tarif_jurnal_doc_number?: string;
  tarif_jurnal_description?: string;
  [key: string]: string | undefined;
}

export interface CmsNavItem {
  id: number;
  parentId: number | null;
  label: string;
  subtitle: string;
  actionType: 'page' | 'dropdown' | 'modal_service' | 'modal_contact' | 'url';
  target: string;
  description: string;
  openNewTab: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface CmsUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  role: CmsRoleKey;
  roleLabel?: string;
  permissions?: CmsPermission[];
}

export interface ManagedCmsUser {
  id: string;
  name: string;
  username: string;
  displayUsername?: string;
  email: string;
  role: CmsRoleKey;
  banned: boolean;
  banReason?: string | null;
  createdAt: string;
}

export interface CmsDatabaseInfo {
  connected: boolean;
  host: string;
  port: string;
  name: string;
  version: string;
}

export interface CmsNewsItem extends NewsArticle {
  dbId: number;
  isPublished: boolean;
  sortOrder: number;
}

export interface CmsStats {
  totalNews: number;
  publishedNews: number;
}

export interface CmsUploadedMedia {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface CmsMediaItem {
  id: string;
  originalName: string;
  altText: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export interface NewsCategoryItem {
  id: number;
  name: string;
  sortOrder: number;
  articleCount?: number;
}

export interface PartnerLogoItem {
  id: number;
  name: string;
  logoUrl: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MagangGalleryItem {
  id: number;
  title: string;
  caption: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MagangPositionItem {
  id: number;
  title: string;
  division: string;
  description: string;
  imageUrl: string;
  tasks: string[];
  sortOrder: number;
  isActive: boolean;
  isAvailable: boolean;
}

export type MagangApplicationStatus = 'baru' | 'ditinjau' | 'diterima' | 'ditolak';

export interface MagangApplicationItem {
  id: number;
  registrationCode: string;
  fullName: string;
  email: string;
  phone: string;
  studyProgram: string;
  faculty: string;
  aboutP2b: string;
  positionId: number | null;
  positionTitle: string;
  interestReason: string;
  resumeFileId: string | null;
  resumeFileName: string | null;
  resumeUrl: string | null;
  portfolioFileId: string | null;
  portfolioFileName: string | null;
  portfolioUrl: string | null;
  expectations: string;
  status: MagangApplicationStatus;
  createdAt: string;
}

export interface KerjasamaItem {
  rowIndex: number;
  no: string;
  namaPenyewa: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  perihal: string;
  jenis: string;
  berkasUrl: string;
}

export interface KerjasamaDataset {
  ok: boolean;
  title: string;
  sheetLabel: string;
  csvUrl: string;
  fetchedAt: string;
  items: KerjasamaItem[];
  message?: string;
}

