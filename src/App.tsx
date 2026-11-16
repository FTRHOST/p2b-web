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

function getPageViewFromHash(hash: string): NavPageTarget {
  if (hash === '#semua-berita') return 'all-news';
  if (hash === '#tentang-kami') return 'about';
  if (hash === '#visi-misi') return 'visi-misi';
  if (hash === '#struktur-organisasi') return 'struktur-organisasi';
  return 'home';
}

const pageToHash: Record<NavPageTarget, string> = {
  home: '',
  about: '#tentang-kami',
  'visi-misi': '#visi-misi',
  'struktur-organisasi': '#struktur-organisasi',
  'all-news': '#semua-berita',
};

export default function App() {
  const [pageView, setPageView] = useState<NavPageTarget>(() =>
    getPageViewFromHash(window.location.hash)
  );

  useEffect(() => {
    const syncFromHash = () => {
      setPageView(getPageViewFromHash(window.location.hash));
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navigateToPage = (target: NavPageTarget) => {
    if (target === 'home') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.location.hash = pageToHash[target];
    }
    setPageView(target);
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

  return (
    <MotionConfig reducedMotion="user">
      <Navbar currentPage={pageView} onNavigatePage={navigateToPage} />

      {pageView === 'all-news' ? (
        <AllNewsPage
          onBackHome={() => navigateToPage('home')}
          onNavigateSection={navigateToSection}
        />
      ) : pageView === 'about' ? (
        <AboutPage
          onOpenVisiMisi={() => navigateToPage('visi-misi')}
          onNavigateSection={navigateToSection}
        />
      ) : pageView === 'visi-misi' ? (
        <VisiMisiPage
          onOpenStruktur={() => navigateToPage('struktur-organisasi')}
          onNavigateSection={navigateToSection}
        />
      ) : pageView === 'struktur-organisasi' ? (
        <StrukturOrganisasiPage
          onOpenAbout={() => navigateToPage('about')}
          onNavigateSection={navigateToSection}
        />
      ) : (
        <main className="min-h-screen bg-[#F6F3EC]">
          <Hero onOpenAbout={() => navigateToPage('about')} />
          <WhoWeAre />
          <NewsSection onViewAllNews={() => navigateToPage('all-news')} />
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
