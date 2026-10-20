import { useState, useEffect } from 'react';
import { PengaturanSekolah } from '../types';
import { usePengaturan } from '../hooks';
import { APP_CONFIG, isMySQLMode } from '../config';
import { checkHealth, syncLocalToMySQL } from '../api';

export default function Pengaturan() {
  const { data: pengaturan, loading, update: updatePengaturan, reload } = usePengaturan();
  const [form, setForm] = useState<PengaturanSekolah | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'sekolah' | 'pegawai' | 'anggaran' | 'database'>('sekolah');
  const [apiStatus, setApiStatus] = useState<{ status: string; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const checkAPI = async () => {
    setApiStatus({ status: 'loading', message: 'Checking...' });
    
    try {
      const result = await checkHealth();
      setApiStatus(result);
      
      console.log('🔍 API Health Check Result:', result);
      
      if (result.status === 'ok') {
        alert(`✅ API Connected!\n\nStatus: ${result.status}\nMessage: ${result.message}`);
      } else {
        alert(`❌ API Error!\n\nStatus: ${result.status}\nMessage: ${result.message}\n\nCheck browser console (F12) for details.`);
      }
    } catch (error) {
      console.error('❌ Health check error:', error);
      setApiStatus({ 
        status: 'error', 
        message: 'Unexpected error: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  };

  const handleSync = async () => {
    if (!confirm('Sync semua data dari localStorage ke MySQL?')) return;
    setSyncing(true);
    
    try {
      const result = await syncLocalToMySQL();
      setSyncing(false);
      
      console.log('📊 Sync result:', result);
      
      if (!result || typeof result !== 'object') {
        alert('❌ Sync gagal: Response tidak valid dari server');
        return;
      }
      
      if (result.success) {
        const message = result.message || 'Sync berhasil!';
        alert(`✅ ${message}`);
      } else {
        const errorMessage = result.message || 'Unknown error';
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      setSyncing(false);
      console.error('❌ Sync error:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Sync gagal: ${errorMsg}`);
    }
  };

  useEffect(() => {
    if (pengaturan) {
      setForm(pengaturan);
    }
  }, [pengaturan]);

  const handleSave = async () => {
    if (!form) return;
    
    try {
      await updatePengaturan(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await reload();
    } catch (error) {
      alert('Gagal menyimpan pengaturan: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat dibatalkan!')) {
      try { localStorage.clear(); } catch {}
      window.location.reload();
    }
  };

  const exportDatabase = () => {
    const data = {
      transaksi: null,
      bukti_kas: null,
      saldo_awal: null,
      pengaturan: form,
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
        if (data.pengaturan) {
          updatePengaturan(data.pengaturan);
        }
        alert('Data berhasil diimpor! Halaman akan dimuat ulang.');
        window.location.reload();
      } catch {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  if (loading || !form) {
    return <div className="text-center py-8">Memuat pengaturan...</div>;
  }

  return (
    <div className="space-y-4">
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <i className="fas fa-check-circle text-green-600"></i>
          <span className="text-sm text-green-700">Pengaturan berhasil disimpan ke database!</span>
        </div>
      )}

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
                  <input type="text" value={form.npsn || ''} onChange={e => setForm({ ...form, npsn: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input type="text" value={form.telepon || ''} onChange={e => setForm({ ...form, telepon: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <input type="text" value={form.alamat || ''} onChange={e => setForm({ ...form, alamat: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelurahan/Desa</label>
                  <input type="text" value={form.kelurahan || ''} onChange={e => setForm({ ...form, kelurahan: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                  <input type="text" value={form.kecamatan || ''} onChange={e => setForm({ ...form, kecamatan: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota</label>
                  <input type="text" value={form.kabupaten || ''} onChange={e => setForm({ ...form, kabupaten: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                  <input type="text" value={form.provinsi || ''} onChange={e => setForm({ ...form, provinsi: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                  <input type="text" value={form.kodePos || ''} onChange={e => setForm({ ...form, kodePos: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pegawai' && (
            <div className="space-y-6 max-w-2xl">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-users text-blue-500"></i>Data Pegawai
              </h4>
              
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-user-tie text-purple-500"></i>Kepala Sekolah
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label>
                    <input type="text" value={form.kepalaSekolah || ''} onChange={e => setForm({ ...form, kepalaSekolah: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIP Kepala Sekolah</label>
                    <input type="text" value={form.nipKepsek || ''} onChange={e => setForm({ ...form, nipKepsek: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border">
                <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-user text-green-500"></i>Bendahara
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bendahara</label>
                    <input type="text" value={form.bendahara || ''} onChange={e => setForm({ ...form, bendahara: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIP Bendahara</label>
                    <input type="text" value={form.nipBendahara || ''} onChange={e => setForm({ ...form, nipBendahara: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
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
                  <select value={form.tahunAnggaran || ''} onChange={e => setForm({ ...form, tahunAnggaran: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Dana</label>
                  <input type="text" value={form.sumberDana || ''} onChange={e => setForm({ ...form, sumberDana: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6 max-w-2xl">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-database text-blue-500"></i>Manajemen Database
              </h4>
              
              <div className={`border rounded-lg p-4 ${isMySQLMode() ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isMySQLMode() ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <i className={`fas ${isMySQLMode() ? 'fa-database text-green-600' : 'fa-hdd text-yellow-600'} text-xl`}></i>
                  </div>
                  <div>
                    <p className={`font-bold ${isMySQLMode() ? 'text-green-800' : 'text-yellow-800'}`}>
                      Mode: {isMySQLMode() ? 'MySQL Database' : 'Local Storage'}
                    </p>
                    <p className={`text-sm ${isMySQLMode() ? 'text-green-700' : 'text-yellow-700'}`}>
                      {isMySQLMode() 
                        ? 'Data tersimpan di database MySQL terpusat' 
                        : 'Data tersimpan di browser (localStorage)'}
                    </p>
                  </div>
                </div>
              </div>
              
              {isMySQLMode() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-2">
                    <i className="fas fa-server mr-2"></i>Konfigurasi API
                  </h5>
                  <div className="bg-white rounded p-3 text-xs font-mono text-gray-700 space-y-1">
                    <p><span className="text-gray-500">API URL:</span> {APP_CONFIG.API_BASE_URL}</p>
                    <p><span className="text-gray-500">Timeout:</span> {APP_CONFIG.API_TIMEOUT}ms</p>
                    <p><span className="text-gray-500">Version:</span> {APP_CONFIG.VERSION}</p>
                  </div>
                  <button 
                    onClick={checkAPI}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <i className="fas fa-plug mr-2"></i>Test Koneksi API
                  </button>
                  {apiStatus && (
                    <div className={`mt-3 p-3 rounded ${apiStatus.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <p className="text-sm font-medium">
                        <i className={`fas ${apiStatus.status === 'ok' ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                        {apiStatus.message}
                      </p>
                    </div>
                  )}
                </div>
              )}

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

              {isMySQLMode() && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-medium text-purple-800 mb-2">
                    <i className="fas fa-sync mr-2"></i>Sync Data ke MySQL
                  </h5>
                  <p className="text-xs text-purple-700 mb-3">
                    Sinkronisasi data dari localStorage ke database MySQL.
                  </p>
                  <button 
                    onClick={handleSync} 
                    disabled={syncing}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:bg-gray-400"
                  >
                    <i className={`fas ${syncing ? 'fa-spinner fa-spin' : 'fa-sync'} mr-2`}></i>
                    {syncing ? 'Syncing...' : 'Sync ke MySQL'}
                  </button>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-medium text-red-800 mb-2">
                  <i className="fas fa-exclamation-triangle mr-2"></i>Reset Semua Data
                </h5>
                <p className="text-xs text-red-700 mb-3">Hapus semua data dan kembalikan ke pengaturan awal. Tindakan ini tidak dapat dibatalkan!</p>
                <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                  <i className="fas fa-trash mr-2"></i>Reset Semua Data
                </button>
              </div>
            </div>
          )}
        </div>

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
