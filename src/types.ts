export interface Transaksi {
  id: string;
  tanggal: string;
  noBukti: string;
  uraian: string;
  kategori: string;
  kodeRekening: string;
  jumlah: number;
  jenis: 'masuk' | 'keluar';
  keterangan: string;
  createdAt: string;
}

export interface BuktiKasPengeluaran {
  id: string;
  noBukti: string;
  tanggal: string;
  telahTerimaDari: string;
  jumlahUang: number;
  terbilang: string;
  untukPembayaran: string;
  kategori: string;
  kodeRekening: string;
  bendahara: string;
  kepalaSekolah: string;
  items: BuktiItem[];
  createdAt: string;
}

export interface BuktiItem {
  uraian: string;
  volume: string;
  satuan: string;
  hargaSatuan: number;
  jumlah: number;
}

export interface SaldoAwal {
  tanggal: string;
  jumlah: number;
  keterangan: string;
}

export const KATEGORI_BOSP = [
  'Pengembangan Perpustakaan',
  'Kegiatan Pembelajaran dan Ekstrakurikuler',
  'Kegiatan Evaluasi Pembelajaran',
  'Pengelolaan Sekolah',
  'Pengembangan Profesi Guru dan Tendik',
  'Langganan dan Daya',
  'Pemeliharaan dan Perawatan',
  'Pembayaran Honor',
  'Biaya Lainnya',
];

export const KODE_REKENING = [
  { kode: '5.1.01', nama: 'Belanja Barang dan Operasional' },
  { kode: '5.1.02', nama: 'Belanja Modal' },
  { kode: '5.1.02.01', nama: 'Belanja Barang' },
  { kode: '5.1.02.02', nama: 'Belanja Jasa' },
  { kode: '5.1.02.03', nama: 'Belanja Pemeliharaan' },
  { kode: '5.2.01', nama: 'Belanja Modal Tanah' },
  { kode: '5.2.02', nama: 'Belanja Modal Peralatan dan Mesin' },
  { kode: '5.2.03', nama: 'Belanja Modal Gedung dan Bangunan' },
];
