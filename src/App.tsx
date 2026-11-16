/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hero } from './components/Hero';
import { WhoWeAre } from './components/WhoWeAre';
import { NewsSection } from './components/NewsSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <main className="min-h-screen bg-[#f0f0f0]">
      <Hero />
      <WhoWeAre />
      <NewsSection />
      <Footer />
    </main>
  );
}
