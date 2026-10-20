# 🔧 PANDUAN LENGKAP: Mengapa Program Tidak Membaca Database

## 🎯 Masalah Utama

Program sudah disesuaikan tetapi **tidak bisa membaca data dari database**. Ini berarti ada masalah koneksi antara frontend dan backend/database.

---

## 📋 5 Langkah Diagnosa WAJIB

### Step 1: Test PHP Langsung

**Buka URL ini di browser:**
```
https://credo.my.id/bosp/api/direct-test.php
```

**✅ Jika berhasil:**
```json
{
  "status": "ok",
  "message": "PHP is working",
  "php_version": "7.4.x"
}
```
→ PHP bekerja, lanjut ke Step 2

**❌ Jika error 404:**
→ File `direct-test.php` belum di-upload
→ Upload file dari `backend/api/direct-test.php` ke `public_html/bosp/api/`

**❌ Jika error 500:**
→ Ada error di PHP
→ Cek error log di cPanel

---

### Step 2: Test Database Langsung

**Buka URL ini di browser:**
```
https://credo.my.id/bosp/api/direct-db-test.php
```

**✅ Jika berhasil:**
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "transaksi_count": 5,
  "sample_data": [...]
}
```
→ Database terhubung, lanjut ke Step 3

**❌ Jika error:**
```json
{
  "status": "error",
  "message": "SQLSTATE[HY000] [1045] Access denied..."
}
```
→ Kredensial database salah
→ Edit `public_html/bosp/api/config.php`

```json
{
  "status": "error",
  "message": "SQLSTATE[42S02] Base table 'transaksi' doesn't exist"
}
```
→ Tabel belum dibuat
→ Import `backend/database/schema.sql` via phpMyAdmin

---

### Step 3: Test API Router

**Buka URL ini di browser:**
```
https://credo.my.id/bosp/api/transaksi
```

**✅ Jika berhasil:**
```json
[
  {
    "id": "abc123",
    "tanggal": "2026-01-15",
    "uraian": "Pembelian ATK",
    ...
  }
]
```
→ API router bekerja, lanjut ke Step 4

**❌ Jika error 404:**
→ File `index.php` belum di-upload
→ Upload file dari `backend/api/index.php` ke `public_html/bosp/api/`

**❌ Jika error 500:**
→ Ada error di routing
→ Cek `public_html/bosp/api/error.log`

---

### Step 4: Test Aplikasi

**Buka aplikasi:**
```
https://credo.my.id/bosp/
```

**Tekan F12 → Tab Console**

**✅ Log yang seharusnya muncul:**
```
[HOOKS] 🔄 Loading transaksi from MySQL...
[API] 📡 Request: GET /bosp/api/transaksi
[API] 📥 Response: 200 OK
[HOOKS] ✅ Transaksi loaded: 5 records
```

**❌ Jika error:**
```
[API] ❌ Request failed: Error: Failed to fetch
```
→ Backend tidak reachable
→ Cek URL API di `src/config.ts`

```
[API] ❌ Request failed: Error: API Error: 404
```
→ File API tidak ada
→ Upload file dari `backend/api/`

---

### Step 5: Test dengan HTML Test Page

**Buka URL ini di browser:**
```
https://credo.my.id/bosp/db-test.html
```

Klik tombol **"Test Semua"** untuk melihat hasil lengkap.

---

## 🔍 Kemungkinan Penyebab & Solusi

### Penyebab #1: File Backend Belum Di-upload

**Cek:**
```
Apakah folder api/ ada di public_html/bosp/?
```

**Struktur yang benar:**
```
public_html/bosp/
├── index.html
├── .htaccess
├── db-test.html          ← Upload dari public/
├── assets/
└── api/                  ← HARUS ADA!
    ├── index.php         ← Upload dari backend/api/
    ├── config.php        ← Upload dari backend/api/
    ├── .htaccess         ← Upload dari backend/api/
    ├── direct-test.php   ← Upload dari backend/api/
    ├── direct-db-test.php ← Upload dari backend/api/
    ├── health.php        ← Upload dari backend/api/
    └── sync.php          ← Upload dari backend/api/
```

**Solusi:**
Upload semua file dari `backend/api/` ke `public_html/bosp/api/`

---

### Penyebab #2: Database MySQL Belum Dibuat

**Cek:**
```
Apakah database sudah dibuat di cPanel?
```

**Solusi:**
1. Login ke cPanel
2. MySQL Databases
3. Create database: `username_bosp`
4. Create user: `username_bospuser`
5. Add user ke database dengan **ALL PRIVILEGES**

---

### Penyebab #3: Schema Belum Di-import

**Cek:**
```
Apakah tabel-tabel sudah ada di database?
```

**Solusi:**
1. Buka phpMyAdmin
2. Pilih database `username_bosp`
3. Tab **Import**
4. Upload `backend/database/schema.sql`
5. Klik **Go**

---

### Penyebab #4: Kredensial Database Salah

**Cek:**
Edit file `public_html/bosp/api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'username_bosp');      ← GANTI INI
define('DB_USER', 'username_bospuser');  ← GANTI INI
define('DB_PASS', 'password_anda');      ← GANTI INI
```

**Solusi:**
Pastikan nama database, username, dan password sesuai dengan yang dibuat di cPanel

---

### Penyebab #5: URL API Tidak Sesuai

**Cek:**
Edit file `src/config.ts`:
```typescript
export const APP_CONFIG = {
  STORAGE_MODE: 'mysql',
  API_BASE_URL: '/bosp/api',  ← Pastikan ini sesuai
  API_TIMEOUT: 30000,
};
```

**Jika aplikasi di subfolder lain:**
```typescript
// Jika di root domain
API_BASE_URL: '/api'

// Jika di subfolder /bosp/
API_BASE_URL: '/bosp/api'

// Jika di subfolder /apps/bosp/
API_BASE_URL: '/apps/bosp/api'
```

---

### Penyebab #6: File .htaccess di Folder API Belum Ada

**Cek:**
```
Apakah file .htaccess ada di public_html/bosp/api/?
```

**Solusi:**
Upload file `backend/api/.htaccess` ke `public_html/bosp/api/`

---

### Penyebab #7: CORS Headers Belum Di-set

**Cek:**
File `public_html/bosp/api/config.php` harus ada:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

---

## 🚀 Quick Fix (5 Langkah)

```bash
# 1. Upload semua file backend
Upload: backend/api/* → public_html/bosp/api/

# 2. Upload file test
Upload: public/db-test.html → public_html/bosp/db-test.html

# 3. Edit config database
Edit: public_html/bosp/api/config.php
→ Isi dengan kredensial database yang benar

# 4. Import database
Buka phpMyAdmin → Import → Upload schema.sql

# 5. Test
Buka: https://credo.my.id/bosp/db-test.html
→ Klik "Test Semua"
→ Semua harus ✅
```

---

## 📊 Error Messages & Solusi

### Error: "Failed to fetch"

**Penyebab:** Backend tidak reachable

**Solusi:**
1. Cek apakah folder `api/` ada
2. Cek URL di `src/config.ts`
3. Test: `https://credo.my.id/bosp/api/direct-test.php`

---

### Error: "404 Not Found"

**Penyebab:** File API tidak ada

**Solusi:**
1. Upload file dari `backend/api/`
2. Cek struktur folder
3. Test: `https://credo.my.id/bosp/api/direct-test.php`

---

### Error: "500 Internal Server Error"

**Penyebab:** Error di PHP

**Solusi:**
1. Buka `public_html/bosp/api/error.log`
2. Lihat error message
3. Fix sesuai error:
   - Database error → Edit `config.php`
   - Table error → Import `schema.sql`
   - Memory error → Increase `memory_limit`

---

### Error: "Access denied for user"

**Penyebab:** Kredensial database salah

**Solusi:**
Edit `public_html/bosp/api/config.php`:
```php
define('DB_NAME', 'username_bosp');      ← Ganti
define('DB_USER', 'username_bospuser');  ← Ganti
define('DB_PASS', 'password_anda');      ← Ganti
```

---

### Error: "Table doesn't exist"

**Penyebab:** Schema belum di-import

**Solusi:**
1. Buka phpMyAdmin
2. Pilih database
3. Import `backend/database/schema.sql`

---

## 📋 Checklist Lengkap

### File yang Harus Ada:

**Frontend (`public_html/bosp/`):**
- [ ] `index.html`
- [ ] `.htaccess`
- [ ] `db-test.html`
- [ ] `assets/` folder

**Backend (`public_html/bosp/api/`):**
- [ ] `index.php`
- [ ] `config.php` (sudah dikonfigurasi)
- [ ] `.htaccess`
- [ ] `direct-test.php`
- [ ] `direct-db-test.php`
- [ ] `health.php`
- [ ] `sync.php`

### Database:
- [ ] Database MySQL sudah dibuat
- [ ] User database sudah dibuat
- [ ] User punya ALL PRIVILEGES
- [ ] Schema sudah di-import
- [ ] Tabel `transaksi` ada
- [ ] Tabel `bukti_kas` ada
- [ ] Tabel `pengaturan` ada
- [ ] Tabel `saldo_awal` ada

### Test:
- [ ] `https://credo.my.id/bosp/api/direct-test.php` → berhasil
- [ ] `https://credo.my.id/bosp/api/direct-db-test.php` → berhasil
- [ ] `https://credo.my.id/bosp/api/transaksi` → berhasil
- [ ] `https://credo.my.id/bosp/db-test.html` → semua ✅
- [ ] Aplikasi → Console → tidak ada error

---

## 🎯 Langkah Selanjutnya

1. **Upload file baru:**
   - `backend/api/direct-test.php`
   - `backend/api/direct-db-test.php`
   - `backend/api/index.php` (yang baru)
   - `public/db-test.html`

2. **Test dengan urutan:**
   - Test 1: `direct-test.php` → harus ✅
   - Test 2: `direct-db-test.php` → harus ✅
   - Test 3: `/transaksi` → harus ✅
   - Test 4: Aplikasi → harus ✅

3. **Jika masih error:**
   - Screenshot hasil test
   - Screenshot console browser (F12)
   - Screenshot error log
   - Kirim untuk bantuan lebih lanjut

---

## 📞 Informasi yang Dibutuhkan untuk Bantuan

Jika masih bermasalah, siapkan:

1. **Screenshot:**
   - Hasil `direct-test.php`
   - Hasil `direct-db-test.php`
   - Console browser (F12)
   - Network tab

2. **Error log:**
   - Isi file `error.log` di folder `api/`

3. **Informasi:**
   - URL aplikasi
   - Struktur folder di hosting
   - Nama database yang dibuat

---

**Versi:** 2.1.0  
**Last Update:** 2026-01-15
