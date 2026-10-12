# 🔧 SOLUSI ERROR 404 SAAT SYNC
## Panduan Lengkap Mengatasi "Sync gagal: API Error: 404"

---

## ❌ Masalah

Ketika klik **"Sync ke MySQL"** di menu Pengaturan, muncul error:
```
Sync gagal: API Error: 404
```

---

## 🔍 Penyebab

Error **404 (Not Found)** berarti file `sync.php` tidak ditemukan di server. Ini terjadi karena:

1. **File `sync.php` belum di-upload** ke folder `/api/`
2. **URL API salah** di konfigurasi
3. **Struktur folder tidak sesuai** dengan yang diharapkan

---

## ✅ Solusi Step-by-Step

### Step 1: Upload File `sync.php`

File `sync.php` adalah endpoint khusus untuk bulk sync. **WAJIB** di-upload ke hosting.

**File yang harus di-upload:**
```
backend/api/
├── index.php       ← Sudah ada
├── config.php      ← Sudah ada
├── .htaccess       ← Sudah ada
├── test.php        ← Untuk testing
└── sync.php        ← ⚠️ BARU! WAJIB UPLOAD!
```

**Upload ke hosting:**
```
public_html/
└── api/
    ├── index.php
    ├── config.php
    ├── .htaccess
    ├── test.php
    └── sync.php    ← Upload file ini!
```

### Step 2: Verifikasi File Ada

Akses URL berikut di browser:
```
https://domain.com/api/sync.php
```

**Jika berhasil:** Akan muncul error "Method not allowed" (karena butuh POST)
**Jika 404:** File belum ter-upload atau URL salah

### Step 3: Cek URL API di Config

Buka aplikasi, tekan **F12** → Tab **Console**, lalu klik **"Sync ke MySQL"**.

Lihat log yang muncul:
```
[API] 📡 Request: POST /api/sync
```

**URL yang dipanggil:**
```
https://domain.com/api/sync
```

**Jika URL salah**, edit `src/config.ts`:
```typescript
// Jika di root domain:
API_BASE_URL: '/api'

// Jika di subfolder /bosp/:
API_BASE_URL: '/bosp/api'

// Jika di subdomain:
API_BASE_URL: 'https://api.domain.com'
```

### Step 4: Test Endpoint Sync

Gunakan tool seperti **Postman** atau **curl** untuk test:

**cURL:**
```bash
curl -X POST https://domain.com/api/sync \
  -H "Content-Type: application/json" \
  -d '{"transaksi":[],"bukti_kas":[],"pengaturan":{},"saldo":{}}'
```

**Postman:**
- Method: POST
- URL: `https://domain.com/api/sync`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "transaksi": [],
  "bukti_kas": [],
  "pengaturan": {},
  "saldo": {}
}
```

**Response yang diharapkan:**
```json
{
  "success": true,
  "message": "Sync berhasil",
  "result": {
    "transaksi": { "success": 0, "failed": 0, "errors": [] },
    "bukti_kas": { "success": 0, "failed": 0, "errors": [] },
    "pengaturan": { "success": true, "error": null },
    "saldo": { "success": true, "error": null }
  }
}
```

### Step 5: Cek .htaccess

File `.htaccess` di folder `api/` harus ada dan berisi:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

**Test dengan akses langsung:**
```
https://domain.com/api/sync.php  ← Harus bisa diakses
```

Jika tidak bisa, berarti `.htaccess` bermasalah atau mod_rewrite tidak aktif.

---

## 📋 Checklist Lengkap

### File yang Harus Ada di Hosting:

- [ ] `public_html/api/index.php`
- [ ] `public_html/api/config.php`
- [ ] `public_html/api/.htaccess`
- [ ] `public_html/api/test.php`
- [ ] `public_html/api/sync.php` ← **BARU!**

### Konfigurasi yang Benar:

- [ ] `src/config.ts` → `API_BASE_URL: '/api'` (atau sesuai struktur)
- [ ] `backend/api/config.php` → Kredensial database benar
- [ ] Database MySQL sudah dibuat
- [ ] Schema sudah di-import

### Test yang Harus Berhasil:

- [ ] `https://domain.com/api/test.php` → Semua ✅
- [ ] `https://domain.com/api/health` → JSON status "ok"
- [ ] `https://domain.com/api/sync.php` → Error "Method not allowed"
- [ ] Sync dari aplikasi → Berhasil

---

## 🎯 Struktur Folder yang Benar

### Jika di Root Domain:

```
public_html/
├── index.html              ← Frontend
├── .htaccess               ← Frontend routing
├── assets/                 ← Frontend assets
├── test-api.html           ← Test frontend
└── api/                    ← Backend API
    ├── index.php           ← Main API router
    ├── config.php          ← Database config
    ├── .htaccess           ← API routing
    ├── test.php            ← Backend test
    └── sync.php            ← Sync endpoint ⚠️
```

**URL API:** `/api`

### Jika di Subfolder `/bosp/`:

```
public_html/
└── bosp/
    ├── index.html
    ├── .htaccess
    ├── assets/
    ├── test-api.html
    └── api/
        ├── index.php
        ├── config.php
        ├── .htaccess
        ├── test.php
        └── sync.php        ← ⚠️
```

**URL API:** `/bosp/api`

**Edit `src/config.ts`:**
```typescript
API_BASE_URL: '/bosp/api'
```

---

## 🔍 Debug dengan Console Browser

1. Buka aplikasi
2. Tekan **F12** → Tab **Console**
3. Klik **"Sync ke MySQL"**
4. Lihat log yang muncul:

**Log yang seharusnya muncul:**
```
🔄 Starting sync to MySQL...
📍 API URL: /api/sync
📦 Data to sync: { transaksi: 5, bukti_kas: 3, ... }
📡 Request: POST /api/sync
📥 Response: 200 OK
✅ Success: { success: true, ... }
```

**Jika error 404:**
```
📡 Request: POST /api/sync
📥 Response: 404 Not Found
❌ Error response: <!DOCTYPE html>...
```

---

## 🚨 Error Umum & Solusi

### Error: "404 Not Found"

**Penyebab:** File `sync.php` tidak ada

**Solusi:**
1. Upload file `backend/api/sync.php` ke `public_html/api/`
2. Verifikasi: `https://domain.com/api/sync.php`

### Error: "500 Internal Server Error"

**Penyebab:** Error di PHP code

**Solusi:**
1. Cek error log di cPanel
2. Test: `https://domain.com/api/test.php`
3. Cek kredensial database di `config.php`

### Error: "Failed to fetch"

**Penyebab:** API tidak reachable

**Solusi:**
1. Cek URL API di `src/config.ts`
2. Test: `https://domain.com/api/health`
3. Cek CORS di `config.php`

### Error: "CORS policy"

**Penyebab:** Cross-origin request diblokir

**Solusi:**
File `config.php` sudah ada CORS headers:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
```

---

## 📊 Endpoint Sync

**URL:** `POST /api/sync`

**Request Body:**
```json
{
  "transaksi": [
    {
      "id": "abc123",
      "tanggal": "2026-01-15",
      "noBukti": "TRX/001/01/2026",
      "uraian": "Pembelian ATK",
      "kategori": "Pengelolaan Sekolah",
      "kodeRekening": "5.1.02.01",
      "jumlah": 1500000,
      "pajak": 0,
      "jenis": "keluar",
      "keterangan": "",
      "penerima": "Toko Makmur",
      "statusBukti": false
    }
  ],
  "bukti_kas": [...],
  "pengaturan": {...},
  "saldo": {...}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sync berhasil",
  "result": {
    "transaksi": {
      "success": 5,
      "failed": 0,
      "errors": []
    },
    "bukti_kas": {
      "success": 3,
      "failed": 0,
      "errors": []
    },
    "pengaturan": {
      "success": true,
      "error": null
    },
    "saldo": {
      "success": true,
      "error": null
    }
  },
  "timestamp": "2026-01-15 10:30:00"
}
```

---

## ✅ Verifikasi Sync Berhasil

Setelah sync berhasil:

1. **Cek di phpMyAdmin:**
   - Buka database `username_bosp`
   - Tabel `transaksi` → harus ada data
   - Tabel `bukti_kas` → harus ada data
   - Tabel `pengaturan` → harus ada data

2. **Test di aplikasi:**
   - Refresh halaman
   - Data harus muncul dari MySQL
   - Buat transaksi baru → harus tersimpan di MySQL

3. **Test multi-device:**
   - Buka aplikasi di device lain
   - Data harus sama (karena dari MySQL terpusat)

---

## 📞 Bantuan Lebih Lanjut

Jika masih error 404:

1. **Screenshot:**
   - Console browser (F12 → Console)
   - Network tab (F12 → Network → lihat request ke `/api/sync`)
   - Hasil `test.php`

2. **Informasi:**
   - URL aplikasi Anda
   - Struktur folder di hosting
   - Isi `src/config.ts` (bagian APP_CONFIG)

3. **Test manual:**
   - `https://domain.com/api/sync.php` (harus error "Method not allowed")
   - `https://domain.com/api/test.php` (harus semua ✅)

---

## 🎯 Quick Fix

Jika ingin cepat fix:

```bash
# 1. Upload file sync.php
Upload: backend/api/sync.php → public_html/api/sync.php

# 2. Test endpoint
Buka: https://domain.com/api/sync.php
Harus: Error "Method not allowed" (bukan 404)

# 3. Sync dari aplikasi
Menu Pengaturan → Database → Sync ke MySQL
Harus: Berhasil!

# 4. Verifikasi
Cek phpMyAdmin → data harus ada
```

---

**Versi:** 2.0.0  
**Last Update:** 2026-01-15
