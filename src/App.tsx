/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { Navbar, NavPageTarget } from './components/Navbar';
import { Hero } from './components/Hero';
import { LogoMarqueeSection } from './components/LogoMarqueeSection';
import { WhoWeAre } from './components/WhoWeAre';
import { NewsSection } from './components/NewsSection';
import { LocationSection } from './components/LocationSection';
import { VisiCard } from './components/VisiCard';
import { Footer } from './components/Footer';
import { AllNewsPage } from './components/AllNewsPage';
import { AboutPage } from './components/AboutPage';
import { VisiMisiPage } from './components/VisiMisiPage';
import { StrukturOrganisasiPage } from './components/StrukturOrganisasiPage';
import { NewsDetailPage } from './components/NewsDetailPage';
import { CmsLoginPage } from './components/CmsLoginPage';
import { CmsDashboard } from './components/CmsDashboard';
import { NotFoundPage } from './components/NotFoundPage';
import { allNewsArticles, DEFAULT_NEWS_CATEGORIES, NewsArticle } from './data/news';
import {
  CmsDatabaseInfo,
  CmsUser,
  NewsCategoryItem,
  PartnerLogoItem,
  SiteSettings,
} from './types/cms';
import { applyPageSeo } from './utils/seo';

interface RouteState {
  page: NavPageTarget;
  articleId: string | null;
}

const CMS_TOKEN_KEY = 'p2b_cms_token';

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
    return { page: 'home', articleId: null };
  }

  return { page: 'not-found', articleId: null };
}

const pageToPath: Record<Exclude<NavPageTarget, 'news-detail' | 'not-found'>, string> = {
  home: '/',
  about: '/tentang-kami',
  'visi-misi': '/visi-misi',
  'struktur-organisasi': '/struktur-organisasi',
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [bootstrapReady, setBootstrapReady] = useState<boolean>(false);
  const [route, setRoute] = useState<RouteState>(() =>
    getRouteFromLocation(window.location.pathname, window.location.hash)
  );

  // CMS Auth State
  const [cmsToken, setCmsToken] = useState<string>(() => {
    try {
      return (
        window.localStorage.getItem(CMS_TOKEN_KEY) ||
        window.sessionStorage.getItem(CMS_TOKEN_KEY) ||
        ''
      );
    } catch {
      return '';
    }
  });
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
        settings?: SiteSettings;
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
        if (data.settings) {
          setSiteSettings(data.settings);
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
          try {
            window.localStorage.removeItem(CMS_TOKEN_KEY);
            window.sessionStorage.removeItem(CMS_TOKEN_KEY);
          } catch {
            // ignore storage errors
          }
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
    try {
      window.localStorage.setItem(CMS_TOKEN_KEY, token);
      window.sessionStorage.setItem(CMS_TOKEN_KEY, token);
    } catch {
      // ignore storage errors
    }
    setCmsToken(token);
    setCmsUser(user);
    navigatePath('/cms', true);
  };

  const handleCmsLogout = async () => {
    try {
      await fetch('/api/cms/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore logout error
    }
    try {
      window.localStorage.removeItem(CMS_TOKEN_KEY);
      window.sessionStorage.removeItem(CMS_TOKEN_KEY);
    } catch {
      // ignore storage errors
    }
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
    const nextPath = pageToPath[target] || '/';
    window.history.pushState(null, '', nextPath);
    setPathname(nextPath);
    setRoute({ page: target, articleId: null });
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
  }, [pathname, effectivePage, selectedArticle, siteSettings]);

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

  return (
    <MotionConfig reducedMotion="user">
      <Navbar
        currentPage={effectivePage}
        currentPath={pathname}
        settings={siteSettings}
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
      ) : effectivePage === 'about' ? (
        <AboutPage
          settings={siteSettings}
          onOpenVisiMisi={() => navigateToPage('visi-misi')}
          onNavigateSection={navigateToSection}
        />
      ) : effectivePage === 'visi-misi' ? (
        <VisiMisiPage
          settings={siteSettings}
          onOpenStruktur={() => navigateToPage('struktur-organisasi')}
          onNavigateSection={navigateToSection}
        />
      ) : effectivePage === 'struktur-organisasi' ? (
        <StrukturOrganisasiPage
          settings={siteSettings}
          onOpenAbout={() => navigateToPage('about')}
          onNavigateSection={navigateToSection}
        />
      ) : (
        <main className="min-h-screen bg-[#F6F3EC]">
          <Hero
            title={siteSettings.hero_title}
            subtitle={siteSettings.hero_subtitle}
            imageUrl={siteSettings.hero_image_url}
            onOpenAbout={() => navigateToPage('about')}
          />
          <LogoMarqueeSection logos={partnerLogos} />
          <WhoWeAre
            settings={siteSettings}
            onNavigateTarget={handleNavigateTarget}
          />
          <NewsSection
            articles={newsArticles}
            categories={newsCategories.map((c) => c.name)}
            onViewAllNews={() => navigateToPage('all-news')}
            onSelectArticle={navigateToArticle}
          />
          <LocationSection
            addressText={siteSettings.location_address}
            settings={siteSettings}
          />
          <div className="w-full flex justify-center px-3 md:px-5 pb-2 md:pb-4 bg-[#F6F3EC]">
            <div className="w-full max-w-[1536px]">
              <VisiCard settings={siteSettings} />
            </div>
          </div>
          <Footer
            settings={siteSettings}
            onNavigate={(target) => {
              if (target === 'who-we-are') {
                navigateToPage('about');
                return;
              }
              if (target === 'top') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
              }
              document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </main>
      )}
    </MotionConfig>
  );
}
