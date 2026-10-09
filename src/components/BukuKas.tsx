import { useState, useEffect } from 'react';
import { Transaksi } from '../types';
import { getTransaksi, getSaldoAwal, formatRupiah, getPengaturan } from '../utils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function BukuKas() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [saldoAwal, setSaldoAwal] = useState<number>(0);
  const [filterBulan, setFilterBulan] = useState('');
  const pengaturan = getPengaturan();
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    setTransaksi(getTransaksi());
    const saldo = getSaldoAwal();
    setSaldoAwal(saldo.jumlah);
  }, []);

  const filtered = transaksi
    .filter(t => {
      const date = new Date(t.tanggal);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear().toString();
      if (filterBulan && month !== filterBulan) return false;
      if (filterTahun && year !== filterTahun) return false;
      return true;
    })
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  let saldoBerjalan = saldoAwal;
  const bukuKasData = filtered.map(t => {
    if (t.jenis === 'masuk') {
      saldoBerjalan += t.jumlah;
    } else {
      saldoBerjalan -= t.jumlah;
    }
    return { ...t, saldo: saldoBerjalan };
  });

  const totalMasuk = filtered.filter(t => t.jenis === 'masuk').reduce((sum, t) => sum + t.jumlah, 0);
  const totalKeluar = filtered.filter(t => t.jenis === 'keluar').reduce((sum, t) => sum + t.jumlah, 0);

  const exportExcel = () => {
    const data = [
      ['BUKU KAS UMUM'],
      [pengaturan.namaSekolah || 'SMP NEGERI 1 TULANG BAWANG BARAT'],
      [`Periode: ${filterBulan ? new Date(`${filterTahun}-${filterBulan}-01`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : `Tahun ${filterTahun}`}`],
      [],
      ['No', 'Tanggal', 'No. Bukti', 'Uraian', 'Kode Rek.', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Saldo (Rp)'],
      ...bukuKasData.map((t, i) => [
        i + 1,
        t.tanggal,
        t.noBukti,
        t.uraian,
        t.kodeRekening,
        t.jenis === 'masuk' ? t.jumlah : 0,
        t.jenis === 'keluar' ? t.jumlah : 0,
        t.saldo,
      ]),
      [],
      ['', '', '', 'TOTAL', '', totalMasuk, totalKeluar, saldoBerjalan],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Buku Kas');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Buku_Kas_BOSP_SMPN1_Tulang_Bawang_Barat_${filterTahun}.xlsx`);
  };

  const bulanOptions = [
    { value: '', label: 'Semua Bulan' },
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            {bulanOptions.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
          <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <button onClick={exportExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm">
          <i className="fas fa-file-excel mr-2"></i>Export Excel
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Total Pemasukan</p>
          <p className="text-lg font-bold text-green-600">{formatRupiah(totalMasuk)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-xs text-gray-500">Total Pengeluaran</p>
          <p className="text-lg font-bold text-red-600">{formatRupiah(totalKeluar)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Saldo Akhir Periode</p>
          <p className="text-lg font-bold text-blue-600">{formatRupiah(saldoBerjalan)}</p>
        </div>
      </div>

      {/* Buku Kas Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-800"><i className="fas fa-book mr-2"></i>Buku Kas Umum</h3>
          <p className="text-xs text-gray-500 mt-1">{pengaturan.namaSekolah || 'SMP Negeri 1 Tulang Bawang Barat'} - {pengaturan.sumberDana || 'Dana BOSP'}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-b">
              <tr>
                <th className="text-center px-3 py-3 font-semibold text-gray-600 w-10">No</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600">Tanggal</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600">No. Bukti</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600">Uraian</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600">Kode Rek.</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600">Debit (Rp)</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600">Kredit (Rp)</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600">Saldo (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {/* Saldo Awal */}
              <tr className="bg-yellow-50 font-medium">
                <td className="px-3 py-2 text-center">-</td>
                <td className="px-3 py-2">-</td>
                <td className="px-3 py-2">-</td>
                <td className="px-3 py-2 font-medium">Saldo Awal</td>
                <td className="px-3 py-2">-</td>
                <td className="px-3 py-2 text-right">{formatRupiah(saldoAwal)}</td>
                <td className="px-3 py-2 text-right">-</td>
                <td className="px-3 py-2 text-right font-bold">{formatRupiah(saldoAwal)}</td>
              </tr>
              {bukuKasData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    <i className="fas fa-inbox text-3xl mb-2 block"></i>
                    Tidak ada transaksi pada periode ini
                  </td>
                </tr>
              ) : (
                bukuKasData.map((t, i) => (
                  <tr key={t.id} className={`border-b hover:bg-gray-50 ${t.jenis === 'masuk' ? '' : ''}`}>
                    <td className="px-3 py-2 text-center">{i + 1}</td>
                    <td className="px-3 py-2">{t.tanggal}</td>
                    <td className="px-3 py-2 font-mono text-xs">{t.noBukti}</td>
                    <td className="px-3 py-2">{t.uraian}</td>
                    <td className="px-3 py-2 text-xs">{t.kodeRekening}</td>
                    <td className="px-3 py-2 text-right text-green-600">{t.jenis === 'masuk' ? formatRupiah(t.jumlah) : '-'}</td>
                    <td className="px-3 py-2 text-right text-red-600">{t.jenis === 'keluar' ? formatRupiah(t.jumlah) : '-'}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatRupiah(t.saldo)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {bukuKasData.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-right">TOTAL</td>
                  <td className="px-3 py-3 text-right text-green-700">{formatRupiah(totalMasuk)}</td>
                  <td className="px-3 py-3 text-right text-red-700">{formatRupiah(totalKeluar)}</td>
                  <td className="px-3 py-3 text-right text-blue-700">{formatRupiah(saldoBerjalan)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
