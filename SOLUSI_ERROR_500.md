# 🔧 SOLUSI ERROR 500 - Sync API
## Panduan Lengkap Mengatasi "Sync gagal: API Error: 500"

---

## ❌ Masalah

Ketika klik **"Sync ke MySQL"** di menu Pengaturan, muncul error:
```
Sync gagal: API Error: 500
```

Error 500 (Internal Server Error) berarti ada masalah di backend PHP.

---

## 🔍 Penyebab Umum Error 500

1. **Error di PHP code** (syntax error, undefined variable)
2. **Masalah koneksi database** (kredensial salah, database tidak ada)
3. **Memory limit exceeded** (data terlalu besar)
4. **Timeout** (proses terlalu lama)
5. **Permission file** (file tidak bisa dibaca/ditulis)
6. **Missing PHP extension** (PDO, MySQL, dll)
7. **SQL error** (query salah, tabel tidak ada)

---

## ✅ Solusi Step-by-Step

### Step 1: Upload File Debug

Upload file `backend/api/debug.php` ke hosting:
```
backend/api/debug.php → public_html/bosp/api/debug.php
```

### Step 2: Akses Debug Script

Buka URL:
```
https://credo.my.id/bosp/api/debug.php
```

Script ini akan menampilkan:
- ✅ PHP configuration
- ✅ File permissions
- ✅ Database connection status
- ✅ Sync endpoint test
- ✅ Error log
- ✅ PHP error log

### Step 3: Analisis Hasil Debug

**Jika Database Connection Gagal:**
```
❌ Error: SQLSTATE[HY000] [1045] Access denied for user
```

**Solusi:**
1. Edit `public_html/bosp/api/config.php`
2. Cek kredensial database:
   ```php
   define('DB_NAME', 'username_bosp');      // Nama database
   define('DB_USER', 'username_bospuser');  // Username
   define('DB_PASS', 'password_anda');      // Password
   ```
3. Pastikan user database punya ALL PRIVILEGES

**Jika Memory Limit Exceeded:**
```
Fatal error: Allowed memory size of X bytes exhausted
```

**Solusi:**
1. Edit `php.ini` di cPanel (PHP Selector)
2. Increase `memory_limit`:
   ```
   memory_limit = 256M
   ```
3. Atau tambahkan di `.htaccess`:
   ```apache
   php_value memory_limit 256M
   ```

**Jika Timeout:**
```
Fatal error: Maximum execution time of 30 seconds exceeded
```

**Solusi:**
1. Edit `php.ini` di cPanel
2. Increase `max_execution_time`:
   ```
   max_execution_time = 300
   ```
3. Atau tambahkan di `.htaccess`:
   ```apache
   php_value max_execution_time 300
   ```

**Jika SQL Error:**
```
SQLSTATE[42S02]: Base table or view 'transaksi' doesn't exist
```

**Solusi:**
1. Buka phpMyAdmin
2. Import ulang `backend/database/schema.sql`
3. Pastikan semua tabel terbuat

### Step 4: Cek Error Log

Di debug script, lihat bagian **Error Log**:

**Contoh error dan solusi:**

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Access denied for user` | Kredensial salah | Edit config.php |
| `Table doesn't exist` | Schema belum import | Import schema.sql |
| `Memory size exhausted` | Data terlalu besar | Increase memory_limit |
| `Maximum execution time` | Proses terlalu lama | Increase max_execution_time |
| `Permission denied` | File permission salah | Chmod 644 untuk file |
| `Undefined index` | Data tidak lengkap | Cek format data |

### Step 5: Test Sync Manual

Gunakan cURL atau Postman untuk test sync:

**cURL:**
```bash
curl -X POST https://credo.my.id/bosp/api/sync.php \
  -H "Content-Type: application/json" \
  -d '{
    "transaksi": [],
    "bukti_kas": [],
    "pengaturan": {
      "namaSekolah": "Test",
      "npsn": "123"
    },
    "saldo": {
      "tanggal": "2026-01-15",
      "jumlah": 0,
      "keterangan": "Test"
    }
  }'
```

**Jika berhasil:** Akan muncul JSON response
**Jika error 500:** Akan muncul detail error

### Step 6: Sync dengan Data Kecil

Jika sync dengan data besar gagal, coba sync dengan data kecil dulu:

1. Buka aplikasi
2. Hapus beberapa transaksi (sisakan 5-10 saja)
3. Coba sync lagi
4. Jika berhasil, tambahkan data bertahap

---

## 📋 Checklist Troubleshooting

### PHP Configuration:
- [ ] PHP version minimal 7.4
- [ ] PDO extension aktif
- [ ] PDO MySQL driver aktif
- [ ] memory_limit minimal 128M
- [ ] max_execution_time minimal 60s

### Database:
- [ ] Database sudah dibuat di cPanel
- [ ] User database sudah dibuat
- [ ] User punya ALL PRIVILEGES
- [ ] Schema sudah di-import
- [ ] Tabel `transaksi` ada
- [ ] Tabel `bukti_kas` ada
- [ ] Tabel `pengaturan` ada
- [ ] Tabel `saldo_awal` ada

### File Permissions:
- [ ] `config.php` readable (644)
- [ ] `sync.php` readable (644)
- [ ] `sync_error.log` writable (666)
- [ ] Folder `api/` accessible (755)

### Error Log:
- [ ] Cek `sync_error.log` di folder `api/`
- [ ] Cek PHP error log di cPanel
- [ ] Cek debug.php untuk detail error

---

## 🔧 Perbaikan yang Sudah Dilakukan

### 1. Error Handling di sync.php

Ditambahkan:
```php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/sync_error.log');

// Custom error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: [$errno] $errstr in $errfile on line $errline");
    return false;
});

// Custom exception handler
set_exception_handler(function($exception) {
    error_log("PHP Exception: " . $exception->getMessage());
    // Return detailed error in JSON
});
```

### 2. Debug Script

File `debug.php` akan menampilkan:
- PHP configuration
- File permissions
- Database connection test
- Sync endpoint test
- Error log viewer
- PHP error log viewer

### 3. Logging

Setiap sync request akan di-log ke `sync_error.log`:
```
Sync request received. Data size: 1234 bytes
Processing 5 transaksi...
Processing 3 bukti_kas...
Sync completed successfully
```

---

## 🎯 Quick Fix

Jika ingin cepat fix:

```bash
# 1. Upload debug.php
Upload: backend/api/debug.php → public_html/bosp/api/debug.php

# 2. Akses debug script
Buka: https://credo.my.id/bosp/api/debug.php

# 3. Lihat error
Baca hasil debug untuk mengetahui penyebab error

# 4. Fix sesuai error
- Database error → Edit config.php
- Memory error → Increase memory_limit
- Timeout error → Increase max_execution_time
- SQL error → Import schema.sql

# 5. Test sync lagi
Menu Pengaturan → Database → Sync ke MySQL
```

---

## 📊 Common Errors & Solutions

### Error: "SQLSTATE[HY000] [2002] Connection refused"

**Penyebab:** MySQL server tidak berjalan atau host salah

**Solusi:**
```php
// Di config.php
define('DB_HOST', 'localhost');  // Biasanya 'localhost'
```

### Error: "SQLSTATE[HY000] [1049] Unknown database"

**Penyebab:** Database belum dibuat

**Solusi:**
1. Login ke cPanel
2. MySQL Databases → Create database
3. Nama: `username_bosp`

### Error: "SQLSTATE[42S02] Base table doesn't exist"

**Penyebab:** Tabel belum dibuat

**Solusi:**
1. Buka phpMyAdmin
2. Pilih database
3. Import `backend/database/schema.sql`

### Error: "Allowed memory size exhausted"

**Penyebab:** Data terlalu besar untuk memory

**Solusi:**
1. Edit php.ini: `memory_limit = 256M`
2. Atau sync data bertahap (jangan semua sekaligus)

### Error: "Maximum execution time exceeded"

**Penyebab:** Proses sync terlalu lama

**Solusi:**
1. Edit php.ini: `max_execution_time = 300`
2. Atau sync data bertahap

---

## 🔍 Debug dengan Console Browser

Saat sync, buka Console browser (F12):

**Log yang seharusnya muncul:**
```
🔄 Starting sync to MySQL...
📍 API URL: /bosp/api/sync
📦 Data to sync: { transaksi: 5, bukti_kas: 3, ... }
📡 Request: POST /bosp/api/sync
📥 Response: 500 Internal Server Error
❌ Error response: {...}
```

**Lihat detail error di response** untuk mengetahui penyebab.

---

## 📞 Jika Masih Error

### Informasi yang Dibutuhkan:

1. **Screenshot debug.php:**
   - Buka `https://credo.my.id/bosp/api/debug.php`
   - Screenshot semua bagian

2. **Error log:**
   - Lihat bagian "Error Log" di debug.php
   - Copy 20 baris terakhir

3. **Console browser:**
   - Tekan F12 → Tab Console
   - Screenshot error message

4. **Network tab:**
   - Tekan F12 → Tab Network
   - Klik request `/bosp/api/sync`
   - Tab Response → screenshot

---

## ✅ Verifikasi Berhasil

Setelah fix, test:

1. **Debug script:**
   ```
   https://credo.my.id/bosp/api/debug.php
   ```
   Semua test harus ✅

2. **Sync endpoint:**
   ```
   https://credo.my.id/bosp/api/sync.php
   ```
   Harus error "Method not allowed" (bukan 500)

3. **Sync dari aplikasi:**
   - Menu Pengaturan → Database → Sync ke MySQL
   - Harus berhasil tanpa error

4. **Cek database:**
   - Buka phpMyAdmin
   - Data harus ada di tabel

---

## 📖 Dokumentasi Lengkap

- **debug.php** - Script debug untuk diagnosa
- **sync_error.log** - Log error sync
- **DEPLOYMENT_BOSP.md** - Panduan deployment
- **SOLUSI_ERROR_404.md** - Solusi error 404
- **TROUBLESHOOTING.md** - Troubleshooting umum

---

**Versi:** 2.0.0  
**Last Update:** 2026-01-15
