import { useState, useEffect } from 'react';
import { PengaturanSekolah } from '../types';
import { getPengaturan, savePengaturan } from '../utils';

export default function Pengaturan() {
  const [form, setForm] = useState<PengaturanSekolah>(getPengaturan());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'sekolah' | 'pegawai' | 'anggaran' | 'database'>('sekolah');

  useEffect(() => {
    setForm(getPengaturan());
  }, []);

  const handleSave = () => {
    savePengaturan(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const safeGetItem = (key: string): string | null => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const safeSetItem = (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch {}
  };
  const safeClear = () => {
    try { localStorage.clear(); } catch {}
  };
  const safeStringLength = (): number => {
    try { return JSON.stringify(localStorage).length; } catch { return 0; }
  };
  const safeKeyCount = (): number => {
    try { return Object.keys(localStorage).length; } catch { return 0; }
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat dibatalkan!')) {
      safeClear();
      window.location.reload();
    }
  };

  const exportDatabase = () => {
    const data = {
      transaksi: safeGetItem('bosp_transaksi'),
      bukti_kas: safeGetItem('bosp_bukti_kas'),
      saldo_awal: safeGetItem('bosp_saldo_awal'),
      pengaturan: safeGetItem('bosp_pengaturan'),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_bosp_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transaksi) safeSetItem('bosp_transaksi', data.transaksi);
        if (data.bukti_kas) safeSetItem('bosp_bukti_kas', data.bukti_kas);
        if (data.saldo_awal) safeSetItem('bosp_saldo_awal', data.saldo_awal);
        if (data.pengaturan) safeSetItem('bosp_pengaturan', data.pengaturan);
        alert('Data berhasil diimpor! Halaman akan dimuat ulang.');
        window.location.reload();
      } catch {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Success notification */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <i className="fas fa-check-circle text-green-600"></i>
          <span className="text-sm text-green-700">Pengaturan berhasil disimpan!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b flex overflow-x-auto">
          <button onClick={() => setActiveTab('sekolah')} className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === 'sekolah' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-school mr-2"></i>Data Sekolah
          </button>
          <button onClick={() => setActiveTab('pegawai')} className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === 'pegawai' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-users mr-2"></i>Pegawai
          </button>
          <button onClick={() => setActiveTab('anggaran')} className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === 'anggaran' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-money-bill mr-2"></i>Anggaran
          </button>
          <button onClick={() => setActiveTab('database')} className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === 'database' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-database mr-2"></i>Database
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'sekolah' && (
            <div className="space-y-4 max-w-2xl">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-school text-blue-500"></i>Data Sekolah
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
                  <input type="text" value={form.namaSekolah} onChange={e => setForm({ ...form, namaSekolah: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NPSN</label>
                  <input type="text" value={form.npsn} onChange={e => setForm({ ...form, npsn: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nomor Pokok Sekolah Nasional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input type="text" value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <input type="text" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelurahan/Desa</label>
                  <input type="text" value={form.kelurahan} onChange={e => setForm({ ...form, kelurahan: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                  <input type="text" value={form.kecamatan} onChange={e => setForm({ ...form, kecamatan: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota</label>
                  <input type="text" value={form.kabupaten} onChange={e => setForm({ ...form, kabupaten: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                  <input type="text" value={form.provinsi} onChange={e => setForm({ ...form, provinsi: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                  <input type="text" value={form.kodePos} onChange={e => setForm({ ...form, kodePos: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pegawai' && (
            <div className="space-y-6 max-w-2xl">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-users text-blue-500"></i>Data Pegawai
              </h4>
              
              {/* Kepala Sekolah */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-user-tie text-purple-500"></i>Kepala Sekolah
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label>
                    <input type="text" value={form.kepalaSekolah} onChange={e => setForm({ ...form, kepalaSekolah: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama lengkap beserta gelar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIP Kepala Sekolah</label>
                    <input type="text" value={form.nipKepsek} onChange={e => setForm({ ...form, nipKepsek: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="18 digit NIP" />
                  </div>
                </div>
              </div>

              {/* Bendahara */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-user text-green-500"></i>Bendahara
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bendahara</label>
                    <input type="text" value={form.bendahara} onChange={e => setForm({ ...form, bendahara: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama lengkap beserta gelar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIP Bendahara</label>
                    <input type="text" value={form.nipBendahara} onChange={e => setForm({ ...form, nipBendahara: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="18 digit NIP" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anggaran' && (
            <div className="space-y-4 max-w-2xl">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-money-bill text-blue-500"></i>Data Anggaran
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Anggaran</label>
                  <select value={form.tahunAnggaran} onChange={e => setForm({ ...form, tahunAnggaran: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Dana</label>
                  <input type="text" value={form.sumberDana} onChange={e => setForm({ ...form, sumberDana: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Dana BOSP" />
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  Untuk mengatur saldo awal, silakan buka menu <strong>Dashboard</strong> dan klik tombol "Ubah Saldo Awal".
                </p>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6 max-w-2xl">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-database text-blue-500"></i>Manajemen Database
              </h4>
              
              {/* Info MySQL */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2">
                  <i className="fas fa-database mr-2"></i>Koneksi MySQL
                </h5>
                <p className="text-sm text-blue-700 mb-3">
                  Aplikasi ini saat ini menggunakan penyimpanan lokal (localStorage). Untuk menggunakan database MySQL, 
                  Anda perlu menginstal backend PHP yang tersedia di folder <code className="bg-blue-100 px-1 rounded">backend/</code> pada proyek ini.
                </p>
                <div className="bg-white rounded p-3 text-xs font-mono text-gray-700 space-y-1">
                  <p className="text-gray-500">-- Konfigurasi Database MySQL --</p>
                  <p>Host: localhost</p>
                  <p>Database: bosp_smpn1</p>
                  <p>Username: root</p>
                  <p>Port: 3306</p>
                </div>
              </div>

              {/* Backup & Restore */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-800 mb-2">
                    <i className="fas fa-download mr-2"></i>Backup Data
                  </h5>
                  <p className="text-xs text-green-700 mb-3">Unduh semua data dalam format JSON untuk cadangan</p>
                  <button onClick={exportDatabase} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                    <i className="fas fa-download mr-2"></i>Download Backup
                  </button>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-medium text-orange-800 mb-2">
                    <i className="fas fa-upload mr-2"></i>Restore Data
                  </h5>
                  <p className="text-xs text-orange-700 mb-3">Muat data dari file backup JSON</p>
                  <label className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium text-center cursor-pointer block">
                    <i className="fas fa-upload mr-2"></i>Pilih File Backup
                    <input type="file" accept=".json" onChange={importDatabase} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Reset */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-medium text-red-800 mb-2">
                  <i className="fas fa-exclamation-triangle mr-2"></i>Reset Semua Data
                </h5>
                <p className="text-xs text-red-700 mb-3">Hapus semua data dan kembalikan ke pengaturan awal. Tindakan ini tidak dapat dibatalkan!</p>
                <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                  <i className="fas fa-trash mr-2"></i>Reset Semua Data
                </button>
              </div>

              {/* Statistik */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-3">Statistik Penyimpanan</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{JSON.parse(safeGetItem('bosp_transaksi') || '[]').length}</p>
                    <p className="text-xs text-gray-500">Transaksi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{JSON.parse(safeGetItem('bosp_bukti_kas') || '[]').length}</p>
                    <p className="text-xs text-gray-500">Bukti Kas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{(safeStringLength() / 1024).toFixed(1)} KB</p>
                    <p className="text-xs text-gray-500">Ukuran Data</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{safeKeyCount()}</p>
                    <p className="text-xs text-gray-500">Total Keys</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        {activeTab !== 'database' && (
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              <i className="fas fa-save mr-2"></i>Simpan Pengaturan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
