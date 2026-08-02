## EduPresent 🎓

EduPresent adalah sebuah platform web presentasi interaktif dan _real-time_ yang dirancang khusus untuk memudahkan interaksi antara Guru dan Siswa. Aplikasi ini memungkinkan Guru untuk membagikan halaman PDF presentasi secara tersinkronisasi, dan siswa dapat melihat halaman tersebut bergeser secara _real-time_ di layar mereka masing-masing.

## 🌟 Fitur Utama

*   **Sinkronisasi Presentasi Real-Time:** Halaman presentasi siswa otomatis berpindah saat guru memindahkan halamannya.
*   **Pelacakan Fokus Siswa (Real-Time Radar):** Guru dapat melihat secara langsung siapa saja siswa yang sedang fokus membuka presentasi. Jika siswa berpindah tab browser, namanya akan menghilang dari layar guru dalam 2 detik.
*   **Skala Besar (In-Memory Presence):** Kehadiran siswa dilacak sepenuhnya melalui RAM (_Node.js Global State_), sehingga tidak membebani database dan aman untuk digunakan di tingkat sekolah.
*   **Dashboard Admin:** Admin dapat memantau pendaftaran guru, me-reset _password_, menghapus guru, dan merubah slogan aplikasi.
*   **Auto-Logout Siswa:** Saat presentasi ditutup (_Keluar_) oleh Guru, seluruh kelas siswa otomatis dibubarkan.

## 🌍 PANDUAN DEPLOYMENT VPS (Zero to Hero)

Banyak hal yang bisa menyebabkan _error_ saat pertama kali melakukan deployment ke VPS (seperti fitur _upload_ gagal atau tombol _logout/delete_ mendapatkan error `403 Forbidden`).

Ikuti **langkah-langkah berurutan** di bawah ini untuk memastikan aplikasi Anda berjalan sempurna di VPS (terutama yang menggunakan Nginx sebagai Reverse Proxy).

### Langkah 1: Persiapan Nginx (Sangat Penting untuk PDF)

Secara bawaan, Nginx menolak _file_ yang diunggah jika ukurannya melebihi 1MB. Kita harus memperbesarnya agar Guru bisa mengunggah PDF.

1.  Buka konfigurasi Nginx Anda di VPS:
2.  Tambahkan atau ubah baris berikut di dalam blok `http { ... }` atau `server { ... }`:
3.  Simpan dan _restart_ Nginx:

### Langkah 2: Unduh Kode & Konfigurasi Keamanan (CSRF)

Fitur _Server Actions_ Next.js 14 akan memblokir aksi (seperti klik tombol Hapus/Logout/Buat) jika domain tidak dikenali, menghasilkan error `403 Forbidden`.

1.  _Clone_ atau _Pull_ (_tarik_) kode terbaru ke VPS Anda.
2.  Buka file `next.config.mjs` dan pastikan domain VPS Anda tertulis di `allowedOrigins`. Contoh:

### Langkah 3: Hak Akses Folder Upload

Aplikasi butuh hak untuk menulis (_write_) ke dalam sistem agar bisa menyimpan file PDF.

```plaintext
# Pastikan Anda berada di direktori proyek presentasi
mkdir -p public/uploads
chmod -R 775 public/uploads
```

### Langkah 4: Instalasi Redis & Database

Aplikasi ini menggunakan **Redis** untuk melacak kehadiran ribuan siswa secara sinkron dan instan (real-time) di seluruh proses PM2.

1.  Install Redis di VPS (Ubuntu/Debian):
2.  Buat file `.env` di folder `presentasi` jika belum ada, dan tambahkan koneksi Redis (biarkan default jika Redis Anda berjalan di port standar tanpa password):
3.  Install paket Node.js:
4.  Buat kerangka database SQLite:

### Langkah 5: Build Aplikasi

**Perhatian:** Langkah ini WAJIB dilakukan setelah Anda mengedit file `next.config.mjs` atau merubah sumber data (Redis/Database). Jika Anda belum menjalankan perintah ini, konfigurasi keamanan domain tidak akan aktif!

```plaintext
npm run build
```

### Langkah 6: Jalankan dengan PM2

PM2 akan memastikan aplikasi Anda hidup 24 jam nonstop.

```plaintext
# Mulai aplikasi menggunakan PM2 (port default 3000)
pm2 start ecosystem.config.js

# ATAU, jika Anda ingin menggunakan Custom Port (contoh port 4000)
pm2 start npm --name "edupresent" -- start -- -p 4000
```

Untuk membuat aplikasi ini otomatis menyala ketika VPS mati/direstart:

```plaintext
pm2 save
pm2 startup
```

## 🚀 Panduan Instalasi (Development Lokal)

Jika Anda ingin menjalankan aplikasi ini di komputer lokal Anda untuk modifikasi kode:

1.  `git clone <repo-url>` lalu `cd presentasi`
2.  `npm install`
3.  `npx prisma db push`
4.  `npm run dev`

## 🧑‍💻 Hak Akses & Akun Default

*   **Login Admin**
    *   Username: `admin`
    *   Password: `1`
*   Akun Guru dapat didaftarkan secara bebas melalui halaman `/teacher/register`.

\> **Catatan Server:** File presentasi (PDF) yang diupload disimpan di dalam folder `public/uploads/`. Pastikan folder ini aman dan jangan sampai terhapus saat Anda melakukan _redeployment_ (memperbarui kode dari git).  
 

```plaintext
npx prisma generate
npx prisma db push
```

```plaintext
npm install
```

```plaintext
REDIS_URL="redis://localhost:6379"
```

```plaintext
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
      allowedOrigins: ['slide.smkn1abang.sch.id', 'www.slide.smkn1abang.sch.id'], // GANTI DENGAN DOMAIN ANDA
    },
  },
};
export default nextConfig;
```

```plaintext
cd /lokasi/folder/presentasi
git pull
```

```plaintext
sudo systemctl restart nginx
```

```plaintext
client_max_body_size 50M;
```

```plaintext
sudo nano /etc/nginx/nginx.conf
# atau sudo nano /etc/nginx/sites-available/default



# Gabungan
git pull && pm2 stop layar && rm -rf .next && npm run build && pm2 start layar
```