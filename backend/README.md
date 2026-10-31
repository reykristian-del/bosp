# Backend API - Sistem Pembukuan BOSP
## SMP Negeri 1 Tulang Bawang Barat

### Persyaratan
- PHP 7.4 atau lebih baru
- MySQL/MariaDB 5.7+
- Apache dengan mod_rewrite (atau Nginx)
- PDO Extension

### Instalasi

1. **Setup Database MySQL**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Konfigurasi Database**
   Edit file `config.php` dan sesuaikan:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'bosp_smpn1');
   define('DB_USER', 'root');
   define('DB_PASS', 'password_anda');
   ```

3. **Deploy ke Server**
   Upload folder `backend/` ke server web Anda (misalnya `/var/www/html/bosp-backend/`)

4. **Setup Frontend**
   Untuk menghubungkan frontend ke API MySQL, ubah konfigurasi di file `src/utils.ts` dan tambahkan fungsi API call.

### API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/transaksi | List semua transaksi |
| POST | /api/transaksi | Tambah transaksi baru |
| PUT | /api/transaksi/{id} | Update transaksi |
| DELETE | /api/transaksi/{id} | Hapus transaksi |
| GET | /api/bukti-kas | List semua bukti kas |
| POST | /api/bukti-kas | Buat bukti kas baru |
| DELETE | /api/bukti-kas/{id} | Hapus bukti kas |
| GET | /api/pengaturan | Ambil data pengaturan |
| PUT | /api/pengaturan | Update pengaturan |
| GET | /api/saldo | Ambil saldo awal |
| PUT | /api/saldo | Update saldo awal |
| GET | /api/laporan/ringkasan | Laporan ringkasan |
| GET | /api/laporan/kategori | Laporan per kategori |
| GET | /api/laporan/bulanan | Laporan per bulan |

### Contoh Request

**Tambah Transaksi:**
```bash
curl -X POST http://localhost/api/transaksi \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2026-01-15",
    "no_bukti": "TRX/001/01/2026",
    "uraian": "Pembelian ATK",
    "kategori": "Pengelolaan Sekolah",
    "kode_rekening": "5.1.02.01",
    "jumlah": 1500000,
    "jenis": "keluar",
    "penerima": "Toko Makmur"
  }'
```

**Buat Bukti Kas:**
```bash
curl -X POST http://localhost/api/bukti-kas \
  -H "Content-Type: application/json" \
  -d '{
    "transaksi_id": "abc123",
    "no_bukti": "BKP/001/01/2026",
    "tanggal": "2026-01-15",
    "telah_terima_dari": "Toko Makmur",
    "jumlah_uang": 1500000,
    "terbilang": "satu juta lima ratus ribu",
    "untuk_pembayaran": "Pembelian ATK",
    "kategori": "Pengelolaan Sekolah",
    "kode_rekening": "5.1.02.01",
    "items": [
      {
        "uraian": "Kertas HVS A4",
        "volume": "10",
        "satuan": "rim",
        "harga_satuan": 55000,
        "jumlah": 550000
      }
    ],
    "dokumen_pendukung": ["Kwitansi", "Nota/Faktur"]
  }'
```

### Struktur Database

```
bosp_smpn1
├── pengaturan        - Data sekolah, kepsek, bendahara
├── saldo_awal        - Saldo awal per tahun anggaran
├── transaksi         - Data transaksi masuk/keluar
├── bukti_kas         - Bukti kas pengeluaran
├── bukti_kas_item    - Rincian item bukti kas
├── dokumen_pendukung - Daftar dokumen pendukung
├── users             - User untuk autentikasi
└── activity_log      - Log aktivitas
```

### Integrasi Frontend dengan MySQL

Untuk menghubungkan aplikasi React ke API MySQL, tambahkan fungsi API di `src/utils.ts`:

```typescript
const API_BASE = 'http://your-server.com/api';

export async function fetchTransaksi() {
  const res = await fetch(`${API_BASE}/transaksi`);
  return res.json();
}

export async function createTransaksi(data: any) {
  const res = await fetch(`${API_BASE}/transaksi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
```

### Keamanan

- Ganti JWT_SECRET di config.php dengan random string yang kuat
- Implementasi autentikasi JWT untuk production
- Gunakan HTTPS di production
- Batasi akses database hanya dari server aplikasi
- Setup firewall dan backup rutin
