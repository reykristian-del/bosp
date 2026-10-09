import { useState, useEffect } from 'react';
import { Transaksi } from '../types';
import { getTransaksi, getSaldoAwal, formatRupiah, getPengaturan } from '../utils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx';

export default function Laporan() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [saldoAwal, setSaldoAwal] = useState<number>(0);
  const pengaturan = getPengaturan();
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());
  const [filterBulan, setFilterBulan] = useState('');
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'kategori' | 'bulanan'>('ringkasan');

  useEffect(() => {
    setTransaksi(getTransaksi());
    const saldo = getSaldoAwal();
    setSaldoAwal(saldo.jumlah);
  }, []);

  const filtered = transaksi.filter(t => {
    const date = new Date(t.tanggal);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    if (filterTahun && year !== filterTahun) return false;
    if (filterBulan && month !== filterBulan) return false;
    return true;
  });

  const totalMasuk = filtered.filter(t => t.jenis === 'masuk').reduce((sum, t) => sum + t.jumlah, 0);
  const totalKeluar = filtered.filter(t => t.jenis === 'keluar').reduce((sum, t) => sum + t.jumlah, 0);
  const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;

  // Kategori breakdown
  const kategoriData = filtered
    .filter(t => t.jenis === 'keluar')
    .reduce((acc, t) => {
      if (!acc[t.kategori]) acc[t.kategori] = { jumlah: 0, count: 0 };
      acc[t.kategori].jumlah += t.jumlah;
      acc[t.kategori].count += 1;
      return acc;
    }, {} as Record<string, { jumlah: number; count: number }>);

  // Monthly breakdown
  const monthlyData = filtered.reduce((acc, t) => {
    const month = t.tanggal.substring(0, 7);
    if (!acc[month]) acc[month] = { masuk: 0, keluar: 0 };
    if (t.jenis === 'masuk') acc[month].masuk += t.jumlah;
    else acc[month].keluar += t.jumlah;
    return acc;
  }, {} as Record<string, { masuk: number; keluar: number }>);

  const exportLaporanExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan
    const ringkasanData = [
      ['LAPORAN REALISASI ANGGARAN DANA BOSP'],
      [pengaturan.namaSekolah || 'SMP NEGERI 1 TULANG BAWANG BARAT'],
      [`Tahun Anggaran ${filterTahun}${filterBulan ? ` - Bulan ${new Date(`${filterTahun}-${filterBulan}-01`).toLocaleDateString('id-ID', { month: 'long' })}` : ''}`],
      [],
      ['URAIAN', 'JUMLAH (Rp)'],
      ['Saldo Awal', saldoAwal],
      ['Pemasukan', totalMasuk],
      ['Pengeluaran', totalKeluar],
      ['Saldo Akhir', saldoAkhir],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(ringkasanData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

    // Sheet 2: Per Kategori
    const kategoriSheet = [
      ['LAPORAN PENGELUARAN PER KATEGORI'],
      [pengaturan.namaSekolah || 'SMP NEGERI 1 TULANG BAWANG BARAT'],
      [],
      ['No', 'Kategori', 'Jumlah Transaksi', 'Total (Rp)', 'Persentase (%)'],
      ...Object.entries(kategoriData).map(([kat, data], i) => [
        i + 1,
        kat,
        data.count,
        data.jumlah,
        totalKeluar > 0 ? ((data.jumlah / totalKeluar) * 100).toFixed(2) : '0',
      ]),
      [],
      ['', 'TOTAL', Object.values(kategoriData).reduce((s, d) => s + d.count, 0), totalKeluar, '100'],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(kategoriSheet);
    XLSX.utils.book_append_sheet(wb, ws2, 'Per Kategori');

    // Sheet 3: Per Bulan
    const bulanSheet = [
      ['LAPORAN TRANSAKSI PER BULAN'],
      [pengaturan.namaSekolah || 'SMP NEGERI 1 TULANG BAWANG BARAT'],
      [],
      ['No', 'Bulan', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Selisih (Rp)'],
      ...Object.entries(monthlyData).sort().map(([bulan, data], i) => [
        i + 1,
        new Date(bulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        data.masuk,
        data.keluar,
        data.masuk - data.keluar,
      ]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(bulanSheet);
    XLSX.utils.book_append_sheet(wb, ws3, 'Per Bulan');

    // Sheet 4: Detail Transaksi
    const detailData = [
      ['DETAIL TRANSAKSI DANA BOSP'],
      [pengaturan.namaSekolah || 'SMP NEGERI 1 TULANG BAWANG BARAT'],
      [],
      ['No', 'Tanggal', 'No. Bukti', 'Uraian', 'Kategori', 'Kode Rek.', 'Jenis', 'Jumlah (Rp)'],
      ...filtered.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()).map((t, i) => [
        i + 1,
        t.tanggal,
        t.noBukti,
        t.uraian,
        t.kategori,
        t.kodeRekening,
        t.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
        t.jumlah,
      ]),
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Detail Transaksi');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Laporan_BOSP_SMPN1_TBB_${filterTahun}.xlsx`);
  };

  const exportLaporanWord = async () => {
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "LAPORAN REALISASI ANGGARAN", bold: true, size: 28 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `DANA ${pengaturan.sumberDana || 'BANTUAN OPERASIONAL SATUAN PENDIDIKAN (BOSP)'}`, bold: true, size: 24 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: pengaturan.namaSekolah || "SMP NEGERI 1 TULANG BAWANG BARAT", bold: true, size: 24 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: `Tahun Anggaran ${filterTahun}`, size: 22 })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "A. RINGKASAN ANGGARAN", bold: true, size: 22 })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: "Uraian", bold: true })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Jumlah (Rp)", bold: true })] })] }),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: "Saldo Awal" })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(saldoAwal) })] })] }),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: "Total Pemasukan" })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(totalMasuk) })] })] }),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: "Total Pengeluaran" })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(totalKeluar) })] })] }),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: "Saldo Akhir", bold: true })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(saldoAkhir), bold: true })] })] }),
              ]}),
            ]
          }),
          new Paragraph({ spacing: { before: 300, after: 200 }, children: [new TextRun({ text: "B. PENGELUARAN PER KATEGORI", bold: true, size: 22 })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: "Kategori", bold: true, size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jumlah (Rp)", bold: true, size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "%", bold: true, size: 18 })] })] }),
              ]}),
              ...Object.entries(kategoriData).map(([kat, data], i) => new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: kat, size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(data.jumlah), size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: totalKeluar > 0 ? ((data.jumlah / totalKeluar) * 100).toFixed(1) + '%' : '0%', size: 18 })] })] }),
              ]})),
            ]
          }),
          new Paragraph({ spacing: { before: 300, after: 200 }, children: [new TextRun({ text: "C. REKAP TRANSAKSI PER BULAN", bold: true, size: 22 })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: "Bulan", bold: true, size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Pemasukan", bold: true, size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Pengeluaran", bold: true, size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Selisih", bold: true, size: 18 })] })] }),
              ]}),
              ...Object.entries(monthlyData).sort().map(([bulan, data], i) => new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: new Date(bulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }), size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(data.masuk), size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(data.keluar), size: 18 })] })] }),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(data.masuk - data.keluar), size: 18 })] })] }),
              ]})),
            ]
          }),
          new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: `Dibuat pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, size: 20 })] }),
        ]
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `Laporan_BOSP_SMPN1_TBB_${filterTahun}.docx`);
  };

  const bulanOptions = [
    { value: '', label: 'Semua Bulan' },
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
    { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter & Export */}
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
        <div className="flex gap-2">
          <button onClick={exportLaporanWord} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
            <i className="fas fa-file-word mr-2"></i>Export Word
          </button>
          <button onClick={exportLaporanExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm">
            <i className="fas fa-file-excel mr-2"></i>Export Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b flex">
          <button onClick={() => setActiveTab('ringkasan')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'ringkasan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-chart-bar mr-2"></i>Ringkasan
          </button>
          <button onClick={() => setActiveTab('kategori')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'kategori' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-tags mr-2"></i>Per Kategori
          </button>
          <button onClick={() => setActiveTab('bulanan')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'bulanan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-calendar mr-2"></i>Per Bulan
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-green-600 font-medium">SALDO AWAL</p>
                  <p className="text-xl font-bold text-green-700 mt-1">{formatRupiah(saldoAwal)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">TOTAL PEMASUKAN</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">{formatRupiah(totalMasuk)}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-xs text-red-600 font-medium">TOTAL PENGELUARAN</p>
                  <p className="text-xl font-bold text-red-700 mt-1">{formatRupiah(totalKeluar)}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium">SALDO AKHIR</p>
                  <p className="text-xl font-bold text-purple-700 mt-1">{formatRupiah(saldoAkhir)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Realisasi Anggaran</span>
                  <span className="font-bold">{saldoAwal > 0 ? ((totalKeluar / saldoAwal) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all" style={{ width: `${Math.min(saldoAwal > 0 ? (totalKeluar / saldoAwal) * 100 : 0, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Terpakas: {formatRupiah(totalKeluar)}</span>
                  <span>Sisa: {formatRupiah(saldoAkhir)}</span>
                </div>
              </div>

              {/* Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  <strong>Info:</strong> Laporan ini mencakup {filtered.length} transaksi pada periode yang dipilih.
                  Gunakan tombol Export untuk mengunduh laporan dalam format Word atau Excel.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'kategori' && (
            <div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">No</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Kategori</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Jumlah Transaksi</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Total (Rp)</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(kategoriData).length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada data</td></tr>
                  ) : (
                    Object.entries(kategoriData).map(([kat, data], i) => (
                      <tr key={kat} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{kat}</td>
                        <td className="px-4 py-3 text-center">{data.count}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatRupiah(data.jumlah)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                            {totalKeluar > 0 ? ((data.jumlah / totalKeluar) * 100).toFixed(1) : 0}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {Object.keys(kategoriData).length > 0 && (
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td colSpan={2} className="px-4 py-3">TOTAL</td>
                      <td className="px-4 py-3 text-center">{Object.values(kategoriData).reduce((s, d) => s + d.count, 0)}</td>
                      <td className="px-4 py-3 text-right">{formatRupiah(totalKeluar)}</td>
                      <td className="px-4 py-3 text-right">100%</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {activeTab === 'bulanan' && (
            <div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">No</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Bulan</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Pemasukan (Rp)</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Pengeluaran (Rp)</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Selisih (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(monthlyData).length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada data</td></tr>
                  ) : (
                    Object.entries(monthlyData).sort().map(([bulan, data], i) => (
                      <tr key={bulan} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{new Date(bulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</td>
                        <td className="px-4 py-3 text-right text-green-600">{formatRupiah(data.masuk)}</td>
                        <td className="px-4 py-3 text-right text-red-600">{formatRupiah(data.keluar)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${data.masuk - data.keluar >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatRupiah(data.masuk - data.keluar)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
