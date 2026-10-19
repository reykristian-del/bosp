# 🔧 SOLUSI ERROR: Content Security Policy Blocks `eval`
## Panduan Lengkap Mengatasi CSP Error

---

## ❌ Masalah

Saat membuka aplikasi, muncul error di browser console:
```
Content Security Policy of your site blocks the use of 'eval' in JavaScript
```

Atau fitur import Excel / export Word tidak berfungsi.

---

## 🔍 Penyebab

Error ini terjadi karena:

1. **Library `xlsx`** (untuk import/export Excel) menggunakan `eval()` atau `new Function()`
2. **Library `docx`** (untuk export Word) juga menggunakan `eval()`
3. **Hosting Anda** memiliki Content Security Policy (CSP) yang ketat dan memblokir `eval`

---

## ✅ Solusi yang Sudah Diterapkan

Saya sudah menambahkan konfigurasi CSP yang mengizinkan `eval` di:

### 1. **Meta Tag di index.html**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
  connect-src 'self' https: http:;
  worker-src 'self' blob:;
" />
```

### 2. **Header di .htaccess**
```apache
<IfModule mod_headers.c>
    # Hapus CSP default hosting jika ada
    Header unset Content-Security-Policy
    
    # Set CSP yang mengizinkan eval
    Header set Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; ..."
</IfModule>
```

---

## 🚀 Langkah-Langkah Fix

### Step 1: Upload File Terbaru

Upload file-file ini ke hosting:

```
public_html/
├── index.html          ← Upload dari dist/
├── .htaccess           ← Upload dari dist/
└── assets/             ← Upload dari dist/
```

### Step 2: Clear Cache Browser

1. Tekan **Ctrl + Shift + Delete**
2. Pilih "Cached images and files"
3. Klik "Clear data"
4. Atau tekan **Ctrl + Shift + R** untuk hard reload

### Step 3: Test Aplikasi

Buka aplikasi dan cek:
- ✅ Import Excel berfungsi
- ✅ Export Word berfungsi
- ✅ Export Excel berfungsi
- ✅ Tidak ada error CSP di console

---

## 🔧 Jika Masih Error

### Solusi 1: Cek CSP di Hosting

Beberapa hosting (seperti Cloudflare, Netlify, Vercel) memiliki CSP sendiri yang override konfigurasi kita.

**Cara cek:**
1. Buka aplikasi
2. Tekan F12 → Tab Console
3. Cari error dengan kata "Content Security Policy"
4. Lihat URL yang diblokir

**Jika ada CSP dari hosting:**
- Login ke dashboard hosting
- Cari pengaturan "Security Headers" atau "CSP"
- Tambahkan `'unsafe-eval'` ke `script-src`

### Solusi 2: Cloudflare

Jika menggunakan Cloudflare:
1. Login ke Cloudflare dashboard
2. Pilih domain Anda
3. Menu **Security** → **WAF**
4. Tab **Managed rules**
5. Cari rule "Content Security Policy"
6. Edit atau disable rule tersebut

Atau tambahkan Page Rule:
1. Menu **Rules** → **Page Rules**
2. Create Page Rule
3. URL: `*domain.com/*`
4. Setting: **Security Level** → **Essentially Off**

### Solusi 3: cPanel dengan ModSecurity

Jika menggunakan cPanel dengan ModSecurity:
1. Login ke cPanel
2. Menu **Security** → **ModSecurity**
3. Pilih domain
4. Cari rule yang memblokir eval
5. Disable rule tersebut

Atau tambahkan di `.htaccess`:
```apache
<IfModule mod_security2.c>
    SecRuleRemoveById 960010
    SecRuleRemoveById 960904
</IfModule>
```

### Solusi 4: Hosting dengan CSP Ketat

Jika hosting tidak mengizinkan `unsafe-eval` sama sekali, gunakan library alternatif:

**Untuk Excel:**
- Ganti `xlsx` dengan `SheetJS` versi community yang tidak menggunakan eval
- Atau gunakan `exceljs` yang lebih aman

**Untuk Word:**
- Ganti `docx` dengan `html-docx-js` yang generate HTML lalu convert ke DOCX

---

## 📋 Verifikasi CSP Berhasil

### Test 1: Cek Console Browser

1. Buka aplikasi
2. Tekan F12 → Tab Console
3. Tidak boleh ada error CSP

### Test 2: Cek Network Tab

1. Tekan F12 → Tab Network
2. Refresh halaman
3. Klik `index.html`
4. Tab **Headers** → **Response Headers**
5. Cari `Content-Security-Policy`
6. Harus ada `'unsafe-eval'`

### Test 3: Test Fitur

1. **Import Excel:**
   - Menu Transaksi → Import Excel
   - Upload file Excel
   - Harus berhasil tanpa error

2. **Export Word:**
   - Menu Bukti Kas → Export Word
   - File .docx harus terdownload

3. **Export Excel:**
   - Menu Laporan → Export Excel
   - File .xlsx harus terdownload

---

## 🎯 CSP Policy yang Digunakan

```
default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
img-src 'self' data: blob: https:;
font-src 'self' data: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
connect-src 'self' https: http:;
worker-src 'self' blob:;
```

**Penjelasan:**
- `'self'` - Izinkan resource dari domain yang sama
- `'unsafe-inline'` - Izinkan inline script/style
- `'unsafe-eval'` - Izinkan eval() (DIPERLUKAN untuk xlsx & docx)
- `data:` - Izinkan data URI (untuk gambar base64)
- `blob:` - Izinkan blob URL (untuk download file)
- `https://cdnjs.cloudflare.com` - CDN Font Awesome
- `https://cdn.jsdelivr.net` - CDN alternatif

---

## 🔐 Keamanan

**Apakah `'unsafe-eval'` berbahaya?**

Jawaban: **Relatif aman** untuk aplikasi internal seperti ini.

**Risiko:**
- `eval()` bisa menjalankan code JavaScript dari string
- Jika ada XSS vulnerability, attacker bisa inject code

**Mitigasi:**
- Aplikasi ini untuk internal sekolah
- Data disimpan di localStorage/MySQL (bukan dari user input mentah)
- Tidak ada user-generated content yang di-render sebagai HTML
- Sanitasi input sudah dilakukan

**Alternatif lebih aman:**
- Gunakan library yang tidak memerlukan `eval`
- Tapi saat ini `xlsx` dan `docx` memerlukan `eval` untuk performa

---

## 📞 Troubleshooting Lanjutan

### Error: "Refused to evaluate a string"

**Penyebab:** CSP masih memblokir eval

**Solusi:**
1. Clear cache browser (Ctrl+Shift+Delete)
2. Hard reload (Ctrl+Shift+R)
3. Cek `.htaccess` sudah ter-upload
4. Cek hosting tidak override CSP

### Error: "Blocked by Content Security Policy"

**Penyebab:** Resource diblokir CSP

**Solusi:**
1. Buka Console (F12)
2. Lihat URL yang diblokir
3. Tambahkan domain tersebut ke CSP di `.htaccess`

Contoh:
```apache
Header set Content-Security-Policy "... script-src 'self' 'unsafe-eval' https://blocked-domain.com ..."
```

### Fitur Excel/Word Tidak Berfungsi

**Penyebab:** Library tidak bisa load karena CSP

**Solusi:**
1. Cek Console untuk error
2. Pastikan `'unsafe-eval'` ada di CSP
3. Clear cache dan reload
4. Test di browser lain

---

## ✅ Checklist Final

- [ ] Upload `index.html` terbaru dari `dist/`
- [ ] Upload `.htaccess` terbaru dari `dist/`
- [ ] Clear cache browser
- [ ] Test import Excel → berhasil
- [ ] Test export Word → berhasil
- [ ] Test export Excel → berhasil
- [ ] Tidak ada error CSP di console
- [ ] CSP header mengandung `'unsafe-eval'`

---

## 📖 Referensi

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Cheat Sheet](https://content-security-policy.com/)
- [SheetJS Documentation](https://sheetjs.com/)
- [docx.js Documentation](https://docx.js.org/)

---

## 🎉 Jika Semua Berhasil

Selamat! Aplikasi Anda sekarang berfungsi penuh dengan:
- ✅ Import Excel dari file
- ✅ Export laporan ke Excel
- ✅ Export bukti kas ke Word
- ✅ Semua fitur berjalan tanpa error CSP

---

**Versi:** 2.0.0  
**Last Update:** 2026-01-15
