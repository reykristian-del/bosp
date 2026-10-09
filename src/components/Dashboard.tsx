import { useState, useEffect } from 'react';
import { Transaksi } from '../types';
import { getTransaksi, getSaldoAwal, formatRupiah, saveSaldoAwal, getPengaturan } from '../utils';

export default function Dashboard() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [saldoAwal, setSaldoAwal] = useState<number>(0);
  const [showSaldoModal, setShowSaldoModal] = useState(false);
  const [inputSaldo, setInputSaldo] = useState('');
  const pengaturan = getPengaturan();

  useEffect(() => {
    setTransaksi(getTransaksi());
    const saldo = getSaldoAwal();
    setSaldoAwal(saldo.jumlah);
  }, []);

  const totalMasuk = transaksi.filter(t => t.jenis === 'masuk').reduce((sum, t) => sum + t.jumlah, 0);
  const totalKeluar = transaksi.filter(t => t.jenis === 'keluar').reduce((sum, t) => sum + t.jumlah, 0);
  const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;

  const transaksiTerakhir = [...transaksi].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 5);

  const handleSaveSaldo = () => {
    const jumlah = parseFloat(inputSaldo) || 0;
    saveSaldoAwal({ tanggal: new Date().toISOString().split('T')[0], jumlah, keterangan: 'Saldo Awal Dana BOSP' });
    setSaldoAwal(jumlah);
    setShowSaldoModal(false);
  };

  // Kategori breakdown
  const kategoriData = transaksi
    .filter(t => t.jenis === 'keluar')
    .reduce((acc, t) => {
      acc[t.kategori] = (acc[t.kategori] || 0) + t.jumlah;
      return acc;
    }, {} as Record<string, number>);

  const transaksiTanpaBukti = transaksi.filter(t => t.jenis === 'keluar' && !t.statusBukti).length;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{pengaturan.namaSekolah || 'SMP Negeri 1 Tulang Bawang Barat'}</h3>
            <p className="text-blue-100 mt-1">Sistem Pembukuan Dana {pengaturan.sumberDana || 'BOSP'}</p>
            <p className="text-blue-200 text-sm mt-2">Tahun Anggaran {pengaturan.tahunAnggaran || new Date().getFullYear()}</p>
            {pengaturan.npsn && <p className="text-blue-200 text-xs mt-1">NPSN: {pengaturan.npsn}</p>}
          </div>
          <div className="text-right">
            <i className="fas fa-school text-5xl text-blue-200"></i>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Saldo Awal</p>
              <p className="text-xl font-bold text-gray-800">{formatRupiah(saldoAwal)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-wallet text-green-600 text-xl"></i>
            </div>
          </div>
          <button onClick={() => { setShowSaldoModal(true); setInputSaldo(saldoAwal.toString()); }} className="text-xs text-green-600 hover:underline mt-2">
            <i className="fas fa-edit mr-1"></i>Ubah Saldo Awal
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pemasukan</p>
              <p className="text-xl font-bold text-gray-800">{formatRupiah(totalMasuk)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-arrow-down text-blue-600 text-xl"></i>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{transaksi.filter(t => t.jenis === 'masuk').length} transaksi</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pengeluaran</p>
              <p className="text-xl font-bold text-gray-800">{formatRupiah(totalKeluar)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i className="fas fa-arrow-up text-red-600 text-xl"></i>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{transaksi.filter(t => t.jenis === 'keluar').length} transaksi</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Saldo Akhir</p>
              <p className="text-xl font-bold text-gray-800">{formatRupiah(saldoAkhir)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-piggy-bank text-purple-600 text-xl"></i>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Sisa anggaran tersedia</p>
        </div>
      </div>

      {/* Alert for transactions without bukti kas */}
      {transaksiTanpaBukti > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-exclamation text-orange-600"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">
              {transaksiTanpaBukti} transaksi pengeluaran belum memiliki bukti kas
            </p>
            <p className="text-xs text-orange-600">Segera buat bukti kas pengeluaran untuk kelengkapan administrasi</p>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaksi Terakhir */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b">
            <h3 className="font-bold text-gray-800"><i className="fas fa-clock mr-2 text-blue-500"></i>Transaksi Terakhir</h3>
          </div>
          <div className="p-5">
            {transaksiTerakhir.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Belum ada transaksi</p>
            ) : (
              <div className="space-y-3">
                {transaksiTerakhir.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.jenis === 'masuk' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <i className={`fas ${t.jenis === 'masuk' ? 'fa-arrow-down text-green-600' : 'fa-arrow-up text-red-600'} text-sm`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{t.uraian}</p>
                        <p className="text-xs text-gray-400">{t.tanggal}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${t.jenis === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.jenis === 'masuk' ? '+' : '-'}{formatRupiah(t.jumlah)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pengeluaran per Kategori */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b">
            <h3 className="font-bold text-gray-800"><i className="fas fa-chart-pie mr-2 text-purple-500"></i>Pengeluaran per Kategori</h3>
          </div>
          <div className="p-5">
            {Object.keys(kategoriData).length === 0 ? (
              <p className="text-gray-400 text-center py-4">Belum ada data pengeluaran</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(kategoriData).map(([kategori, jumlah]) => {
                  const persen = totalKeluar > 0 ? (jumlah / totalKeluar * 100) : 0;
                  return (
                    <div key={kategori}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 truncate mr-2">{kategori}</span>
                        <span className="font-medium text-gray-800 whitespace-nowrap">{formatRupiah(jumlah)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${persen}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Pegawai */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3"><i className="fas fa-users mr-2 text-green-500"></i>Informasi Pegawai</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Kepala Sekolah</p>
            <p className="font-medium text-gray-800">{pengaturan.kepalaSekolah || '(Belum diatur)'}</p>
            {pengaturan.nipKepsek && <p className="text-xs text-gray-500">NIP: {pengaturan.nipKepsek}</p>}
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Bendahara</p>
            <p className="font-medium text-gray-800">{pengaturan.bendahara || '(Belum diatur)'}</p>
            {pengaturan.nipBendahara && <p className="text-xs text-gray-500">NIP: {pengaturan.nipBendahara}</p>}
          </div>
        </div>
      </div>

      {/* Saldo Modal */}
      {showSaldoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Set Saldo Awal</h3>
            <label className="block text-sm text-gray-600 mb-1">Jumlah Saldo Awal (Rp)</label>
            <input
              type="number"
              value={inputSaldo}
              onChange={e => setInputSaldo(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Masukkan jumlah saldo"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowSaldoModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSaveSaldo} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
