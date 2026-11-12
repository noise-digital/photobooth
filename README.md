# Virtual Wedding Photobooth (versi Supabase) — Tutorial

## 1. Buat project Supabase
1. Buka **supabase.com** → Sign in (bisa pakai GitHub) → **New project**.
2. Isi Name (mis. `photobooth`), **Database Password** (simpan!), Region pilih **Southeast Asia (Singapore)** → Create. Tunggu 1–2 menit.

## 2. Buat tabel + keamanan (1 kali tempel)
1. Menu kiri **SQL Editor** → **New query**.
2. Buka file `supabase/setup.sql`, salin SEMUA isinya, tempel, klik **Run**. Harus muncul "Success".
   Ini membuat tabel, aturan keamanan (RLS), dan bucket penyimpanan `media` sekaligus.
   Kalau Run diulang akan error "already exists" — itu normal, abaikan.

## 3. Ambil kunci
**Project Settings → API**: salin **Project URL** dan **anon / publishable key**. Isi ke `supabase/supabase-config.js`.
Hanya pakai anon/publishable key. **Jangan pernah** memakai `service_role` di kode.

## 4. Buat admin pertama
1. **Authentication → Users → Add user → Create new user**: isi email + password, centang **Auto Confirm User**.
2. Salin **UID** user itu (kolom User UID).
3. **SQL Editor**, jalankan (ganti UID):
`insert into admins(user_id) values ('UID-TADI');`

## 5. Deploy ke GitHub Pages
1. Buat repo di GitHub, upload seluruh isi folder (index.html di root).
2. Settings → Pages → Branch `main` / root → Save. URL: `https://USERNAME.github.io/NAMA-REPO/`.
3. (Opsional) tambah **Authentication → URL Configuration → Site URL** dengan URL tersebut.

## 6. Pakai
1. `.../admin/login.html` → login → tab **Wedding** → isi ID (mis. `armanjaya`), nama, tanggal, cover → Simpan.
2. Klik **QR** → download PNG → cetak/tempel di acara.
3. Tab **Frame**: upload PNG transparan + slot foto (x,y,lebar,tinggi 0–1, satu baris per slot). 40 frame placeholder sudah bawaan.
4. Tamu scan QR → Mulai → pilih frame → foto → zoom → rekam suara (opsional) → Simpan → download/share/QR kenangan.
5. Tab **Galeri**: lihat, download, hapus. **Pengaturan**: durasi audio, kualitas, brand.

## 7. Penting sebelum acara
- Paket Free: **project pause setelah 1 minggu tanpa aktivitas**. Buka dashboard Supabase 1–2 hari sebelum acara; kalau status Paused, klik **Restore**. Simpan 1 GB; cek pemakaian di **Storage**.
- Uji di Android (Chrome) dan iPhone (Safari) via HTTPS: kamera, mikrofon, share, link kenangan.

## Masalah umum
| Masalah | Solusi |
|---|---|
| Login gagal | Email/password salah, atau user belum Auto Confirm |
| "Akun ini bukan admin" | Langkah 4.3 belum dijalankan / UID salah |
| `new row violates row-level security` | `setup.sql` belum dijalankan penuh |
| Foto gagal diunggah | Bucket `media` belum ada (jalankan ulang bagian storage di setup.sql) |
| Semua gagal / lambat | Project Paused → Restore |
| Frame upload tidak tampil | Pastikan file PNG ≤ 3 MB dan bucket `media` public |

Catatan: Instagram/TikTok memakai menu share sistem atau simpan lalu unggah manual (tidak ada upload otomatis).
Link kenangan memakai ID acak (sulit ditebak); daftar semua foto hanya bisa dilihat admin.
