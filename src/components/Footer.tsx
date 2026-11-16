import { useState } from 'react';
import { ArrowUpRight, Check, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalDoc {
  title: string;
  updated: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

const legalDocs: Record<string, LegalDoc> = {
  'Terms of Service': {
    title: 'Terms of Service',
    updated: 'Last updated November 2026',
    summary:
      'Governs access to the RIVR web interface, Smart Vault routing tools, and non-custodial protocol interaction utilities.',
    sections: [
      {
        heading: '1. Non-Custodial Interface',
        body: 'RIVR provides a decentralized web interface for interacting with autonomous smart contracts. Users retain sole custody of private keys and digital assets at all times.',
      },
      {
        heading: '2. Protocol Eligibility',
        body: 'By interacting with RIVR streams or vaults, you confirm compliance with applicable local regulations governing digital asset protocols.',
      },
    ],
  },
  'Privacy Policy': {
    title: 'Privacy Policy',
    updated: 'Last updated November 2026',
    summary:
      'Explains how minimal operational data and voluntary newsletter contact details are handled across RIVR web properties.',
    sections: [
      {
        heading: '1. Data Minimization',
        body: 'We do not collect private keys, seed phrases, or off-chain identity records to read public on-chain vault states.',
      },
      {
        heading: '2. Newsletter Subscriptions',
        body: 'Email addresses submitted through the newsletter form are used exclusively for protocol engineering updates and governance notices.',
      },
    ],
  },
  'Risk Disclosure': {
    title: 'Risk Disclosure',
    updated: 'Last updated November 2026',
    summary:
      'Outlines smart contract, liquidity, collateral volatility, and oracle risks associated with decentralized asset streaming.',
    sections: [
      {
        heading: '1. Smart Contract & Oracle Risk',
        body: 'While RIVR contracts undergo formal verification and third-party audits, on-chain execution carries inherent technical and market risks.',
      },
      {
        heading: '2. Collateral Management',
        body: 'Users are responsible for monitoring Smart Vault health ratios during periods of rapid market volatility.',
      },
    ],
  },
  'Security Audits': {
    title: 'Security Audits',
    updated: 'Last updated November 2026',
    summary:
      'Independent cryptographic and smart contract reviews covering RIVR Core Vaults, Fluid Staking streams, and NFT adapters.',
    sections: [
      {
        heading: '1. Continuous Verification',
        body: 'Core settlement contracts and liquidity stream modules are verified with automated invariant testing and formal audits prior to mainnet deployment.',
      },
      {
        heading: '2. Responsible Disclosure',
        body: 'Security researchers may report potential vulnerabilities through the RIVR bug bounty program for expedited triage.',
      },
    ],
  },
};

const socialLinks = [
  { label: 'X (Twitter)', handle: '@rivrprotocol', href: '#social-x' },
  { label: 'Discord', handle: '5.2K Yielders', href: '#social-discord' },
  { label: 'GitHub', handle: 'rivr-labs', href: '#social-github' },
  { label: 'Mirror', handle: 'Research Log', href: '#social-mirror' },
];

const protocolLinks = [
  { label: 'Fluid Streams', href: '#top' },
  { label: 'Who We Are', href: '#who-we-are' },
  { label: 'Smart Vaults', href: '#smart-vaults' },
  { label: 'Fluid Staking', href: '#fluid-staking' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalDoc | null>(null);
  const [activeSocial, setActiveSocial] = useState<{ label: string; handle: string } | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!isValid) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSubscribedEmail(trimmed);
    setEmail('');
  };

  return (
    <footer className="w-full flex justify-center px-3 md:px-5 pb-4 md:pb-6 bg-[#f0f0f0]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-[1536px] rounded-[1.5rem] md:rounded-[3rem] bg-white/45 backdrop-blur-xl border border-white/60 p-6 sm:p-10 md:p-14 text-[rgba(30,50,90,0.9)]"
      >
        {/* Upper Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-[rgba(30,50,90,0.08)]">
          {/* Brand + Newsletter Signup */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-md">
              <span className="text-2xl font-normal tracking-tighter text-[rgba(30,50,90,0.95)]">
                RIVR
              </span>
              <p className="text-sm md:text-base text-[#5E6470] opacity-85 leading-relaxed font-normal">
                Non-custodial liquidity infrastructure turning Smart Vaults, RIVR staking, and NFTs into continuous cashflow streams.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 max-w-md">
              <span className="text-xs font-normal text-[rgba(30,50,90,0.6)] uppercase tracking-wider">
                Protocol Newsletter
              </span>

              {subscribedEmail ? (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/75 backdrop-blur-md border border-white/70 text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[rgba(30,50,90,0.85)] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[rgba(30,50,90,0.9)] truncate">
                      Subscribed with {subscribedEmail}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubscribedEmail(null)}
                    className="text-xs text-[rgba(30,50,90,0.6)] hover:text-[rgba(30,50,90,0.95)] underline underline-offset-2 shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} noValidate className="flex flex-col gap-2">
                  <div className="flex items-center bg-white/70 backdrop-blur-md border border-[rgba(30,50,90,0.12)] focus-within:border-[rgba(30,50,90,0.4)] rounded-full p-1.5 pl-4 gap-2 transition-colors">
                    <Mail className="w-4 h-4 text-[rgba(30,50,90,0.45)] shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter email for release notes"
                      aria-label="Email address for newsletter"
                      className="w-full bg-transparent text-sm text-[rgba(30,50,90,0.95)] placeholder:text-[rgba(30,50,90,0.45)] focus:outline-none min-w-0"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center bg-[rgba(30,50,90,0.85)] hover:bg-[rgba(30,50,90,1)] text-white rounded-full pl-2 pr-4 py-2 gap-2 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      <span className="bg-white/20 p-1 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                      </span>
                      <span className="text-xs md:text-sm font-normal">Subscribe</span>
                    </motion.button>
                  </div>
                  {error && (
                    <span className="text-xs text-[#9b2c2c] pl-4">{error}</span>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Protocol */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-normal text-[rgba(30,50,90,0.55)] uppercase tracking-wider">
                Protocol
              </span>
              <ul className="flex flex-col gap-2.5 text-sm">
                {protocolLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        if (item.href === '#top') {
                          e.preventDefault();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else if (item.href === '#who-we-are') {
                          e.preventDefault();
                          document
                            .getElementById('who-we-are')
                            ?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-[rgba(30,50,90,0.8)] hover:text-[rgba(30,50,90,1)] transition-colors whitespace-nowrap"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-normal text-[rgba(30,50,90,0.55)] uppercase tracking-wider">
                Social
              </span>
              <ul className="flex flex-col gap-2.5 text-sm">
                {socialLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSocial({ label: item.label, handle: item.handle });
                      }}
                      className="inline-flex items-center gap-1 text-[rgba(30,50,90,0.8)] hover:text-[rgba(30,50,90,1)] transition-colors group whitespace-nowrap"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Documentation */}
            <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
              <span className="text-xs font-normal text-[rgba(30,50,90,0.55)] uppercase tracking-wider">
                Legal
              </span>
              <ul className="flex flex-col gap-2.5 text-sm">
                {Object.keys(legalDocs).map((docKey) => (
                  <li key={docKey}>
                    <button
                      type="button"
                      onClick={() => setActiveLegal(legalDocs[docKey])}
                      className="text-left text-[rgba(30,50,90,0.8)] hover:text-[rgba(30,50,90,1)] transition-colors cursor-pointer whitespace-nowrap bg-transparent border-0 p-0"
                    >
                      {docKey}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[rgba(30,50,90,0.55)]">
          <span>© 2026 RIVR Protocol. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveLegal(legalDocs['Terms of Service'])}
              className="hover:text-[rgba(30,50,90,0.9)] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => setActiveLegal(legalDocs['Privacy Policy'])}
              className="hover:text-[rgba(30,50,90,0.9)] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => setActiveLegal(legalDocs['Security Audits'])}
              className="hover:text-[rgba(30,50,90,0.9)] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Security
            </button>
          </div>
        </div>
      </motion.div>

      {/* Legal Documentation Modal */}
      <AnimatePresence>
        {activeLegal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLegal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/60 p-6 md:p-8 text-[rgba(30,50,90,0.95)] shadow-lg relative"
            >
              <button
                type="button"
                onClick={() => setActiveLegal(null)}
                aria-label="Close legal document"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(30,50,90,0.06)] hover:bg-[rgba(30,50,90,0.12)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[rgba(30,50,90,0.8)]" />
              </button>

              <span className="text-xs text-[rgba(30,50,90,0.55)]">
                {activeLegal.updated}
              </span>
              <h3 className="text-2xl font-normal tracking-tight mt-1 mb-2">
                {activeLegal.title}
              </h3>
              <p className="text-sm text-[rgba(30,50,90,0.7)] leading-relaxed mb-5">
                {activeLegal.summary}
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {activeLegal.sections.map((section) => (
                  <div
                    key={section.heading}
                    className="p-4 rounded-2xl bg-[rgba(30,50,90,0.04)] border border-[rgba(30,50,90,0.07)]"
                  >
                    <h4 className="text-sm font-normal text-[rgba(30,50,90,0.95)] mb-1">
                      {section.heading}
                    </h4>
                    <p className="text-xs text-[rgba(30,50,90,0.7)] leading-relaxed">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveLegal(null)}
                className="w-full py-2.5 rounded-full bg-[rgba(30,50,90,0.85)] hover:bg-[rgba(30,50,90,1)] text-white text-sm font-normal transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Channel Modal */}
      <AnimatePresence>
        {activeSocial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSocial(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/60 p-6 text-[rgba(30,50,90,0.95)] shadow-lg relative"
            >
              <button
                type="button"
                onClick={() => setActiveSocial(null)}
                aria-label="Close social preview"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(30,50,90,0.06)] hover:bg-[rgba(30,50,90,0.12)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[rgba(30,50,90,0.8)]" />
              </button>

              <span className="text-xs uppercase tracking-wider text-[rgba(30,50,90,0.55)]">
                Official Channel
              </span>
              <h3 className="text-xl font-normal tracking-tight mt-1 mb-1">
                RIVR on {activeSocial.label}
              </h3>
              <p className="text-sm text-[rgba(30,50,90,0.7)] mb-5">
                Handle: {activeSocial.handle}
              </p>

              <button
                type="button"
                onClick={() => setActiveSocial(null)}
                className="w-full py-2.5 rounded-full bg-[rgba(30,50,90,0.85)] hover:bg-[rgba(30,50,90,1)] text-white text-sm font-normal transition-colors cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
