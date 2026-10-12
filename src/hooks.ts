import { useState, useEffect } from 'react';
import { Transaksi, BuktiKasPengeluaran, PengaturanSekolah } from './types';
import { 
  getTransaksi, saveTransaksi, 
  getBuktiKas, saveBuktiKas,
  getPengaturan, savePengaturan,
  getSaldoAwal, saveSaldoAwal
} from './utils';
import { isMySQLMode } from './config';
import {
  fetchTransaksi, createTransaksi, updateTransaksiAPI, deleteTransaksiAPI,
  fetchBuktiKas, createBuktiKas, deleteBuktiKasAPI,
  fetchPengaturan, updatePengaturan,
  fetchSaldo, updateSaldo
} from './api';

// ==================== TRANSAKSI HOOKS ====================

export function useTransaksi() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isMySQLMode()) {
        const result = await fetchTransaksi();
        setData(result);
      } else {
        setData(getTransaksi());
      }
    } catch (error) {
      console.error('Error loading transaksi:', error);
      setData(getTransaksi());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const add = async (transaksi: Transaksi) => {
    if (isMySQLMode()) {
      await createTransaksi(transaksi);
    } else {
      const list = getTransaksi();
      list.push(transaksi);
      saveTransaksi(list);
    }
    await loadData();
  };

  const update = async (id: string, data: Partial<Transaksi>) => {
    if (isMySQLMode()) {
      await updateTransaksiAPI(id, data);
    } else {
      const list = getTransaksi().map(t => t.id === id ? { ...t, ...data } : t);
      saveTransaksi(list);
    }
    await loadData();
  };

  const remove = async (id: string) => {
    if (isMySQLMode()) {
      await deleteTransaksiAPI(id);
    } else {
      const list = getTransaksi().filter(t => t.id !== id);
      saveTransaksi(list);
    }
    await loadData();
  };

  return { data, loading, add, update, remove, reload: loadData };
}

// ==================== BUKTI KAS HOOKS ====================

export function useBuktiKas() {
  const [data, setData] = useState<BuktiKasPengeluaran[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isMySQLMode()) {
        const result = await fetchBuktiKas();
        setData(result);
      } else {
        setData(getBuktiKas());
      }
    } catch (error) {
      console.error('Error loading bukti kas:', error);
      setData(getBuktiKas());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const add = async (bukti: BuktiKasPengeluaran) => {
    if (isMySQLMode()) {
      await createBuktiKas(bukti);
    } else {
      const list = getBuktiKas();
      list.push(bukti);
      saveBuktiKas(list);
    }
    await loadData();
  };

  const remove = async (id: string) => {
    if (isMySQLMode()) {
      await deleteBuktiKasAPI(id);
    } else {
      const list = getBuktiKas().filter(b => b.id !== id);
      saveBuktiKas(list);
    }
    await loadData();
  };

  return { data, loading, add, remove, reload: loadData };
}

// ==================== PENGATURAN HOOKS ====================

export function usePengaturan() {
  const [data, setData] = useState<PengaturanSekolah | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isMySQLMode()) {
        const result = await fetchPengaturan();
        setData(result);
      } else {
        setData(getPengaturan());
      }
    } catch (error) {
      console.error('Error loading pengaturan:', error);
      setData(getPengaturan());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const update = async (pengaturan: PengaturanSekolah) => {
    if (isMySQLMode()) {
      await updatePengaturan(pengaturan);
    } else {
      savePengaturan(pengaturan);
    }
    setData(pengaturan);
  };

  return { data, loading, update, reload: loadData };
}

// ==================== SALDO HOOKS ====================

export function useSaldo() {
  const [data, setData] = useState<{ tanggal: string; jumlah: number; keterangan: string }>({ 
    tanggal: '', 
    jumlah: 0, 
    keterangan: '' 
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isMySQLMode()) {
        const result = await fetchSaldo();
        setData(result);
      } else {
        setData(getSaldoAwal());
      }
    } catch (error) {
      console.error('Error loading saldo:', error);
      setData(getSaldoAwal());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const update = async (saldo: { tanggal: string; jumlah: number; keterangan: string }) => {
    if (isMySQLMode()) {
      await updateSaldo(saldo);
    } else {
      saveSaldoAwal(saldo);
    }
    setData(saldo);
  };

  return { data, loading, update, reload: loadData };
}
