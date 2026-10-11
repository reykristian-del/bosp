# Panduan Import Transaksi dari Excel

## 📥 Cara Download Template

1. **Melalui Aplikasi:**
   - Buka menu **Transaksi**
   - Klik tombol **"Download Template"** (warna abu-abu)
   - File `Template_Import_Transaksi_BOSP.xlsx` akan terdownload

2. **Template terdiri dari 2 sheet:**
   - **Format Import** - Sheet untuk mengisi data transaksi
   - **Panduan** - Sheet berisi penjelasan lengkap

---

## 📋 Format Kolom

### Kolom WAJIB (harus diisi):

| Kolom | Format | Contoh |
|-------|--------|--------|
| **Tanggal** | YYYY-MM-DD | 2026-01-15 |
| **Uraian** | Teks | Pembelian ATK sekolah |
| **Jenis** | "masuk" atau "keluar" (huruf kecil) | keluar |
| **Jumlah** | Angka tanpa format | 1500000 |

### Kolom OPSIONAL:

| Kolom | Format | Contoh |
|-------|--------|--------|
| **No. Bukti** | Teks | TRX/001/01/2026 |
| **Kategori** | Pilih dari daftar | Pengelolaan Sekolah |
| **Kode Rekening** | Teks | 5.1.02.01 |
| **Penerima** | Teks | Toko Makmur Jaya |
| **Keterangan** | Teks | Pembelian kertas, tinta |

---

## 📂 Daftar Kategori BOSP

Gunakan salah satu dari kategori berikut:

1. Pengembangan Perpustakaan
2. Kegiatan Pembelajaran dan Ekstrakurikuler
3. Kegiatan Evaluasi Pembelajaran
4. Pengelolaan Sekolah
5. Pengembangan Profesi Guru dan Tendik
6. Langganan dan Daya
7. Pemeliharaan dan Perawatan
8. Pembayaran Honor
9. Biaya Lainnya

---

## 🔄 Cara Import

1. **Download template** dari menu Transaksi
2. **Isi data** di sheet "Format Import"
3. **Simpan file** dalam format .xlsx
4. **Buka aplikasi** → Menu Transaksi
5. **Klik "Import Excel"** (tombol ungu)
6. **Pilih file** Excel yang sudah diisi
7. **Preview data** yang akan diimport
8. **Klik "Import"** untuk menyimpan

---

## ⚠️ Catatan Penting

### Format Tanggal
- ✅ Benar: `2026-01-15`, `15/01/2026`, `15-01-2026`
- ❌ Salah: `Jan 15, 2026`, `15 Jan 2026`

### Format Jumlah
- ✅ Benar: `1500000`, `1.500.000`, `Rp 1.500.000`
- ❌ Salah: `1,500,000` (koma sebagai pemisah ribuan)

### Jenis Transaksi
- ✅ Benar: `masuk`, `keluar` (huruf kecil semua)
- ❌ Salah: `Masuk`, `KELUAR`, `Masuk/Keluar`

### Aturan Umum
- Baris pertama adalah **header**, jangan dihapus
- Data dimulai dari **baris kedua**
- Jangan ada **baris kosong** di tengah data
- Pastikan semua **kolom wajib** terisi
- Maksimal **10.000 baris** per import

---

## 🚨 Error yang Sering Terjadi

| Error | Penyebab | Solusi |
|-------|----------|--------|
| Tanggal kosong | Kolom tanggal tidak diisi | Isi dengan format YYYY-MM-DD |
| Uraian kosong | Kolom uraian tidak diisi | Isi deskripsi transaksi |
| Jumlah tidak valid | Format salah atau kosong | Isi angka tanpa format Rupiah |
| Jenis tidak valid | Bukan "masuk" atau "keluar" | Gunakan huruf kecil |

---

## 💡 Tips

1. **Backup data** sebelum import dalam jumlah besar
2. **Test dengan sedikit data** terlebih dahulu (5-10 baris)
3. **Periksa kembali** data sebelum klik Import
4. **Data yang error** akan dilewati, tidak akan diimport
5. Gunakan **template resmi** untuk menghindari error format

---

## 📊 Contoh Data

```
Tanggal       | No. Bukti              | Uraian                          | Kategori            | Kode Rekening | Jenis   | Jumlah    | Penerima              | Keterangan
2026-01-15    | TRX/001/01/2026        | Pembelian ATK                   | Pengelolaan Sekolah | 5.1.02.01     | keluar  | 1500000   | Toko Makmur Jaya      | Kertas, tinta
2026-01-20    | TRX/002/01/2026        | Honor guru Januari              | Pembayaran Honor    | 5.1.02.02     | keluar  | 5000000   | Bendahara Sekolah     | 5 guru
2026-02-01    | TRX/003/02/2026        | Pencairan Dana BOSP Triwulan I  | Biaya Lainnya       | 5.1.01        | masuk   | 50000000  | SMP Negeri 1 TBB      | Triwulan I
```

---

## 🆘 Bantuan

Jika mengalami masalah saat import:
1. Pastikan menggunakan **template resmi**
2. Periksa **format tanggal** dan **jumlah**
3. Pastikan **kolom wajib** terisi semua
4. Coba import **sedikit data** terlebih dahulu
5. Hubungi tim IT jika masih bermasalah
