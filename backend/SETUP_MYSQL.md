# Panduan Setup Database MySQL
## Sistem Pembukuan BOSP - SMP Negeri 1 Tulang Bawang Barat

### 📋 Persyaratan

- PHP 7.4 atau lebih baru
- MySQL/MariaDB 5.7+
- Apache dengan mod_rewrite (atau Nginx)
- PDO Extension enabled

---

### 🚀 Langkah-langkah Setup

#### 1. Setup Database MySQL

**Via cPanel:**
1. Login ke cPanel
2. Buka **MySQL Databases**
3. Buat database baru:
   - Database name: `username_bosp` (contoh: `cpaneluser_bosp`)
   - Note nama database lengkap
4. Buat user database:
   - Username: `username_bospuser`
   - Password: (buat password yang kuat)
   - Note username dan password
5. Add user ke database dengan **All Privileges**

**Via phpMyAdmin:**
1. Buka phpMyAdmin dari cPanel
2. Klik tab **Import**
3. Pilih file `backend/database/schema.sql`
4. Klik **Go** untuk import

**Via Command Line:**
```bash
mysql -u root -p
CREATE DATABASE bosp_smpn1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bosp_smpn1;
SOURCE /path/to/backend/database/schema.sql;
```

#### 2. Konfigurasi Backend PHP

Edit file `backend/config.php`:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'username_bosp');      // Ganti dengan nama database Anda
define('DB_USER', 'username_bospuser');  // Ganti dengan username database
define('DB_PASS', 'password_anda');      // Ganti dengan password database
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key (ganti dengan random string yang kuat)
define('JWT_SECRET', 'ganti_dengan_random_string_yang_panjang_dan_aman');

// Upload directory
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// ... rest of config
```

#### 3. Upload Backend ke Server

**Struktur folder di cPanel:**
```
public_html/
├── index.html              ← Frontend (isi folder dist/)
├── .htaccess               ← Frontend htaccess
├── assets/                 ← Frontend assets
└── api/                    ← Backend API
    ├── .htaccess
    ├── index.php
    └── config.php
```

**Atau di subfolder:**
```
public_html/
└── bosp/
    ├── index.html
    ├── .htaccess
    ├── assets/
    └── api/
        ├── .htaccess
        ├── index.php
        └── config.php
```

#### 4. Konfigurasi Frontend

Edit file `src/config.ts`:

```typescript
export const APP_CONFIG = {
  // Mode penyimpanan: 'local' atau 'mysql'
  STORAGE_MODE: 'mysql',  // Ubah ke 'mysql'
  
  // URL Backend API (sesuaikan dengan domain hosting Anda)
  API_BASE_URL: '/api',   // Jika di root domain
  // API_BASE_URL: '/bosp/api',  // Jika di subfolder /bosp/
  // API_BASE_URL: 'https://domain.com/api',  // Jika di domain berbeda
  
  // Timeout API dalam milidetik
  API_TIMEOUT: 10000,
  
  // Info Aplikasi
  APP_NAME: 'Sistem Pembukuan BOSP',
  SCHOOL_NAME: 'SMP Negeri 1 Tulang Bawang Barat',
  VERSION: '2.0.0',
};
```

#### 5. Build dan Upload Frontend

```bash
# Build aplikasi
npm run build

# Upload isi folder dist/ ke public_html/
# (atau ke public_html/bosp/ jika menggunakan subfolder)
```

#### 6. Test Koneksi

Buka browser dan akses:
```
https://domain.com/api/health
```

Jika berhasil, akan muncul:
```json
{
  "status": "ok",
  "message": "API dan database terhubung",
  "timestamp": "2026-01-15 10:30:00"
}
```

---

### 🔧 Troubleshooting

#### Error: "API tidak tersedia"

**Penyebab:**
- Backend PHP tidak ter-upload
- URL API salah di config
- Database tidak terhubung

**Solusi:**
1. Cek apakah file `api/index.php` ada di server
2. Cek URL API di `src/config.ts`
3. Cek kredensial database di `backend/config.php`
4. Cek error log di cPanel

#### Error: "Database tidak terhubung"

**Penyebab:**
- Kredensial database salah
- Database belum dibuat
- User tidak punya privilege

**Solusi:**
1. Verifikasi nama database, username, dan password
2. Pastikan user sudah di-add ke database dengan All Privileges
3. Test koneksi via phpMyAdmin

#### Error: "404 Not Found" pada API

**Penyebab:**
- File `.htaccess` tidak ada di folder `api/`
- mod_rewrite tidak aktif

**Solusi:**
1. Upload file `backend/api/.htaccess`
2. Hubungi hosting untuk aktifkan mod_rewrite

---

### 📊 Struktur Database

```
bosp_smpn1
├── pengaturan           - Data sekolah, kepsek, bendahara
├── saldo_awal           - Saldo awal per tahun anggaran
├── transaksi            - Data transaksi masuk/keluar
│   ├── id
│   ├── tanggal
│   ├── no_bukti
│   ├── uraian
│   ├── kategori
│   ├── kode_rekening
│   ├── jumlah
│   ├── pajak            - Kolom pajak (baru)
│   ├── jenis
│   ├── keterangan
│   ├── penerima
│   └── status_bukti
├── bukti_kas            - Bukti kas pengeluaran
│   ├── id
│   ├── transaksi_id
│   ├── no_bukti
│   ├── tanggal
│   ├── telah_terima_dari
│   ├── penerima         - Kolom penerima (baru)
│   ├── jumlah_uang
│   ├── terbilang
│   ├── untuk_pembayaran
│   ├── kategori
│   └── kode_rekening
├── bukti_kas_item       - Rincian item bukti kas
│   ├── id
│   ├── bukti_kas_id
│   ├── kode_rekening    - Kolom kode rekening (baru)
│   ├── uraian
│   ├── volume
│   ├── satuan
│   ├── harga_satuan
│   ├── pajak            - Kolom pajak (baru)
│   └── jumlah
├── dokumen_pendukung    - Daftar dokumen pendukung
├── users                - User untuk autentikasi
└── activity_log         - Log aktivitas
```

---

### 🔄 Migrasi dari localStorage ke MySQL

Jika sebelumnya menggunakan localStorage dan ingin migrasi ke MySQL:

1. **Backup data localStorage:**
   - Buka aplikasi
   - Menu Pengaturan → Database → Download Backup

2. **Setup MySQL** (langkah 1-5 di atas)

3. **Sync data:**
   - Buka aplikasi (sudah terhubung ke MySQL)
   - Menu Pengaturan → Database → Sync ke MySQL
   - Atau upload file backup JSON

4. **Verifikasi:**
   - Cek di phpMyAdmin apakah data sudah masuk
   - Test create/edit/delete transaksi

---

### 🔐 Keamanan

**Untuk Production:**

1. **Ganti JWT_SECRET** dengan random string yang kuat:
   ```php
   define('JWT_SECRET', bin2hex(random_bytes(32)));
   ```

2. **Enable HTTPS** di cPanel (Let's Encrypt SSL)

3. **Batasi akses database:**
   - Hanya allow koneksi dari localhost
   - Gunakan password yang kuat

4. **Setup firewall** di cPanel

5. **Backup rutin:**
   - Daily backup database via cPanel
   - Store backup di lokasi berbeda

6. **Update berkala:**
   - Update PHP ke versi terbaru
   - Update MySQL/MariaDB
   - Patch security

---

### 📞 Support

Jika mengalami masalah:

1. Cek error log di cPanel
2. Test API endpoint `/api/health`
3. Verifikasi kredensial database
4. Hubungi hosting support jika perlu

---

### ✅ Checklist Setup

- [ ] Database MySQL sudah dibuat
- [ ] User database sudah dibuat dengan All Privileges
- [ ] Schema sudah di-import via phpMyAdmin
- [ ] File `backend/config.php` sudah diedit
- [ ] Backend sudah di-upload ke server
- [ ] File `.htaccess` ada di folder `api/`
- [ ] Frontend config sudah di-update (`API_BASE_URL`)
- [ ] Frontend sudah di-build dan di-upload
- [ ] Test `/api/health` berhasil
- [ ] Test create transaksi berhasil
- [ ] Data tersimpan di MySQL (cek phpMyAdmin)

---

**Versi:** 2.0.0  
**Terakhir diupdate:** 2026-01-15
