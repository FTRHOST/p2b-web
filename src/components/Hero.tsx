import { useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { BottomRightCorner } from './BottomRightCorner';

interface HeroProps {
  onOpenAbout?: () => void;
}

export function Hero({ onOpenAbout }: HeroProps) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [bgFailed, setBgFailed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 48]);
  const bgScale = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 36]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], prefersReducedMotion ? [1, 1] : [1, 0.15]);

  return (
    <div
      ref={heroRef}
      className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#F6F3EC]"
    >
      <motion.section
        initial={{ opacity: 0, scale: 0.99 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[1536px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col items-center justify-center bg-white/20 border border-[#C9A45A]/20 group"
      >
        {/* Fallback backdrop if image fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B261D] via-[#164234] to-[#1E5644] z-0" />

        {!bgFailed && (
          <motion.div
            style={{ y: bgY, scale: bgScale }}
            className="absolute inset-0 w-full h-full z-0 will-change-transform"
          >
            <motion.img
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              src="https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png"
              alt="Auditorium Student Centre UIN Salatiga"
              referrerPolicy="no-referrer"
              onError={() => setBgFailed(true)}
              className="w-full h-full object-cover object-[65%] lg:object-center"
            />
          </motion.div>
        )}

        {/* Deep emerald green gradient scrim for high-contrast white/cream typography */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A241B]/90 via-[#164234]/68 to-[#164234]/28 z-0 pointer-events-none" />

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 pt-16 md:pt-20 pb-12">
          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.08,
                },
              },
            }}
            className="w-full flex flex-col items-center text-center max-w-4xl will-change-transform"
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.98 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[74px] font-normal text-[#FAF8F3] drop-shadow-sm mb-3 tracking-tight leading-[1.06] text-balance"
            >
              Pusat Pengembangan Bisnis
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="text-sm sm:text-base md:text-lg text-[#F6F3EC]/90 leading-relaxed max-w-2xl font-normal"
            >
              Unit strategis UIN Salatiga dalam optimalisasi aset, layanan komersial, kemitraan, dan inovasi bisnis mendukung kemandirian PTN BLU yang profesional serta berkelanjutan.
            </motion.p>
          </motion.div>

          <BottomRightCorner onOpenProfile={onOpenAbout} />
        </div>
      </motion.section>
    </div>
  );
}
