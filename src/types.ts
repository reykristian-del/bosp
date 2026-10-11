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
  penerima: string;
  statusBukti: boolean; // apakah sudah dibuatkan bukti kas
  createdAt: string;
}

export interface BuktiKasPengeluaran {
  id: string;
  transaksiId: string; // referensi ke transaksi
  noBukti: string;
  tanggal: string;
  telahTerimaDari: string; // default: nama sekolah
  penerima: string; // dari data transaksi
  jumlahUang: number;
  terbilang: string;
  untukPembayaran: string;
  kategori: string;
  kodeRekening: string;
  items: BuktiItem[];
  dokumenPendukung: string[];
  createdAt: string;
}

export interface BuktiItem {
  uraian: string;
  volume: string;
  satuan: string;
  hargaSatuan: number;
  jumlah: number;
}

export interface PengaturanSekolah {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  kepalaSekolah: string;
  nipKepsek: string;
  bendahara: string;
  nipBendahara: string;
  tahunAnggaran: string;
  sumberDana: string;
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

export const DOKUMEN_PENDUKUNG_OPTIONS = [
  'Kwitansi',
  'Nota/Faktur',
  'Surat Pesanan',
  'Berita Acara Serah Terima',
  'Surat Tugas',
  'Daftar Hadir',
  'SPJ',
  'Bukti Transfer',
  'Dokumen Lainnya',
];
