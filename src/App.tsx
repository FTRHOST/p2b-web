/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { ScrollTrigger } from './lib/gsap';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { Navbar, NavPageTarget } from './components/Navbar';
import { HomePageRenderer } from './components/HomePageRenderer';
import { AllNewsPage } from './components/AllNewsPage';
import { MagangPage } from './components/MagangPage';
import { MagangRegisterPage } from './components/MagangRegisterPage';
import { KerjasamaPage } from './components/KerjasamaPage';
import { TarifLayananPage } from './components/TarifLayananPage';
import { NewsDetailPage } from './components/NewsDetailPage';
import { CmsLoginPage } from './components/CmsLoginPage';
import { CmsDashboard } from './components/CmsDashboard';
import { NotFoundPage } from './components/NotFoundPage';
import {
  authClient,
  clearInMemoryAuthToken,
  getInMemoryAuthToken,
  setInMemoryAuthToken,
} from './lib/authClient';
import { allNewsArticles, DEFAULT_NEWS_CATEGORIES, NewsArticle } from './data/news';
import {
  DEFAULT_MAGANG_GALLERY,
  DEFAULT_MAGANG_POSITIONS,
} from './data/magangDefaults';
import {
  DEFAULT_TARIF_ITEMS,
  TarifCategorySlug,
  TarifItem,
  getTarifItemBySlug,
  isValidTarifSlug,
} from './data/tarifDefaults';
import {
  BuilderPageSlug,
  DEFAULT_HOME_BLOCKS,
  HomeBlockItem,
  getDefaultBlocksWithIds,
} from './data/homeBuilderDefaults';
import {
  CmsDatabaseInfo,
  CmsUser,
  MagangGalleryItem,
  MagangPositionItem,
  NewsCategoryItem,
  PartnerLogoItem,
  SiteSettings,
} from './types/cms';
import { applyPageSeo } from './utils/seo';

interface RouteState {
  page: NavPageTarget;
  articleId: string | null;
  tarifCategory?: TarifCategorySlug;
}

function normalizePathname(raw: string): string {
  const cleaned = raw.replace(/\/+$/, '');
  return cleaned || '/';
}

function getRouteFromLocation(pathnameRaw: string, hashRaw: string): RouteState {
  const cleanPath = normalizePathname(pathnameRaw);

  if (cleanPath === '/berita') {
    return { page: 'not-found', articleId: null };
  }
  if (cleanPath.startsWith('/berita/')) {
    const id = decodeURIComponent(cleanPath.slice('/berita/'.length)).trim();
    return id
      ? { page: 'news-detail', articleId: id }
      : { page: 'not-found', articleId: null };
  }
  if (cleanPath === '/semua-berita') return { page: 'all-news', articleId: null };
  if (cleanPath === '/tentang-kami') return { page: 'about', articleId: null };
  if (cleanPath === '/visi-misi') return { page: 'visi-misi', articleId: null };
  if (cleanPath === '/struktur-organisasi') {
    return { page: 'struktur-organisasi', articleId: null };
  }
  if (cleanPath === '/kerjasama') {
    return { page: 'kerjasama', articleId: null };
  }
  if (cleanPath === '/tarif-layanan') {
    return {
      page: 'tarif-layanan',
      articleId: null,
    };
  }
  if (cleanPath.startsWith('/tarif-layanan/')) {
    const slug = decodeURIComponent(
      cleanPath.slice('/tarif-layanan/'.length)
    ).trim();
    if (isValidTarifSlug(slug)) {
      return { page: 'tarif-layanan', articleId: null, tarifCategory: slug };
    }
    return { page: 'not-found', articleId: null };
  }
  if (cleanPath === '/magang') {
    return { page: 'magang', articleId: null };
  }
  if (cleanPath === '/magang/daftar') {
    return { page: 'magang-register', articleId: null };
  }
  if (cleanPath === '/cms' || cleanPath === '/silahkanmasuk') {
    return { page: 'home', articleId: null };
  }

  // Fallback support for legacy hash links on root path
  if (cleanPath === '/') {
    if (hashRaw.startsWith('#berita/')) {
      const id = decodeURIComponent(hashRaw.replace('#berita/', '')).trim();
      return id
        ? { page: 'news-detail', articleId: id }
        : { page: 'not-found', articleId: null };
    }
    if (hashRaw === '#semua-berita') return { page: 'all-news', articleId: null };
    if (hashRaw === '#tentang-kami') return { page: 'about', articleId: null };
    if (hashRaw === '#visi-misi') return { page: 'visi-misi', articleId: null };
    if (hashRaw === '#struktur-organisasi') {
      return { page: 'struktur-organisasi', articleId: null };
    }
    if (hashRaw === '#kerjasama') {
      return { page: 'kerjasama', articleId: null };
    }
    if (hashRaw === '#tarif-layanan') {
      return {
        page: 'tarif-layanan',
        articleId: null,
        tarifCategory: 'penunjang-akademik',
      };
    }
    if (hashRaw.startsWith('#tarif-layanan/')) {
      const slug = decodeURIComponent(
        hashRaw.replace('#tarif-layanan/', '')
      ).trim();
      if (isValidTarifSlug(slug)) {
        return { page: 'tarif-layanan', articleId: null, tarifCategory: slug };
      }
    }
    if (hashRaw === '#magang') {
      return { page: 'magang', articleId: null };
    }
    if (hashRaw === '#magang/daftar') {
      return { page: 'magang-register', articleId: null };
    }
    return { page: 'home', articleId: null };
  }

  return { page: 'not-found', articleId: null };
}

const pageToPath: Record<Exclude<NavPageTarget, 'news-detail' | 'not-found'>, string> = {
  home: '/',
  about: '/tentang-kami',
  'visi-misi': '/visi-misi',
  'struktur-organisasi': '/struktur-organisasi',
  kerjasama: '/kerjasama',
  'tarif-layanan': '/tarif-layanan/penunjang-akademik',
  magang: '/magang',
  'magang-register': '/magang/daftar',
  'all-news': '/semua-berita',
};

export default function App() {
  const [pathname, setPathname] = useState<string>(() =>
    normalizePathname(window.location.pathname)
  );
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(allNewsArticles);
  const [newsCategories, setNewsCategories] = useState<NewsCategoryItem[]>(() =>
    DEFAULT_NEWS_CATEGORIES.map((name, idx) => ({ id: idx + 1, name, sortOrder: idx + 1 }))
  );
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogoItem[]>([
    {
      id: 1,
      name: 'UIN Salatiga',
      logoUrl: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/2022-Web-UIN-Logo-1.png',
      linkUrl: 'https://uinsalatiga.ac.id',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 2,
      name: 'P2B UIN Salatiga',
      logoUrl: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Logo.webp',
      linkUrl: '',
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 3,
      name: 'Pusat Pengembangan Bisnis',
      logoUrl: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2023/08/logo_ico_2.png',
      linkUrl: '',
      sortOrder: 3,
      isActive: true,
    },
  ]);
  const [magangGallery, setMagangGallery] = useState<MagangGalleryItem[]>(
    DEFAULT_MAGANG_GALLERY
  );
  const [magangPositions, setMagangPositions] = useState<MagangPositionItem[]>(
    DEFAULT_MAGANG_POSITIONS
  );
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [homeBlocks, setHomeBlocks] = useState<HomeBlockItem[]>(DEFAULT_HOME_BLOCKS);
  const [tarifItems, setTarifItems] = useState<TarifItem[]>(DEFAULT_TARIF_ITEMS);
  const [bootstrapReady, setBootstrapReady] = useState<boolean>(false);
  const [route, setRoute] = useState<RouteState>(() =>
    getRouteFromLocation(window.location.pathname, window.location.hash)
  );

  // CMS Auth State (token held strictly in React/JS memory; Better Auth manages HttpOnly session cookie)
  const [cmsToken, setCmsToken] = useState<string>(() => getInMemoryAuthToken());
  const [cmsUser, setCmsUser] = useState<CmsUser | null>(null);
  const [cmsDbInfo, setCmsDbInfo] = useState<CmsDatabaseInfo | null>(null);
  const [cmsChecking, setCmsChecking] = useState<boolean>(() => {
    const initialPath = normalizePathname(window.location.pathname);
    return initialPath === '/cms' || initialPath === '/silahkanmasuk';
  });

  const markVersionSyncedRef = useRef<(version?: string | null) => void>(() => {});

  const fetchPublicBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/public/bootstrap', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as {
        ok?: boolean;
        version?: string;
        news?: NewsArticle[];
        categories?: NewsCategoryItem[];
        partnerLogos?: PartnerLogoItem[];
        magangGallery?: MagangGalleryItem[];
        magangPositions?: MagangPositionItem[];
        settings?: SiteSettings;
        homeBlocks?: HomeBlockItem[];
        tarifItems?: TarifItem[];
      };
      if (data.ok) {
        if (data.version) {
          markVersionSyncedRef.current(data.version);
        }
        if (Array.isArray(data.news)) {
          setNewsArticles(data.news);
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setNewsCategories(data.categories);
        }
        if (Array.isArray(data.partnerLogos)) {
          setPartnerLogos(data.partnerLogos);
        }
        if (Array.isArray(data.magangGallery)) {
          setMagangGallery(data.magangGallery);
        }
        if (Array.isArray(data.magangPositions)) {
          setMagangPositions(data.magangPositions);
        }
        if (data.settings) {
          setSiteSettings(data.settings);
        }
        if (Array.isArray(data.homeBlocks)) {
          setHomeBlocks(data.homeBlocks);
        }
        if (Array.isArray(data.tarifItems)) {
          setTarifItems(data.tarifItems);
        }
      }
    } catch {
      // Fallback gracefully to bundled initial content
    } finally {
      setBootstrapReady(true);
    }
  }, []);

  useEffect(() => {
    void fetchPublicBootstrap();
  }, [fetchPublicBootstrap]);

  const { markVersionSynced } = useRealtimeSync({
    enabled: pathname !== '/cms' && pathname !== '/silahkanmasuk',
    pollIntervalMs: 15000,
    onSync: useCallback(() => {
      return fetchPublicBootstrap();
    }, [fetchPublicBootstrap]),
  });

  useEffect(() => {
    markVersionSyncedRef.current = markVersionSynced;
  }, [markVersionSynced]);

  useEffect(() => {
    const syncNavigation = () => {
      const nextPath = normalizePathname(window.location.pathname);
      setPathname(nextPath);
      setRoute(getRouteFromLocation(nextPath, window.location.hash));
    };
    window.addEventListener('hashchange', syncNavigation);
    window.addEventListener('popstate', syncNavigation);
    return () => {
      window.removeEventListener('hashchange', syncNavigation);
      window.removeEventListener('popstate', syncNavigation);
    };
  }, []);

  const navigatePath = useCallback((nextPath: string, replace = false) => {
    const normalized = normalizePathname(nextPath);
    if (replace) {
      window.history.replaceState(null, '', normalized);
    } else {
      window.history.pushState(null, '', normalized);
    }
    setPathname(normalized);
    setRoute(getRouteFromLocation(normalized, ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Validate CMS session whenever user accesses /cms or /silahkanmasuk
  useEffect(() => {
    if (pathname !== '/cms' && pathname !== '/silahkanmasuk') {
      setCmsChecking(false);
      return;
    }

    let active = true;
    setCmsChecking(true);

    const headers: Record<string, string> = {};
    if (cmsToken) {
      headers.Authorization = `Bearer ${cmsToken}`;
    }

    fetch('/api/cms/me', {
      headers,
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          ok?: boolean;
          user?: CmsUser;
          database?: CmsDatabaseInfo;
        };
      })
      .then((data) => {
        if (!active) return;
        if (data?.ok && data.user) {
          setCmsUser(data.user);
          if (data.database) setCmsDbInfo(data.database);
          if (pathname === '/silahkanmasuk') {
            navigatePath('/cms', true);
          }
          setCmsChecking(false);
        } else {
          clearInMemoryAuthToken();
          setCmsToken('');
          setCmsUser(null);
          setCmsChecking(false);
          if (pathname === '/cms') {
            navigatePath('/silahkanmasuk', true);
          }
        }
      })
      .catch(() => {
        if (!active) return;
        setCmsUser(null);
        setCmsChecking(false);
        if (pathname === '/cms') {
          navigatePath('/silahkanmasuk', true);
        }
      });

    return () => {
      active = false;
    };
  }, [pathname, cmsToken, navigatePath]);

  const handleCmsLoginSuccess = (user: CmsUser, token: string) => {
    if (token) {
      setInMemoryAuthToken(token);
    }
    setCmsToken(token);
    setCmsUser(user);
    navigatePath('/cms', true);
  };

  const handleCmsLogout = async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore logout error
    }
    clearInMemoryAuthToken();
    setCmsToken('');
    setCmsUser(null);
    navigatePath('/silahkanmasuk', true);
  };

  const navigateToPage = (target: NavPageTarget) => {
    if (target === 'news-detail') {
      navigateToPage('all-news');
      return;
    }
    if (target === 'not-found') {
      setRoute({ page: 'not-found', articleId: null });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const defaultTarifSlug = tarifItems[0]?.slug || 'penunjang-akademik';
    const nextPath =
      target === 'tarif-layanan'
        ? `/tarif-layanan/${encodeURIComponent(defaultTarifSlug)}`
        : pageToPath[target] || '/';
    window.history.pushState(null, '', nextPath);
    setPathname(nextPath);
    setRoute(
      target === 'tarif-layanan'
        ? {
            page: 'tarif-layanan',
            articleId: null,
            tarifCategory: defaultTarifSlug,
          }
        : { page: target, articleId: null }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToArticle = (articleId: string) => {
    const nextPath = `/berita/${encodeURIComponent(articleId)}`;
    window.history.pushState(null, '', nextPath);
    setPathname(nextPath);
    setRoute({ page: 'news-detail', articleId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSection = (
    target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b'
  ) => {
    if (target === 'who-we-are') {
      navigateToPage('about');
      return;
    }
    if (target === 'news-updates') {
      navigateToPage('all-news');
      return;
    }
    navigateToPage('home');
    if (target !== 'top') {
      window.setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  };

  const handleNavigateTarget = useCallback(
    (rawTarget: string) => {
      const target = rawTarget.trim();
      if (!target) {
        navigatePath('/');
        return;
      }
      if (/^(https?:\/\/|mailto:|tel:)/i.test(target)) {
        window.location.href = target;
        return;
      }
      if (target.startsWith('#')) {
        const id = target.slice(1);
        if (id === 'who-we-are') {
          navigatePath('/tentang-kami');
          return;
        }
        if (id === 'news-updates') {
          navigatePath('/semua-berita');
          return;
        }
        navigatePath('/');
        if (id && id !== 'top') {
          window.setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }
        return;
      }
      navigatePath(target);
    },
    [navigatePath]
  );

  const matchedArticle =
    route.page === 'news-detail' && route.articleId
      ? newsArticles.find((item) => item.id === route.articleId) ?? null
      : null;
  const isWaitingArticleBootstrap =
    route.page === 'news-detail' && !matchedArticle && !bootstrapReady;
  const isArticleNotFound =
    route.page === 'news-detail' && !matchedArticle && bootstrapReady;
  const effectivePage: NavPageTarget = isArticleNotFound ? 'not-found' : route.page;
  const selectedArticle = matchedArticle;

  // Keep GSAP ScrollTrigger positions synced across font loading, SPA routes, and CMS updates
  useEffect(() => {
    let active = true;
    const rafId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    if ('fonts' in document && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (active) ScrollTrigger.refresh();
      });
    }

    return () => {
      active = false;
      window.cancelAnimationFrame(rafId);
    };
  }, [pathname, effectivePage, newsArticles.length, siteSettings, homeBlocks.length, bootstrapReady]);

  // Dynamic OpenGraph, Twitter Card, Canonical & Schema.org JSON-LD synchronization
  useEffect(() => {
    const origin = window.location.origin;

    if (pathname === '/silahkanmasuk' || pathname === '/cms') {
      applyPageSeo({
        title:
          pathname === '/cms'
            ? 'CMS Panel — P2B UIN Salatiga'
            : 'Masuk Portal Redaksi — P2B UIN Salatiga',
        description: 'Portal pengelolaan konten Pusat Pengembangan Bisnis UIN Salatiga.',
        path: pathname,
        robots: 'noindex, nofollow',
      });
      return;
    }

    if (effectivePage === 'not-found') {
      applyPageSeo({
        title: '404 — Halaman Tidak Ditemukan · P2B UIN Salatiga',
        description:
          'Halaman yang Anda cari tidak tersedia atau telah dipindahkan dari portal Pusat Pengembangan Bisnis UIN Salatiga.',
        path: pathname,
        robots: 'noindex, nofollow',
      });
      return;
    }

    if (effectivePage === 'news-detail' && selectedArticle) {
      const articlePath = `/berita/${encodeURIComponent(selectedArticle.id)}`;
      const desc = selectedArticle.excerpt.slice(0, 160);
      applyPageSeo({
        title: `${selectedArticle.title} — P2B UIN Salatiga`,
        description: desc,
        path: articlePath,
        type: 'article',
        image: selectedArticle.image,
        section: selectedArticle.category,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: selectedArticle.title,
          description: selectedArticle.excerpt,
          image: [
            selectedArticle.image.startsWith('http')
              ? selectedArticle.image
              : `${origin}${selectedArticle.image}`,
          ],
          articleSection: selectedArticle.category,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${origin}${articlePath}`,
          },
          author: {
            '@type': 'Organization',
            name: 'P2B UIN Salatiga',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Pusat Pengembangan Bisnis UIN Salatiga',
            logo: {
              '@type': 'ImageObject',
              url: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2023/08/logo_ico_2.png',
            },
          },
        },
      });
      return;
    }

    if (route.page === 'about') {
      applyPageSeo({
        title: 'Tentang P2B UIN Salatiga — Profil & Pilar Bisnis PTN BLU',
        description:
          'Mengenal profil resmi Pusat Pengembangan Bisnis (P2B) UIN Salatiga dalam pengelolaan aset, layanan komersial, dan kemitraan strategis.',
        path: '/tentang-kami',
      });
      return;
    }

    if (route.page === 'visi-misi') {
      applyPageSeo({
        title: 'Visi & Misi — Pusat Pengembangan Bisnis UIN Salatiga',
        description:
          'Arah strategis, visi kelembagaan, dan misi pelayanan profesional Pusat Pengembangan Bisnis (P2B) Universitas Islam Negeri Salatiga.',
        path: '/visi-misi',
      });
      return;
    }

    if (route.page === 'struktur-organisasi') {
      applyPageSeo({
        title: 'Struktur Organisasi — P2B UIN Salatiga',
        description:
          'Susunan manajemen, tata kelola, dan unit pelaksana bisnis di lingkungan Pusat Pengembangan Bisnis UIN Salatiga.',
        path: '/struktur-organisasi',
      });
      return;
    }

    if (route.page === 'kerjasama') {
      const ksTitle = siteSettings.page_kerjasama_title?.trim() || 'Kerjasama & Sewa Aset';
      const ksDesc =
        siteSettings.page_kerjasama_subtitle?.trim().slice(0, 160) ||
        'Daftar kemitraan strategis, pemanfaatan lahan dan bangunan, serta kerja sama operasional di lingkungan Pusat Pengembangan Bisnis UIN Salatiga.';
      applyPageSeo({
        title: `${ksTitle} — P2B UIN Salatiga`,
        description: ksDesc,
        path: '/kerjasama',
        image: siteSettings.page_kerjasama_image,
      });
      return;
    }

    if (route.page === 'tarif-layanan') {
      const activeCat = getTarifItemBySlug(tarifItems, route.tarifCategory);
      const tarifDocTitle = activeCat?.title?.trim() || activeCat?.navLabel || 'Tarif Layanan';
      const tarifDesc =
        activeCat?.description?.trim().slice(0, 160) ||
        'Informasi resmi daftar tarif layanan Pusat Pengembangan Bisnis UIN Salatiga.';
      applyPageSeo({
        title: `${tarifDocTitle} — P2B UIN Salatiga`,
        description: tarifDesc,
        path: activeCat ? `/tarif-layanan/${activeCat.slug}` : '/tarif-layanan',
        image: siteSettings.page_tarif_image,
      });
      return;
    }

    if (route.page === 'magang') {
      applyPageSeo({
        title: 'Magang di P2B — Open Recruitment P2B UIN Salatiga',
        description:
          'Informasi open recruitment magang Pusat Pengembangan Bisnis (P2B) UIN Salatiga posisi Content Creator, Graphic Designer, dan Office Administrator.',
        path: '/magang',
      });
      return;
    }

    if (route.page === 'magang-register') {
      applyPageSeo({
        title: 'Formulir Pendaftaran Magang — P2B UIN Salatiga',
        description:
          'Daftar program magang Pusat Pengembangan Bisnis (P2B) UIN Salatiga dan unggah lamaran serta portofolio Anda.',
        path: '/magang/daftar',
      });
      return;
    }

    if (route.page === 'all-news') {
      applyPageSeo({
        title: 'Semua Berita & Update — P2B UIN Salatiga',
        description:
          'Arsip berita resmi, pengembangan fasilitas, inovasi layanan komersial, dan program kemitraan P2B UIN Salatiga.',
        path: '/semua-berita',
      });
      return;
    }

    const homeTitle = siteSettings.hero_title?.trim()
      ? `${siteSettings.hero_title.trim()} — UIN Salatiga`
      : 'P2B UIN Salatiga — Pusat Pengembangan Bisnis PTN BLU';
    const homeDesc =
      siteSettings.hero_subtitle?.trim().slice(0, 160) ||
      'Pusat Pengembangan Bisnis (P2B) UIN Salatiga — Unit strategis optimalisasi aset, layanan komersial, kemitraan, dan inovasi bisnis PTN BLU.';
    applyPageSeo({
      title: homeTitle,
      description: homeDesc,
      path: '/',
      image: siteSettings.hero_image_url,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'P2B UIN Salatiga',
        url: origin,
        description: homeDesc,
        publisher: {
          '@type': 'Organization',
          name: 'Pusat Pengembangan Bisnis UIN Salatiga',
          logo: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2023/08/logo_ico_2.png',
          telephone: siteSettings.contact_phone?.trim() || '0811-2520-4371',
          email: siteSettings.contact_email?.trim() || 'p2b@uinsalatiga.ac.id',
          address: {
            '@type': 'PostalAddress',
            streetAddress:
              'Gedung Auditorium & Student Center Prof. Dr. H. Achmadi, Jl. Lingkar Selatan Km. 02, Pulutan, Sidorejo',
            addressLocality: 'Kota Salatiga',
            addressRegion: 'Jawa Tengah',
            postalCode: '50716',
            addressCountry: 'ID',
          },
        },
      },
    });
  }, [pathname, effectivePage, route.page, route.tarifCategory, selectedArticle, siteSettings, tarifItems]);

  // Dedicated Hidden Login Route: /silahkanmasuk
  if (pathname === '/silahkanmasuk') {
    if (cmsChecking || cmsUser) {
      return (
        <div className="min-h-screen bg-[#F6F3EC] flex items-center justify-center p-6">
          <div className="rounded-3xl bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 px-8 py-6 text-sm text-[#164234]">
            Memeriksa sesi CMS...
          </div>
        </div>
      );
    }

    return (
      <MotionConfig reducedMotion="user">
        <CmsLoginPage
          onLoginSuccess={handleCmsLoginSuccess}
          onBackHome={() => navigateToPage('home')}
        />
      </MotionConfig>
    );
  }

  // Protected CMS Dashboard Route: /cms
  if (pathname === '/cms') {
    if (cmsChecking || !cmsUser) {
      return (
        <div className="min-h-screen bg-[#F6F3EC] flex items-center justify-center p-6">
          <div className="rounded-3xl bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 px-8 py-6 text-sm text-[#164234]">
            Memeriksa sesi CMS...
          </div>
        </div>
      );
    }

    return (
      <MotionConfig reducedMotion="user">
        <CmsDashboard
          user={cmsUser}
          token={cmsToken}
          dbInfo={cmsDbInfo}
          onViewPublicSite={() => navigateToPage('home')}
          onLogout={() => void handleCmsLogout()}
          onPublicDataChanged={() => void fetchPublicBootstrap()}
        />
      </MotionConfig>
    );
  }

  const getBuilderBlocksForPage = (slug: BuilderPageSlug): HomeBlockItem[] => {
    if (!bootstrapReady) {
      return getDefaultBlocksWithIds(slug);
    }
    return homeBlocks.filter((b) => (b.pageSlug || 'home') === slug);
  };

  const isBuilderPage =
    effectivePage === 'home' ||
    effectivePage === 'about' ||
    effectivePage === 'visi-misi' ||
    effectivePage === 'struktur-organisasi';

  const activeBuilderPageSlug: BuilderPageSlug =
    effectivePage === 'about' ||
    effectivePage === 'visi-misi' ||
    effectivePage === 'struktur-organisasi'
      ? effectivePage
      : 'home';

  return (
    <MotionConfig reducedMotion="user">
      <Navbar
        currentPage={effectivePage}
        currentPath={pathname}
        settings={siteSettings}
        tarifItems={tarifItems}
        onNavigatePage={navigateToPage}
        onNavigateTarget={handleNavigateTarget}
      />

      {isWaitingArticleBootstrap ? (
        <main className="min-h-screen bg-[#F6F3EC] flex items-center justify-center p-6">
          <div className="rounded-3xl bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 px-8 py-6 text-sm text-[#164234]">
            Memuat berita...
          </div>
        </main>
      ) : effectivePage === 'not-found' ? (
        <NotFoundPage
          path={pathname}
          settings={siteSettings}
          onBackHome={() => navigateToPage('home')}
          onOpenAllNews={() => navigateToPage('all-news')}
          onNavigateSection={navigateToSection}
        />
      ) : effectivePage === 'news-detail' && selectedArticle ? (
        <NewsDetailPage
          article={selectedArticle}
          articles={newsArticles}
          settings={siteSettings}
          onOpenAllNews={() => navigateToPage('all-news')}
          onSelectArticle={navigateToArticle}
          onNavigateSection={navigateToSection}
        />
      ) : effectivePage === 'all-news' ? (
        <AllNewsPage
          articles={newsArticles}
          categories={newsCategories.map((c) => c.name)}
          onBackHome={() => navigateToPage('home')}
          onSelectArticle={navigateToArticle}
          onNavigateSection={navigateToSection}
        />
      ) : effectivePage === 'kerjasama' ? (
        <KerjasamaPage
          settings={siteSettings}
          onNavigateSection={navigateToSection}
        />
      ) : effectivePage === 'tarif-layanan' ? (
        <TarifLayananPage
          settings={siteSettings}
          tarifItems={tarifItems}
          activeCategorySlug={route.tarifCategory}
          onSelectCategory={(slug) => navigatePath(`/tarif-layanan/${slug}`)}
          onNavigateSection={navigateToSection}
        />
      ) : effectivePage === 'magang' ? (
        <MagangPage
          settings={siteSettings}
          galleryItems={magangGallery}
          positions={magangPositions}
          onOpenRegisterPage={() => navigateToPage('magang-register')}
          onNavigateSection={navigateToSection}
        />
      ) : effectivePage === 'magang-register' ? (
        <MagangRegisterPage
          settings={siteSettings}
          positions={magangPositions}
          onBackToMagang={() => navigateToPage('magang')}
          onNavigateSection={navigateToSection}
        />
      ) : isBuilderPage ? (
        <HomePageRenderer
          pageSlug={activeBuilderPageSlug}
          blocks={getBuilderBlocksForPage(activeBuilderPageSlug)}
          settings={siteSettings}
          newsArticles={newsArticles}
          newsCategories={newsCategories.map((c) => c.name)}
          partnerLogos={partnerLogos}
          magangGallery={magangGallery}
          magangPositions={magangPositions}
          onOpenAbout={() => navigateToPage('about')}
          onNavigateTarget={handleNavigateTarget}
          onViewAllNews={() => navigateToPage('all-news')}
          onSelectArticle={navigateToArticle}
        />
      ) : null}
    </MotionConfig>
  );
}
