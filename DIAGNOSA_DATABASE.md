# 🔍 DIAGNOSA: Mengapa Program Tidak Membaca Database?

## ❓ Kemungkinan Penyebab

### 1. **File Backend Belum Di-upload** ⭐ (PALING UMUM)

**Cek:**
```
Apakah folder `api/` ada di hosting?
```

**Struktur yang benar:**
```
public_html/bosp/
├── index.html
├── .htaccess
├── assets/
└── api/                    ← HARUS ADA!
    ├── index.php
    ├── config.php
    ├── .htaccess
    ├── health.php
    ├── sync.php
    └── test-simple.php
```

**Solusi:**
Upload semua file dari `backend/api/` ke `public_html/bosp/api/`

---

### 2. **Database MySQL Belum Dibuat**

**Cek:**
```
Apakah database sudah dibuat di cPanel?
```

**Solusi:**
1. Login ke cPanel
2. MySQL Databases
3. Create database: `username_bosp`
4. Create user: `username_bospuser`
5. Add user ke database dengan ALL PRIVILEGES

---

### 3. **Schema Belum Di-import**

**Cek:**
```
Apakah tabel-tabel sudah ada di database?
```

**Solusi:**
1. Buka phpMyAdmin
2. Pilih database `username_bosp`
3. Tab Import
4. Upload `backend/database/schema.sql`
5. Klik Go

---

### 4. **Kredensial Database Salah**

**Cek:**
Edit file `public_html/bosp/api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'username_bosp');      ← Ganti dengan nama database Anda
define('DB_USER', 'username_bospuser');  ← Ganti dengan username Anda
define('DB_PASS', 'password_anda');      ← Ganti dengan password Anda
```

**Solusi:**
Pastikan nama database, username, dan password sesuai dengan yang dibuat di cPanel

---

### 5. **URL API Tidak Sesuai**

**Cek:**
Edit file `src/config.ts`:
```typescript
export const APP_CONFIG = {
  STORAGE_MODE: 'mysql',
  API_BASE_URL: '/bosp/api',  ← Pastikan ini sesuai dengan struktur folder
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

### 6. **File .htaccess di Folder API Belum Ada**

**Cek:**
```
Apakah file .htaccess ada di public_html/bosp/api/?
```

**Solusi:**
Upload file `backend/api/.htaccess` ke `public_html/bosp/api/`

---

### 7. **CORS Headers Belum Di-set**

**Cek:**
File `public_html/bosp/api/config.php` harus ada:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

---

### 8. **PHP Extension PDO MySQL Tidak Aktif**

**Cek:**
1. Login ke cPanel
2. Select PHP Version
3. Tab Extensions
4. Pastikan `pdo_mysql` dicentang

---

## 🧪 Langkah Diagnosa Step-by-Step

### Step 1: Test Backend Langsung

Buka URL di browser:
```
https://credo.my.id/bosp/api/test-simple.php
```

**Jika berhasil:**
```json
{
  "status": "ok",
  "message": "API test berhasil",
  "php_version": "7.4.x",
  "database": "connected"
}
```

**Jika error 404:**
- File `test-simple.php` belum di-upload
- URL salah

**Jika error 500:**
- Ada error di PHP
- Cek `sync_error.log`

---

### Step 2: Test Health Check

Buka URL:
```
https://credo.my.id/bosp/api/health.php
```

**Jika berhasil:**
```json
{
  "status": "ok",
  "message": "All checks passed",
  "checks": {
    "php": { "status": "ok" },
    "config": { "status": "ok" },
    "database": { "status": "ok" }
  }
}
```

**Jika error:**
- Lihat detail error di response
- Cek `sync_error.log`

---

### Step 3: Cek Console Browser

Buka aplikasi:
```
https://credo.my.id/bosp/
```

Tekan **F12** → Tab **Console**

**Log yang seharusnya muncul:**
```
[HOOKS] 🔄 Loading transaksi from MySQL...
[API] 📡 Request: GET /bosp/api/transaksi
[API] 📥 Response: 200 OK
[HOOKS] ✅ Transaksi loaded: X records
```

**Jika error:**
```
[API] ❌ Request failed: Error: Failed to fetch
```
→ Backend tidak reachable

```
[API] ❌ Request failed: Error: API Error: 404
```
→ File API tidak ada atau URL salah

```
[API] ❌ Request failed: Error: API Error: 500
```
→ Error di backend PHP, cek `sync_error.log`

---

### Step 4: Cek Network Tab

Tekan **F12** → Tab **Network**

Refresh halaman, lihat request ke `/bosp/api/transaksi`:

**Jika status 200:**
- ✅ Backend bekerja
- ✅ Data harusnya muncul

**Jika status 404:**
- ❌ File tidak ada
- Upload file dari `backend/api/`

**Jika status 500:**
- ❌ Error di backend
- Cek `sync_error.log`

**Jika status CORS error:**
- ❌ CORS headers belum di-set
- Edit `config.php`

---

### Step 5: Cek Database via phpMyAdmin

1. Login ke cPanel
2. Buka phpMyAdmin
3. Pilih database `username_bosp`
4. Cek tabel:
   - ✅ `transaksi`
   - ✅ `bukti_kas`
   - ✅ `pengaturan`
   - ✅ `saldo_awal`

**Jika tabel tidak ada:**
- Import `backend/database/schema.sql`

**Jika tabel ada tapi kosong:**
- Tambah data via aplikasi
- Cek apakah data tersimpan

---

## 📋 Checklist Diagnosa

### Backend:
- [ ] Folder `api/` ada di `public_html/bosp/api/`
- [ ] File `index.php` ada
- [ ] File `config.php` ada dan sudah dikonfigurasi
- [ ] File `.htaccess` ada
- [ ] File `health.php` ada
- [ ] File `test-simple.php` ada
- [ ] File `sync.php` ada

### Database:
- [ ] Database MySQL sudah dibuat
- [ ] User database sudah dibuat
- [ ] User punya ALL PRIVILEGES
- [ ] Schema sudah di-import
- [ ] Tabel `transaksi` ada
- [ ] Tabel `bukti_kas` ada
- [ ] Tabel `pengaturan` ada
- [ ] Tabel `saldo_awal` ada

### Konfigurasi:
- [ ] `config.php` sudah diisi kredensial yang benar
- [ ] `src/config.ts` sudah di-set `STORAGE_MODE: 'mysql'`
- [ ] `API_BASE_URL` sesuai dengan struktur folder
- [ ] CORS headers sudah di-set di `config.php`

### Testing:
- [ ] `https://credo.my.id/bosp/api/test-simple.php` → berhasil
- [ ] `https://credo.my.id/bosp/api/health.php` → berhasil
- [ ] Console browser tidak ada error
- [ ] Network tab status 200
- [ ] Data muncul di aplikasi

---

## 🎯 Quick Fix

Jika ingin cepat fix, lakukan ini:

```bash
# 1. Upload semua file backend
Upload: backend/api/* → public_html/bosp/api/

# 2. Edit config database
Edit: public_html/bosp/api/config.php
→ Isi dengan kredensial database yang benar

# 3. Import database
Buka phpMyAdmin → Import → Upload schema.sql

# 4. Test backend
Buka: https://credo.my.id/bosp/api/test-simple.php
→ Harus muncul JSON status "ok"

# 5. Test aplikasi
Buka: https://credo.my.id/bosp/
→ Menu Pengaturan → Database → Test Koneksi API
→ Harus "API dan database terhubung"
```

---

## 🔍 Error Messages & Solusi

### Error: "Failed to fetch"

**Penyebab:** Backend tidak reachable

**Solusi:**
1. Cek apakah folder `api/` ada
2. Cek URL di `src/config.ts`
3. Test: `https://credo.my.id/bosp/api/test-simple.php`

---

### Error: "404 Not Found"

**Penyebab:** File API tidak ada

**Solusi:**
1. Upload file dari `backend/api/`
2. Cek struktur folder
3. Test: `https://credo.my.id/bosp/api/health.php`

---

### Error: "500 Internal Server Error"

**Penyebab:** Error di PHP

**Solusi:**
1. Buka `public_html/bosp/api/sync_error.log`
2. Lihat error message
3. Fix sesuai error:
   - Database error → Edit `config.php`
   - Table error → Import `schema.sql`
   - Memory error → Increase `memory_limit`

---

### Error: "CORS policy"

**Penyebab:** CORS headers belum di-set

**Solusi:**
Edit `public_html/bosp/api/config.php`:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

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

## 📞 Informasi yang Dibutuhkan untuk Bantuan

Jika masih bermasalah, siapkan:

1. **Screenshot:**
   - Hasil `https://credo.my.id/bosp/api/test-simple.php`
   - Console browser (F12)
   - Network tab

2. **Error log:**
   - Isi file `sync_error.log`

3. **Informasi:**
   - URL aplikasi
   - Struktur folder di hosting
   - Nama database yang dibuat

---

## ✅ Verifikasi Berhasil

Setelah fix, test:

1. **Backend:**
   ```
   https://credo.my.id/bosp/api/test-simple.php
   ```
   Harus muncul JSON status "ok"

2. **Aplikasi:**
   ```
   https://credo.my.id/bosp/
   ```
   - Menu Pengaturan → Database → Test Koneksi API
   - Harus "API dan database terhubung"

3. **Data:**
   - Tambah transaksi → tersimpan
   - Lihat data → muncul dari database
   - Edit transaksi → terupdate
   - Hapus transaksi → terhapus

---

**Versi:** 2.1.0  
**Last Update:** 2026-01-15
