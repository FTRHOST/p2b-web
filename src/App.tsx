/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Navbar, NavPageTarget } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhoWeAre } from './components/WhoWeAre';
import { NewsSection } from './components/NewsSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { AllNewsPage } from './components/AllNewsPage';
import { AboutPage } from './components/AboutPage';
import { VisiMisiPage } from './components/VisiMisiPage';
import { StrukturOrganisasiPage } from './components/StrukturOrganisasiPage';
import { NewsDetailPage } from './components/NewsDetailPage';
import { allNewsArticles } from './data/news';

interface RouteState {
  page: NavPageTarget;
  articleId: string | null;
}

function getRouteFromHash(hash: string): RouteState {
  if (hash.startsWith('#berita/')) {
    const id = hash.replace('#berita/', '').trim();
    const exists = allNewsArticles.some((item) => item.id === id);
    if (exists) {
      return { page: 'news-detail', articleId: id };
    }
    return { page: 'all-news', articleId: null };
  }
  if (hash === '#semua-berita') return { page: 'all-news', articleId: null };
  if (hash === '#tentang-kami') return { page: 'about', articleId: null };
  if (hash === '#visi-misi') return { page: 'visi-misi', articleId: null };
  if (hash === '#struktur-organisasi') {
    return { page: 'struktur-organisasi', articleId: null };
  }
  return { page: 'home', articleId: null };
}

const pageToHash: Record<Exclude<NavPageTarget, 'news-detail'>, string> = {
  home: '',
  about: '#tentang-kami',
  'visi-misi': '#visi-misi',
  'struktur-organisasi': '#struktur-organisasi',
  'all-news': '#semua-berita',
};

export default function App() {
  const [route, setRoute] = useState<RouteState>(() =>
    getRouteFromHash(window.location.hash)
  );

  useEffect(() => {
    const syncFromHash = () => {
      setRoute(getRouteFromHash(window.location.hash));
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navigateToPage = (target: NavPageTarget) => {
    if (target === 'news-detail') {
      navigateToPage('all-news');
      return;
    }
    if (target === 'home') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.location.hash = pageToHash[target];
    }
    setRoute({ page: target, articleId: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToArticle = (articleId: string) => {
    window.location.hash = `#berita/${articleId}`;
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

  const selectedArticle =
    route.page === 'news-detail' && route.articleId
      ? allNewsArticles.find((item) => item.id === route.articleId) ??
        allNewsArticles[0]
      : null;

  return (
    <MotionConfig reducedMotion="user">
      <Navbar currentPage={route.page} onNavigatePage={navigateToPage} />

      {route.page === 'news-detail' && selectedArticle ? (
        <NewsDetailPage
          article={selectedArticle}
          onOpenAllNews={() => navigateToPage('all-news')}
          onSelectArticle={navigateToArticle}
          onNavigateSection={navigateToSection}
        />
      ) : route.page === 'all-news' ? (
        <AllNewsPage
          onBackHome={() => navigateToPage('home')}
          onSelectArticle={navigateToArticle}
          onNavigateSection={navigateToSection}
        />
      ) : route.page === 'about' ? (
        <AboutPage
          onOpenVisiMisi={() => navigateToPage('visi-misi')}
          onNavigateSection={navigateToSection}
        />
      ) : route.page === 'visi-misi' ? (
        <VisiMisiPage
          onOpenStruktur={() => navigateToPage('struktur-organisasi')}
          onNavigateSection={navigateToSection}
        />
      ) : route.page === 'struktur-organisasi' ? (
        <StrukturOrganisasiPage
          onOpenAbout={() => navigateToPage('about')}
          onNavigateSection={navigateToSection}
        />
      ) : (
        <main className="min-h-screen bg-[#F6F3EC]">
          <Hero onOpenAbout={() => navigateToPage('about')} />
          <WhoWeAre />
          <NewsSection
            onViewAllNews={() => navigateToPage('all-news')}
            onSelectArticle={navigateToArticle}
          />
          <LocationSection />
          <Footer
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
