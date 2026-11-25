import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { authClient } from '../lib/authClient';
import {
  CMS_ROLE_LIST,
  CMS_ROLE_META,
  CmsRoleKey,
  normalizeCmsRole,
} from '../lib/authRoles';
import { CmsUser, ManagedCmsUser } from '../types/cms';

interface CmsUsersPanelProps {
  currentUser: CmsUser;
  onNotify: (msg: string) => void;
}

export function CmsUsersPanel({ currentUser, onNotify }: CmsUsersPanelProps) {
  const [users, setUsers] = useState<ManagedCmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | CmsRoleKey>('all');

  // Create user form
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<CmsRoleKey>('editor_berita');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Reset password modal/inline
  const [resetPwUser, setResetPwUser] = useState<ManagedCmsUser | null>(null);
  const [resetPwValue, setResetPwValue] = useState('');
  const [savingResetPw, setSavingResetPw] = useState(false);
  const [resetPwError, setResetPwError] = useState('');

  // Row action loading / inline delete confirm
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authClient.admin.listUsers({
        query: {
          limit: 100,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        },
      });
      if (res.error) {
        setError(res.error.message || 'Gagal memuat daftar pengguna.');
        return;
      }
      const rawUsers = (res.data?.users || []) as unknown as Array<
        Record<string, unknown>
      >;
      const mapped: ManagedCmsUser[] = rawUsers.map((u) => {
        const uname = String(u.username || u.email || '');
        return {
          id: String(u.id),
          name: String(u.name || uname || 'Pengguna'),
          username: uname,
          displayUsername: u.displayUsername ? String(u.displayUsername) : undefined,
          email: String(u.email || ''),
          role: normalizeCmsRole(u.role ? String(u.role) : 'editor_berita'),
          banned: Boolean(u.banned),
          banReason: u.banReason ? String(u.banReason) : null,
          createdAt: u.createdAt ? String(u.createdAt) : new Date().toISOString(),
        };
      });
      setUsers(mapped);
    } catch {
      setError('Tidak dapat memuat data pengguna dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanName = newName.trim();
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanName) {
      setCreateError('Nama lengkap wajib diisi.');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3 || !/^[a-z0-9._-]+$/.test(cleanUsername)) {
      setCreateError(
        'Username minimal 3 karakter dan hanya menggunakan huruf kecil, angka, titik, atau garis bawah.'
      );
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setCreateError('Password minimal 6 karakter.');
      return;
    }

    const effectiveEmail =
      cleanEmail && cleanEmail.includes('@')
        ? cleanEmail
        : `${cleanUsername}@cms.p2b.local`;

    setCreating(true);
    try {
      const res = await authClient.admin.createUser({
        email: effectiveEmail,
        password: newPassword,
        name: cleanName,
        role: newRole,
        data: {
          username: cleanUsername,
          displayUsername: newUsername.trim(),
        },
      });
      if (res.error) {
        const msg = res.error.message || '';
        if (/username/i.test(msg)) {
          setCreateError('Username tersebut sudah digunakan akun lain.');
        } else if (/email/i.test(msg)) {
          setCreateError('Email tersebut sudah digunakan akun lain.');
        } else {
          setCreateError(msg || 'Gagal membuat akun pengguna baru.');
        }
        return;
      }

      setNewName('');
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('editor_berita');
      setCreateOpen(false);
      onNotify(`Akun "${cleanName}" (${CMS_ROLE_META[newRole].label}) berhasil dibuat.`);
      await loadUsers();
    } catch {
      setCreateError('Terjadi kesalahan saat menyimpan akun baru.');
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (target: ManagedCmsUser, nextRole: CmsRoleKey) => {
    if (target.role === nextRole) return;
    if (target.id === currentUser.id) {
      setError('Anda tidak dapat mengubah peran akun yang sedang digunakan sendiri.');
      return;
    }
    setBusyUserId(target.id);
    setError('');
    try {
      const res = await authClient.admin.setRole({
        userId: target.id,
        role: nextRole,
      });
      if (res.error) {
        setError(res.error.message || 'Gagal memperbarui peran pengguna.');
        return;
      }
      onNotify(`Peran "${target.name}" diperbarui menjadi ${CMS_ROLE_META[nextRole].label}.`);
      await loadUsers();
    } catch {
      setError('Gagal memperbarui peran pengguna.');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleBan = async (target: ManagedCmsUser) => {
    if (target.id === currentUser.id) {
      setError('Anda tidak dapat menonaktifkan akun Anda sendiri.');
      return;
    }
    setBusyUserId(target.id);
    setError('');
    try {
      const res = target.banned
        ? await authClient.admin.unbanUser({ userId: target.id })
        : await authClient.admin.banUser({
            userId: target.id,
            banReason: 'Dinonaktifkan oleh Super Admin CMS',
          });
      if (res.error) {
        setError(res.error.message || 'Gagal memperbarui status akun.');
        return;
      }
      onNotify(
        target.banned
          ? `Akun "${target.name}" kembali diaktifkan.`
          : `Akun "${target.name}" dinonaktifkan.`
      );
      await loadUsers();
    } catch {
      setError('Gagal memperbarui status aktif pengguna.');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (target: ManagedCmsUser) => {
    if (target.id === currentUser.id) {
      setError('Anda tidak dapat menghapus akun yang sedang aktif login.');
      return;
    }
    setBusyUserId(target.id);
    setError('');
    try {
      const res = await authClient.admin.removeUser({ userId: target.id });
      if (res.error) {
        setError(res.error.message || 'Gagal menghapus pengguna.');
        return;
      }
      setConfirmDeleteId(null);
      onNotify(`Akun "${target.name}" berhasil dihapus.`);
      await loadUsers();
    } catch {
      setError('Gagal menghapus akun pengguna.');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwUser) return;
    if (resetPwValue.length < 6) {
      setResetPwError('Password baru minimal 6 karakter.');
      return;
    }
    setSavingResetPw(true);
    setResetPwError('');
    try {
      const res = await authClient.admin.setUserPassword({
        userId: resetPwUser.id,
        newPassword: resetPwValue,
      });
      if (res.error) {
        setResetPwError(res.error.message || 'Gagal mengatur ulang password.');
        return;
      }
      onNotify(`Password untuk "${resetPwUser.name}" berhasil diatur ulang.`);
      setResetPwUser(null);
      setResetPwValue('');
    } catch {
      setResetPwError('Gagal terhubung ke server.');
    } finally {
      setSavingResetPw(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Role Profiles Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {CMS_ROLE_LIST.map((roleMeta) => {
          const count = users.filter((u) => u.role === roleMeta.key).length;
          return (
            <div
              key={roleMeta.key}
              className="rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-6 flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#8F6D26]">
                    Profil Peran
                  </span>
                  <span className="text-xs font-medium tabular-nums text-[#164234]">
                    {count} akun
                  </span>
                </div>
                <h3 className="text-xl font-normal text-[#164234]">
                  {roleMeta.label}
                </h3>
                <p className="text-xs sm:text-sm text-[#3E544B] leading-relaxed">
                  {roleMeta.description}
                </p>
              </div>
              <ul className="flex flex-col gap-1.5 pt-3 border-t border-[#C9A45A]/20">
                {roleMeta.capabilities.map((cap) => (
                  <li
                    key={cap}
                    className="flex items-start gap-2 text-xs text-[#164234]/85"
                  >
                    <Icon
                      icon="mdi:check"
                      className="w-3.5 h-3.5 text-[#8F6D26] shrink-0 mt-0.5"
                    />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* User Directory & Actions */}
      <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/70 backdrop-blur-xl border border-[#C9A45A]/30 p-5 sm:p-7 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.14em] text-[#8F6D26]">
              Better Auth · Manajemen Akses
            </span>
            <h2 className="text-2xl font-normal text-[#164234]">
              Daftar Pengguna & Profil Redaksi
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateError('');
              setCreateOpen((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer w-fit"
          >
            <Icon
              icon={createOpen ? 'mdi:close' : 'mdi:account-plus-outline'}
              className="w-4 h-4 text-[#F4D993]"
            />
            <span>{createOpen ? 'Tutup Formulir' : 'Tambah Akun Baru'}</span>
          </button>
        </div>

        {/* Create User Inline Drawer */}
        {createOpen && (
          <form
            onSubmit={handleCreateUser}
            className="rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/35 p-5 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                Akun CMS Baru
              </span>
              <h3 className="text-lg font-normal text-[#164234]">
                Buat Profil Super Admin, Admin, atau Editor Berita
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#3E544B]">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Mis. Redaksi Humas P2B"
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#3E544B]">Username Login</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="editor_berita"
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#3E544B]">Profil / Peran</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as CmsRoleKey)}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                >
                  {CMS_ROLE_LIST.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#3E544B]">Email (Opsional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Otomatis jika dikosongkan"
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs text-[#3E544B]">
                  Password Awal (min. 6 karakter)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password awal"
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
                />
              </div>
            </div>

            {createError && (
              <div className="px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]">
                {createError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 rounded-full border border-[#C9A45A]/40 text-xs sm:text-sm text-[#3E544B] hover:text-[#164234] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] disabled:opacity-60 text-[#F6F3EC] text-xs sm:text-sm transition-colors cursor-pointer"
              >
                {creating ? 'Menyimpan...' : 'Simpan Akun Baru'}
              </button>
            </div>
          </form>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'super_admin', 'admin', 'editor_berita'] as const).map((r) => {
              const active = roleFilter === r;
              const label = r === 'all' ? 'Semua Peran' : CMS_ROLE_META[r].label;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#164234] text-[#F6F3EC]'
                      : 'bg-[#FAF8F3] text-[#3E544B] border border-[#C9A45A]/25 hover:border-[#164234]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#C9A45A]/30 w-full sm:w-64">
            <Icon icon="mdi:magnify" className="w-4 h-4 text-[#8F6D26] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau username..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#164234] focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-2.5 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/25 text-xs text-[#9b2c2c]">
            {error}
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="py-10 text-center text-xs text-[#3E544B]">
            Memuat daftar akun CMS...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#3E544B]">
            Tidak ada akun yang sesuai dengan filter pencarian.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#C9A45A]/20 border border-[#C9A45A]/25 rounded-2xl bg-white/80 overflow-hidden">
            {filteredUsers.map((item) => {
              const isSelf = item.id === currentUser.id;
              const isBusy = busyUserId === item.id;
              const roleMeta = CMS_ROLE_META[item.role];

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#164234]/10 border border-[#C9A45A]/30 flex items-center justify-center shrink-0 text-sm font-medium text-[#164234]">
                      {item.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-medium text-[#164234] truncate">
                          {item.name}
                        </span>
                        {isSelf && (
                          <span className="text-[11px] uppercase tracking-wider text-[#8F6D26]">
                            · Akun Anda
                          </span>
                        )}
                        {item.banned && (
                          <span className="text-[11px] uppercase tracking-wider text-[#9b2c2c]">
                            · Nonaktif
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#3E544B] truncate">
                        @{item.username} · {item.email}
                      </span>
                      <span className="text-[11px] text-[#8F6D26]">
                        Profil aktif: {roleMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      aria-label={`Ubah peran untuk ${item.name}`}
                      disabled={isSelf || isBusy}
                      value={item.role}
                      onChange={(e) =>
                        handleRoleChange(item, e.target.value as CmsRoleKey)
                      }
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-xs text-[#164234] disabled:opacity-60 focus:outline-none cursor-pointer"
                    >
                      {CMS_ROLE_LIST.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        setResetPwUser(item);
                        setResetPwValue('');
                        setResetPwError('');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#C9A45A]/35 text-xs text-[#164234] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
                    >
                      Atur Password
                    </button>

                    {!isSelf && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleBan(item)}
                          className="px-3 py-1.5 rounded-xl border border-[#C9A45A]/35 text-xs text-[#3E544B] hover:text-[#164234] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
                        >
                          {item.banned ? 'Aktifkan' : 'Nonaktifkan'}
                        </button>

                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDeleteUser(item)}
                              className="px-3 py-1.5 rounded-xl bg-[#9b2c2c] text-white text-xs cursor-pointer"
                            >
                              Konfirmasi Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1.5 rounded-xl border border-[#C9A45A]/30 text-xs text-[#3E544B] cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label={`Hapus ${item.name}`}
                            className="px-3 py-1.5 rounded-xl border border-[#9b2c2c]/30 text-xs text-[#9b2c2c] hover:bg-[#9b2c2c]/10 transition-colors cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset User Password Modal */}
      {resetPwUser && (
        <div
          onClick={() => setResetPwUser(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/35 backdrop-blur-sm"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleResetPasswordSubmit}
            className="w-full max-w-md rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/40 p-6 flex flex-col gap-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Atur Ulang Password
                </span>
                <h3 className="text-lg font-normal text-[#164234]">
                  {resetPwUser.name} (@{resetPwUser.username})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPwUser(null)}
                className="w-8 h-8 rounded-full bg-[#164234]/10 flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4 text-[#164234]" />
              </button>
            </div>

            <input
              type="password"
              required
              value={resetPwValue}
              onChange={(e) => setResetPwValue(e.target.value)}
              placeholder="Password baru (min. 6 karakter)"
              className="px-4 py-3 rounded-2xl bg-white border border-[#C9A45A]/30 text-sm text-[#164234] focus:outline-none focus:border-[#164234]"
            />

            {resetPwError && (
              <div className="px-4 py-2 rounded-2xl bg-[#9b2c2c]/10 text-xs text-[#9b2c2c]">
                {resetPwError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetPwUser(null)}
                className="px-4 py-2 rounded-full border border-[#C9A45A]/35 text-xs text-[#3E544B] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingResetPw}
                className="px-5 py-2 rounded-full bg-[#164234] text-[#F6F3EC] text-xs cursor-pointer disabled:opacity-60"
              >
                {savingResetPw ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
