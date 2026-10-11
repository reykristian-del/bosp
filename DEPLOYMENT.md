# Panduan Deploy ke cPanel Hosting
## Sistem Pembukuan BOSP - SMP Negeri 1 Tulang Bawang Barat

### ⚠️ Masalah Halaman Kosong - Solusi

Jika setelah deploy ke cPanel hanya muncul halaman kosong, pastikan:

1. **File di-upload dengan benar** - Semua isi folder `dist/` harus di-upload
2. **Struktur folder** - File `index.html` harus di root folder (bukan di dalam subfolder)
3. **File permissions** - File: 644, Folder: 755
4. **.htaccess** - File `.htaccess` harus ikut ter-upload

---

### 📋 Langkah-langkah Deploy

#### Cara 1: Deploy ke Root Domain (domain.com)

1. **Build aplikasi:**
   ```bash
   npm run build
   ```

2. **Upload ke cPanel:**
   - Buka File Manager di cPanel
   - Masuk ke folder `public_html/`
   - Upload SEMUA isi folder `dist/` ke `public_html/`:
     ```
     public_html/
     ├── index.html
     ├── .htaccess
     └── assets/
         ├── index-xxxxx.js
         └── index-xxxxx.css
     ```

3. **Akses:** `https://domain.com`

#### Cara 2: Deploy ke Subfolder (domain.com/bosp)

1. **Build aplikasi** (sudah dikonfigurasi dengan relative paths)

2. **Upload ke cPanel:**
   - Buat folder `bosp` di `public_html/`
   - Upload SEMUA isi folder `dist/` ke `public_html/bosp/`:
     ```
     public_html/
     └── bosp/
         ├── index.html
         ├── .htaccess
         └── assets/
             ├── index-xxxxx.js
             └── index-xxxxx.css
     ```

3. **Edit .htaccess** di `public_html/bosp/`:
   ```apache
   RewriteEngine On
   RewriteBase /bosp/
   
   RewriteCond %{REQUEST_FILENAME} -f [OR]
   RewriteCond %{REQUEST_FILENAME} -d
   RewriteRule ^ - [L]
   
   RewriteRule ^ index.html [L]
   ```

4. **Akses:** `https://domain.com/bosp`

---

### 🔧 Troubleshooting Halaman Kosong

#### 1. Cek Browser Console
- Tekan F12 → Tab Console
- Lihat apakah ada error merah
- Error umum:
  - `Failed to load resource: 404` → Path asset salah
  - `MIME type` → File tidak ter-upload dengan benar
  - `CSP` → Content Security Policy memblokir

#### 2. Cek Network Tab
- Tekan F12 → Tab Network
- Refresh halaman
- Pastikan `index.html`, `.js`, dan `.css` statusnya 200 (bukan 404)

#### 3. Cek File Permissions
Di cPanel File Manager:
- Klik kanan file → Change Permissions
- File: **644** (rw-r--r--)
- Folder: **755** (rwxr-xr-x)

#### 4. Cek .htaccess
Pastikan `.htaccess` ada di folder yang sama dengan `index.html`

#### 5. Clear Cache Browser
- Tekan Ctrl+Shift+R (hard reload)
- Atau buka di Incognito/Private mode

#### 6. Cek PHP Version (jika ada backend)
- cPanel → Select PHP Version
- Minimal PHP 7.4

---

### 📁 Struktur File yang Benar di cPanel

```
public_html/              ← atau subfolder
├── index.html            ← WAJIB ADA
├── .htaccess             ← WAJIB ADA
└── assets/
    ├── index-xxxxx.js    ← File JavaScript
    └── index-xxxxx.css   ← File CSS
```

**JANGAN** seperti ini (SALAH):
```
public_html/
└── dist/                 ← ❌ JANGAN ada folder dist
    ├── index.html
    └── assets/
```

---

### 🔌 Setup Backend PHP (Opsional)

Jika ingin menggunakan database MySQL:

1. **Buat Database di cPanel:**
   - cPanel → MySQL Databases
   - Buat database: `username_bosp`
   - Buat user dan tambahkan ke database

2. **Import Schema:**
   - cPanel → phpMyAdmin
   - Pilih database
   - Tab Import → Upload file `backend/database/schema.sql`

3. **Upload Backend:**
   - Upload folder `backend/` ke `public_html/bosp-api/`

4. **Edit Konfigurasi:**
   Edit `backend/config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'username_bosp');
   define('DB_USER', 'username_user');
   define('DB_PASS', 'password_anda');
   ```

5. **Update Frontend:**
   Edit `src/api.ts`:
   ```typescript
   const USE_API = true;
   const API_BASE_URL = 'https://domain.com/bosp-api/api';
   ```

6. **Build ulang dan upload:**
   ```bash
   npm run build
   ```

---

### ✅ Checklist Sebelum Deploy

- [ ] Sudah run `npm run build`
- [ ] File `.htaccess` ada di folder `dist/`
- [ ] Semua isi folder `dist/` di-upload (bukan folder `dist/` itu sendiri)
- [ ] File permissions: File 644, Folder 755
- [ ] Akses via browser dan cek Console (F12)
- [ ] Clear cache browser (Ctrl+Shift+R)

---

### 🆘 Jika Masih Bermasalah

1. **Screenshot error di Console (F12)**
2. **Cek URL yang diakses** - pastikan benar
3. **Cek File Manager** - pastikan file ada
4. **Hubungi hosting support** jika masih blank

---

### 📞 Kontak Support

Untuk bantuan lebih lanjut, hubungi tim IT SMP Negeri 1 Tulang Bawang Barat.
