import { useState, useEffect } from 'react';
import { Transaksi as TransaksiType, KATEGORI_BOSP } from '../types';
import { getTransaksi, addTransaksi, deleteTransaksi, generateId, formatRupiah, generateNoBukti } from '../utils';

export default function Transaksi() {
  const [transaksi, setTransaksi] = useState<TransaksiType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    noBukti: '',
    uraian: '',
    kategori: '',
    kodeRekening: '',
    jumlah: '',
    jenis: 'keluar' as 'masuk' | 'keluar',
    keterangan: '',
  });

  useEffect(() => {
    setTransaksi(getTransaksi());
    setForm(f => ({ ...f, noBukti: generateNoBukti('TRX') }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      createdAt: new Date().toISOString(),
    };
    addTransaksi(newTransaksi);
    setTransaksi(getTransaksi());
    setShowForm(false);
    setForm({
      tanggal: new Date().toISOString().split('T')[0],
      noBukti: generateNoBukti('TRX'),
      uraian: '',
      kategori: '',
      kodeRekening: '',
      jumlah: '',
      jenis: 'keluar',
      keterangan: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      deleteTransaksi(id);
      setTransaksi(getTransaksi());
    }
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
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
        >
          <i className="fas fa-plus mr-2"></i>Tambah Transaksi
        </button>
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kategori</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Jumlah</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
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
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{t.kategori}</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${t.jenis === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.jenis === 'masuk' ? '+' : '-'}{formatRupiah(t.jumlah)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
                        <i className="fas fa-trash"></i>
                      </button>
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
              <h3 className="text-lg font-bold">Tambah Transaksi Baru</h3>
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
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  <i className="fas fa-save mr-2"></i>Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
