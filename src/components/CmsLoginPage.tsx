import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { CmsUser } from '../types/cms';
import {
  authClient,
  getInMemoryAuthToken,
  setInMemoryAuthToken,
} from '../lib/authClient';

interface CmsLoginPageProps {
  onLoginSuccess: (user: CmsUser, token: string) => void;
  onBackHome: () => void;
}

const LOGO_URL = 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Logo.webp';
const HERO_BG_URL =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png';

export function CmsLoginPage({ onLoginSuccess, onBackHome }: CmsLoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgFailed, setBgFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  // First-run Super Admin claim flow (active only when DB has 0 users and no env seed)
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [setupDisplayName, setSetupDisplayName] = useState('');
  const [setupUsername, setSetupUsername] = useState('admin');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/auth-setup/status', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { ok?: boolean; needsSetup?: boolean };
      })
      .then((data) => {
        if (!active) return;
        setNeedsSetup(Boolean(data?.ok && data?.needsSetup));
      })
      .catch(() => {
        // ignore check errors
      })
      .finally(() => {
        if (active) setCheckingSetup(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const signInAndLoadProfile = async (loginId: string, pass: string) => {
    const trimmed = loginId.trim();
    const isEmail = trimmed.includes('@');

    const signInResult = isEmail
      ? await authClient.signIn.email({
          email: trimmed.toLowerCase(),
          password: pass,
          rememberMe: true,
        })
      : await authClient.signIn.username({
          username: trimmed.toLowerCase(),
          password: pass,
          rememberMe: true,
        });

    if (signInResult.error) {
      const rawMsg = signInResult.error.message || '';
      if (/banned/i.test(rawMsg)) {
        setError('Akun Anda sedang dinonaktifkan. Hubungi Super Admin P2B.');
      } else if (/invalid|password|credential|not found/i.test(rawMsg)) {
        setError('Username/email atau password tidak sesuai.');
      } else {
        setError(rawMsg || 'Login gagal. Periksa kembali kredensial Anda.');
      }
      return;
    }

    const returnedToken =
      getInMemoryAuthToken() ||
      (signInResult.data && 'token' in signInResult.data
        ? String((signInResult.data as { token?: string }).token || '')
        : '');
    if (returnedToken) {
      setInMemoryAuthToken(returnedToken);
    }

    const meHeaders: Record<string, string> = {};
    if (returnedToken) {
      meHeaders.Authorization = `Bearer ${returnedToken}`;
    }

    const meRes = await fetch('/api/cms/me', {
      headers: meHeaders,
      credentials: 'include',
      cache: 'no-store',
    });
    const meData = (await meRes.json()) as {
      ok?: boolean;
      user?: CmsUser;
      message?: string;
    };

    if (!meRes.ok || !meData.ok || !meData.user) {
      setError(meData.message || 'Gagal memuat profil akun CMS.');
      return;
    }

    onLoginSuccess(meData.user, returnedToken);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Mohon masukkan username/email dan password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signInAndLoadProfile(identifier, password);
    } catch {
      setError('Tidak dapat terhubung ke server autentikasi. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const uname = setupUsername.trim();
    if (!uname || uname.length < 3) {
      setError('Username minimal 3 karakter.');
      return;
    }
    if (setupPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth-setup/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: uname,
          displayName: setupDisplayName.trim() || 'Super Admin P2B',
          email: setupEmail.trim() || undefined,
          password: setupPassword,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        if (res.status === 409) {
          setNeedsSetup(false);
        }
        setError(data.message || 'Gagal mendaftarkan akun Super Admin pertama.');
        return;
      }

      await signInAndLoadProfile(uname, setupPassword);
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
            {checkingSetup ? (
              <div className="py-10 flex flex-col items-center gap-3 text-center">
                <div className="w-7 h-7 rounded-full border-2 border-[#C9A45A]/40 border-t-[#164234] animate-spin" />
                <span className="text-xs text-[#3E544B]">
                  Memeriksa layanan autentikasi...
                </span>
              </div>
            ) : needsSetup ? (
              <>
                <div className="flex flex-col gap-2 mb-6 text-center">
                  <span className="text-xs uppercase tracking-[0.16em] text-[#8F6D26]">
                    Aktivasi Awal · Better Auth
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-normal text-[#164234] tracking-tight">
                    Buat Akun Super Admin
                  </h1>
                  <p className="text-xs sm:text-sm text-[#3E544B] leading-relaxed">
                    Belum ada pengguna CMS terdaftar. Daftarkan akun Super Admin pertama untuk mengelola peran Admin & Editor Berita.
                  </p>
                </div>

                <form onSubmit={handleSetupClaim} noValidate className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="setup-name" className="text-xs text-[#3E544B]">
                      Nama Lengkap
                    </label>
                    <input
                      id="setup-name"
                      type="text"
                      value={setupDisplayName}
                      onChange={(e) => setSetupDisplayName(e.target.value)}
                      placeholder="Super Admin P2B"
                      className="px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/35 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="setup-username" className="text-xs text-[#3E544B]">
                      Username
                    </label>
                    <input
                      id="setup-username"
                      type="text"
                      value={setupUsername}
                      onChange={(e) => setSetupUsername(e.target.value)}
                      placeholder="admin"
                      className="px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/35 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="setup-email" className="text-xs text-[#3E544B]">
                      Email (Opsional)
                    </label>
                    <input
                      id="setup-email"
                      type="email"
                      value={setupEmail}
                      onChange={(e) => setSetupEmail(e.target.value)}
                      placeholder="p2b@uinsalatiga.ac.id"
                      className="px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/35 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="setup-password" className="text-xs text-[#3E544B]">
                      Password (min. 6 karakter)
                    </label>
                    <input
                      id="setup-password"
                      type="password"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      placeholder="Masukkan password kuat"
                      className="px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/35 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="setup-confirm" className="text-xs text-[#3E544B]">
                      Konfirmasi Password
                    </label>
                    <input
                      id="setup-confirm"
                      type="password"
                      value={setupConfirmPassword}
                      onChange={(e) => setSetupConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                      className="px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/35 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                    />
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
                    {loading ? 'Menyimpan Akun...' : 'Aktifkan Super Admin & Masuk'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-6 text-center">
                  <span className="text-xs uppercase tracking-[0.16em] text-[#8F6D26]">
                    CMS P2B · UIN Salatiga
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-normal text-[#164234] tracking-tight">
                    Masuk Pengelola Konten
                  </h1>
                </div>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cms-username" className="text-xs text-[#3E544B]">
                      Username atau Email
                    </label>
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/35 focus-within:border-[#164234] transition-colors">
                      <Icon icon="mdi:account-outline" className="w-4 h-4 text-[#B89242] shrink-0" />
                      <input
                        id="cms-username"
                        type="text"
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Masukkan username atau email"
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
              </>
            )}
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
