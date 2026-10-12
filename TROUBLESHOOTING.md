# 🔧 TROUBLESHOOTING: API Tidak Tersedia
## Solusi Lengkap untuk Masalah Koneksi API

---

## ❌ Masalah: "API tidak tersedia"

Ketika Anda klik "Test Koneksi API" di menu Pengaturan, muncul notifikasi **"API tidak tersedia"**.

---

## 🔍 Penyebab Umum

### 1. **Backend PHP Belum Di-upload** (PALING UMUM)
Folder `backend/api/` belum di-upload ke hosting.

**Solusi:**
```
Upload folder backend/api/ ke hosting:

public_html/
├── index.html          ← dari dist/
├── .htaccess           ← dari dist/
├── assets/             ← dari dist/
└── api/                ← WAJIB ADA! dari backend/api/
    ├── index.php
    ├── config.php
    ├── .htaccess
    └── test.php
```

### 2. **URL API Salah di Config**
`API_BASE_URL` di `src/config.ts` tidak sesuai dengan struktur folder.

**Solusi:**
```typescript
// Jika di root domain:
API_BASE_URL: '/api'

// Jika di subfolder /bosp/:
API_BASE_URL: '/bosp/api'

// Jika di domain berbeda:
API_BASE_URL: 'https://api.domain.com'
```

### 3. **Database Belum Dibuat**
Database MySQL belum dibuat di cPanel.

**Solusi:**
1. Login ke cPanel
2. MySQL Databases → Create database
3. Nama: `username_bosp`
4. Buat user & assign ke database

### 4. **Kredensial Database Salah**
Username/password database di `config.php` salah.

**Solusi:**
Edit `backend/api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'username_bosp');      // Ganti ini
define('DB_USER', 'username_bospuser');  // Ganti ini
define('DB_PASS', 'password_anda');      // Ganti ini
```

### 5. **Schema Belum Di-import**
Tabel database belum dibuat.

**Solusi:**
1. Buka phpMyAdmin di cPanel
2. Pilih database `username_bosp`
3. Tab Import → Upload `backend/database/schema.sql`
4. Klik Go

### 6. **File .htaccess Tidak Ada**
URL rewriting tidak bekerja.

**Solusi:**
Pastikan file `.htaccess` ada di folder `api/`:
```
api/
├── index.php
├── config.php
└── .htaccess    ← WAJIB ADA!
```

### 7. **PHP Version Terlalu Lama**
Hosting menggunakan PHP < 7.4.

**Solusi:**
1. Login ke cPanel
2. Select PHP Version
3. Pilih PHP 7.4 atau lebih baru

### 8. **Extension PDO MySQL Tidak Aktif**
PHP tidak punya driver MySQL.

**Solusi:**
1. Login ke cPanel
2. Select PHP Version
3. Tab Extensions
4. Centang `pdo_mysql`
5. Save

---

## 🧪 Cara Diagnosa

### Step 1: Test Backend Langsung

Upload file `backend/api/test.php` ke hosting, lalu akses:
```
https://domain.com/api/test.php
```

File ini akan menampilkan:
- ✅ PHP version
- ✅ PDO extension status
- ✅ Config file status
- ✅ Database connection
- ✅ File permissions
- ✅ mod_rewrite status

### Step 2: Test API Health Endpoint

Akses URL:
```
https://domain.com/api/health
```

**Jika berhasil:**
```json
{
  "status": "ok",
  "message": "API dan database terhubung",
  "timestamp": "2026-01-15 10:30:00"
}
```

**Jika gagal:**
- HTTP 404 → File `index.php` tidak ada atau `.htaccess` bermasalah
- HTTP 500 → Error di PHP (cek error log)
- Connection refused → Server PHP tidak berjalan

### Step 3: Test dari Frontend

Akses:
```
https://domain.com/test-api.html
```

Klik tombol "Test API Health" untuk melihat detail error.

### Step 4: Cek Browser Console

1. Buka aplikasi
2. Tekan F12
3. Tab Console
4. Klik "Test Koneksi API"
5. Lihat error message

**Error umum:**
- `Failed to fetch` → API tidak reachable
- `CORS error` → Cross-origin issue
- `404 Not Found` → URL API salah
- `500 Internal Server Error` → Error di backend

---

## 📋 Checklist Setup Lengkap

### ✅ Backend Setup

- [ ] Folder `api/` sudah di-upload ke hosting
- [ ] File `config.php` sudah dikonfigurasi
- [ ] Database MySQL sudah dibuat di cPanel
- [ ] User database sudah dibuat dengan All Privileges
- [ ] Schema `schema.sql` sudah di-import via phpMyAdmin
- [ ] File `.htaccess` ada di folder `api/`
- [ ] Test `https://domain.com/api/test.php` berhasil
- [ ] Test `https://domain.com/api/health` berhasil

### ✅ Frontend Setup

- [ ] File `src/config.ts` sudah diedit:
  ```typescript
  STORAGE_MODE: 'mysql'
  API_BASE_URL: '/api'  // atau sesuai struktur folder
  ```
- [ ] Frontend sudah di-build: `npm run build`
- [ ] Isi folder `dist/` sudah di-upload ke hosting
- [ ] Test `https://domain.com/test-api.html` berhasil

---

## 🎯 Solusi Step-by-Step

### Jika Backend Belum Di-upload:

```bash
# 1. Upload folder backend/api/ ke hosting
# Gunakan File Manager cPanel atau FTP

# 2. Struktur yang benar:
public_html/
├── index.html
├── .htaccess
├── assets/
└── api/
    ├── index.php
    ├── config.php
    ├── .htaccess
    └── test.php
```

### Jika Database Belum Dibuat:

```
1. Login cPanel
2. MySQL Databases
3. Create Database:
   - Name: username_bosp
4. Add User:
   - Username: username_bospuser
   - Password: (buat password kuat)
5. Add User to Database:
   - Select user & database
   - ALL PRIVILEGES ✓
```

### Jika Schema Belum Di-import:

```
1. Login cPanel
2. phpMyAdmin
3. Pilih database: username_bosp
4. Tab Import
5. Choose File: backend/database/schema.sql
6. Klik Go
7. Verifikasi tabel sudah terbuat
```

### Jika URL API Salah:

**Contoh struktur folder:**

```
# Jika di root domain:
public_html/
├── index.html
└── api/
    └── index.php

→ API_BASE_URL: '/api'


# Jika di subfolder:
public_html/
└── bosp/
    ├── index.html
    └── api/
        └── index.php

→ API_BASE_URL: '/bosp/api'


# Jika di subdomain:
bosp.domain.com/
├── index.html
└── api/
    └── index.php

→ API_BASE_URL: '/api'
```

---

## 🔍 Error Message & Solusi

### Error: "Failed to fetch"

**Penyebab:** API tidak reachable

**Solusi:**
1. Cek URL API di browser: `https://domain.com/api/health`
2. Cek apakah file `api/index.php` ada
3. Cek error log di cPanel

### Error: "CORS policy"

**Penyebab:** Cross-origin request diblokir

**Solusi:**
File `backend/config.php` sudah ada CORS headers:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Error: "404 Not Found"

**Penyebab:** URL API salah atau `.htaccess` tidak bekerja

**Solusi:**
1. Test direct: `https://domain.com/api/index.php`
2. Jika berhasil → masalah di `.htaccess`
3. Jika gagal → file tidak ada

### Error: "500 Internal Server Error"

**Penyebab:** Error di PHP code

**Solusi:**
1. Cek error log di cPanel
2. Test: `https://domain.com/api/test.php`
3. Cek kredensial database di `config.php`

### Error: "Database connection failed"

**Penyebab:** Kredensial database salah

**Solusi:**
1. Verifikasi nama database, username, password
2. Test login ke phpMyAdmin dengan kredensial tersebut
3. Pastikan user punya All Privileges

---

## 📞 Bantuan Lebih Lanjut

### Log yang Perlu Dicek:

1. **Browser Console** (F12 → Console)
2. **Network Tab** (F12 → Network → lihat API calls)
3. **cPanel Error Log** (Metrics → Errors)
4. **PHP Error Log** (di folder hosting)

### Information yang Dibutuhkan:

Jika masih bermasalah, siapkan:
1. Screenshot error di browser console
2. Screenshot hasil test `test.php`
3. URL aplikasi Anda
4. Struktur folder di hosting
5. Isi file `src/config.ts` (bagian APP_CONFIG)

---

## ✅ Verifikasi Setup Berhasil

Setelah semua step dilakukan, test:

1. **Backend Test:**
   ```
   https://domain.com/api/test.php
   ```
   Semua item harus ✅

2. **API Health:**
   ```
   https://domain.com/api/health
   ```
   Harus muncul JSON dengan status "ok"

3. **Frontend Test:**
   ```
   https://domain.com/test-api.html
   ```
   Klik "Test API Health" → harus success

4. **Aplikasi:**
   - Buka aplikasi
   - Menu Pengaturan → Database
   - Klik "Test Koneksi API"
   - Harus muncul "API dan database terhubung"

---

## 🎉 Jika Semua Berhasil

Selamat! Aplikasi Anda sekarang terhubung ke database MySQL.

**Fitur yang tersedia:**
- ✅ Data tersimpan di MySQL
- ✅ Multi-user support
- ✅ Backup database otomatis
- ✅ Performance lebih baik
- ✅ Data terpusat

---

**Versi:** 2.0.0  
**Last Update:** 2026-01-15
