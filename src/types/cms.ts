import { NewsArticle } from '../data/news';

export interface SiteSettings {
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  about_heading?: string;
  about_p1?: string;
  about_p2?: string;
  contact_phone?: string;
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

export interface OrgMemberItem {
  id: number;
  name: string;
  positionTitle: string;
  tier: 'rektor' | 'kepala_p2b' | 'manajemen' | 'divisi';
  bio: string;
  photoUrl: string;
  sortOrder: number;
  isActive: boolean;
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


