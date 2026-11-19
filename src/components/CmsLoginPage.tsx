import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { CmsUser } from '../types/cms';

interface CmsLoginPageProps {
  onLoginSuccess: (user: CmsUser, token: string) => void;
  onBackHome: () => void;
}

const LOGO_URL = 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Logo.webp';
const HERO_BG_URL =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png';

export function CmsLoginPage({ onLoginSuccess, onBackHome }: CmsLoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgFailed, setBgFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Mohon masukkan username dan password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cms/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        token?: string;
        user?: CmsUser;
        message?: string;
      };

      if (!res.ok || !data.ok || !data.user || !data.token) {
        setError(data.message || 'Login gagal. Periksa kembali kredensial Anda.');
        return;
      }

      onLoginSuccess(data.user, data.token);
    } catch {
      setError('Tidak dapat terhubung ke server CMS. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-3 md:p-5 bg-[#F6F3EC]">
      <motion.section
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[1536px] min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2.5rem)] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden flex flex-col justify-between border border-[#C9A45A]/25"
      >
        {/* Emerald fallback backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B261D] via-[#164234] to-[#1E5644] z-0" />

        {!bgFailed && (
          <img
            src={HERO_BG_URL}
            alt="Auditorium Student Centre UIN Salatiga"
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-[65%] lg:object-center z-0"
          />
        )}

        {/* Deep emerald gradient scrim matching Hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A241B]/90 via-[#164234]/75 to-[#164234]/40 z-0 pointer-events-none" />

        {/* Top Header Bar inside Hero */}
        <div className="relative z-10 w-full flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
          <button
            type="button"
            onClick={onBackHome}
            aria-label="Beranda P2B UIN Salatiga"
            className="inline-flex items-center bg-transparent border-0 p-0 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {!logoFailed ? (
              <img
                src={LOGO_URL}
                alt="Logo Pusat Pengembangan Bisnis UIN Salatiga"
                referrerPolicy="no-referrer"
                onError={() => setLogoFailed(true)}
                className="h-9 lg:h-11 w-auto object-contain"
              />
            ) : (
              <span className="text-base font-normal tracking-tight text-[#FAF8F3]">
                P2B UIN Salatiga
              </span>
            )}
          </button>

          <span className="text-xs sm:text-sm uppercase tracking-[0.16em] text-[#F4D993]">
            Portal Redaksi CMS
          </span>
        </div>

        {/* Centered Hero-Styled Glassmorphism Login Card */}
        <div className="relative z-10 flex-1 w-full flex items-center justify-center px-4 sm:px-6 py-12 pb-24 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-[1.75rem] md:rounded-[2.5rem] bg-[#FAF8F3]/92 backdrop-blur-2xl border border-[#C9A45A]/40 p-6 sm:p-8 md:p-10 shadow-[0_24px_60px_rgba(10,36,27,0.32)]"
          >
            <div className="flex flex-col gap-2 mb-6 text-center">
              <span className="text-xs uppercase tracking-[0.16em] text-[#8F6D26]">
                CMS P2B · UIN Salatiga
              </span>
              <h1 className="text-2xl sm:text-3xl font-normal text-[#164234] tracking-tight">
                Masuk Pengelola Konten
              </h1>
              <p className="text-xs sm:text-sm text-[#3E544B] leading-relaxed">
                Kelola berita, konten beranda, tanggapan pembaca, serta pesan masuk layanan P2B.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cms-username" className="text-xs text-[#3E544B]">
                  Username
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/35 focus-within:border-[#164234] transition-colors">
                  <Icon icon="mdi:account-outline" className="w-4 h-4 text-[#B89242] shrink-0" />
                  <input
                    id="cms-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Masukkan username"
                    className="w-full bg-transparent text-sm text-[#164234] placeholder:text-[#3E544B]/45 focus:outline-none min-w-0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="cms-password" className="text-xs text-[#3E544B]">
                  Password
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/35 focus-within:border-[#164234] transition-colors">
                  <Icon icon="mdi:lock-outline" className="w-4 h-4 text-[#B89242] shrink-0" />
                  <input
                    id="cms-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Masukkan password"
                    className="w-full bg-transparent text-sm text-[#164234] placeholder:text-[#3E544B]/45 focus:outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    className="text-[#3E544B]/70 hover:text-[#164234] cursor-pointer bg-transparent border-0 p-0"
                  >
                    {showPassword ? (
                      <Icon icon="mdi:eye-off-outline" className="w-4 h-4" />
                    ) : (
                      <Icon icon="mdi:eye-outline" className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-3.5 rounded-full bg-[#164234] hover:bg-[#1E5644] disabled:opacity-60 text-[#F6F3EC] border border-[#C9A45A]/45 text-sm font-normal transition-colors cursor-pointer"
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke CMS'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Hero Signature Bottom-Right Faux-Cutout Corner Link */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onBackHome();
          }}
          className="absolute bottom-0 right-0 px-6 py-4 pt-5 pl-8 sm:px-7 sm:py-5 sm:pt-6 sm:pl-10 md:px-9 md:py-6 md:pt-8 md:pl-12 bg-[#F6F3EC] rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3.5rem] flex items-center z-10 group cursor-pointer"
        >
          {/* Top intersection mask */}
          <div className="absolute -top-[1.5rem] sm:-top-[2rem] md:-top-[3.5rem] right-0 w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#F6F3EC" />
            </svg>
          </div>

          {/* Left intersection mask */}
          <div className="absolute bottom-0 -left-[1.5rem] sm:-left-[2rem] md:-left-[3.5rem] w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#F6F3EC" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-[15px] md:text-[19px] font-normal text-[#164234] whitespace-nowrap">
              Website Utama
            </span>
            <div className="flex items-center gap-1 text-[#8F6D26] group-hover:text-[#164234] transition-colors">
              <span className="text-[12px] md:text-[14px] font-normal whitespace-nowrap">
                Kembali ke Beranda
              </span>
              <Icon icon="mdi:chevron-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </a>
      </motion.section>
    </div>
  );
}
