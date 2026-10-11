import { Transaksi, BuktiKasPengeluaran, PengaturanSekolah } from './types';

const TRANSAKSI_KEY = 'bosp_transaksi';
const BUKTI_KAS_KEY = 'bosp_bukti_kas';
const SALDO_KEY = 'bosp_saldo_awal';
const PENGATURAN_KEY = 'bosp_pengaturan';

// Safe localStorage wrapper - mencegah crash jika localStorage diblokir
const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage tidak tersedia:', e);
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Gagal menghapus dari localStorage:', e);
    }
  },
  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Gagal mengosongkan localStorage:', e);
    }
  }
};

// Default pengaturan
const DEFAULT_PENGATURAN: PengaturanSekolah = {
  namaSekolah: 'SMP NEGERI 1 TULANG BAWANG BARAT',
  npsn: '',
  alamat: '',
  kelurahan: '',
  kecamatan: 'Tulang Bawang Barat',
  kabupaten: 'Tulang Bawang Barat',
  provinsi: 'Lampung',
  kodePos: '',
  telepon: '',
  email: '',
  kepalaSekolah: '',
  nipKepsek: '',
  bendahara: '',
  nipBendahara: '',
  tahunAnggaran: new Date().getFullYear().toString(),
  sumberDana: 'Dana BOSP',
};

// Transaksi
export function getTransaksi(): Transaksi[] {
  const data = safeStorage.getItem(TRANSAKSI_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransaksi(transaksi: Transaksi[]): void {
  safeStorage.setItem(TRANSAKSI_KEY, JSON.stringify(transaksi));
}

export function addTransaksi(transaksi: Transaksi): void {
  const list = getTransaksi();
  list.push(transaksi);
  saveTransaksi(list);
}

export function updateTransaksi(id: string, data: Partial<Transaksi>): void {
  const list = getTransaksi().map(t => t.id === id ? { ...t, ...data } : t);
  saveTransaksi(list);
}

export function deleteTransaksi(id: string): void {
  const list = getTransaksi().filter(t => t.id !== id);
  saveTransaksi(list);
}

// Bukti Kas
export function getBuktiKas(): BuktiKasPengeluaran[] {
  const data = safeStorage.getItem(BUKTI_KAS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBuktiKas(bukti: BuktiKasPengeluaran[]): void {
  safeStorage.setItem(BUKTI_KAS_KEY, JSON.stringify(bukti));
}

export function addBuktiKas(bukti: BuktiKasPengeluaran): void {
  const list = getBuktiKas();
  list.push(bukti);
  saveBuktiKas(list);
}

export function deleteBuktiKas(id: string): void {
  const list = getBuktiKas().filter(b => b.id !== id);
  saveBuktiKas(list);
}

// Saldo Awal
export function getSaldoAwal(): { tanggal: string; jumlah: number; keterangan: string } {
  const data = safeStorage.getItem(SALDO_KEY);
  return data ? JSON.parse(data) : { tanggal: '', jumlah: 0, keterangan: '' };
}

export function saveSaldoAwal(saldo: { tanggal: string; jumlah: number; keterangan: string }): void {
  safeStorage.setItem(SALDO_KEY, JSON.stringify(saldo));
}

// Pengaturan
export function getPengaturan(): PengaturanSekolah {
  const data = safeStorage.getItem(PENGATURAN_KEY);
  if (data) {
    return { ...DEFAULT_PENGATURAN, ...JSON.parse(data) };
  }
  return DEFAULT_PENGATURAN;
}

export function savePengaturan(pengaturan: PengaturanSekolah): void {
  safeStorage.setItem(PENGATURAN_KEY, JSON.stringify(pengaturan));
}

// Utility functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

export function formatTanggal(tanggal: string): string {
  if (!tanggal) return '-';
  const date = new Date(tanggal);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function terbilang(angka: number): string {
  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  
  if (angka < 12) return satuan[angka];
  if (angka < 20) return terbilang(angka - 10) + ' belas';
  if (angka < 100) return terbilang(Math.floor(angka / 10)) + ' puluh ' + terbilang(angka % 10);
  if (angka < 200) return 'seratus ' + terbilang(angka - 100);
  if (angka < 1000) return terbilang(Math.floor(angka / 100)) + ' ratus ' + terbilang(angka % 100);
  if (angka < 2000) return 'seribu ' + terbilang(angka - 1000);
  if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' ribu ' + terbilang(angka % 1000);
  if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + ' juta ' + terbilang(angka % 1000000);
  return terbilang(Math.floor(angka / 1000000000)) + ' miliar ' + terbilang(angka % 1000000000);
}

export function generateNoBukti(prefix: string = 'BKP'): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const list = prefix === 'BKP' ? getBuktiKas() : getTransaksi();
  const count = list.filter(b => {
    const d = new Date(b.tanggal);
    return d.getMonth() + 1 === date.getMonth() + 1 && d.getFullYear() === year;
  }).length + 1;
  return `${prefix}/${String(count).padStart(3, '0')}/${month}/${year}`;
}
