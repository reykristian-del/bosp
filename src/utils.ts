import { Transaksi, BuktiKasPengeluaran, SaldoAwal } from './types';

const TRANSAKSI_KEY = 'bosp_transaksi';
const BUKTI_KAS_KEY = 'bosp_bukti_kas';
const SALDO_KEY = 'bosp_saldo_awal';

export function getTransaksi(): Transaksi[] {
  const data = localStorage.getItem(TRANSAKSI_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransaksi(transaksi: Transaksi[]): void {
  localStorage.setItem(TRANSAKSI_KEY, JSON.stringify(transaksi));
}

export function addTransaksi(transaksi: Transaksi): void {
  const list = getTransaksi();
  list.push(transaksi);
  saveTransaksi(list);
}

export function deleteTransaksi(id: string): void {
  const list = getTransaksi().filter(t => t.id !== id);
  saveTransaksi(list);
}

export function getBuktiKas(): BuktiKasPengeluaran[] {
  const data = localStorage.getItem(BUKTI_KAS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBuktiKas(bukti: BuktiKasPengeluaran[]): void {
  localStorage.setItem(BUKTI_KAS_KEY, JSON.stringify(bukti));
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

export function getSaldoAwal(): SaldoAwal {
  const data = localStorage.getItem(SALDO_KEY);
  return data ? JSON.parse(data) : { tanggal: '', jumlah: 0, keterangan: '' };
}

export function saveSaldoAwal(saldo: SaldoAwal): void {
  localStorage.setItem(SALDO_KEY, JSON.stringify(saldo));
}

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
