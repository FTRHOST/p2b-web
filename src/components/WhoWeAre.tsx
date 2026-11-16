import { useState } from 'react';
import { ArrowUpRight, ChevronRight, Layers, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardData {
  id: string;
  title: string;
  subtitle: string;
  linkLabel: string;
  href: string;
  image: string;
  description: string;
  highlights: string[];
}

const products: ProductCardData[] = [
  {
    id: 'smart-vaults',
    title: 'Smart Vaults',
    subtitle: 'Automated collateral & instant liquidity',
    linkLabel: 'Explore Vaults',
    href: '#smart-vaults',
    image: '/src/assets/images/product_smart_vaults_1794835686973.jpg',
    description:
      'Deposit RIVR, yield-bearing tokens, or blue-chip NFTs into non-custodial Smart Vaults to unlock instant liquid credit while your underlying positions continue compounding.',
    highlights: [
      'Zero-liquidation dynamic collateral buffers',
      'Automated yield harvesting and debt repayment',
      'Composable vault receipts usable across DeFi',
    ],
  },
  {
    id: 'fluid-staking',
    title: 'Fluid Staking',
    subtitle: 'Real-time continuous asset streams',
    linkLabel: 'Open Streams',
    href: '#fluid-staking',
    image: '/src/assets/images/product_fluid_staking_1794835686294.jpg',
    description:
      'Convert locked governance tokens and rigid staking schedules into second-by-second transferable asset streams with zero epoch wait times.',
    highlights: [
      'Per-second reward accrual and instant claim',
      'Streamable staked positions with full governance rights',
      'Cross-protocol liquidity routing with minimal slippage',
    ],
  },
];

export function WhoWeAre() {
  const [selectedProduct, setSelectedProduct] = useState<ProductCardData | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section
      id="who-we-are"
      className="w-full flex justify-center px-3 md:px-5 pt-8 md:pt-14 pb-12 md:pb-20 bg-[#f0f0f0]"
    >
      <div className="w-full max-w-[1536px] flex flex-col gap-8 md:gap-12">
        {/* Intro Header Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="px-3 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-12"
        >
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-normal text-[rgba(30,50,90,0.6)] uppercase tracking-wider">
              About RIVR
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal text-[#5E6470] tracking-tight leading-[1.06]">
              Who We Are
            </h2>
          </div>

          <p className="text-sm sm:text-base md:text-lg text-[#5E6470] opacity-85 leading-relaxed max-w-xl font-normal">
            RIVR is a decentralized liquidity protocol turning static vaults, staked positions, and digital collectibles into continuous cashflow streams—built for capital efficiency without giving up custody.
          </p>
        </motion.div>

        {/* 2 Product Cards Grid matching Hero architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {products.map((product, index) => (
            <motion.a
              key={product.id}
              href={product.href}
              onClick={(e) => {
                e.preventDefault();
                setSelectedProduct(product);
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: 'easeOut' }}
              className="relative w-full aspect-[4/3] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-white/30 group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(30,50,90,0.5)]"
            >
              {/* Fallback gradient mesh if image fails */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#e2e6ec] via-[#d7dde6] to-[#cfd7e3] flex flex-col items-center justify-center gap-2 text-[rgba(30,50,90,0.5)]">
                <Layers className="w-8 h-8" />
                <span className="text-sm font-normal">{product.title}</span>
              </div>

              {!failedImages[product.id] && (
                <img
                  src={product.image}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [product.id]: true }))
                  }
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              )}

              {/* Frosted Glass Product Overlay (Top-Left, echoing Hero glassmorphism) */}
              <div className="absolute top-4 left-4 md:top-8 md:left-8 p-3.5 md:p-5 rounded-[1.2rem] md:rounded-[1.75rem] bg-white/55 backdrop-blur-xl border border-white/40 max-w-[240px] sm:max-w-[290px] z-10">
                <h3 className="text-lg md:text-2xl font-normal text-[rgba(30,50,90,0.95)] tracking-tight leading-tight">
                  {product.title}
                </h3>
                <p className="text-xs md:text-sm font-normal text-[rgba(30,50,90,0.68)] mt-1 leading-snug">
                  {product.subtitle}
                </p>
              </div>

              {/* Faux-Cutout Bottom-Right Corner with Arrow Redirect Cue */}
              <div className="absolute bottom-0 right-0 p-3 pt-4 pl-6 sm:p-4 sm:pt-5 sm:pl-8 md:p-5 md:pt-6 md:pl-10 bg-[#f0f0f0] rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3rem] flex items-center gap-3 sm:gap-4 z-10">
                {/* Top intersection mask */}
                <div className="absolute -top-[1.5rem] sm:-top-[2rem] md:-top-[3rem] right-0 w-[1.5rem] sm:w-[2rem] md:w-[3rem] h-[1.5rem] sm:h-[2rem] md:h-[3rem] pointer-events-none">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#f0f0f0" />
                  </svg>
                </div>

                {/* Left intersection mask */}
                <div className="absolute bottom-0 -left-[1.5rem] sm:-left-[2rem] md:-left-[3rem] w-[1.5rem] sm:w-[2rem] md:w-[3rem] h-[1.5rem] sm:h-[2rem] md:h-[3rem] pointer-events-none">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#f0f0f0" />
                  </svg>
                </div>

                <div className="bg-[rgba(30,50,90,0.05)] group-hover:bg-[rgba(30,50,90,0.9)] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-[rgba(30,50,90,0.1)] transition-colors duration-300 shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-[rgba(30,50,90,0.85)] group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                <div className="flex flex-col pr-1">
                  <span className="text-[14px] md:text-[17px] font-normal text-[rgba(30,50,90,0.95)] whitespace-nowrap">
                    {product.title}
                  </span>
                  <div className="flex items-center gap-0.5 text-[rgba(30,50,90,0.6)] group-hover:text-[rgba(30,50,90,0.9)] transition-colors">
                    <span className="text-[11px] md:text-[13px] font-normal whitespace-nowrap">
                      {product.linkLabel}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Product Detail Redirect Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
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
                onClick={() => setSelectedProduct(null)}
                aria-label="Close product overview"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(30,50,90,0.06)] hover:bg-[rgba(30,50,90,0.12)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[rgba(30,50,90,0.8)]" />
              </button>

              <span className="text-xs font-normal text-[rgba(30,50,90,0.55)] uppercase tracking-wider">
                RIVR Product Suite
              </span>
              <h3 className="text-2xl md:text-3xl font-normal tracking-tight mt-1 mb-2">
                {selectedProduct.title}
              </h3>
              <p className="text-sm text-[rgba(30,50,90,0.72)] leading-relaxed mb-5">
                {selectedProduct.description}
              </p>

              <ul className="flex flex-col gap-2.5 mb-6">
                {selectedProduct.highlights.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[rgba(30,50,90,0.85)] px-4 py-2.5 rounded-2xl bg-[rgba(30,50,90,0.04)] border border-[rgba(30,50,90,0.07)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-2.5 rounded-full bg-[rgba(30,50,90,0.08)] hover:bg-[rgba(30,50,90,0.14)] text-[rgba(30,50,90,0.9)] text-sm font-normal transition-colors cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={selectedProduct.href}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.replaceState(null, '', selectedProduct.href);
                    setSelectedProduct(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[rgba(30,50,90,0.85)] hover:bg-[rgba(30,50,90,1)] text-white text-sm font-normal transition-colors cursor-pointer"
                >
                  <span>{selectedProduct.linkLabel}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
