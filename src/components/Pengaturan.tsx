import { useState, useEffect } from 'react';
import { PengaturanSekolah } from '../types';
import { getPengaturan, savePengaturan } from '../utils';
import { APP_CONFIG, isMySQLMode } from '../config';
import { checkHealth, syncLocalToMySQL } from '../api';

export default function Pengaturan() {
  const [form, setForm] = useState<PengaturanSekolah>(getPengaturan());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'sekolah' | 'pegawai' | 'anggaran' | 'database'>('sekolah');
  const [apiStatus, setApiStatus] = useState<{ status: string; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const checkAPI = async () => {
    setApiStatus({ status: 'loading', message: 'Checking...' });
    
    try {
      const result = await checkHealth();
      setApiStatus(result);
      
      // Log detail untuk debugging
      console.log('🔍 API Health Check Result:', result);
      
      // Tampilkan alert dengan detail
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
      
      // Validasi result
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
              
              {/* Status Mode */}
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
              
              {/* Info MySQL */}
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
              
              {!isMySQLMode() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-2">
                    <i className="fas fa-info-circle mr-2"></i>Aktifkan MySQL
                  </h5>
                  <p className="text-sm text-blue-700 mb-3">
                    Untuk menggunakan database MySQL, ikuti langkah berikut:
                  </p>
                  <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                    <li>Setup database MySQL di cPanel</li>
                    <li>Upload folder <code className="bg-blue-100 px-1 rounded">backend/</code> ke hosting</li>
                    <li>Edit <code className="bg-blue-100 px-1 rounded">backend/config.php</code> dengan kredensial database</li>
                    <li>Edit <code className="bg-blue-100 px-1 rounded">src/config.ts</code> ubah <code>STORAGE_MODE</code> ke <code>'mysql'</code></li>
                    <li>Build ulang dan upload ke hosting</li>
                  </ol>
                  <p className="text-xs text-blue-600 mt-3">
                    <i className="fas fa-book mr-1"></i>
                    Lihat file <strong>INTEGRASI_MYSQL.md</strong> untuk panduan lengkap
                  </p>
                </div>
              )}

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

              {/* Sync to MySQL */}
              {isMySQLMode() && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-medium text-purple-800 mb-2">
                    <i className="fas fa-sync mr-2"></i>Sync Data ke MySQL
                  </h5>
                  <p className="text-xs text-purple-700 mb-3">
                    Sinkronisasi data dari localStorage ke database MySQL. Gunakan ini jika Anda baru saja mengaktifkan mode MySQL.
                  </p>
                  
                  {/* Debug Info */}
                  <div className="bg-white rounded p-2 mb-3 text-xs">
                    <p className="text-gray-600"><strong>Sync URL:</strong></p>
                    <code className="text-blue-600 break-all">{window.location.origin}{APP_CONFIG.API_BASE_URL}/sync</code>
                    <p className="text-gray-500 mt-1">
                      Pastikan file <code className="bg-gray-100 px-1 rounded">sync.php</code> ada di folder <code className="bg-gray-100 px-1 rounded">{APP_CONFIG.API_BASE_URL}/</code>
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleSync} 
                    disabled={syncing}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:bg-gray-400"
                  >
                    <i className={`fas ${syncing ? 'fa-spinner fa-spin' : 'fa-sync'} mr-2`}></i>
                    {syncing ? 'Syncing...' : 'Sync ke MySQL'}
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Buka Console browser (F12) untuk melihat detail proses sync
                  </p>
                </div>
              )}

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
