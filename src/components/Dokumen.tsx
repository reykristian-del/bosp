import { useState } from 'react';
import { useTransaksi, usePengaturan } from '../hooks';
import { formatRupiah, formatTanggalIndonesia, terbilang } from '../utils';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export default function Dokumen() {
  const { data: transaksi = [], loading: loadingTransaksi } = useTransaksi();
  const { data: pengaturan } = usePengaturan();
  
  const [activeTab, setActiveTab] = useState<'pesanan' | 'bast' | 'periksa'>('pesanan');
  const [selectedTransaksi, setSelectedTransaksi] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const transaksiArray = Array.isArray(transaksi) ? transaksi : [];
  const transaksiKeluar = transaksiArray.filter(t => t.jenis === 'keluar');

  const defaultPengaturan = {
    namaSekolah: 'SMP NEGERI 1 TULANG BAWANG BARAT',
    alamat: 'Jl. Pendidikan No. 1',
    kecamatan: 'Tulang Bawang Barat',
    kabupaten: 'Tulang Bawang Barat',
    provinsi: 'Lampung',
    telepon: '',
    kepalaSekolah: '',
    nipKepsek: '',
    bendahara: '',
    nipBendahara: '',
  };

  const peng = pengaturan || defaultPengaturan;

  const selectTransaksi = (t: any) => {
    setSelectedTransaksi(t);
    setShowForm(true);
  };

  // Generate Surat Pesanan
  const generateSuratPesanan = async () => {
    if (!selectedTransaksi) return;

    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
        children: [
          // KOP SEKOLAH
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "PEMERINTAH KABUPATEN TULANG BAWANG BARAT", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "DINAS PENDIDIKAN DAN KEBUDAYAAN", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
            new TextRun({ text: peng.namaSekolah, bold: true, size: 28 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: `${peng.alamat}, ${peng.kecamatan}, ${peng.kabupaten}`, size: 20 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
            new TextRun({ text: `Telepon: ${peng.telepon || '-'}`, size: 20 })
          ]}),
          
          // Garis pembatas
          new Paragraph({ 
            spacing: { after: 300 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
            children: []
          }),

          // Judul
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
            new TextRun({ text: "SURAT PESANAN", bold: true, size: 24, underline: {} })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [
            new TextRun({ text: `Nomor: ${selectedTransaksi.noBukti}/SP/${new Date(selectedTransaksi.tanggal).getMonth() + 1}/${new Date(selectedTransaksi.tanggal).getFullYear()}`, size: 20 })
          ]}),

          // Isi surat
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "Yang bertanda tangan di bawah ini:", size: 22 })
          ]}),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 25, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Nama", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: peng.bendahara || '...........................', size: 22 })] })
                  ]}),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Jabatan", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Bendahara Sekolah", size: 22 })] })
                  ]}),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: "NIP", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: peng.nipBendahara || '...........................', size: 22 })] })
                  ]}),
                ]
              }),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 200 }, children: [
            new TextRun({ text: `Dengan ini memesan kepada:`, size: 22 })
          ]}),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 25, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Nama Toko/Vendor", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: selectedTransaksi.penerima || '...........................', size: 22 })] })
                  ]}),
                ]
              }),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 200 }, children: [
            new TextRun({ text: "Untuk menyediakan barang-barang sebagai berikut:", size: 22 })
          ]}),

          // Tabel barang
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 8, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 45, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uraian Barang", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Volume", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Satuan", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 20, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jumlah (Rp)", bold: true, size: 20 })] })
                  ]}),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: selectedTransaksi.uraian, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Paket", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(selectedTransaksi.jumlah), size: 20 })] })
                  ]}),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, columnSpan: 4, children: [
                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Jumlah Total", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(selectedTransaksi.jumlah), bold: true, size: 20 })] })
                  ]}),
                ]
              }),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 200 }, children: [
            new TextRun({ text: `Terbilang: ${terbilang(selectedTransaksi.jumlah)} rupiah`, italics: true, size: 22 })
          ]}),

          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "Barang tersebut agar diserahkan kepada Bendahara Sekolah paling lambat 7 (tujuh) hari kerja sejak surat pesanan ini diterima.", size: 22 })
          ]}),

          // Tanda tangan
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [] }),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${peng.kecamatan || 'Tulang Bawang Barat'}, ${formatTanggalIndonesia(selectedTransaksi.tanggal)}`, size: 22 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bendahara Sekolah,", size: 22 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: peng.bendahara || '(...........................)', size: 22, bold: true })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `NIP. ${peng.nipBendahara || '...........................'}`, size: 20 })] }),
                  ]}),
                ]
              }),
            ]
          }),
        ]
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `Surat_Pesanan_${selectedTransaksi.noBukti}.docx`);
  };

  // Generate BAST
  const generateBAST = async () => {
    if (!selectedTransaksi) return;

    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
        children: [
          // KOP SEKOLAH
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "PEMERINTAH KABUPATEN TULANG BAWANG BARAT", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "DINAS PENDIDIKAN DAN KEBUDAYAAN", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
            new TextRun({ text: peng.namaSekolah, bold: true, size: 28 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: `${peng.alamat}, ${peng.kecamatan}, ${peng.kabupaten}`, size: 20 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
            new TextRun({ text: `Telepon: ${peng.telepon || '-'}`, size: 20 })
          ]}),
          
          new Paragraph({ 
            spacing: { after: 300 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
            children: []
          }),

          // Judul
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
            new TextRun({ text: "BERITA ACARA SERAH TERIMA", bold: true, size: 24, underline: {} })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
            new TextRun({ text: "(BAST)", bold: true, size: 22 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [
            new TextRun({ text: `Nomor: ${selectedTransaksi.noBukti}/BAST/${new Date(selectedTransaksi.tanggal).getMonth() + 1}/${new Date(selectedTransaksi.tanggal).getFullYear()}`, size: 20 })
          ]}),

          // Isi
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: `Pada hari ini, ${new Date(selectedTransaksi.tanggal).toLocaleDateString('id-ID', { weekday: 'long' })} tanggal ${formatTanggalIndonesia(selectedTransaksi.tanggal)}, kami yang bertanda tangan di bawah ini:`, size: 22 })
          ]}),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: "1.", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 20, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Nama", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: selectedTransaksi.penerima || '...........................', size: 22 })] })
                  ]}),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: "", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Jabatan", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Penyedia Barang", size: 22 })] })
                  ]}),
                ]
              }),
            ]
          }),

          new Paragraph({ spacing: { before: 100 }, children: [
            new TextRun({ text: "Selanjutnya disebut sebagai PIHAK PERTAMA", size: 22 })
          ]}),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: "2.", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 20, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Nama", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ children: [new TextRun({ text: peng.bendahara || '...........................', size: 22 })] })
                  ]}),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: "", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Jabatan", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Bendahara Sekolah", size: 22 })] })
                  ]}),
                ]
              }),
            ]
          }),

          new Paragraph({ spacing: { before: 100, after: 200 }, children: [
            new TextRun({ text: "Selanjutnya disebut sebagai PIHAK KEDUA", size: 22 })
          ]}),

          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA dan PIHAK KEDUA menerima dari PIHAK PERTAMA barang-barang sebagai berikut:", size: 22 })
          ]}),

          // Tabel barang
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 8, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 45, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uraian Barang", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Volume", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Satuan", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 20, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jumlah (Rp)", bold: true, size: 20 })] })
                  ]}),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: selectedTransaksi.uraian, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Paket", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(selectedTransaksi.jumlah), size: 20 })] })
                  ]}),
                ]
              }),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 200 }, children: [
            new TextRun({ text: `Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`, size: 22 })
          ]}),

          // Tanda tangan
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PIHAK PERTAMA", size: 22 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Penyedia Barang", size: 20 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: selectedTransaksi.penerima || '(...........................)', size: 22, bold: true })] }),
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PIHAK KEDUA", size: 22 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bendahara Sekolah", size: 20 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: peng.bendahara || '(...........................)', size: 22, bold: true })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `NIP. ${peng.nipBendahara || '...........................'}`, size: 20 })] }),
                  ]}),
                ]
              }),
            ]
          }),

          new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "Mengetahui,", size: 22 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "Kepala Sekolah", size: 22 })
          ]}),
          new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: peng.kepalaSekolah || '(...........................)', size: 22, bold: true })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: `NIP. ${peng.nipKepsek || '...........................'}`, size: 20 })
          ]}),
        ]
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `BAST_${selectedTransaksi.noBukti}.docx`);
  };

  // Generate Lembar Pemeriksaan
  const generateLembarPemeriksaan = async () => {
    if (!selectedTransaksi) return;

    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
        children: [
          // KOP SEKOLAH
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "PEMERINTAH KABUPATEN TULANG BAWANG BARAT", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "DINAS PENDIDIKAN DAN KEBUDAYAAN", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
            new TextRun({ text: peng.namaSekolah, bold: true, size: 28 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: `${peng.alamat}, ${peng.kecamatan}, ${peng.kabupaten}`, size: 20 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
            new TextRun({ text: `Telepon: ${peng.telepon || '-'}`, size: 20 })
          ]}),
          
          new Paragraph({ 
            spacing: { after: 300 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
            children: []
          }),

          // Judul
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
            new TextRun({ text: "LEMBAR PEMERIKSAAN BARANG", bold: true, size: 24, underline: {} })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [
            new TextRun({ text: `Nomor: ${selectedTransaksi.noBukti}/LPB/${new Date(selectedTransaksi.tanggal).getMonth() + 1}/${new Date(selectedTransaksi.tanggal).getFullYear()}`, size: 20 })
          ]}),

          // Isi
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: `Tanggal Pemeriksaan: ${formatTanggalIndonesia(selectedTransaksi.tanggal)}`, size: 22 })
          ]}),

          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "Telah dilakukan pemeriksaan terhadap barang-barang yang diterima dengan rincian sebagai berikut:", size: 22 })
          ]}),

          // Tabel pemeriksaan
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 8, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 35, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uraian Barang", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Qty", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kondisi", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sesuai", bold: true, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ket", bold: true, size: 20 })] })
                  ]}),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ children: [new TextRun({ text: selectedTransaksi.uraian, size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Baik", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "✓", size: 20 })] })
                  ]}),
                  new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "-", size: 20 })] })
                  ]}),
                ]
              }),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 200 }, children: [
            new TextRun({ text: "Hasil Pemeriksaan:", size: 22, bold: true })
          ]}),

          new Paragraph({ spacing: { after: 100 }, children: [
            new TextRun({ text: "☐ Barang diterima dengan baik dan sesuai spesifikasi", size: 22 })
          ]}),
          new Paragraph({ spacing: { after: 100 }, children: [
            new TextRun({ text: "☐ Barang diterima dengan catatan (lihat keterangan)", size: 22 })
          ]}),
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "☐ Barang ditolak (lihat keterangan)", size: 22 })
          ]}),

          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "Catatan:", size: 22, bold: true })
          ]}),
          new Paragraph({ spacing: { after: 400 }, children: [
            new TextRun({ text: "................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................", size: 20 })
          ]}),

          // Tanda tangan
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Pemeriksa,", size: 22 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bendahara Sekolah", size: 20 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: peng.bendahara || '(...........................)', size: 22, bold: true })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `NIP. ${peng.nipBendahara || '...........................'}`, size: 20 })] }),
                  ]}),
                  new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${peng.kecamatan || 'Tulang Bawang Barat'}, ${formatTanggalIndonesia(selectedTransaksi.tanggal)}`, size: 22 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mengetahui,", size: 22 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kepala Sekolah", size: 20 })] }),
                    new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: peng.kepalaSekolah || '(...........................)', size: 22, bold: true })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `NIP. ${peng.nipKepsek || '...........................'}`, size: 20 })] }),
                  ]}),
                ]
              }),
            ]
          }),
        ]
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `Lembar_Pemeriksaan_${selectedTransaksi.noBukti}.docx`);
  };

  if (loadingTransaksi) {
    return <div className="text-center py-8">Memuat data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          <i className="fas fa-file-contract mr-2 text-blue-600"></i>
          Pembuatan Dokumen Resmi
        </h2>
        <p className="text-gray-600">Buat dokumen resmi sekolah dengan kop sekolah dan export ke Word</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b flex">
          <button onClick={() => setActiveTab('pesanan')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'pesanan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-shopping-cart mr-2"></i>Surat Pesanan
          </button>
          <button onClick={() => setActiveTab('bast')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'bast' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-handshake mr-2"></i>Berita Acara Serah Terima
          </button>
          <button onClick={() => setActiveTab('periksa')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'periksa' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-clipboard-check mr-2"></i>Lembar Pemeriksaan
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'pesanan' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Pilih Transaksi untuk Surat Pesanan</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">No. Bukti</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Uraian</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Penerima</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Jumlah</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksiKeluar.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          <i className="fas fa-inbox text-3xl mb-2 block"></i>
                          Belum ada transaksi pengeluaran
                        </td>
                      </tr>
                    ) : (
                      transaksiKeluar.map(t => (
                        <tr key={t.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{formatTanggalIndonesia(t.tanggal)}</td>
                          <td className="px-4 py-3 font-mono text-xs">{t.noBukti}</td>
                          <td className="px-4 py-3">{t.uraian}</td>
                          <td className="px-4 py-3">{t.penerima || '-'}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatRupiah(t.jumlah)}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => selectTransaksi(t)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                              <i className="fas fa-file-word mr-1"></i>Buat Surat
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bast' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Pilih Transaksi untuk BAST</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">No. Bukti</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Uraian</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Penerima</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Jumlah</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksiKeluar.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          <i className="fas fa-inbox text-3xl mb-2 block"></i>
                          Belum ada transaksi pengeluaran
                        </td>
                      </tr>
                    ) : (
                      transaksiKeluar.map(t => (
                        <tr key={t.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{formatTanggalIndonesia(t.tanggal)}</td>
                          <td className="px-4 py-3 font-mono text-xs">{t.noBukti}</td>
                          <td className="px-4 py-3">{t.uraian}</td>
                          <td className="px-4 py-3">{t.penerima || '-'}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatRupiah(t.jumlah)}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => selectTransaksi(t)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                              <i className="fas fa-file-word mr-1"></i>Buat BAST
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'periksa' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Pilih Transaksi untuk Lembar Pemeriksaan</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">No. Bukti</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Uraian</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Penerima</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Jumlah</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksiKeluar.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          <i className="fas fa-inbox text-3xl mb-2 block"></i>
                          Belum ada transaksi pengeluaran
                        </td>
                      </tr>
                    ) : (
                      transaksiKeluar.map(t => (
                        <tr key={t.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{formatTanggalIndonesia(t.tanggal)}</td>
                          <td className="px-4 py-3 font-mono text-xs">{t.noBukti}</td>
                          <td className="px-4 py-3">{t.uraian}</td>
                          <td className="px-4 py-3">{t.penerima || '-'}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatRupiah(t.jumlah)}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => selectTransaksi(t)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700">
                              <i className="fas fa-file-word mr-1"></i>Buat LPB
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && selectedTransaksi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {activeTab === 'pesanan' && 'Buat Surat Pesanan'}
                {activeTab === 'bast' && 'Buat Berita Acara Serah Terima'}
                {activeTab === 'periksa' && 'Buat Lembar Pemeriksaan Barang'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Detail Transaksi</h4>
                <p className="text-sm text-blue-700"><strong>No. Bukti:</strong> {selectedTransaksi.noBukti}</p>
                <p className="text-sm text-blue-700"><strong>Tanggal:</strong> {formatTanggalIndonesia(selectedTransaksi.tanggal)}</p>
                <p className="text-sm text-blue-700"><strong>Uraian:</strong> {selectedTransaksi.uraian}</p>
                <p className="text-sm text-blue-700"><strong>Penerima:</strong> {selectedTransaksi.penerima || '-'}</p>
                <p className="text-sm text-blue-700"><strong>Jumlah:</strong> {formatRupiah(selectedTransaksi.jumlah)}</p>
              </div>

              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button 
                  onClick={() => {
                    if (activeTab === 'pesanan') generateSuratPesanan();
                    else if (activeTab === 'bast') generateBAST();
                    else if (activeTab === 'periksa') generateLembarPemeriksaan();
                    setShowForm(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <i className="fas fa-download mr-2"></i>Download Word
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
