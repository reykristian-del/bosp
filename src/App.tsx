import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Transaksi from './components/Transaksi';
import BukuKas from './components/BukuKas';
import BuktiKas from './components/BuktiKas';
import Laporan from './components/Laporan';
import Pengaturan from './components/Pengaturan';
import { getPengaturan } from './utils';

type Page = 'dashboard' | 'transaksi' | 'bukukas' | 'buktikas' | 'laporan' | 'pengaturan';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pengaturan = getPengaturan();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transaksi':
        return <Transaksi />;
      case 'bukukas':
        return <BukuKas />;
      case 'buktikas':
        return <BuktiKas />;
      case 'laporan':
        return <Laporan />;
      case 'pengaturan':
        return <Pengaturan />;
      default:
        return <Dashboard />;
    }
  };

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'transaksi' as Page, label: 'Transaksi', icon: 'fa-money-bill-transfer' },
    { id: 'bukukas' as Page, label: 'Buku Kas', icon: 'fa-book' },
    { id: 'buktikas' as Page, label: 'Bukti Kas', icon: 'fa-file-invoice' },
    { id: 'laporan' as Page, label: 'Laporan', icon: 'fa-file-excel' },
    { id: 'pengaturan' as Page, label: 'Pengaturan', icon: 'fa-cog' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-blue-800 to-blue-900 text-white transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-school text-blue-800 text-lg"></i>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold leading-tight truncate">{pengaturan.namaSekolah || 'SMP Negeri 1'}</h1>
                <p className="text-xs text-blue-200 truncate">{pengaturan.kecamatan || 'Tulang Bawang Barat'}</p>
                <p className="text-xs text-yellow-300 font-semibold">Sistem BOSP {pengaturan.tahunAnggaran}</p>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-200 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-blue-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-700 transition-all"
          >
            <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
            {sidebarOpen && <span className="text-sm">Tutup Menu</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {menuItems.find(m => m.id === currentPage)?.label}
              </h2>
              <p className="text-sm text-gray-500">Sistem Informasi Pembukuan Dana BOSP</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden md:inline">
                <i className="fas fa-calendar-alt mr-2"></i>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <button
                onClick={() => setCurrentPage('pengaturan')}
                className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all"
                title="Pengaturan"
              >
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </header>
        <div className="p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
