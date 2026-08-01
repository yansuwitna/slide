# EduPresent 🎓

EduPresent adalah sebuah platform web presentasi interaktif dan *real-time* yang dirancang khusus untuk memudahkan interaksi antara Guru dan Siswa. Aplikasi ini memungkinkan Guru untuk membagikan halaman PDF presentasi secara tersinkronisasi, dan siswa dapat melihat halaman tersebut bergeser secara *real-time* di layar mereka masing-masing.

## 🌟 Fitur Utama
- **Sinkronisasi Presentasi Real-Time:** Halaman presentasi siswa otomatis berpindah saat guru memindahkan halamannya.
- **Pelacakan Fokus Siswa (Real-Time Radar):** Guru dapat melihat secara langsung siapa saja siswa yang sedang fokus membuka presentasi. Jika siswa berpindah tab browser, namanya akan menghilang dari layar guru dalam 2 detik.
- **Skala Besar (In-Memory Presence):** Kehadiran siswa dilacak sepenuhnya melalui RAM (*Node.js Global State*), sehingga tidak membebani database dan aman untuk digunakan di tingkat sekolah.
- **Dashboard Admin:** Admin dapat memantau pendaftaran guru, me-reset *password*, menghapus guru, dan merubah slogan aplikasi.
- **Auto-Logout Siswa:** Saat presentasi ditutup (*Keluar*) oleh Guru, seluruh kelas siswa otomatis dibubarkan.

---

## 🚀 Panduan Instalasi (Development Lokal)

Jika Anda ingin menjalankan aplikasi ini di komputer lokal Anda:

1. **Clone & Install Dependencies**
   ```bash
   git clone <repo-url>
   cd presentasi
   npm install
   ```

2. **Siapkan Database SQLite**
   Karena aplikasi ini menggunakan Prisma + SQLite, Anda wajib me-sinkronisasi strukturnya terlebih dahulu.
   ```bash
   npx prisma db push
   ```

3. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🌍 Panduan Deployment / Hosting (menggunakan PM2)

Jika Anda ingin meng-hosting aplikasi ini di VPS (Virtual Private Server) agar bisa diakses seluruh sekolah secara 24 jam penuh tanpa terputus, Anda sangat disarankan menggunakan **PM2** (Process Manager).

### Prasyarat di Server:
- Node.js (versi 18+)
- NPM
- PM2 terinstal secara global (`npm install -g pm2`)

### Langkah-Langkah Menjalankan EduPresent di PM2:

**1. Masuk ke direktori proyek Anda**
```bash
cd /lokasi/folder/presentasi
```

**2. Install seluruh package (jika belum)**
```bash
npm install
```

**3. Buat dan siapkan Database Production**
```bash
npx prisma generate
npx prisma db push
```

**4. Build Aplikasi Next.js**
(Ini wajib dilakukan sebelum menjalankan Next.js di mode *Production*).
```bash
npm run build
```

**5. Jalankan Aplikasi dengan PM2**
Cara terbaik menjalankan aplikasi di *background* adalah menggunakan file konfigurasi PM2:
```bash
pm2 start ecosystem.config.js
```
*(Pastikan Anda telah membuat file `ecosystem.config.js` di folder proyek Anda)*

**Alternatif: Menjalankan PM2 Langsung dengan Custom Port**
Jika Anda tidak ingin membuat file konfigurasi, Anda bisa menyisipkan port langsung saat menjalankan PM2.

Menggunakan Environment Variable `PORT` (Biasa di Linux/Mac):
```bash
PORT=3001 pm2 start npm --name "aplikasi-ku" -- start
```

Atau meneruskan argumen port (`-p`) ke script Next.js:
```bash
pm2 start npm --name "aplikasi-ku" -- start -- -p 3001
```

*(Catatan: Jika Anda menggunakan server file kustom seperti `app.js`, perintahnya adalah `PORT=3001 pm2 start app.js --name "aplikasi-ku"` atau `pm2 start app.js --name "aplikasi-ku" -- --port 3001`)*

---

## ⚙️ Menjalankan Tanpa PM2 dengan Custom Port

Jika Anda tidak ingin menggunakan PM2 dan ingin menentukan port sesuai keinginan secara manual (contoh: port `4000`), Anda dapat menggunakan perintah berikut:

```bash
npm run start -- -p 4000
```
Atau menggunakan `npx`:
```bash
npx next start -p 4000
```
*(Catatan: Pastikan Anda sudah menjalankan `npm run build` sebelum menggunakan perintah di atas)*

### 💡 Perintah Berguna PM2 Lainnya:

- **Melihat status aplikasi:**
  ```bash
  pm2 status
  ```
- **Melihat log (jika ada error):**
  ```bash
  pm2 logs edupresent
  ```
- **Me-restart aplikasi (Misal setelah ada update):**
  ```bash
  pm2 restart edupresent
  ```
- **Mematikan aplikasi:**
  ```bash
  pm2 stop edupresent
  ```
- **Menyimpan daftar PM2 agar otomatis menyala (auto-start) ketika VPS di-restart:**
  ```bash
  pm2 save
  pm2 startup
  ```

---

## 🛠️ Troubleshooting VPS (Gagal Upload Presentasi)

Jika Anda mengalami kendala **tidak bisa membuat presentasi** (file PDF gagal di-upload) setelah di-deploy ke VPS, periksa 3 hal berikut:

### 1. Batas Upload Next.js (Sudah Diperbaiki)
Secara default, Next.js membatasi upload hingga 1MB. Namun, ini sudah diatasi dengan penambahan konfigurasi di `next.config.mjs` (`bodySizeLimit: '50mb'`).
👉 **Solusi:** Pastikan Anda sudah menarik pembaruan kode ini ke VPS, lalu jalankan `npm run build` dan `pm2 restart edupresent` (atau sesuai nama PM2 Anda).

### 2. Batas Upload NGINX
Jika VPS Anda menggunakan Nginx sebagai *Reverse Proxy*, Nginx akan memblokir file lebih dari 1MB (Error `413 Request Entity Too Large`).
👉 **Solusi:** Buka konfigurasi Nginx Anda (`/etc/nginx/sites-available/default` atau `/etc/nginx/nginx.conf`) dan tambahkan baris ini di dalam blok `server` atau `http`:
```nginx
client_max_body_size 50M;
```
Lalu restart Nginx: `sudo systemctl restart nginx`

### 3. Izin Akses Folder (Permissions)
Aplikasi butuh akses untuk membuat file di dalam folder `public/uploads`.
👉 **Solusi:** Jalankan perintah berikut di folder proyek Anda di VPS:
```bash
mkdir -p public/uploads
chmod -R 775 public/uploads
```

---

## 🧑‍💻 Hak Akses & Akun Default
- **Login Admin**
  - Username: `admin`
  - Password: `1`
- Akun Guru dapat didaftarkan secara bebas melalui halaman `/teacher/register`.

> **Catatan Server/VPS:** File presentasi (PDF) yang diupload disimpan di dalam folder `public/uploads/`. Pastikan folder ini aman dan tidak terhapus saat Anda melakukan *redeployment*.
