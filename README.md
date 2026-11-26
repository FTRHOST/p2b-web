# Website & CMS Pusat Pengembangan Bisnis (P2B) UIN Salatiga

Aplikasi web resmi dan sistem manajemen konten (_Content Management System_) untuk **Pusat Pengembangan Bisnis (P2B) Universitas Islam Negeri (UIN) Salatiga** unit pengelola optimalisasi aset, layanan komersial, kemitraan strategis, tarif layanan PTN BLU, program magang mahasiswa, serta publikasi berita kelembagaan.

> **Dokumentasi Teknis & Tutorial Lengkap**: Baca [**`docs/README.md`**](./docs/README.md) untuk panduan detail seluruh fitur publik, operasional panel CMS, skema database, autentikasi Better Auth & peran (RBAC), referensi API, slot gambar tutorial, dan rencana pengembangan ke depan.

---

## Ringkasan Fitur Utama

- **Website Publik**: Beranda dinamis, Profil Kelembagaan (_Tentang Kami_, _Visi & Misi_, _Struktur Organisasi_), Berita & Update (galeri foto & lampiran PDF), Kerjasama & Sewa Aset (sinkronisasi Google Sheets CSV + sorting), Tarif Layanan (kategori dinamis + PDF Viewer Google Drive & lokal), Program Magang & pendaftaran online, Peta Interaktif Leaflet, serta sinkronisasi real-time WebSocket.
- **Panel CMS (`/silahkanmasuk` & `/cms`)**: Page Builder multi-halaman (Beranda & halaman Profil dengan 19 tipe blok & katalog preset), editor berita TinyMCE, Media Library terpusat (MariaDB), Logo Mitra, manajemen Google Sheets Kerjasama, CRUD kategori & PDF Tarif Layanan, manajemen Magang & kotak masuk pelamar, Pengaturan Situs/SEO, serta manajemen Pengguna & Peran (**Super Admin**, **Admin**, **Editor Berita**) berbasis **Better Auth**.

---

## Teknologi Inti

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion, GSAP, Leaflet, TinyMCE
- **Backend & Real-Time**: Express 4 (`server.ts`), WebSocket (`ws`), Multer
- **Database & Auth**: MariaDB / MySQL (`mysql2/promise`), Better Auth v1.7 (`username`, `admin`, `bearer`)

---

## Menjalankan Proyek Secara Lokal

1. **Instal dependensi**

   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables**
   Salin `.env.example` menjadi `.env` lalu sesuaikan kredensial database MariaDB (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) dan `BETTER_AUTH_SECRET`.

3. **Jalankan mode development** (port `3000`)

   ```bash
   npm run dev
   ```

4. **Validasi & Build Produksi**

   ```bash
   npm run lint
   npm run build
   npm start
   ```

---

## Dokumentasi Lanjutan

- [Dokumentasi Teknis & Panduan CMS (`docs/README.md`)](./docs/README.md)
- [Template Environment Variables (`.env.example`)](./.env.example)
