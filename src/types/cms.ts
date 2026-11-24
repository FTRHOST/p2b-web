import { NewsArticle } from '../data/news';

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
  id: number;
  username: string;
  displayName: string;
  role: string;
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
