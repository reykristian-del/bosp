import { useState } from 'react';
import { BuktiKasPengeluaran, BuktiItem, Transaksi } from '../types';
import { useBuktiKas, useTransaksi, usePengaturan } from '../hooks';
import { generateId, formatRupiah, terbilang, formatTanggalIndonesia, updateTransaksi } from '../utils';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export default function BuktiKas() {
  const { data: buktiList = [], loading: loadingBukti, add: addBukti, remove: removeBukti, reload: reloadBukti } = useBuktiKas();
  const { data: transaksiList = [], loading: loadingTransaksi, reload: reloadTransaksi } = useTransaksi();
  const { data: pengaturan } = usePengaturan();
  
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState<BuktiKasPengeluaran | null>(null);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [filterTransaksi, setFilterTransaksi] = useState<'belum' | 'semua'>('belum');

  const emptyItem: BuktiItem = { kodeRekening: '', uraian: '', volume: '', satuan: '', hargaSatuan: 0, pajak: 0, jumlah: 0 };
  
  const defaultNamaSekolah = 'SMP Negeri 1 Tulang Bawang Barat';
  const namaSekolah = pengaturan?.namaSekolah || defaultNamaSekolah;

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    noBukti: '',
    telahTerimaDari: namaSekolah,
    penerima: '',
    jumlahUang: '',
    untukPembayaran: '',
    kategori: '',
    kodeRekening: '',
    dokumenPendukung: [] as string[],
    items: [{ ...emptyItem }],
  });

  // Pastikan data selalu array
  const buktiArray = Array.isArray(buktiList) ? buktiList : [];
  const transaksiArray = Array.isArray(transaksiList) ? transaksiList : [];

  // Filter transaksi yang belum dibuatkan bukti kas
  const transaksiTersedia = transaksiArray
    .filter(t => t.jenis === 'keluar')
    .filter(t => filterTransaksi === 'semua' || !t.statusBukti)
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const selectTransaksi = (t: Transaksi) => {
    setSelectedTransaksi(t);
    setForm({
      tanggal: t.tanggal,
      noBukti: t.noBukti,
      telahTerimaDari: namaSekolah,
      penerima: t.penerima || '',
      jumlahUang: t.jumlah.toString(),
      untukPembayaran: t.uraian,
      kategori: t.kategori,
      kodeRekening: t.kodeRekening,
      dokumenPendukung: [],
      items: [{
        kodeRekening: t.kodeRekening || '',
        uraian: t.uraian,
        volume: '1',
        satuan: 'paket',
        hargaSatuan: t.jumlah,
        pajak: t.pajak || 0,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaksi) {
      alert('Pilih transaksi terlebih dahulu!');
      return;
    }
    
    try {
      const totalJumlah = form.items.reduce((sum, item) => sum + item.jumlah, 0);
      const bukti: BuktiKasPengeluaran = {
        id: generateId(),
        transaksiId: selectedTransaksi.id,
        noBukti: form.noBukti,
        tanggal: form.tanggal,
        telahTerimaDari: form.telahTerimaDari,
        penerima: form.penerima,
        jumlahUang: parseFloat(form.jumlahUang) || totalJumlah,
        terbilang: terbilang(parseFloat(form.jumlahUang) || totalJumlah),
        untukPembayaran: form.untukPembayaran,
        kategori: form.kategori,
        kodeRekening: form.kodeRekening,
        items: form.items,
        dokumenPendukung: form.dokumenPendukung,
        createdAt: new Date().toISOString(),
      };
      
      await addBukti(bukti);
      
      // Update status transaksi
      await updateTransaksi(selectedTransaksi.id, { statusBukti: true });
      
      // Reload data
      await reloadBukti();
      await reloadTransaksi();
      
      setShowForm(false);
      setSelectedTransaksi(null);
      setForm({
        tanggal: new Date().toISOString().split('T')[0],
        noBukti: '',
        telahTerimaDari: namaSekolah,
        penerima: '',
        jumlahUang: '',
        untukPembayaran: '',
        kategori: '',
        kodeRekening: '',
        dokumenPendukung: [],
        items: [{ ...emptyItem }],
      });
    } catch (error) {
      alert('Gagal membuat bukti kas: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus bukti kas pengeluaran ini?')) {
      try {
        const bukti = buktiArray.find(b => b.id === id);
        if (bukti) {
          await updateTransaksi(bukti.transaksiId, { statusBukti: false });
        }
        await removeBukti(id);
        await reloadBukti();
        await reloadTransaksi();
      } catch (error) {
        alert('Gagal menghapus bukti kas: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const exportWord = async (bukti: BuktiKasPengeluaran) => {
    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
    const lineSpacing15 = { line: 360 };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100, ...lineSpacing15 }, children: [new TextRun({ text: "BUKTI KAS PENGELUARAN", bold: true, size: 28, underline: {} })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300, ...lineSpacing15 }, children: [new TextRun({ text: `Nomor: ${bukti.noBukti}`, bold: true, size: 22 })] }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Terima dari bendahara", bold: true, size: 20 })] })] }),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })] }),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: bukti.telahTerimaDari, size: 20 })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Uang sebesar", bold: true, size: 20 })] })] }),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })] }),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: `${bukti.terbilang} rupiah`, italics: true, size: 20 })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Untuk Pembayaran", bold: true, size: 20 })] })] }),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })] }),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: bukti.untukPembayaran, size: 20 })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Jumlah", bold: true, size: 20 })] })] }),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })] }),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: formatRupiah(bukti.jumlahUang), size: 24, bold: true })] })] }),
                ]
              }),
            ]
          }),
          
          new Paragraph({ spacing: { before: 400, ...lineSpacing15 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 33, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [new TextRun({ text: "Mengetahui dan menyetujui,", size: 18 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [new TextRun({ text: "Kepala Sekolah", size: 18 })] }),
                    new Paragraph({ spacing: { before: 800, ...lineSpacing15 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: pengaturan?.kepalaSekolah || '(...........................)', size: 20, bold: true })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [new TextRun({ text: `NIP. ${pengaturan?.nipKepsek || '...........................'}`, size: 18 })] }),
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 33, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [new TextRun({ text: "Bendahara", size: 18 })] }),
                    new Paragraph({ spacing: { before: 1000, ...lineSpacing15 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: pengaturan?.bendahara || '(...........................)', size: 20, bold: true })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [new TextRun({ text: `NIP. ${pengaturan?.nipBendahara || '...........................'}`, size: 18 })] }),
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 34, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [new TextRun({ text: `${pengaturan?.kecamatan || 'Tulang Bawang Barat'}, ${formatTanggalIndonesia(bukti.tanggal)}`, size: 18 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [new TextRun({ text: "Penerima,", size: 18 })] }),
                    new Paragraph({ spacing: { before: 1000, ...lineSpacing15 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: bukti.penerima || '(...........................)', size: 20, bold: true })] }),
                  ]}),
                ]
              }),
            ]
          }),
          
          ...(bukti.items.length > 0 ? [
            new Paragraph({ spacing: { before: 400, after: 100 }, children: [new TextRun({ text: "Rincian Pengeluaran:", bold: true, size: 22, underline: {} })] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kode Rek.", bold: true, size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uraian", bold: true, size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 8, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Volume", bold: true, size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 8, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Satuan", bold: true, size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Harga Satuan", bold: true, size: 16 })] })] }),
                    ...(bukti.items.some(item => item.pajak && item.pajak > 0) ? [
                      new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Pajak", bold: true, size: 16 })] })] })
                    ] : []),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jumlah", bold: true, size: 16 })] })] }),
                  ]
                }),
                ...bukti.items.map((item, i) => new TableRow({
                  children: [
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.kodeRekening || '-', size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: item.uraian, size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 8, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.volume, size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 8, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.satuan, size: 16 })] })] }),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(item.hargaSatuan), size: 16 })] })] }),
                    ...(bukti.items.some(it => it.pajak && it.pajak > 0) ? [
                      new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: item.pajak ? formatRupiah(item.pajak) : '-', size: 16 })] })] })
                    ] : []),
                    new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(item.jumlah), size: 16 })] })] }),
                  ]
                })),
              ]
            }),
          ] : []),
        ]
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `BKP_${bukti.noBukti.replace(/\//g, '-')}.docx`);
  };

  if (loadingBukti || loadingTransaksi) {
    return <div className="text-center py-8">Memuat data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Buat bukti kas pengeluaran dari data transaksi yang tersimpan</p>
          <p className="text-xs text-gray-400 mt-1">
            <i className="fas fa-info-circle mr-1"></i>
            {transaksiArray.filter(t => t.jenis === 'keluar' && !t.statusBukti).length} transaksi belum memiliki bukti kas
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
          <i className="fas fa-plus mr-2"></i>Buat Bukti Kas
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-800"><i className="fas fa-file-invoice mr-2 text-blue-500"></i>Daftar Bukti Kas Pengeluaran</h3>
        </div>
        <div className="p-4">
          {buktiArray.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-file-invoice text-4xl text-gray-300 mb-3 block"></i>
              <p className="text-gray-400">Belum ada bukti kas pengeluaran</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...buktiArray].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map(b => (
                <div key={b.id} className="border rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">{b.noBukti}</span>
                      <p className="text-xs text-gray-400 mt-1">{b.tanggal}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{b.kategori}</span>
                  </div>
                  <p className="font-medium text-gray-800 text-sm mb-1">{b.untukPembayaran}</p>
                  <p className="text-xs text-gray-500 mb-1">Kepada: {b.penerima}</p>
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

      {/* Preview dan Form Modal - sama seperti sebelumnya */}
      {/* ... kode preview dan form modal ... */}
    </div>
  );
}
