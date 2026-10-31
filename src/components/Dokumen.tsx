import { useState, useEffect } from 'react';
import { Transaksi, BuktiKasPengeluaran } from '../types';
import { useTransaksi, useBuktiKas, usePengaturan } from '../hooks';
import { formatRupiah, formatTanggalIndonesia, terbilang } from '../utils';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

type DocType = 'surat-pesanan' | 'bast' | 'pemeriksaan';

export default function Dokumen() {
  const { data: transaksi = [] } = useTransaksi();
  const { data: buktiKas = [] } = useBuktiKas();
  const { data: pengaturan } = usePengaturan();
  
  const [activeDoc, setActiveDoc] = useState<DocType>('surat-pesanan');
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [showForm, setShowForm] = useState(false);

  const transaksiArray = Array.isArray(transaksi) ? transaksi : [];
  const buktiKasArray = Array.isArray(buktiKas) ? buktiKas : [];

  const defaultPengaturan = {
    namaSekolah: 'SMP NEGERI 1 TULANG BAWANG BARAT',
    alamat: 'Jl. Pendidikan No. 1',
    kecamatan: 'Tulang Bawang Barat',
    kabupaten: 'Tulang Bawang Barat',
    provinsi: 'Lampung',
    telepon: '',
    npsn: '',
    kepalaSekolah: '',
    nipKepsek: '',
    bendahara: '',
    nipBendahara: '',
  };

  const peng = pengaturan || defaultPengaturan;

  // Generate Surat Pesanan
  const generateSuratPesanan = async (transaksi: Transaksi) => {
    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
    const lineSpacing15 = { line: 360 };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
        children: [
          // KOP SEKOLAH
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: "PEMERINTAH KABUPATEN TULANG BAWANG BARAT", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: "DINAS PENDIDIKAN DAN KEBUDAYAAN", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: peng.namaSekolah, bold: true, size: 28 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: `${peng.alamat}, ${peng.kecamatan}, ${peng.kabupaten}`, size: 20 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: `Telepon: ${peng.telepon || '-'} | NPSN: ${peng.npsn || '-'}`, size: 20 })
          ]}),
          
          // Garis pembatas
          new Paragraph({ 
            spacing: { before: 100, after: 200 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
            children: []
          }),

          // Judul
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "SURAT PESANAN", bold: true, size: 24, underline: {} })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300, ...lineSpacing15 }, children: [
            new TextRun({ text: `Nomor: ${transaksi.noBukti}/SP/${new Date(transaksi.tanggal).getMonth() + 1}/${new Date(transaksi.tanggal).getFullYear()}`, size: 20 })
          ]}),

          // Isi surat
          new Paragraph({ spacing: { after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "Yang bertanda tangan di bawah ini:", size: 20 })
          ]}),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 25, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Nama", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: peng.bendahara || '-', size: 20 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Jabatan", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Bendahara Sekolah", size: 20 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "NIP", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: peng.nipBendahara || '-', size: 20 })] })
                ]}),
              ]}),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "Dengan ini memesan kepada:", size: 20 })
          ]}),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 25, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Nama Toko/Vendor", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: transaksi.penerima || '-', size: 20 })] })
                ]}),
              ]}),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "Untuk menyediakan barang sebagai berikut:", size: 20 })
          ]}),

          // Tabel barang
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 10, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kode Rek.", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 45, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uraian Barang", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 10, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Volume", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 10, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Satuan", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 20, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jumlah (Rp)", bold: true, size: 18 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: transaksi.kodeRekening || '-', size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ children: [new TextRun({ text: transaksi.uraian, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Paket", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(transaksi.jumlah), size: 18 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, columnSpan: 5, children: [
                  new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Total", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(transaksi.jumlah), bold: true, size: 18 })] })
                ]}),
              ]}),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: `Terbilang: ${terbilang(transaksi.jumlah)} rupiah`, italics: true, size: 20 })
          ]}),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "Demikian surat pesanan ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.", size: 20 })
          ]}),

          // Tanda tangan
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [] }),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: `${peng.kecamatan || 'Tulang Bawang Barat'}, ${formatTanggalIndonesia(transaksi.tanggal)}`, size: 20 })
                  ]}),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: "Bendahara,", size: 20 })
                  ]}),
                  new Paragraph({ spacing: { before: 800, ...lineSpacing15 }, alignment: AlignmentType.CENTER, children: [
                    new TextRun({ text: peng.bendahara || '(...........................)', size: 20, bold: true })
                  ]}),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: `NIP. ${peng.nipBendahara || '...........................'}`, size: 18 })
                  ]}),
                ]}),
              ]}),
            ]
          }),
        ]
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `Surat_Pesanan_${transaksi.noBukti}.docx`);
  };

  // Generate BAST
  const generateBAST = async (transaksi: Transaksi) => {
    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
    const lineSpacing15 = { line: 360 };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
        children: [
          // KOP SEKOLAH
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: "PEMERINTAH KABUPATEN TULANG BAWANG BARAT", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: "DINAS PENDIDIKAN DAN KEBUDAYAAN", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: peng.namaSekolah, bold: true, size: 28 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: `${peng.alamat}, ${peng.kecamatan}, ${peng.kabupaten}`, size: 20 })
          ]}),
          
          new Paragraph({ 
            spacing: { before: 100, after: 200 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
            children: []
          }),

          // Judul
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "BERITA ACARA SERAH TERIMA", bold: true, size: 24, underline: {} })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "(BAST)", bold: true, size: 22 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300, ...lineSpacing15 }, children: [
            new TextRun({ text: `Nomor: ${transaksi.noBukti}/BAST/${new Date(transaksi.tanggal).getMonth() + 1}/${new Date(transaksi.tanggal).getFullYear()}`, size: 20 })
          ]}),

          // Isi
          new Paragraph({ spacing: { after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: `Pada hari ini, ${formatTanggalIndonesia(transaksi.tanggal)}, telah dilaksanakan serah terima barang antara:`, size: 20 })
          ]}),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "PIHAK PERTAMA (Yang Menyerahkan):", bold: true, size: 20 })
          ]}),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 25, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Nama", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: transaksi.penerima || '-', size: 20 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Jabatan", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Penyedia Barang", size: 20 })] })
                ]}),
              ]}),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "PIHAK KEDUA (Yang Menerima):", bold: true, size: 20 })
          ]}),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 25, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Nama", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: peng.bendahara || '-', size: 20 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Jabatan", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Bendahara Sekolah", size: 20 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "NIP", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: peng.nipBendahara || '-', size: 20 })] })
                ]}),
              ]}),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "Barang yang diserahterimakan:", bold: true, size: 20 })
          ]}),

          // Tabel barang
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uraian Barang", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jumlah", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Satuan", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kondisi", bold: true, size: 18 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ children: [new TextRun({ text: transaksi.uraian, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Paket", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Baik", size: 18 })] })
                ]}),
              ]}),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "Demikian Berita Acara ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.", size: 20 })
          ]}),

          // Tanda tangan
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: "PIHAK PERTAMA", size: 20 })
                  ]}),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: "(Yang Menyerahkan)", size: 18 })
                  ]}),
                  new Paragraph({ spacing: { before: 800, ...lineSpacing15 }, alignment: AlignmentType.CENTER, children: [
                    new TextRun({ text: transaksi.penerima || '(...........................)', size: 20, bold: true })
                  ]}),
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: "PIHAK KEDUA", size: 20 })
                  ]}),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: "(Yang Menerima)", size: 18 })
                  ]}),
                  new Paragraph({ spacing: { before: 800, ...lineSpacing15 }, alignment: AlignmentType.CENTER, children: [
                    new TextRun({ text: peng.bendahara || '(...........................)', size: 20, bold: true })
                  ]}),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: `NIP. ${peng.nipBendahara || '...........................'}`, size: 18 })
                  ]}),
                ]}),
              ]}),
            ]
          }),

          new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "Mengetahui,", size: 20 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: "Kepala Sekolah", size: 20 })
          ]}),
          new Paragraph({ spacing: { before: 800, ...lineSpacing15 }, alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: peng.kepalaSekolah || '(...........................)', size: 20, bold: true })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: `NIP. ${peng.nipKepsek || '...........................'}`, size: 18 })
          ]}),
        ]
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `BAST_${transaksi.noBukti}.docx`);
  };

  // Generate Lembar Pemeriksaan
  const generatePemeriksaan = async (transaksi: Transaksi) => {
    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
    const lineSpacing15 = { line: 360 };

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
        children: [
          // KOP SEKOLAH
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: "PEMERINTAH KABUPATEN TULANG BAWANG BARAT", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: "DINAS PENDIDIKAN DAN KEBUDAYAAN", bold: true, size: 24 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: peng.namaSekolah, bold: true, size: 28 })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
            new TextRun({ text: `${peng.alamat}, ${peng.kecamatan}, ${peng.kabupaten}`, size: 20 })
          ]}),
          
          new Paragraph({ 
            spacing: { before: 100, after: 200 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
            children: []
          }),

          // Judul
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "LEMBAR PEMERIKSAAN BARANG", bold: true, size: 24, underline: {} })
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300, ...lineSpacing15 }, children: [
            new TextRun({ text: `Nomor: ${transaksi.noBukti}/LPB/${new Date(transaksi.tanggal).getMonth() + 1}/${new Date(transaksi.tanggal).getFullYear()}`, size: 20 })
          ]}),

          // Informasi
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 25, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Tanggal Pemeriksaan", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 70, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: formatTanggalIndonesia(transaksi.tanggal), size: 20 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "No. Bukti", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: transaksi.noBukti, size: 20 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: "Penerima Barang", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: ":", size: 20 })] })
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [
                  new Paragraph({ spacing: lineSpacing15, children: [new TextRun({ text: transaksi.penerima || '-', size: 20 })] })
                ]}),
              ]}),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "Hasil Pemeriksaan Barang:", bold: true, size: 20 })
          ]}),

          // Tabel pemeriksaan
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 5, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 35, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uraian Barang", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 10, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Qty", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kesesuaian", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 15, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kondisi", bold: true, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 20, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Keterangan", bold: true, size: 18 })] })
                ]}),
              ]}),
              new TableRow({ children: [
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ children: [new TextRun({ text: transaksi.uraian, size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sesuai", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Baik", size: 18 })] })
                ]}),
                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [
                  new Paragraph({ children: [new TextRun({ text: "-", size: 18 })] })
                ]}),
              ]}),
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "Kesimpulan:", bold: true, size: 20 })
          ]}),
          new Paragraph({ spacing: { after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "☐ Barang diterima dengan baik dan sesuai pesanan", size: 20 })
          ]}),
          new Paragraph({ spacing: { after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "☐ Barang diterima dengan catatan (lihat keterangan)", size: 20 })
          ]}),
          new Paragraph({ spacing: { after: 100, ...lineSpacing15 }, children: [
            new TextRun({ text: "☐ Barang ditolak (lihat keterangan)", size: 20 })
          ]}),

          // Tanda tangan
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: "Pemeriksa,", size: 20 })
                  ]}),
                  new Paragraph({ spacing: { before: 800, ...lineSpacing15 }, alignment: AlignmentType.CENTER, children: [
                    new TextRun({ text: peng.bendahara || '(...........................)', size: 20, bold: true })
                  ]}),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: `NIP. ${peng.nipBendahara || '...........................'}`, size: 18 })
                  ]}),
                ]}),
                new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: `${peng.kecamatan || 'Tulang Bawang Barat'}, ${formatTanggalIndonesia(transaksi.tanggal)}`, size: 20 })
                  ]}),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: "Mengetahui,", size: 20 })
                  ]}),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: "Kepala Sekolah", size: 20 })
                  ]}),
                  new Paragraph({ spacing: { before: 800, ...lineSpacing15 }, alignment: AlignmentType.CENTER, children: [
                    new TextRun({ text: peng.kepalaSekolah || '(...........................)', size: 20, bold: true })
                  ]}),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: lineSpacing15, children: [
                    new TextRun({ text: `NIP. ${peng.nipKepsek || '...........................'}`, size: 18 })
                  ]}),
                ]}),
              ]}),
            ]
          }),
        ]
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `Lembar_Pemeriksaan_${transaksi.noBukti}.docx`);
  };

  if (loadingTransaksi || loadingBuktiKas) {
    return <div className="text-center py-8">Memuat data...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          <i className="fas fa-file-contract mr-2"></i>
          Pembuatan Dokumen
        </h2>
        <p className="text-purple-100">Buat Surat Pesanan, BAST, dan Lembar Pemeriksaan Barang</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b flex">
          <button
            onClick={() => setActiveDoc('surat-pesanan')}
            className={`flex-1 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeDoc === 'surat-pesanan'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-file-invoice mr-2"></i>Surat Pesanan
          </button>
          <button
            onClick={() => setActiveDoc('bast')}
            className={`flex-1 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeDoc === 'bast'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-handshake mr-2"></i>BAST
          </button>
          <button
            onClick={() => setActiveDoc('pemeriksaan')}
            className={`flex-1 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeDoc === 'pemeriksaan'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-clipboard-check mr-2"></i>Lembar Pemeriksaan
          </button>
        </div>

        <div className="p-6">
          {activeDoc === 'surat-pesanan' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <i className="fas fa-file-invoice mr-2 text-purple-600"></i>
                Surat Pesanan
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Pilih transaksi untuk membuat Surat Pesanan. Dokumen akan menggunakan kop sekolah dan dapat diunduh dalam format Word.
              </p>
              
              <div className="space-y-2">
                {transaksiArray.filter(t => t.jenis === 'keluar').map(t => (
                  <div key={t.id} className="border rounded-lg p-4 hover:border-purple-500 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{t.noBukti}</span>
                          <span className="text-xs text-gray-400">{formatTanggalIndonesia(t.tanggal)}</span>
                        </div>
                        <p className="font-medium text-gray-800">{t.uraian}</p>
                        <p className="text-sm text-gray-600">Kepada: {t.penerima || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">{formatRupiah(t.jumlah)}</p>
                        <button
                          onClick={() => generateSuratPesanan(t)}
                          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                        >
                          <i className="fas fa-download mr-2"></i>Download Word
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDoc === 'bast' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <i className="fas fa-handshake mr-2 text-purple-600"></i>
                Berita Acara Serah Terima (BAST)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Pilih transaksi untuk membuat BAST. Dokumen akan menggunakan kop sekolah dan dapat diunduh dalam format Word.
              </p>
              
              <div className="space-y-2">
                {transaksiArray.filter(t => t.jenis === 'keluar').map(t => (
                  <div key={t.id} className="border rounded-lg p-4 hover:border-purple-500 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{t.noBukti}</span>
                          <span className="text-xs text-gray-400">{formatTanggalIndonesia(t.tanggal)}</span>
                        </div>
                        <p className="font-medium text-gray-800">{t.uraian}</p>
                        <p className="text-sm text-gray-600">Dari: {t.penerima || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">{formatRupiah(t.jumlah)}</p>
                        <button
                          onClick={() => generateBAST(t)}
                          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                        >
                          <i className="fas fa-download mr-2"></i>Download Word
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDoc === 'pemeriksaan' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <i className="fas fa-clipboard-check mr-2 text-purple-600"></i>
                Lembar Pemeriksaan Barang
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Pilih transaksi untuk membuat Lembar Pemeriksaan Barang. Dokumen akan menggunakan kop sekolah dan dapat diunduh dalam format Word.
              </p>
              
              <div className="space-y-2">
                {transaksiArray.filter(t => t.jenis === 'keluar').map(t => (
                  <div key={t.id} className="border rounded-lg p-4 hover:border-purple-500 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{t.noBukti}</span>
                          <span className="text-xs text-gray-400">{formatTanggalIndonesia(t.tanggal)}</span>
                        </div>
                        <p className="font-medium text-gray-800">{t.uraian}</p>
                        <p className="text-sm text-gray-600">Barang dari: {t.penerima || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">{formatRupiah(t.jumlah)}</p>
                        <button
                          onClick={() => generatePemeriksaan(t)}
                          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                        >
                          <i className="fas fa-download mr-2"></i>Download Word
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
