import { useState, useEffect } from 'react';
import { Transaksi, BuktiKasPengeluaran, PengaturanSekolah } from './types';
import { APP_CONFIG } from './config';
import {
  fetchTransaksi, createTransaksi, updateTransaksiAPI, deleteTransaksiAPI,
  fetchBuktiKas, createBuktiKas, deleteBuktiKasAPI,
  fetchPengaturan, updatePengaturan,
  fetchSaldo, updateSaldo
} from './api';

// Helper untuk logging
function log(...args: any[]) {
  if (APP_CONFIG.DEBUG) {
    console.log('[HOOKS]', ...args);
  }
}

// ==================== TRANSAKSI HOOKS ====================

export function useTransaksi() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    log('🔄 Loading transaksi from MySQL...');
    
    try {
      const result = await fetchTransaksi();
      // Pastikan result adalah array
      const transaksiArray = Array.isArray(result) ? result : [];
      log('✅ Transaksi loaded:', transaksiArray.length, 'records');
      setData(transaksiArray);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error loading transaksi:', errorMsg);
      setError(errorMsg);
      setData([]); // Set empty array instead of localStorage fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const add = async (transaksi: Transaksi) => {
    log('➕ Adding transaksi:', transaksi);
    try {
      await createTransaksi(transaksi);
      log('✅ Transaksi added successfully');
      await loadData(); // Reload from database
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error adding transaksi:', errorMsg);
      throw error;
    }
  };

  const update = async (id: string, updateData: Partial<Transaksi>) => {
    log('✏️ Updating transaksi:', id, updateData);
    try {
      await updateTransaksiAPI(id, updateData);
      log('✅ Transaksi updated successfully');
      await loadData(); // Reload from database
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error updating transaksi:', errorMsg);
      throw error;
    }
  };

  const remove = async (id: string) => {
    log('🗑️ Deleting transaksi:', id);
    try {
      await deleteTransaksiAPI(id);
      log('✅ Transaksi deleted successfully');
      await loadData(); // Reload from database
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error deleting transaksi:', errorMsg);
      throw error;
    }
  };

  return { data, loading, error, add, update, remove, reload: loadData };
}

// ==================== BUKTI KAS HOOKS ====================

export function useBuktiKas() {
  const [data, setData] = useState<BuktiKasPengeluaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    log('🔄 Loading bukti kas from MySQL...');
    
    try {
      const result = await fetchBuktiKas();
      // Pastikan result adalah array
      const buktiArray = Array.isArray(result) ? result : [];
      log('✅ Bukti kas loaded:', buktiArray.length, 'records');
      setData(buktiArray);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error loading bukti kas:', errorMsg);
      setError(errorMsg);
      setData([]); // Set empty array instead of localStorage fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const add = async (bukti: BuktiKasPengeluaran) => {
    log('➕ Adding bukti kas:', bukti);
    try {
      await createBuktiKas(bukti);
      log('✅ Bukti kas added successfully');
      await loadData(); // Reload from database
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error adding bukti kas:', errorMsg);
      throw error;
    }
  };

  const remove = async (id: string) => {
    log('🗑️ Deleting bukti kas:', id);
    try {
      await deleteBuktiKasAPI(id);
      log('✅ Bukti kas deleted successfully');
      await loadData(); // Reload from database
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error deleting bukti kas:', errorMsg);
      throw error;
    }
  };

  return { data, loading, error, add, remove, reload: loadData };
}

// ==================== PENGATURAN HOOKS ====================

export function usePengaturan() {
  const [data, setData] = useState<PengaturanSekolah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    log('🔄 Loading pengaturan from MySQL...');
    
    try {
      const result = await fetchPengaturan();
      log('✅ Pengaturan loaded:', result);
      setData(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error loading pengaturan:', errorMsg);
      setError(errorMsg);
      setData(null); // Set null instead of localStorage fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const update = async (pengaturan: PengaturanSekolah) => {
    log('✏️ Updating pengaturan:', pengaturan);
    try {
      await updatePengaturan(pengaturan);
      log('✅ Pengaturan updated successfully');
      setData(pengaturan); // Update local state
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error updating pengaturan:', errorMsg);
      throw error;
    }
  };

  return { data, loading, error, update, reload: loadData };
}

// ==================== SALDO HOOKS ====================

export function useSaldo() {
  const [data, setData] = useState<{ tanggal: string; jumlah: number; keterangan: string }>({ 
    tanggal: '', 
    jumlah: 0, 
    keterangan: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    log('🔄 Loading saldo from MySQL...');
    
    try {
      const result = await fetchSaldo();
      log('✅ Saldo loaded:', result);
      setData(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error loading saldo:', errorMsg);
      setError(errorMsg);
      // Set default empty saldo instead of localStorage fallback
      setData({ tanggal: '', jumlah: 0, keterangan: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const update = async (saldo: { tanggal: string; jumlah: number; keterangan: string }) => {
    log('✏️ Updating saldo:', saldo);
    try {
      await updateSaldo(saldo);
      log('✅ Saldo updated successfully');
      setData(saldo); // Update local state
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log('❌ Error updating saldo:', errorMsg);
      throw error;
    }
  };

  return { data, loading, error, update, reload: loadData };
}
