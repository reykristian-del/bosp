# 🔧 PANDUAN TROUBLESHOOTING LENGKAP
## Solusi Error 500 & API Tidak Tersedia

---

## 📋 Checklist Upload File

Sebelum troubleshooting, pastikan file-file berikut sudah di-upload dengan benar:

### Frontend (di `public_html/bosp/`):
```
public_html/bosp/
├── index.html              ← Dari dist/
├── .htaccess               ← Dari dist/
├── api-test.html           ← Dari public/
├── test-api.html           ← Dari public/
└── assets/                 ← Dari dist/
    ├── index-xxxxx.js
    └── index-xxxxx.css
```

### Backend (di `public_html/bosp/api/`):
```
public_html/bosp/api/
├── index.php               ← Dari backend/api/
├── config.php              ← Dari backend/api/
├── .htaccess               ← Dari backend/api/
├── sync.php                ← Dari backend/api/
├── test.php                ← Dari backend/api/
├── test-simple.php         ← Dari backend/api/
└── debug.php               ← Dari backend/api/
```

---

## 🧪 Step 1: Test Koneksi API

### Buka URL berikut di browser:

**1. Test Simple (Paling Dasar):**
```
https://credo.my.id/bosp/api/test-simple.php
```

**Harus muncul:**
```json
{
  "status": "ok",
  "message": "API test berhasil",
  "php_version": "7.4.x",
  "database": "connected",
  "transaksi_count": 0
}
```

**Jika error:**
- **404 Not Found** → File `test-simple.php` belum di-upload
- **500 Internal Error** → Ada error di PHP, cek error log
- **CORS Error** → Header CORS belum di-set

**2. Test Health:**
```
https://credo.my.id/bosp/api/health
```

**Harus muncul:**
```json
{
  "status": "ok",
  "message": "API dan database terhubung"
}
```

**3. Test HTML Interface:**
```
https://credo.my.id/bosp/api-test.html
```

Klik tombol **"Test Semua"** untuk melihat hasil semua test.

---

## 🔍 Step 2: Diagnosa Error

### Error: "404 Not Found"

**Penyebab:** File PHP belum di-upload atau URL salah

**Solusi:**
1. Pastikan file ada di `public_html/bosp/api/`
2. Cek nama file (case-sensitive di Linux)
3. Pastikan `.htaccess` ada di folder `api/`

**Verifikasi:**
```bash
# Cek via FTP/cPanel File Manager
public_html/bosp/api/test-simple.php  ← Harus ada
```

### Error: "500 Internal Server Error"

**Penyebab:** Error di PHP code

**Solusi:**
1. Buka file `sync_error.log` di folder `api/`
2. Lihat error message
3. Fix sesuai error

**Common Errors:**

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `SQLSTATE[HY000] [1045] Access denied` | Kredensial database salah | Edit `config.php` |
| `SQLSTATE[42S02] Base table doesn't exist` | Tabel belum dibuat | Import `schema.sql` |
| `Allowed memory size exhausted` | Memory kurang | Increase `memory_limit` |
| `Maximum execution time exceeded` | Timeout | Increase `max_execution_time` |

### Error: "CORS policy"

**Penyebab:** Header CORS belum di-set

**Solusi:**
1. Edit `config.php`, pastikan ada:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

2. Edit `.htaccess` di folder `api/`, pastikan ada:
```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

---

## 🗄️ Step 3: Test Database

### Buka phpMyAdmin di cPanel

1. Login ke cPanel
2. Buka **phpMyAdmin**
3. Pilih database `username_bosp`
4. Cek tabel yang ada:
   - ✅ `transaksi`
   - ✅ `bukti_kas`
   - ✅ `bukti_kas_item`
   - ✅ `dokumen_pendukung`
   - ✅ `pengaturan`
   - ✅ `saldo_awal`
   - ✅ `users`
   - ✅ `activity_log`

**Jika tabel tidak ada:**
1. Klik tab **Import**
2. Upload file `backend/database/schema.sql`
3. Klik **Go**

### Test Query Manual

Di phpMyAdmin, jalankan query:
```sql
SELECT * FROM transaksi LIMIT 5;
SELECT * FROM pengaturan LIMIT 1;
SELECT * FROM saldo_awal LIMIT 1;
```

Jika error, berarti ada masalah dengan tabel.

---

## 🔧 Step 4: Fix Error 500

### Cek Error Log

Buka file `public_html/bosp/api/sync_error.log`:

**Contoh error dan solusi:**

**Error 1: Database Connection**
```
[2026-01-15 10:30:00] Database connection error: SQLSTATE[HY000] [1045] Access denied for user 'username'@'localhost'
```

**Solusi:**
Edit `config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'username_bosp');      // Ganti dengan nama database
define('DB_USER', 'username_bospuser');  // Ganti dengan username
define('DB_PASS', 'password_anda');      // Ganti dengan password
```

**Error 2: Table Not Found**
```
[2026-01-15 10:30:00] Sync error: SQLSTATE[42S02]: Base table or view 'bosp_smpn1.transaksi' doesn't exist
```

**Solusi:**
Import `schema.sql` via phpMyAdmin

**Error 3: Memory Limit**
```
[2026-01-15 10:30:00] Fatal error: Allowed memory size of 67108864 bytes exhausted
```

**Solusi:**
Edit `php.ini` di cPanel:
```
memory_limit = 256M
```

Atau tambahkan di `.htaccess`:
```apache
php_value memory_limit 256M
```

**Error 4: Timeout**
```
[2026-01-15 10:30:00] Fatal error: Maximum execution time of 30 seconds exceeded
```

**Solusi:**
Edit `php.ini`:
```
max_execution_time = 300
```

Atau tambahkan di `.htaccess`:
```apache
php_value max_execution_time 300
```

---

## 📊 Step 5: Test Sync

### Test dengan Data Kecil

1. Buka aplikasi: `https://credo.my.id/bosp/`
2. Hapus beberapa transaksi (sisakan 5-10 saja)
3. Menu **Pengaturan** → **Database**
4. Klik **"Sync ke MySQL"**
5. Lihat console browser (F12) untuk detail

**Jika berhasil:**
```
🔄 Starting sync to MySQL...
📍 API URL: /bosp/api/sync
📦 Data to sync: { transaksi: 5, bukti_kas: 3, ... }
📡 Request: POST /bosp/api/sync
📥 Response: 200 OK
✅ Success: { success: true, ... }
```

**Jika error 500:**
```
📡 Request: POST /bosp/api/sync
📥 Response: 500 Internal Server Error
❌ Error response: {...}
```

Lihat detail error di response dan fix sesuai error message.

---

## 🎯 Quick Fix Checklist

### Jika API Tidak Tersedia:

- [ ] Upload semua file dari `backend/api/` ke `public_html/bosp/api/`
- [ ] Pastikan `.htaccess` ada di folder `api/`
- [ ] Test: `https://credo.my.id/bosp/api/test-simple.php`
- [ ] Jika error 404, cek nama file (case-sensitive)
- [ ] Jika error 500, cek `sync_error.log`

### Jika Error 500 saat Sync:

- [ ] Buka `sync_error.log` di folder `api/`
- [ ] Lihat error message
- [ ] Fix sesuai error:
  - Database error → Edit `config.php`
  - Table error → Import `schema.sql`
  - Memory error → Increase `memory_limit`
  - Timeout error → Increase `max_execution_time`
- [ ] Test sync lagi dengan data kecil

### Jika CORS Error:

- [ ] Edit `config.php` → tambahkan CORS headers
- [ ] Edit `.htaccess` di folder `api/` → tambahkan CORS headers
- [ ] Clear cache browser (Ctrl+Shift+R)

---

## 📞 Informasi yang Dibutuhkan untuk Bantuan

Jika masih error, siapkan informasi berikut:

1. **Screenshot hasil test:**
   - `https://credo.my.id/bosp/api/test-simple.php`
   - `https://credo.my.id/bosp/api-test.html`

2. **Error log:**
   - Buka `public_html/bosp/api/sync_error.log`
   - Copy 20 baris terakhir

3. **Console browser:**
   - Tekan F12 → Tab Console
   - Screenshot error message

4. **Network tab:**
   - Tekan F12 → Tab Network
   - Klik request `/bosp/api/sync`
   - Tab Response → screenshot

5. **Informasi hosting:**
   - PHP version
   - MySQL version
   - Hosting provider

---

## 📖 File-File Penting

| File | Lokasi | Fungsi |
|------|--------|--------|
| `test-simple.php` | `/bosp/api/` | Test koneksi API dasar |
| `api-test.html` | `/bosp/` | Interface test API |
| `sync_error.log` | `/bosp/api/` | Log error sync |
| `config.php` | `/bosp/api/` | Konfigurasi database |
| `.htaccess` | `/bosp/api/` | URL rewriting & CORS |

---

## ✅ Verifikasi Berhasil

Setelah semua fix, test:

1. **Test Simple:**
   ```
   https://credo.my.id/bosp/api/test-simple.php
   ```
   Harus muncul JSON dengan status "ok"

2. **Test API:**
   ```
   https://credo.my.id/bosp/api-test.html
   ```
   Klik "Test Semua" → semua harus ✅

3. **Test Aplikasi:**
   ```
   https://credo.my.id/bosp/
   ```
   Menu Pengaturan → Database → Test Koneksi API → harus "API dan database terhubung"

4. **Test Sync:**
   - Menu Pengaturan → Database → Sync ke MySQL
   - Harus berhasil tanpa error

---

**Versi:** 2.0.0  
**Last Update:** 2026-01-15
