import { useState, useEffect } from 'react';
import { BuktiKasPengeluaran, BuktiItem, Transaksi } from '../types';
import { getBuktiKas, addBuktiKas, deleteBuktiKas, getTransaksi, updateTransaksi, generateId, formatRupiah, terbilang, generateNoBukti, getPengaturan } from '../utils';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export default function BuktiKas() {
  const [buktiList, setBuktiList] = useState<BuktiKasPengeluaran[]>([]);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState<BuktiKasPengeluaran | null>(null);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null as Transaksi | null);
  const [filterTransaksi, setFilterTransaksi] = useState<'belum' | 'semua'>('belum');

  const emptyItem: BuktiItem = { uraian: '', volume: '', satuan: '', hargaSatuan: 0, jumlah: 0 };
  const pengaturan = getPengaturan();

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    noBukti: '',
    telahTerimaDari: '',
    jumlahUang: '',
    untukPembayaran: '',
    kategori: '',
    kodeRekening: '',
    dokumenPendukung: [] as string[],
    items: [{ ...emptyItem }],
  });

  useEffect(() => {
    setBuktiList(getBuktiKas());
    setTransaksiList(getTransaksi());
    setForm(f => ({ ...f, noBukti: generateNoBukti('BKP') }));
  }, []);

  // Filter transaksi yang belum dibuatkan bukti kas
  const transaksiTersedia = transaksiList
    .filter(t => t.jenis === 'keluar')
    .filter(t => filterTransaksi === 'semua' || !t.statusBukti)
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const selectTransaksi = (t: Transaksi) => {
    setSelectedTransaksi(t);
    setForm({
      tanggal: t.tanggal,
      noBukti: generateNoBukti('BKP'),
      telahTerimaDari: t.penerima || '',
      jumlahUang: t.jumlah.toString(),
      untukPembayaran: t.uraian,
      kategori: t.kategori,
      kodeRekening: t.kodeRekening,
      dokumenPendukung: [],
      items: [{
        uraian: t.uraian,
        volume: '1',
        satuan: 'paket',
        hargaSatuan: t.jumlah,
        jumlah: t.jumlah,
      }],
    });
  };

  const updateItem = (index: number, field: keyof BuktiItem, value: string | number) => {
    const newItems = [...form.items];
    (newItems[index] as any)[field] = value;
    if (field === 'volume' || field === 'hargaSatuan') {
      const vol = parseFloat(newItems[index].volume) || 0;
      const harga = newItems[index].hargaSatuan;
      newItems[index].jumlah = vol * harga;
    }
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  };

  const removeItem = (index: number) => {
    if (form.items.length > 1) {
      setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
    }
  };

  const toggleDokumen = (dok: string) => {
    if (form.dokumenPendukung.includes(dok)) {
      setForm({ ...form, dokumenPendukung: form.dokumenPendukung.filter(d => d !== dok) });
    } else {
      setForm({ ...form, dokumenPendukung: [...form.dokumenPendukung, dok] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaksi) {
      alert('Pilih transaksi terlebih dahulu!');
      return;
    }
    const totalJumlah = form.items.reduce((sum, item) => sum + item.jumlah, 0);
    const bukti: BuktiKasPengeluaran = {
      id: generateId(),
      transaksiId: selectedTransaksi.id,
      noBukti: form.noBukti,
      tanggal: form.tanggal,
      telahTerimaDari: form.telahTerimaDari,
      jumlahUang: parseFloat(form.jumlahUang) || totalJumlah,
      terbilang: terbilang(parseFloat(form.jumlahUang) || totalJumlah),
      untukPembayaran: form.untukPembayaran,
      kategori: form.kategori,
      kodeRekening: form.kodeRekening,
      items: form.items,
      dokumenPendukung: form.dokumenPendukung,
      createdAt: new Date().toISOString(),
    };
    addBuktiKas(bukti);
    // Update status transaksi
    updateTransaksi(selectedTransaksi.id, { statusBukti: true });
    setBuktiList(getBuktiKas());
    setTransaksiList(getTransaksi());
    setShowForm(false);
    setSelectedTransaksi(null);
    setForm({
      tanggal: new Date().toISOString().split('T')[0],
      noBukti: generateNoBukti('BKP'),
      telahTerimaDari: '',
      jumlahUang: '',
      untukPembayaran: '',
      kategori: '',
      kodeRekening: '',
      dokumenPendukung: [],
      items: [{ ...emptyItem }],
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus bukti kas pengeluaran ini?')) {
      const bukti = buktiList.find(b => b.id === id);
      if (bukti) {
        updateTransaksi(bukti.transaksiId, { statusBukti: false });
      }
      deleteBuktiKas(id);
      setBuktiList(getBuktiKas());
      setTransaksiList(getTransaksi());
    }
  };

  const exportWord = async (bukti: BuktiKasPengeluaran) => {
    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: pengaturan.namaSekolah, bold: true, size: 24 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: pengaturan.alamat, size: 18 })] }),
          new Paragraph({ children: [] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "BUKTI KAS PENGELUARAN", bold: true, size: 28, underline: {} })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: `No: ${bukti.noBukti}`, size: 20 })] }),
          new Paragraph({ spacing: { after: 80 }, children: [
            new TextRun({ text: "Tanggal", bold: true, size: 20 }),
            new TextRun({ text: `: ${bukti.tanggal}`, size: 20 }),
          ]}),
          new Paragraph({ spacing: { after: 80 }, children: [
            new TextRun({ text: "Telah terima dari", bold: true, size: 20 }),
            new TextRun({ text: `: Bendahara ${pengaturan.namaSekolah}`, size: 20 }),
          ]}),
          new Paragraph({ spacing: { after: 80 }, children: [
            new TextRun({ text: "Jumlah uang", bold: true, size: 20 }),
            new TextRun({ text: `: ${formatRupiah(bukti.jumlahUang)}`, size: 20 }),
          ]}),
          new Paragraph({ spacing: { after: 80 }, children: [
            new TextRun({ text: "Terbilang", bold: true, size: 20 }),
            new TextRun({ text: `: ${bukti.terbilang} rupiah`, size: 20 }),
          ]}),
          new Paragraph({ spacing: { after: 80 }, children: [
            new TextRun({ text: "Untuk pembayaran", bold: true, size: 20 }),
            new TextRun({ text: `: ${bukti.untukPembayaran}`, size: 20 }),
          ]}),
          new Paragraph({ spacing: { after: 80 }, children: [
            new TextRun({ text: "Kategori", bold: true, size: 20 }),
            new TextRun({ text: `: ${bukti.kategori}`, size: 20 }),
          ]}),
          new Paragraph({ spacing: { after: 80 }, children: [
            new TextRun({ text: "Kode Rekening", bold: true, size: 20 }),
            new TextRun({ text: `: ${bukti.kodeRekening}`, size: 20 }),
          ]}),
          new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Rincian Pengeluaran:", bold: true, size: 22 })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uraian", bold: true, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Vol", bold: true, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Satuan", bold: true, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Harga", bold: true, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jumlah", bold: true, size: 18 })] })] }),
                ]
              }),
              ...bukti.items.map((item, i) => new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: item.uraian, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.volume, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.satuan, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(item.hargaSatuan), size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(item.jumlah), size: 18 })] })] }),
                ]
              })),
            ]
          }),
          // Dokumen Pendukung
          ...(bukti.dokumenPendukung.length > 0 ? [
            new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Dokumen Pendukung:", bold: true, size: 20 })] }),
            ...bukti.dokumenPendukung.map((dok, i) => new Paragraph({
              spacing: { after: 40 },
              children: [new TextRun({ text: `${i + 1}. ${dok}`, size: 18 })]
            })),
          ] : []),
          // Tanda tangan
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mengetahui/Menyetujui,", size: 18 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kepala Sekolah", size: 18 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: pengaturan.kepalaSekolah || '(...........................)', size: 20, bold: true })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `NIP. ${pengaturan.nipKepsek || '...........................'}`, size: 18 })] }),
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${pengaturan.kecamatan || 'Tulang Bawang Barat'}, ${bukti.tanggal}`, size: 18 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bendahara", size: 18 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: pengaturan.bendahara || '(...........................)', size: 20, bold: true })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `NIP. ${pengaturan.nipBendahara || '...........................'}`, size: 18 })] }),
                  ]}),
                ]
              }),
            ]
          }),
          // Penerima
          new Paragraph({ spacing: { before: 300 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Yang Menerima,", size: 18 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: bukti.telahTerimaDari || '(...........................)', size: 20, bold: true })] }),
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [] }),
                ]
              }),
            ]
          }),
        ]
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `BKP_${bukti.noBukti.replace(/\//g, '-')}.docx`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Buat bukti kas pengeluaran dari data transaksi yang tersimpan</p>
          <p className="text-xs text-gray-400 mt-1">
            <i className="fas fa-info-circle mr-1"></i>
            {transaksiList.filter(t => t.jenis === 'keluar' && !t.statusBukti).length} transaksi belum memiliki bukti kas
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
          <i className="fas fa-plus mr-2"></i>Buat Bukti Kas
        </button>
      </div>

      {/* List Bukti Kas */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-800"><i className="fas fa-file-invoice mr-2 text-blue-500"></i>Daftar Bukti Kas Pengeluaran</h3>
        </div>
        <div className="p-4">
          {buktiList.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-file-invoice text-4xl text-gray-300 mb-3 block"></i>
              <p className="text-gray-400">Belum ada bukti kas pengeluaran</p>
              <p className="text-xs text-gray-400 mt-1">Tambahkan transaksi pengeluaran terlebih dahulu, lalu buat bukti kas dari menu Transaksi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...buktiList].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map(b => (
                <div key={b.id} className="border rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">{b.noBukti}</span>
                      <p className="text-xs text-gray-400 mt-1">{b.tanggal}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{b.kategori}</span>
                  </div>
                  <p className="font-medium text-gray-800 text-sm mb-1">{b.untukPembayaran}</p>
                  <p className="text-xs text-gray-500 mb-1">Kepada: {b.telahTerimaDari}</p>
                  {b.dokumenPendukung.length > 0 && (
                    <p className="text-xs text-gray-400 mb-2">
                      <i className="fas fa-paperclip mr-1"></i>{b.dokumenPendukung.length} dokumen pendukung
                    </p>
                  )}
                  <p className="text-lg font-bold text-blue-600 mb-3">{formatRupiah(b.jumlahUang)}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPreview(b)} className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">
                      <i className="fas fa-eye mr-1"></i>Lihat
                    </button>
                    <button onClick={() => exportWord(b)} className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100">
                      <i className="fas fa-file-word mr-1"></i>Word
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold">Preview Bukti Kas Pengeluaran</h3>
              <div className="flex gap-2">
                <button onClick={() => exportWord(showPreview)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                  <i className="fas fa-file-word mr-1"></i>Export Word
                </button>
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs hover:bg-gray-700">
                  <i className="fas fa-print mr-1"></i>Cetak
                </button>
                <button onClick={() => setShowPreview(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-8" id="bukti-print">
              <div className="text-center mb-4 border-b pb-3">
                <h2 className="text-base font-bold">{pengaturan.namaSekolah}</h2>
                <p className="text-xs text-gray-600">{pengaturan.alamat}{pengaturan.kecamatan ? `, ${pengaturan.kecamatan}` : ''}</p>
                <h3 className="text-lg font-bold mt-3 underline">BUKTI KAS PENGELUARAN</h3>
                <p className="text-sm">No: {showPreview.noBukti}</p>
              </div>
              <div className="space-y-1.5 text-sm mb-4">
                <p><span className="font-semibold w-40 inline-block">Tanggal</span>: {showPreview.tanggal}</p>
                <p><span className="font-semibold w-40 inline-block">Telah terima dari</span>: Bendahara {pengaturan.namaSekolah}</p>
                <p><span className="font-semibold w-40 inline-block">Jumlah uang</span>: {formatRupiah(showPreview.jumlahUang)}</p>
                <p><span className="font-semibold w-40 inline-block">Terbilang</span>: <em>{showPreview.terbilang} rupiah</em></p>
                <p><span className="font-semibold w-40 inline-block">Untuk pembayaran</span>: {showPreview.untukPembayaran}</p>
                <p><span className="font-semibold w-40 inline-block">Kategori</span>: {showPreview.kategori}</p>
                <p><span className="font-semibold w-40 inline-block">Kode Rekening</span>: {showPreview.kodeRekening}</p>
              </div>
              <table className="w-full text-sm border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-2 w-8">No</th>
                    <th className="border px-2 py-2">Uraian</th>
                    <th className="border px-2 py-2 w-16">Vol</th>
                    <th className="border px-2 py-2 w-16">Satuan</th>
                    <th className="border px-2 py-2 w-28">Harga Satuan</th>
                    <th className="border px-2 py-2 w-28">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {showPreview.items.map((item, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-2 text-center">{i + 1}</td>
                      <td className="border px-2 py-2">{item.uraian}</td>
                      <td className="border px-2 py-2 text-center">{item.volume}</td>
                      <td className="border px-2 py-2 text-center">{item.satuan}</td>
                      <td className="border px-2 py-2 text-right">{formatRupiah(item.hargaSatuan)}</td>
                      <td className="border px-2 py-2 text-right">{formatRupiah(item.jumlah)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td colSpan={5} className="border px-2 py-2 text-right">Total</td>
                    <td className="border px-2 py-2 text-right">{formatRupiah(showPreview.items.reduce((s, i) => s + i.jumlah, 0))}</td>
                  </tr>
                </tbody>
              </table>
              {showPreview.dokumenPendukung.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-sm mb-1">Dokumen Pendukung:</p>
                  <ol className="text-sm list-decimal list-inside text-gray-700">
                    {showPreview.dokumenPendukung.map((dok, i) => <li key={i}>{dok}</li>)}
                  </ol>
                </div>
              )}
              <div className="grid grid-cols-2 gap-8 mt-8 text-sm">
                <div className="text-center">
                  <p>Mengetahui/Menyetujui,</p>
                  <p>Kepala Sekolah</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{pengaturan.kepalaSekolah || '(...........................)'}</p>
                  <p className="text-xs">NIP. {pengaturan.nipKepsek || '...........................'}</p>
                </div>
                <div className="text-center">
                  <p>{pengaturan.kecamatan || 'Tulang Bawang Barat'}, {showPreview.tanggal}</p>
                  <p>Bendahara</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{pengaturan.bendahara || '(...........................)'}</p>
                  <p className="text-xs">NIP. {pengaturan.nipBendahara || '...........................'}</p>
                </div>
              </div>
              <div className="text-center mt-6 text-sm">
                <p>Yang Menerima,</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{showPreview.telahTerimaDari || '(...........................)'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal - Pilih Transaksi */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold">Buat Bukti Kas Pengeluaran</h3>
              <button onClick={() => { setShowForm(false); setSelectedTransaksi(null); }} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              {!selectedTransaksi ? (
                // Step 1: Pilih Transaksi
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-700">Pilih Transaksi Pengeluaran</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilterTransaksi('belum')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filterTransaksi === 'belum' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
                      >Belum Ada Bukti</button>
                      <button
                        onClick={() => setFilterTransaksi('semua')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filterTransaksi === 'semua' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                      >Semua</button>
                    </div>
                  </div>
                  {transaksiTersedia.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <i className="fas fa-inbox text-3xl text-gray-300 mb-2 block"></i>
                      <p className="text-gray-400">Tidak ada transaksi pengeluaran yang tersedia</p>
                      <p className="text-xs text-gray-400 mt-1">Tambahkan transaksi pengeluaran di menu Transaksi terlebih dahulu</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {transaksiTersedia.map(t => (
                        <div
                          key={t.id}
                          onClick={() => selectTransaksi(t)}
                          className={`border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all ${(selectedTransaksi as Transaksi | null)?.id === t.id ? 'border-blue-500 bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{t.noBukti}</span>
                                <span className="text-xs text-gray-400">{t.tanggal}</span>
                                {t.statusBukti && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Sudah ada bukti</span>}
                              </div>
                              <p className="font-medium text-gray-800">{t.uraian}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500"><i className="fas fa-user mr-1"></i>{t.penerima || '-'}</span>
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{t.kategori}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-600">{formatRupiah(t.jumlah)}</p>
                              <button className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                                Pilih <i className="fas fa-arrow-right ml-1"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Step 2: Form Bukti Kas
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Info Transaksi Terpilih */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-600 font-medium">TRANSAKSI TERPILIH</p>
                        <p className="font-medium text-gray-800">{selectedTransaksi.uraian}</p>
                        <p className="text-sm text-gray-600">{selectedTransaksi.noBukti} | {selectedTransaksi.tanggal}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{formatRupiah(selectedTransaksi.jumlah)}</p>
                        <button type="button" onClick={() => setSelectedTransaksi(null)} className="text-xs text-blue-600 hover:text-blue-800">
                          <i className="fas fa-arrow-left mr-1"></i>Pilih transaksi lain
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                      <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. Bukti</label>
                      <input type="text" value={form.noBukti} onChange={e => setForm({ ...form, noBukti: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telah Terima Dari (Penerima)</label>
                      <input type="text" value={form.telahTerimaDari} onChange={e => setForm({ ...form, telahTerimaDari: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama penerima" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Uang (Rp)</label>
                      <input type="number" value={form.jumlahUang} onChange={e => setForm({ ...form, jumlahUang: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required min="0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Untuk Pembayaran</label>
                    <input type="text" value={form.untukPembayaran} onChange={e => setForm({ ...form, untukPembayaran: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <input type="text" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} className="w-full border rounded-lg px-3 py-2 bg-gray-50 outline-none" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kode Rekening</label>
                      <input type="text" value={form.kodeRekening} onChange={e => setForm({ ...form, kodeRekening: e.target.value })} className="w-full border rounded-lg px-3 py-2 bg-gray-50 outline-none" readOnly />
                    </div>
                  </div>

                  {/* Rincian Items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Rincian Pengeluaran</label>
                      <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:text-blue-800">
                        <i className="fas fa-plus mr-1"></i>Tambah Item
                      </button>
                    </div>
                    <div className="space-y-2">
                      {form.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg">
                          <div className="col-span-12 md:col-span-4">
                            <label className="text-xs text-gray-500">Uraian</label>
                            <input type="text" value={item.uraian} onChange={e => updateItem(i, 'uraian', e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" required />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <label className="text-xs text-gray-500">Volume</label>
                            <input type="text" value={item.volume} onChange={e => updateItem(i, 'volume', e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <label className="text-xs text-gray-500">Satuan</label>
                            <input type="text" value={item.satuan} onChange={e => updateItem(i, 'satuan', e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <label className="text-xs text-gray-500">Harga Satuan</label>
                            <input type="number" value={item.hargaSatuan} onChange={e => updateItem(i, 'hargaSatuan', parseFloat(e.target.value))} className="w-full border rounded px-2 py-1.5 text-sm" />
                          </div>
                          <div className="col-span-10 md:col-span-1">
                            <label className="text-xs text-gray-500">Jumlah</label>
                            <p className="text-sm font-medium text-gray-700 py-1.5">{formatRupiah(item.jumlah)}</p>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            {form.items.length > 1 && (
                              <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dokumen Pendukung */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen Pendukung</label>
                    <div className="flex flex-wrap gap-2">
                      {['Kwitansi', 'Nota/Faktur', 'Surat Pesanan', 'Berita Acara Serah Terima', 'Surat Tugas', 'Daftar Hadir', 'SPJ', 'Bukti Transfer'].map(dok => (
                        <button
                          key={dok}
                          type="button"
                          onClick={() => toggleDokumen(dok)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            form.dokumenPendukung.includes(dok)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {form.dokumenPendukung.includes(dok) && <i className="fas fa-check mr-1"></i>}
                          {dok}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <button type="button" onClick={() => { setShowForm(false); setSelectedTransaksi(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      <i className="fas fa-save mr-2"></i>Simpan Bukti Kas
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
