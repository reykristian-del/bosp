import { useState, useEffect } from 'react';
import { Transaksi as TransaksiType, KATEGORI_BOSP } from '../types';
import { getTransaksi, addTransaksi, deleteTransaksi, updateTransaksi, generateId, formatRupiah, generateNoBukti, parseExcelDate, parseExcelNumber, validateImportData, saveTransaksi } from '../utils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Transaksi() {
  const [transaksi, setTransaksi] = useState<TransaksiType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [search, setSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<{ valid: any[]; invalid: any[] } | null>(null);
  const [importFileName, setImportFileName] = useState('');

  const emptyForm = {
    tanggal: new Date().toISOString().split('T')[0],
    noBukti: '',
    uraian: '',
    kategori: '',
    kodeRekening: '',
    jumlah: '',
    jenis: 'keluar' as 'masuk' | 'keluar',
    keterangan: '',
    penerima: '',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setTransaksi(getTransaksi());
    setForm(f => ({ ...f, noBukti: generateNoBukti('TRX') }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateTransaksi(editId, {
        tanggal: form.tanggal,
        noBukti: form.noBukti,
        uraian: form.uraian,
        kategori: form.kategori,
        kodeRekening: form.kodeRekening,
        jumlah: parseFloat(form.jumlah) || 0,
        jenis: form.jenis,
        keterangan: form.keterangan,
        penerima: form.penerima,
      });
    } else {
      const newTransaksi: TransaksiType = {
        id: generateId(),
        tanggal: form.tanggal,
        noBukti: form.noBukti,
        uraian: form.uraian,
        kategori: form.kategori,
        kodeRekening: form.kodeRekening,
        jumlah: parseFloat(form.jumlah) || 0,
        jenis: form.jenis,
        keterangan: form.keterangan,
        penerima: form.penerima,
        statusBukti: false,
        createdAt: new Date().toISOString(),
      };
      addTransaksi(newTransaksi);
    }
    setTransaksi(getTransaksi());
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm, noBukti: generateNoBukti('TRX') });
  };

  const handleEdit = (t: TransaksiType) => {
    setEditId(t.id);
    setForm({
      tanggal: t.tanggal,
      noBukti: t.noBukti,
      uraian: t.uraian,
      kategori: t.kategori,
      kodeRekening: t.kodeRekening,
      jumlah: t.jumlah.toString(),
      jenis: t.jenis,
      keterangan: t.keterangan,
      penerima: t.penerima,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      deleteTransaksi(id);
      setTransaksi(getTransaksi());
    }
  };

  // Download Template Excel
  const downloadTemplate = () => {
    // Buat data contoh
    const sampleData = [
      {
        'Tanggal': '2026-01-15',
        'No. Bukti': 'TRX/001/01/2026',
        'Uraian': 'Pembelian ATK untuk kegiatan sekolah',
        'Kategori': 'Pengelolaan Sekolah',
        'Kode Rekening': '5.1.02.01',
        'Jenis': 'keluar',
        'Jumlah': 1500000,
        'Penerima': 'Toko Makmur Jaya',
        'Keterangan': 'Pembelian kertas, tinta, dll'
      },
      {
        'Tanggal': '2026-01-20',
        'No. Bukti': 'TRX/002/01/2026',
        'Uraian': 'Pembayaran honor guru bulan Januari',
        'Kategori': 'Pembayaran Honor',
        'Kode Rekening': '5.1.02.02',
        'Jenis': 'keluar',
        'Jumlah': 5000000,
        'Penerima': 'Bendahara Sekolah',
        'Keterangan': 'Honor 5 guru'
      },
      {
        'Tanggal': '2026-02-01',
        'No. Bukti': 'TRX/003/02/2026',
        'Uraian': 'Pencairan Dana BOSP Triwulan I',
        'Kategori': 'Biaya Lainnya',
        'Kode Rekening': '5.1.01',
        'Jenis': 'masuk',
        'Jumlah': 50000000,
        'Penerima': 'SMP Negeri 1 Tulang Bawang Barat',
        'Keterangan': 'Dana BOSP Triwulan I TA 2026'
      }
    ];

    // Buat worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Set lebar kolom
    ws['!cols'] = [
      { wch: 12 }, // Tanggal
      { wch: 20 }, // No. Bukti
      { wch: 40 }, // Uraian
      { wch: 30 }, // Kategori
      { wch: 15 }, // Kode Rekening
      { wch: 10 }, // Jenis
      { wch: 15 }, // Jumlah
      { wch: 30 }, // Penerima
      { wch: 30 }, // Keterangan
    ];

    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Format Import');

    // Tambah sheet panduan
    const panduanData = [
      ['PANDUAN IMPORT TRANSAKSI'],
      [''],
      ['KOLOM WAJIB:'],
      ['1. Tanggal - Format: YYYY-MM-DD (contoh: 2026-01-15)'],
      ['2. Uraian - Deskripsi transaksi'],
      ['3. Jenis - Harus "masuk" atau "keluar" (huruf kecil)'],
      ['4. Jumlah - Angka tanpa format Rupiah (contoh: 1500000)'],
      [''],
      ['KOLOM OPSIONAL:'],
      ['5. No. Bukti - Jika kosong, akan dibuat otomatis'],
      ['6. Kategori - Pilih dari daftar berikut:'],
      ...KATEGORI_BOSP.map(k => ['   - ' + k]),
      ['7. Kode Rekening - Contoh: 5.1.02.01'],
      ['8. Penerima - Nama pihak yang menerima/memberi dana'],
      ['9. Keterangan - Catatan tambahan'],
      [''],
      ['CATATAN PENTING:'],
      ['- Baris pertama adalah header, jangan dihapus'],
      ['- Data dimulai dari baris kedua'],
      ['- Format tanggal bisa juga: DD/MM/YYYY atau DD-MM-YYYY'],
      ['- Jumlah bisa dalam format: 1.500.000 atau 1500000'],
      ['- Pastikan tidak ada baris kosong di tengah data'],
    ];
    
    const wsPanduan = XLSX.utils.aoa_to_sheet(panduanData);
    wsPanduan['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsPanduan, 'Panduan');

    // Download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Template_Import_Transaksi_BOSP.xlsx');
  };

  // Handle File Import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Ambil sheet pertama
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          alert('File Excel kosong atau format tidak sesuai!');
          return;
        }

        // Parse dan validasi data
        const parsedData = jsonData.map((row: any) => ({
          tanggal: parseExcelDate(row['Tanggal'] || row['tanggal']),
          noBukti: row['No. Bukti'] || row['noBukti'] || '',
          uraian: row['Uraian'] || row['uraian'] || '',
          kategori: row['Kategori'] || row['kategori'] || '',
          kodeRekening: row['Kode Rekening'] || row['kodeRekening'] || '',
          jenis: (row['Jenis'] || row['jenis'] || '').toString().toLowerCase(),
          jumlah: parseExcelNumber(row['Jumlah'] || row['jumlah']),
          penerima: row['Penerima'] || row['penerima'] || '',
          keterangan: row['Keterangan'] || row['keterangan'] || '',
        }));

        const validated = validateImportData(parsedData);
        setImportData(validated);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert('Gagal membaca file Excel. Pastikan format sesuai template!');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Confirm Import
  const confirmImport = () => {
    if (!importData || importData.valid.length === 0) {
      alert('Tidak ada data valid untuk diimport!');
      return;
    }

    const currentData = getTransaksi();
    const newData = [...currentData, ...importData.valid];
    saveTransaksi(newData);
    
    setTransaksi(newData);
    setShowImportModal(false);
    setImportData(null);
    setImportFileName('');
    
    alert(`Berhasil mengimport ${importData.valid.length} transaksi!`);
  };

  const filtered = transaksi
    .filter(t => filter === 'semua' || t.jenis === filter)
    .filter(t => t.uraian.toLowerCase().includes(search.toLowerCase()) || t.noBukti.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('semua')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'semua' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >Semua</button>
          <button
            onClick={() => setFilter('masuk')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'masuk' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >Pemasukan</button>
          <button
            onClick={() => setFilter('keluar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'keluar' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >Pengeluaran</button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium shadow-sm"
          >
            <i className="fas fa-file-import mr-2"></i>Import Excel
          </button>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium shadow-sm"
          >
            <i className="fas fa-download mr-2"></i>Download Template
          </button>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm, noBukti: generateNoBukti('TRX') }); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
          >
            <i className="fas fa-plus mr-2"></i>Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="text"
          placeholder="Cari transaksi berdasarkan uraian atau no. bukti..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">No. Bukti</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Uraian</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Penerima</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kategori</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Jumlah</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Bukti</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    <i className="fas fa-inbox text-3xl mb-2 block"></i>
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{t.tanggal}</td>
                    <td className="px-4 py-3 font-mono text-xs">{t.noBukti}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.uraian}</div>
                      {t.keterangan && <div className="text-xs text-gray-400">{t.keterangan}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm">{t.penerima || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{t.kategori}</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${t.jenis === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.jenis === 'masuk' ? '+' : '-'}{formatRupiah(t.jumlah)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.statusBukti ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          <i className="fas fa-check mr-1"></i>Ada
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(t)} className="text-blue-500 hover:text-blue-700" title="Edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700" title="Hapus">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            Menampilkan {filtered.length} transaksi
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">{editId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
                <div className="flex gap-3">
                  <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition-all ${form.jenis === 'masuk' ? 'border-green-500 bg-green-50' : ''}`}>
                    <input type="radio" name="jenis" value="masuk" checked={form.jenis === 'masuk'} onChange={() => setForm({ ...form, jenis: 'masuk' })} className="mr-2" />
                    <span className="text-sm font-medium">Pemasukan</span>
                  </label>
                  <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition-all ${form.jenis === 'keluar' ? 'border-red-500 bg-red-50' : ''}`}>
                    <input type="radio" name="jenis" value="keluar" checked={form.jenis === 'keluar'} onChange={() => setForm({ ...form, jenis: 'keluar' })} className="mr-2" />
                    <span className="text-sm font-medium">Pengeluaran</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uraian</label>
                <input type="text" value={form.uraian} onChange={e => setForm({ ...form, uraian: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Deskripsi transaksi" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penerima / Nama Pihak</label>
                <input type="text" value={form.penerima} onChange={e => setForm({ ...form, penerima: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama penerima dana / toko / vendor" />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                <input type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={2} placeholder="Keterangan tambahan (opsional)"></textarea>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  <i className="fas fa-save mr-2"></i>{editId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">
                <i className="fas fa-file-excel mr-2 text-green-600"></i>
                Import Transaksi dari Excel
              </h3>
              <button onClick={() => { setShowImportModal(false); setImportData(null); setImportFileName(''); }} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {!importData ? (
                // Step 1: Upload File
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-800 mb-2">
                      <i className="fas fa-info-circle mr-2"></i>Petunjuk Import
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Download template terlebih dahulu untuk mengetahui format yang benar</li>
                      <li>• Kolom wajib: Tanggal, Uraian, Jenis (masuk/keluar), Jumlah</li>
                      <li>• Format tanggal: YYYY-MM-DD (contoh: 2026-01-15)</li>
                      <li>• Jenis harus huruf kecil: "masuk" atau "keluar"</li>
                      <li>• Jumlah dalam angka tanpa format Rupiah</li>
                    </ul>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <i className="fas fa-file-excel text-5xl text-green-500 mb-4"></i>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">Pilih File Excel</h4>
                    <p className="text-sm text-gray-500 mb-4">Format yang didukung: .xlsx, .xls</p>
                    <label className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer font-medium">
                      <i className="fas fa-upload mr-2"></i>Pilih File
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    {importFileName && (
                      <p className="mt-4 text-sm text-gray-600">
                        <i className="fas fa-file mr-2"></i>
                        File: <span className="font-medium">{importFileName}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      onClick={downloadTemplate}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      <i className="fas fa-download mr-1"></i>Download Template Format Excel
                    </button>
                  </div>
                </div>
              ) : (
                // Step 2: Preview & Confirm
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-check text-green-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-green-600">Data Valid</p>
                          <p className="text-2xl font-bold text-green-700">{importData.valid.length}</p>
                          <p className="text-xs text-green-600">siap diimport</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-times text-red-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-red-600">Data Tidak Valid</p>
                          <p className="text-2xl font-bold text-red-700">{importData.invalid.length}</p>
                          <p className="text-xs text-red-600">akan dilewati</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Data Valid */}
                  {importData.valid.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        <i className="fas fa-eye mr-2 text-green-600"></i>
                        Preview Data yang Akan Diimport (Maks 10 baris)
                      </h4>
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">Tanggal</th>
                              <th className="px-3 py-2 text-left">Uraian</th>
                              <th className="px-3 py-2 text-left">Kategori</th>
                              <th className="px-3 py-2 text-center">Jenis</th>
                              <th className="px-3 py-2 text-right">Jumlah</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importData.valid.slice(0, 10).map((item, i) => (
                              <tr key={i} className="border-t">
                                <td className="px-3 py-2">{item.tanggal}</td>
                                <td className="px-3 py-2">{item.uraian}</td>
                                <td className="px-3 py-2">{item.kategori}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`px-2 py-0.5 rounded text-xs ${item.jenis === 'masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.jenis}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right font-medium">{formatRupiah(item.jumlah)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {importData.valid.length > 10 && (
                        <p className="text-xs text-gray-500 mt-1">
                          ...dan {importData.valid.length - 10} data lainnya
                        </p>
                      )}
                    </div>
                  )}

                  {/* Error Details */}
                  {importData.invalid.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        <i className="fas fa-exclamation-triangle mr-2 text-red-600"></i>
                        Data yang Tidak Valid (Akan Dilewati)
                      </h4>
                      <div className="overflow-x-auto border rounded-lg max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-red-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left">Baris</th>
                              <th className="px-3 py-2 text-left">Uraian</th>
                              <th className="px-3 py-2 text-left">Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importData.invalid.map((item, i) => (
                              <tr key={i} className="border-t">
                                <td className="px-3 py-2">{item.row}</td>
                                <td className="px-3 py-2">{item.data.uraian || '-'}</td>
                                <td className="px-3 py-2 text-red-600">{item.errors.join(', ')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <button
                      onClick={() => { setImportData(null); setImportFileName(''); }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>Pilih File Lain
                    </button>
                    <button
                      onClick={() => { setShowImportModal(false); setImportData(null); setImportFileName(''); }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmImport}
                      disabled={importData.valid.length === 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-check mr-2"></i>
                      Import {importData.valid.length} Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
