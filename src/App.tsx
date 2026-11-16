/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Hero } from './components/Hero';
import { WhoWeAre } from './components/WhoWeAre';
import { NewsSection } from './components/NewsSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { AllNewsPage } from './components/AllNewsPage';
import { AboutPage } from './components/AboutPage';

type PageView = 'home' | 'all-news' | 'about';

function getPageViewFromHash(hash: string): PageView {
  if (hash === '#semua-berita') return 'all-news';
  if (hash === '#tentang-kami') return 'about';
  return 'home';
}

export default function App() {
  const [pageView, setPageView] = useState<PageView>(() =>
    getPageViewFromHash(window.location.hash)
  );

  useEffect(() => {
    const syncFromHash = () => {
      setPageView(getPageViewFromHash(window.location.hash));
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navigateToAllNews = () => {
    window.location.hash = '#semua-berita';
    setPageView('all-news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAbout = () => {
    window.location.hash = '#tentang-kami';
    setPageView('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.history.pushState(null, '', window.location.pathname);
    setPageView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHomeSection = (
    target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b'
  ) => {
    if (target === 'who-we-are') {
      navigateToAbout();
      return;
    }
    if (target === 'news-updates') {
      navigateToAllNews();
      return;
    }
    navigateToHome();
    if (target !== 'top') {
      window.setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      {pageView === 'all-news' ? (
        <AllNewsPage onBackHome={navigateToHome} />
      ) : pageView === 'about' ? (
        <AboutPage
          onBackHome={navigateToHome}
          onNavigateSection={navigateToHomeSection}
          onOpenAllNews={navigateToAllNews}
        />
      ) : (
        <main className="min-h-screen bg-[#F6F3EC]">
          <Hero onOpenAbout={navigateToAbout} />
          <WhoWeAre />
          <NewsSection onViewAllNews={navigateToAllNews} />
          <LocationSection />
          <Footer
            onNavigate={(target) => {
              if (target === 'who-we-are') {
                navigateToAbout();
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
