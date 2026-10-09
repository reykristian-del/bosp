import { useState, useEffect } from 'react';
import { BuktiKasPengeluaran, BuktiItem, KATEGORI_BOSP } from '../types';
import { getBuktiKas, addBuktiKas, deleteBuktiKas, generateId, formatRupiah, terbilang, generateNoBukti } from '../utils';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export default function BuktiKas() {
  const [buktiList, setBuktiList] = useState<BuktiKasPengeluaran[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState<BuktiKasPengeluaran | null>(null);

  const emptyItem: BuktiItem = { uraian: '', volume: '', satuan: '', hargaSatuan: 0, jumlah: 0 };

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    noBukti: '',
    telahTerimaDari: '',
    jumlahUang: '',
    untukPembayaran: '',
    kategori: '',
    kodeRekening: '',
    bendahara: '',
    kepalaSekolah: '',
    items: [{ ...emptyItem }],
  });

  useEffect(() => {
    setBuktiList(getBuktiKas());
    setForm(f => ({ ...f, noBukti: generateNoBukti('BKP') }));
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalJumlah = form.items.reduce((sum, item) => sum + item.jumlah, 0);
    const bukti: BuktiKasPengeluaran = {
      id: generateId(),
      noBukti: form.noBukti,
      tanggal: form.tanggal,
      telahTerimaDari: form.telahTerimaDari,
      jumlahUang: parseFloat(form.jumlahUang) || totalJumlah,
      terbilang: terbilang(parseFloat(form.jumlahUang) || totalJumlah),
      untukPembayaran: form.untukPembayaran,
      kategori: form.kategori,
      kodeRekening: form.kodeRekening,
      bendahara: form.bendahara,
      kepalaSekolah: form.kepalaSekolah,
      items: form.items,
      createdAt: new Date().toISOString(),
    };
    addBuktiKas(bukti);
    setBuktiList(getBuktiKas());
    setShowForm(false);
    setForm({
      tanggal: new Date().toISOString().split('T')[0],
      noBukti: generateNoBukti('BKP'),
      telahTerimaDari: '',
      jumlahUang: '',
      untukPembayaran: '',
      kategori: '',
      kodeRekening: '',
      bendahara: '',
      kepalaSekolah: '',
      items: [{ ...emptyItem }],
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus bukti kas pengeluaran ini?')) {
      deleteBuktiKas(id);
      setBuktiList(getBuktiKas());
    }
  };

  const exportWord = async (bukti: BuktiKasPengeluaran) => {
    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "BUKTI KAS PENGELUARAN", bold: true, size: 28 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "SMP NEGERI 1 TULANG BAWANG BARAT", size: 22 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: `No: ${bukti.noBukti}`, size: 20 })] }),
          new Paragraph({ spacing: { after: 100 }, children: [
            new TextRun({ text: "Tanggal: ", bold: true }),
            new TextRun({ text: bukti.tanggal }),
          ]}),
          new Paragraph({ spacing: { after: 100 }, children: [
            new TextRun({ text: "Telah terima dari: ", bold: true }),
            new TextRun({ text: bukti.telahTerimaDari }),
          ]}),
          new Paragraph({ spacing: { after: 100 }, children: [
            new TextRun({ text: "Jumlah uang: ", bold: true }),
            new TextRun({ text: formatRupiah(bukti.jumlahUang) }),
          ]}),
          new Paragraph({ spacing: { after: 100 }, children: [
            new TextRun({ text: "Terbilang: ", bold: true }),
            new TextRun({ text: bukti.terbilang + " rupiah" }),
          ]}),
          new Paragraph({ spacing: { after: 100 }, children: [
            new TextRun({ text: "Untuk pembayaran: ", bold: true }),
            new TextRun({ text: bukti.untukPembayaran }),
          ]}),
          new Paragraph({ spacing: { after: 100 }, children: [
            new TextRun({ text: "Kategori: ", bold: true }),
            new TextRun({ text: bukti.kategori }),
          ]}),
          new Paragraph({ spacing: { after: 100 }, children: [
            new TextRun({ text: "Kode Rekening: ", bold: true }),
            new TextRun({ text: bukti.kodeRekening }),
          ]}),
          new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Rincian:", bold: true, size: 22 })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uraian", bold: true, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Volume", bold: true, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Satuan", bold: true, size: 18 })] })] }),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Harga Satuan", bold: true, size: 18 })] })] }),
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
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Paragraph({ spacing: { before: 200 }, children: [
            new TextRun({ text: "Mengetahui,", size: 20 }),
          ]}),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bendahara,", size: 20 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: bukti.bendahara || "(...........................)", size: 20 })] }),
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kepala Sekolah,", size: 20 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: bukti.kepalaSekolah || "(...........................)", size: 20 })] }),
                  ]}),
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
        <p className="text-sm text-gray-500">Kelola bukti kas pengeluaran dana BOSP</p>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
          <i className="fas fa-plus mr-2"></i>Buat Bukti Kas
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buktiList.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center">
            <i className="fas fa-file-invoice text-4xl text-gray-300 mb-3 block"></i>
            <p className="text-gray-400">Belum ada bukti kas pengeluaran</p>
          </div>
        ) : (
          buktiList.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm p-5 border hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">{b.noBukti}</span>
                  <p className="text-xs text-gray-400 mt-1">{b.tanggal}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{b.kategori}</span>
              </div>
              <p className="font-medium text-gray-800 text-sm mb-1">{b.untukPembayaran}</p>
              <p className="text-xs text-gray-500 mb-3">Kepada: {b.telahTerimaDari}</p>
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
          ))
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold">Preview Bukti Kas Pengeluaran</h3>
              <div className="flex gap-2">
                <button onClick={() => exportWord(showPreview)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                  <i className="fas fa-file-word mr-1"></i>Export Word
                </button>
                <button onClick={() => setShowPreview(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-8" id="bukti-print">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold">BUKTI KAS PENGELUARAN</h2>
                <p className="text-sm">SMP NEGERI 1 TULANG BAWANG BARAT</p>
                <p className="text-xs mt-1">No: {showPreview.noBukti}</p>
              </div>
              <div className="space-y-2 text-sm mb-6">
                <p><span className="font-semibold">Tanggal:</span> {showPreview.tanggal}</p>
                <p><span className="font-semibold">Telah terima dari:</span> {showPreview.telahTerimaDari}</p>
                <p><span className="font-semibold">Jumlah uang:</span> {formatRupiah(showPreview.jumlahUang)}</p>
                <p><span className="font-semibold">Terbilang:</span> <em>{showPreview.terbilang} rupiah</em></p>
                <p><span className="font-semibold">Untuk pembayaran:</span> {showPreview.untukPembayaran}</p>
                <p><span className="font-semibold">Kategori:</span> {showPreview.kategori}</p>
                <p><span className="font-semibold">Kode Rekening:</span> {showPreview.kodeRekening}</p>
              </div>
              <table className="w-full text-sm border-collapse mb-8">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-2">No</th>
                    <th className="border px-2 py-2">Uraian</th>
                    <th className="border px-2 py-2">Volume</th>
                    <th className="border px-2 py-2">Satuan</th>
                    <th className="border px-2 py-2">Harga Satuan</th>
                    <th className="border px-2 py-2">Jumlah</th>
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
              <div className="grid grid-cols-2 gap-8 mt-12 text-sm">
                <div className="text-center">
                  <p>Bendahara,</p>
                  <div className="h-20"></div>
                  <p className="font-bold underline">{showPreview.bendahara || '(...........................)'}</p>
                </div>
                <div className="text-center">
                  <p>Kepala Sekolah,</p>
                  <div className="h-20"></div>
                  <p className="font-bold underline">{showPreview.kepalaSekolah || '(...........................)'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold">Buat Bukti Kas Pengeluaran</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telah Terima Dari</label>
                  <input type="text" value={form.telahTerimaDari} onChange={e => setForm({ ...form, telahTerimaDari: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama penerima" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Uang (Rp)</label>
                  <input type="number" value={form.jumlahUang} onChange={e => setForm({ ...form, jumlahUang: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" required min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Untuk Pembayaran</label>
                <input type="text" value={form.untukPembayaran} onChange={e => setForm({ ...form, untukPembayaran: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Keperluan pembayaran" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required>
                    <option value="">Pilih Kategori</option>
                    {KATEGORI_BOSP.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Rekening</label>
                  <input type="text" value={form.kodeRekening} onChange={e => setForm({ ...form, kodeRekening: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: 5.1.02.01" />
                </div>
              </div>

              {/* Items */}
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
                        <input type="text" value={item.uraian} onChange={e => updateItem(i, 'uraian', e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Nama barang/jasa" required />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="text-xs text-gray-500">Volume</label>
                        <input type="text" value={item.volume} onChange={e => updateItem(i, 'volume', e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" placeholder="0" />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="text-xs text-gray-500">Satuan</label>
                        <input type="text" value={item.satuan} onChange={e => updateItem(i, 'satuan', e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" placeholder="unit" />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="text-xs text-gray-500">Harga Satuan</label>
                        <input type="number" value={item.hargaSatuan} onChange={e => updateItem(i, 'hargaSatuan', parseFloat(e.target.value))} className="w-full border rounded px-2 py-1.5 text-sm" placeholder="0" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bendahara</label>
                  <input type="text" value={form.bendahara} onChange={e => setForm({ ...form, bendahara: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama bendahara" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label>
                  <input type="text" value={form.kepalaSekolah} onChange={e => setForm({ ...form, kepalaSekolah: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama kepala sekolah" />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  <i className="fas fa-save mr-2"></i>Simpan Bukti Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
