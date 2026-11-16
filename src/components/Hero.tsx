import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './Navbar';
import { HeroBadge } from './HeroBadge';
import { BottomLeftCard } from './BottomLeftCard';
import { BottomRightCorner } from './BottomRightCorner';

type ModalType = 'contact' | 'discord' | 'docs' | 'section' | null;

export function Hero() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);

  const handleOpenContact = () => {
    setContactSubmitted(false);
    setContactEmail('');
    setContactMessage('');
    setActiveModal('contact');
  };

  const handleSelectSection = (label: string) => {
    setSelectedSection(label);
    setActiveModal('section');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim()) return;
    setContactSubmitted(true);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#f0f0f0]">
      <section className="relative w-full max-w-[1536px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col items-center bg-white/10 group">
        {/* Fallback backdrop if image fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e7ebf0] via-[#dde3eb] to-[#cfd8e3] z-0" />

        {!bgFailed && (
          <img
            src="https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png"
            alt="Auditorium Student Centre di Salatiga"
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-[65%] lg:object-center z-0"
          />
        )}

        {/* Subtle light glass scrim to keep dark/slate Hero typography readable over photography */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/45 to-white/15 z-0 pointer-events-none" />

        <div className="relative z-10 w-full h-full flex flex-col items-center">
          <Navbar
            onContact={handleOpenContact}
            onSelectSection={handleSelectSection}
          />

          <div className="w-full flex flex-col items-center pt-8 px-6 text-center max-w-4xl">
            <HeroBadge />

            <motion.h1
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal text-[#5E6470] mb-2 tracking-tight leading-[1.05]"
            >
              Fluid Asset Streams
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-[#5E6470] opacity-80 leading-relaxed max-w-xl font-normal"
            >
              Access Smart Vaults, stake RIVR, NFTs, transform rigid holdings into liquid cash instantly.
            </motion.p>
          </div>

          <BottomLeftCard onJoinDiscord={() => setActiveModal('discord')} />
          <BottomRightCorner onOpenDocs={() => setActiveModal('docs')} />
        </div>
      </section>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/60 p-6 md:p-8 text-[rgba(30,50,90,0.95)] shadow-lg relative"
            >
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Tutup modal"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(30,50,90,0.06)] hover:bg-[rgba(30,50,90,0.12)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[rgba(30,50,90,0.8)]" />
              </button>

              {activeModal === 'contact' && (
                <div>
                  <h2 className="text-2xl font-normal tracking-tight mb-2">
                    Hubungi Kami
                  </h2>
                  <p className="text-sm text-[rgba(30,50,90,0.65)] mb-6">
                    Kirimkan pertanyaan terkait layanan sewa aset, auditorium, klinik, maupun kerja sama lainnya.
                  </p>

                  {contactSubmitted ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[rgba(30,50,90,0.06)] text-sm">
                      <div className="w-8 h-8 rounded-full bg-[rgba(30,50,90,0.85)] text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>
                        Pesan dari <strong>{contactEmail}</strong> telah diterima. Tim kami akan segera menghubungi Anda.
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="email@anda.com"
                        className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[rgba(30,50,90,0.15)] text-sm text-[rgba(30,50,90,0.95)] placeholder:text-[rgba(30,50,90,0.4)] focus:outline-none focus:border-[rgba(30,50,90,0.5)]"
                      />
                      <textarea
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Tulis kebutuhan atau pertanyaan Anda..."
                        className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[rgba(30,50,90,0.15)] text-sm text-[rgba(30,50,90,0.95)] placeholder:text-[rgba(30,50,90,0.4)] focus:outline-none focus:border-[rgba(30,50,90,0.5)] resize-none"
                      />
                      <button
                        type="submit"
                        className="w-full py-3 rounded-full bg-[rgba(30,50,90,0.85)] hover:bg-[rgba(30,50,90,1)] text-white text-sm font-normal transition-colors cursor-pointer"
                      >
                        Kirim Pesan
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeModal === 'discord' && (
                <div>
                  <h2 className="text-2xl font-normal tracking-tight mb-2">
                    RIVR Community
                  </h2>
                  <p className="text-sm text-[rgba(30,50,90,0.65)] mb-5">
                    Join 5.2K active yielders discussing Smart Vault strategies, governance proposals, and liquid staking streams.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-3 rounded-full bg-[rgba(30,50,90,0.85)] hover:bg-[rgba(30,50,90,1)] text-white text-sm font-normal transition-colors cursor-pointer"
                  >
                    Continue to Discord
                  </button>
                </div>
              )}

              {activeModal === 'docs' && (
                <div>
                  <h2 className="text-2xl font-normal tracking-tight mb-2">
                    Documentation Library
                  </h2>
                  <p className="text-sm text-[rgba(30,50,90,0.65)] mb-5">
                    Explore smart contract architecture, Smart Vault SDK references, and RIVR staking stream specifications.
                  </p>
                  <div className="flex flex-col gap-2">
                    {['Smart Vaults Architecture', 'Fluid Staking SDK', 'NFT Collateralization'].map((doc) => (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="text-left px-4 py-3 rounded-2xl bg-white/70 hover:bg-white border border-[rgba(30,50,90,0.08)] text-sm transition-colors cursor-pointer"
                      >
                        {doc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'section' && (
                <div>
                  <h2 className="text-2xl font-normal tracking-tight mb-2">
                    {selectedSection}
                  </h2>
                  <p className="text-sm text-[rgba(30,50,90,0.65)] mb-5">
                    Informasi lengkap, jadwal operasional, serta prosedur pemanfaatan untuk menu <strong>{selectedSection}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-3 rounded-full bg-[rgba(30,50,90,0.85)] hover:bg-[rgba(30,50,90,1)] text-white text-sm font-normal transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
