# 📄 FITUR DOKUMEN RESMI SEKOLAH

## ✨ Fitur Baru: Pembuatan Dokumen Resmi dengan Kop Sekolah

Sistem pembukuan BOSP sekarang memiliki fitur untuk membuat **3 jenis dokumen resmi sekolah** dengan kop sekolah dan export ke format Word (.docx):

1. **Surat Pesanan** - Untuk memesan barang ke vendor/toko
2. **Berita Acara Serah Terima (BAST)** - Untuk dokumentasi serah terima barang
3. **Lembar Pemeriksaan Barang** - Untuk pemeriksaan kualitas barang yang diterima

---

## 🎯 Cara Menggunakan

### 1. Akses Menu Dokumen
- Buka aplikasi
- Klik menu **"Dokumen"** di sidebar (ikon 📄)

### 2. Pilih Jenis Dokumen
Ada 3 tab yang tersedia:
- **Surat Pesanan** - Untuk membuat surat pemesanan barang
- **Berita Acara Serah Terima** - Untuk membuat BAST
- **Lembar Pemeriksaan** - Untuk membuat lembar pemeriksaan barang

### 3. Pilih Transaksi
- Sistem akan menampilkan daftar transaksi pengeluaran
- Klik tombol **"Buat Surat"**, **"Buat BAST"**, atau **"Buat LPB"** pada transaksi yang diinginkan

### 4. Download Dokumen
- Klik tombol **"Download Word"**
- File .docx akan otomatis terdownload
- Dokumen sudah lengkap dengan kop sekolah dan format resmi

---

## 📋 Detail Dokumen

### 1. Surat Pesanan

**Isi Dokumen:**
- Kop sekolah lengkap (Pemerintah Kabupaten, Dinas Pendidikan, Nama Sekolah, Alamat)
- Nomor surat otomatis (format: NoBukti/SP/Bulan/Tahun)
- Data bendahara (nama, jabatan, NIP)
- Data vendor/toko penerima pesanan
- Tabel rincian barang yang dipesan
- Jumlah total dan terbilang
- Tanda tangan bendahara

**Format:**
```
PEMERINTAH KABUPATEN TULANG BAWANG BARAT
DINAS PENDIDIKAN DAN KEBUDAYAAN
SMP NEGERI 1 TULANG BAWANG BARAT
Jl. Pendidikan No. 1, Tulang Bawang Barat, Lampung
Telepon: (0xxx) xxxxxxx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SURAT PESANAN
Nomor: TRX/001/01/2026/SP/1/2026

Yang bertanda tangan di bawah ini:
Nama     : [Nama Bendahara]
Jabatan  : Bendahara Sekolah
NIP      : [NIP Bendahara]

Dengan ini memesan kepada:
Nama Toko/Vendor : [Nama Penerima]

Untuk menyediakan barang-barang sebagai berikut:
┌────┬──────────────────┬────────┬────────┬─────────────┐
│ No │ Uraian Barang    │ Volume │ Satuan │ Jumlah (Rp) │
├────┼──────────────────┼────────┼────────┼─────────────┤
│ 1  │ [Uraian]         │ 1      │ Paket  │ Rp xxx.xxx  │
├────┴──────────────────┴────────┴────────┼─────────────┤
│ Jumlah Total                            │ Rp xxx.xxx  │
└─────────────────────────────────────────┴─────────────┘

Terbilang: [terbilang] rupiah

[Tempat], [Tanggal]
Bendahara Sekolah,

[Tanda Tangan]

[Nama Bendahara]
NIP. [NIP]
```

---

### 2. Berita Acara Serah Terima (BAST)

**Isi Dokumen:**
- Kop sekolah lengkap
- Nomor BAST otomatis (format: NoBukti/BAST/Bulan/Tahun)
- Tanggal dan hari serah terima
- Data pihak pertama (penyedia barang)
- Data pihak kedua (bendahara sekolah)
- Tabel rincian barang yang diserahkan
- Tanda tangan kedua belah pihak
- Mengetahui Kepala Sekolah

**Format:**
```
[KOP SEKOLAH]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BERITA ACARA SERAH TERIMA
(BAST)
Nomor: TRX/001/01/2026/BAST/1/2026

Pada hari ini, [Hari] tanggal [Tanggal], kami yang bertanda tangan di bawah ini:

1. Nama   : [Nama Penerima]
   Jabatan: Penyedia Barang
   Selanjutnya disebut sebagai PIHAK PERTAMA

2. Nama   : [Nama Bendahara]
   Jabatan: Bendahara Sekolah
   Selanjutnya disebut sebagai PIHAK KEDUA

PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA dan PIHAK KEDUA menerima dari PIHAK PERTAMA barang-barang sebagai berikut:

┌────┬──────────────────┬────────┬────────┬─────────────┐
│ No │ Uraian Barang    │ Volume │ Satuan │ Jumlah (Rp) │
├────┼──────────────────┼────────┼────────┼─────────────┤
│ 1  │ [Uraian]         │ 1      │ Paket  │ Rp xxx.xxx  │
└────┴──────────────────┴────────┴────────┴─────────────┘

Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya.

PIHAK PERTAMA              PIHAK KEDUA
Penyedia Barang            Bendahara Sekolah

[Tanda Tangan]             [Tanda Tangan]

[Nama Penerima]            [Nama Bendahara]
                           NIP. [NIP]

Mengetahui,
Kepala Sekolah

[Tanda Tangan]

[Nama Kepala Sekolah]
NIP. [NIP]
```

---

### 3. Lembar Pemeriksaan Barang

**Isi Dokumen:**
- Kop sekolah lengkap
- Nomor LPB otomatis (format: NoBukti/LPB/Bulan/Tahun)
- Tanggal pemeriksaan
- Tabel pemeriksaan barang (uraian, qty, kondisi, sesuai/tidak, keterangan)
- Checklist hasil pemeriksaan:
  - ☐ Barang diterima dengan baik dan sesuai spesifikasi
  - ☐ Barang diterima dengan catatan
  - ☐ Barang ditolak
- Kolom catatan
- Tanda tangan pemeriksa (bendahara)
- Mengetahui Kepala Sekolah

**Format:**
```
[KOP SEKOLAH]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEMBAR PEMERIKSAAN BARANG
Nomor: TRX/001/01/2026/LPB/1/2026

Tanggal Pemeriksaan: [Tanggal]

Telah dilakukan pemeriksaan terhadap barang-barang yang diterima dengan rincian sebagai berikut:

┌────┬──────────────────┬─────┬──────────┬────────┬─────┐
│ No │ Uraian Barang    │ Qty │ Kondisi  │ Sesuai │ Ket │
├────┼──────────────────┼─────┼──────────┼────────┼─────┤
│ 1  │ [Uraian]         │ 1   │ Baik     │ ✓      │ -   │
└────┴──────────────────┴─────┴──────────┴────────┴─────┘

Hasil Pemeriksaan:
☐ Barang diterima dengan baik dan sesuai spesifikasi
☐ Barang diterima dengan catatan (lihat keterangan)
☐ Barang ditolak (lihat keterangan)

Catatan:
[Area untuk catatan]

Pemeriksa,                 Mengetahui,
Bendahara Sekolah          Kepala Sekolah

[Tanda Tangan]             [Tanda Tangan]

[Nama Bendahara]           [Nama Kepala Sekolah]
NIP. [NIP]                 NIP. [NIP]
```

---

## 🔧 Konfigurasi

### Data yang Digunakan

Dokumen menggunakan data dari:

1. **Transaksi** - Data transaksi pengeluaran (uraian, jumlah, tanggal, penerima)
2. **Pengaturan** - Data sekolah dan pegawai:
   - Nama sekolah
   - Alamat
   - Kecamatan, Kabupaten, Provinsi
   - Telepon
   - Kepala Sekolah + NIP
   - Bendahara + NIP

### Cara Mengatur Data Pengaturan

1. Buka menu **Pengaturan**
2. Tab **Data Sekolah**:
   - Isi nama sekolah, alamat, kecamatan, kabupaten, provinsi
   - Isi nomor telepon
3. Tab **Pegawai**:
   - Isi nama Kepala Sekolah + NIP
   - Isi nama Bendahara + NIP
4. Klik **Simpan Pengaturan**

---

## 📊 Fitur Utama

### ✅ Otomatis
- Nomor surat otomatis dari nomor bukti transaksi
- Tanggal otomatis dari tanggal transaksi
- Data bendahara dan kepala sekolah otomatis dari pengaturan
- Format tanggal Indonesia (DD-MM-YYYY)
- Terbilang otomatis untuk jumlah uang

### ✅ Format Resmi
- Kop sekolah lengkap sesuai standar
- Format surat resmi pemerintah
- Tabel dengan border yang rapi
- Tanda tangan di posisi yang benar
- Font dan ukuran sesuai standar

### ✅ Export Word
- Format .docx (Microsoft Word)
- Bisa diedit setelah download
- Bisa di-print langsung
- Kompatibel dengan semua versi Word

---

## 🎨 Tampilan Dokumen

### Kop Sekolah
```
PEMERINTAH KABUPATEN TULANG BAWANG BARAT
DINAS PENDIDIKAN DAN KEBUDAYAAN
SMP NEGERI 1 TULANG BAWANG BARAT
Jl. Pendidikan No. 1, Tulang Bawang Barat, Lampung
Telepon: (0xxx) xxxxxxx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Tabel Barang
- Border hitam tipis
- Header tabel dengan background
- Alignment yang benar (tengah untuk no, kiri untuk uraian, kanan untuk jumlah)
- Kolom total di baris terakhir

### Tanda Tangan
- Posisi yang benar (kiri untuk pihak pertama, kanan untuk pihak kedua)
- Jarak yang sesuai untuk tanda tangan
- Nama lengkap dengan bold
- NIP di bawah nama

---

## 💡 Tips Penggunaan

### 1. Siapkan Data Pengaturan
Sebelum membuat dokumen, pastikan data pengaturan sudah lengkap:
- Nama sekolah
- Alamat lengkap
- Nama dan NIP Kepala Sekolah
- Nama dan NIP Bendahara

### 2. Pilih Transaksi yang Tepat
- Surat Pesanan: Pilih transaksi sebelum barang diterima
- BAST: Pilih transaksi saat barang diterima
- LPB: Pilih transaksi setelah barang diperiksa

### 3. Edit Setelah Download
File Word yang didownload bisa diedit:
- Tambah detail barang jika perlu
- Edit catatan di LPB
- Tambah tanda tangan digital
- Sesuaikan format jika diperlukan

### 4. Print Langsung
File Word bisa langsung di-print:
- Buka di Microsoft Word
- Print atau Save as PDF
- Gunakan kertas A4
- Margin sudah sesuai standar

---

## 🔍 Troubleshooting

### Dokumen Tidak Muncul
**Penyebab:** Belum ada transaksi pengeluaran

**Solusi:** 
1. Tambah transaksi pengeluaran di menu Transaksi
2. Pastikan jenis transaksi = "keluar"

### Data Sekolah Tidak Muncul
**Penyebab:** Pengaturan belum diisi

**Solusi:**
1. Buka menu Pengaturan
2. Isi data sekolah dan pegawai
3. Simpan pengaturan

### File Tidak Terdownload
**Penyebab:** Browser memblokir download

**Solusi:**
1. Izinkan download di browser
2. Cek folder download
3. Coba browser lain

### Format Dokumen Berantakan
**Penyebab:** Versi Word tidak kompatibel

**Solusi:**
1. Gunakan Microsoft Word 2007 atau lebih baru
2. Atau gunakan LibreOffice Writer
3. Atau buka di Google Docs

---

## 📝 Contoh Penggunaan

### Skenario 1: Pembelian ATK

1. **Tambah Transaksi:**
   - Tanggal: 15-01-2026
   - No. Bukti: TRX/001/01/2026
   - Uraian: Pembelian ATK untuk kegiatan sekolah
   - Penerima: Toko Makmur Jaya
   - Jumlah: Rp 1.500.000

2. **Buat Surat Pesanan:**
   - Menu Dokumen → Surat Pesanan
   - Pilih transaksi TRX/001/01/2026
   - Klik "Buat Surat"
   - Download Word
   - Cetak dan tanda tangani
   - Berikan ke Toko Makmur Jaya

3. **Saat Barang Datang:**
   - Menu Dokumen → BAST
   - Pilih transaksi TRX/001/01/2026
   - Klik "Buat BAST"
   - Download Word
   - Cetak dan tanda tangani oleh kedua pihak

4. **Pemeriksaan Barang:**
   - Menu Dokumen → Lembar Pemeriksaan
   - Pilih transaksi TRX/001/01/2026
   - Klik "Buat LPB"
   - Download Word
   - Periksa barang dan isi checklist
   - Cetak dan tanda tangani

---

## 🎯 Keuntungan

### ✅ Efisiensi
- Tidak perlu mengetik ulang
- Data otomatis dari transaksi
- Format sudah standar
- Hemat waktu

### ✅ Konsistensi
- Format sama untuk semua dokumen
- Kop sekolah konsisten
- Nomor surat terurut
- Data pegawai konsisten

### ✅ Profesional
- Dokumen resmi dengan kop sekolah
- Format sesuai standar pemerintah
- Tanda tangan di posisi yang benar
- Terlihat profesional

### ✅ Terintegrasi
- Data dari database MySQL
- Sinkron dengan transaksi
- Update otomatis jika data berubah
- Bisa diakses dari mana saja

---

## 📚 Dokumentasi Terkait

- **SISTEM_ONLINE_MYSQL.md** - Penjelasan sistem online
- **PANDUAN_LENGKAP_DATABASE.md** - Panduan database
- **DIAGNOSA_DATABASE.md** - Troubleshooting database

---

**Versi:** 2.2.0 - Fitur Dokumen Resmi  
**Status:** ✅ Production Ready  
**Last Update:** 2026-01-15
