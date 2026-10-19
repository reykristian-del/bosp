# 🚀 PANDUAN DEPLOYMENT - credo.my.id/bosp/
## Struktur Folder yang Benar untuk Subfolder /bosp/

---

## 📁 Struktur Folder di Hosting

Aplikasi Anda berada di **`credo.my.id/bosp/`**, jadi struktur folder di hosting harus seperti ini:

```
public_html/
└── bosp/                          ← Subfolder aplikasi
    ├── index.html                 ← Dari dist/
    ├── .htaccess                  ← Dari dist/ (RewriteBase: /bosp/)
    ├── test-api.html              ← Dari public/
    ├── assets/                    ← Dari dist/
    │   ├── index-xxxxx.js
    │   └── index-xxxxx.css
    └── api/                       ← Backend PHP
        ├── index.php              ← Dari backend/api/
        ├── config.php             ← Dari backend/api/
        ├── .htaccess              ← Dari backend/api/
        ├── sync.php               ← Dari backend/api/
        └── test.php               ← Dari backend/api/
```

---

## ✅ Konfigurasi yang Sudah Diperbaiki

### 1. **API URL** (`src/config.ts`)
```typescript
API_BASE_URL: '/bosp/api'  // ← Sudah diperbaiki untuk subfolder /bosp/
```

### 2. **RewriteBase** (`.htaccess`)
```apache
RewriteBase /bosp/  // ← Sudah diperbaiki untuk subfolder /bosp/
```

---

## 📤 Langkah Upload ke Hosting

### Step 1: Build Aplikasi
```bash
npm run build
```

### Step 2: Upload Frontend

Upload **ISI folder `dist/`** ke `public_html/bosp/`:

```
dist/                          →  public_html/bosp/
├── index.html                 →  public_html/bosp/index.html
├── .htaccess                  →  public_html/bosp/.htaccess
└── assets/                    →  public_html/bosp/assets/
    ├── index-xxxxx.js
    └── index-xxxxx.css
```

**JANGAN** upload folder `dist/` itu sendiri, tapi **ISI** foldernya!

### Step 3: Upload Backend

Upload **folder `backend/api/`** ke `public_html/bosp/api/`:

```
backend/api/                   →  public_html/bosp/api/
├── index.php                  →  public_html/bosp/api/index.php
├── config.php                 →  public_html/bosp/api/config.php
├── .htaccess                  →  public_html/bosp/api/.htaccess
├── sync.php                   →  public_html/bosp/api/sync.php
└── test.php                   →  public_html/bosp/api/test.php
```

### Step 4: Upload File Test (Opsional)

Upload `public/test-api.html` ke `public_html/bosp/`:
```
public/test-api.html           →  public_html/bosp/test-api.html
```

---

## 🔧 Konfigurasi Database

### Edit `public_html/bosp/api/config.php`

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'username_bosp');      // Ganti dengan nama database Anda
define('DB_USER', 'username_bospuser');  // Ganti dengan username database
define('DB_PASS', 'password_anda');      // Ganti dengan password database
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key
define('JWT_SECRET', 'ganti_dengan_random_string_yang_panjang');

// Upload directory
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ... rest of config
```

---

## 🗄️ Setup Database MySQL

### Step 1: Buat Database di cPanel

1. Login ke cPanel
2. **MySQL Databases**
3. Create database: `username_bosp`
4. Create user: `username_bospuser`
5. Add user ke database dengan **ALL PRIVILEGES**

### Step 2: Import Schema

1. Buka **phpMyAdmin** di cPanel
2. Pilih database `username_bosp`
3. Tab **Import**
4. Upload file `backend/database/schema.sql`
5. Klik **Go**

---

## 🧪 Testing

### Test 1: Backend Test
Akses: `https://credo.my.id/bosp/api/test.php`

**Harus muncul:**
- ✅ PHP version
- ✅ PDO extension
- ✅ Config file
- ✅ Database connection
- ✅ File permissions

### Test 2: API Health
Akses: `https://credo.my.id/bosp/api/health`

**Harus muncul:**
```json
{
  "status": "ok",
  "message": "API dan database terhubung",
  "timestamp": "2026-01-15 10:30:00"
}
```

### Test 3: Sync Endpoint
Akses: `https://credo.my.id/bosp/api/sync.php`

**Harus muncul:**
```
Method not allowed
```
(Karena butuh POST, bukan GET)

### Test 4: Frontend Test
Akses: `https://credo.my.id/bosp/test-api.html`

Klik **"Test API Health"** → harus success

### Test 5: Aplikasi
Akses: `https://credo.my.id/bosp/`

1. Buka aplikasi
2. Menu **Pengaturan** → **Database**
3. Klik **"Test Koneksi API"**
4. Harus muncul **"API dan database terhubung"**

---

## 🔄 Sinkronisasi Data

### Cara Sync dari localStorage ke MySQL

1. Buka aplikasi: `https://credo.my.id/bosp/`
2. Menu **Pengaturan** → **Database**
3. Klik **"Sync ke MySQL"**
4. Tunggu proses selesai
5. Verifikasi di phpMyAdmin

**URL Sync yang benar:**
```
POST https://credo.my.id/bosp/api/sync
```

---

## 📋 Checklist Deployment

### Frontend:
- [ ] Build aplikasi: `npm run build`
- [ ] Upload isi `dist/` ke `public_html/bosp/`
- [ ] File `index.html` ada di `public_html/bosp/`
- [ ] File `.htaccess` ada di `public_html/bosp/`
- [ ] Folder `assets/` ada di `public_html/bosp/`

### Backend:
- [ ] Upload `backend/api/` ke `public_html/bosp/api/`
- [ ] File `config.php` sudah dikonfigurasi
- [ ] File `sync.php` ada di `public_html/bosp/api/`
- [ ] File `.htaccess` ada di `public_html/bosp/api/`

### Database:
- [ ] Database MySQL sudah dibuat
- [ ] User database sudah dibuat
- [ ] Schema sudah di-import
- [ ] Test `test.php` berhasil

### Testing:
- [ ] `https://credo.my.id/bosp/api/test.php` → berhasil
- [ ] `https://credo.my.id/bosp/api/health` → JSON status "ok"
- [ ] `https://credo.my.id/bosp/` → aplikasi terbuka
- [ ] Sync ke MySQL → berhasil

---

## 🎯 URL yang Benar

| Resource | URL |
|----------|-----|
| Aplikasi | `https://credo.my.id/bosp/` |
| API Health | `https://credo.my.id/bosp/api/health` |
| API Test | `https://credo.my.id/bosp/api/test.php` |
| API Sync | `https://credo.my.id/bosp/api/sync` |
| Frontend Test | `https://credo.my.id/bosp/test-api.html` |

---

## ❌ Kesalahan Umum

### Error 1: "404 Not Found" saat sync

**Penyebab:** URL API salah

**Solusi:**
- Pastikan `API_BASE_URL: '/bosp/api'` di `src/config.ts`
- Pastikan folder `api/` ada di `public_html/bosp/api/`
- Build ulang dan upload ulang

### Error 2: "API tidak tersedia"

**Penyebab:** Backend belum di-upload

**Solusi:**
- Upload folder `backend/api/` ke `public_html/bosp/api/`
- Test: `https://credo.my.id/bosp/api/test.php`

### Error 3: "Database connection failed"

**Penyebab:** Kredensial database salah

**Solusi:**
- Edit `public_html/bosp/api/config.php`
- Pastikan nama database, username, password benar

### Error 4: Halaman blank

**Penyebab:** File tidak ter-upload dengan benar

**Solusi:**
- Pastikan upload **ISI** folder `dist/`, bukan folder `dist/` itu sendiri
- Cek file `index.html` ada di `public_html/bosp/`
- Clear cache browser (Ctrl+Shift+R)

---

## 🔍 Debug dengan Console

Jika ada masalah, buka Console browser (F12):

**Log yang seharusnya muncul saat sync:**
```
🔄 Starting sync to MySQL...
📍 API URL: /bosp/api/sync
📦 Data to sync: { transaksi: 5, bukti_kas: 3, ... }
📡 Request: POST /bosp/api/sync
📥 Response: 200 OK
✅ Success: { success: true, ... }
```

**Jika error 404:**
```
📡 Request: POST /bosp/api/sync
📥 Response: 404 Not Found
❌ Error response: ...
```

---

## 📞 Troubleshooting Lanjutan

### Jika sync masih error 404:

1. **Cek URL yang dipanggil:**
   - Buka Console (F12)
   - Lihat log: `📍 API URL: /bosp/api/sync`
   - URL harus: `https://credo.my.id/bosp/api/sync`

2. **Cek file sync.php:**
   - Akses: `https://credo.my.id/bosp/api/sync.php`
   - Harus error "Method not allowed" (bukan 404)

3. **Cek struktur folder:**
   ```
   public_html/
   └── bosp/
       └── api/
           └── sync.php  ← File ini harus ada!
   ```

4. **Cek .htaccess di folder api/:**
   - File harus ada di `public_html/bosp/api/.htaccess`
   - Isi harus ada rewrite rule

---

## ✅ Verifikasi Berhasil

Setelah semua step dilakukan:

1. **Test backend:**
   ```
   https://credo.my.id/bosp/api/test.php
   ```
   Semua item harus ✅

2. **Test API:**
   ```
   https://credo.my.id/bosp/api/health
   ```
   Harus muncul JSON status "ok"

3. **Test aplikasi:**
   ```
   https://credo.my.id/bosp/
   ```
   Aplikasi terbuka dan berfungsi

4. **Test sync:**
   - Menu Pengaturan → Database → Sync ke MySQL
   - Harus berhasil tanpa error

---

## 📖 Dokumentasi Lengkap

- **INTEGRASI_MYSQL.md** - Panduan integrasi MySQL
- **SOLUSI_ERROR_404.md** - Solusi error 404
- **SOLUSI_CSP_ERROR.md** - Solusi error CSP
- **TROUBLESHOOTING.md** - Troubleshooting umum
- **backend/SETUP_MYSQL.md** - Setup MySQL di cPanel

---

**Versi:** 2.0.0  
**Domain:** credo.my.id/bosp/  
**Last Update:** 2026-01-15
