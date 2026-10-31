/**
 * API Service - Koneksi ke Backend PHP/MySQL
 * Dengan fallback ke localStorage jika API tidak tersedia
 */

import { APP_CONFIG } from './config';
import { 
  getTransaksi as getLocalTransaksi, 
  saveTransaksi as saveLocalTransaksi,
  getBuktiKas as getLocalBuktiKas,
  saveBuktiKas as saveLocalBuktiKas,
  getPengaturan as getLocalPengaturan,
  savePengaturan as saveLocalPengaturan,
  getSaldoAwal as getLocalSaldoAwal,
  saveSaldoAwal as saveLocalSaldoAwal
} from './utils';

const API_BASE = APP_CONFIG.API_BASE_URL;

// Helper untuk logging
function log(message: string, data?: any) {
  if (APP_CONFIG.DEBUG) {
    console.log(`[API] ${message}`, data || '');
  }
}

// Helper untuk API request dengan timeout
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  log(`📡 Request: ${options.method || 'GET'} ${url}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    log(`📥 Response: ${response.status} ${response.statusText}`);
    
    // Baca response sebagai text dulu
    const responseText = await response.text();
    log(`📝 Response body:`, responseText.substring(0, 500));
    
    // Cek apakah response kosong
    if (!responseText || responseText.trim() === '') {
      throw new Error(`API mengembalikan response kosong\nURL: ${url}\nStatus: ${response.status}`);
    }
    
    // Cek HTTP error
    if (!response.ok) {
      log(`❌ Error response:`, responseText);
      throw new Error(`API Error: ${response.status} ${response.statusText}\nURL: ${url}\nResponse: ${responseText.substring(0, 200)}`);
    }
    
    // Coba parse sebagai JSON
    try {
      const data = JSON.parse(responseText);
      log(`✅ Success:`, data);
      return data;
    } catch (parseError) {
      log(`❌ JSON parse error:`, parseError);
      log(`📄 Raw response:`, responseText);
      throw new Error(`API tidak mengembalikan JSON valid\nURL: ${url}\nResponse: ${responseText.substring(0, 200)}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    log(`❌ Request failed:`, error);
    throw error;
  }
}

// ==================== TRANSAKSI ====================

export async function fetchTransaksi(params?: {
  jenis?: string;
  tahun?: string;
  bulan?: string;
}): Promise<any[]> {
  try {
    const query = new URLSearchParams();
    if (params?.jenis) query.append('jenis', params.jenis);
    if (params?.tahun) query.append('tahun', params.tahun);
    if (params?.bulan) query.append('bulan', params.bulan);
    
    const queryString = query.toString();
    const endpoint = `/transaksi${queryString ? '?' + queryString : ''}`;
    
    return await apiRequest<any[]>(endpoint);
  } catch (error) {
    console.warn('Gagal fetch dari API, menggunakan localStorage');
    return getLocalTransaksi();
  }
}

export async function createTransaksi(data: any): Promise<{ id: string; message: string }> {
  try {
    const result = await apiRequest<{ id: string; message: string }>('/transaksi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Sync ke localStorage
    const local = getLocalTransaksi();
    local.push({ ...data, id: result.id, statusBukti: false, createdAt: new Date().toISOString() });
    saveLocalTransaksi(local);
    
    return result;
  } catch (error) {
    console.warn('Gagal create via API, menyimpan ke localStorage');
    const local = getLocalTransaksi();
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    local.push({ ...data, id, statusBukti: false, createdAt: new Date().toISOString() });
    saveLocalTransaksi(local);
    return { id, message: 'Tersimpan di localStorage' };
  }
}

export async function updateTransaksiAPI(id: string, data: any): Promise<{ message: string }> {
  try {
    const result = await apiRequest<{ message: string }>(`/transaksi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Sync ke localStorage
    const local = getLocalTransaksi().map(t => t.id === id ? { ...t, ...data } : t);
    saveLocalTransaksi(local);
    
    return result;
  } catch (error) {
    console.warn('Gagal update via API, update di localStorage');
    const local = getLocalTransaksi().map(t => t.id === id ? { ...t, ...data } : t);
    saveLocalTransaksi(local);
    return { message: 'Updated di localStorage' };
  }
}

export async function deleteTransaksiAPI(id: string): Promise<{ message: string }> {
  try {
    const result = await apiRequest<{ message: string }>(`/transaksi/${id}`, {
      method: 'DELETE',
    });
    
    // Sync ke localStorage
    const local = getLocalTransaksi().filter(t => t.id !== id);
    saveLocalTransaksi(local);
    
    return result;
  } catch (error) {
    console.warn('Gagal delete via API, delete di localStorage');
    const local = getLocalTransaksi().filter(t => t.id !== id);
    saveLocalTransaksi(local);
    return { message: 'Deleted dari localStorage' };
  }
}

// ==================== BUKTI KAS ====================

export async function fetchBuktiKas(): Promise<any[]> {
  try {
    return await apiRequest<any[]>('/bukti-kas');
  } catch (error) {
    console.warn('Gagal fetch bukti kas dari API, menggunakan localStorage');
    return getLocalBuktiKas();
  }
}

export async function createBuktiKas(data: any): Promise<{ id: string; message: string }> {
  try {
    const result = await apiRequest<{ id: string; message: string }>('/bukti-kas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Sync ke localStorage
    const local = getLocalBuktiKas();
    local.push({ ...data, id: result.id, createdAt: new Date().toISOString() });
    saveLocalBuktiKas(local);
    
    return result;
  } catch (error) {
    console.warn('Gagal create bukti kas via API, menyimpan ke localStorage');
    const local = getLocalBuktiKas();
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    local.push({ ...data, id, createdAt: new Date().toISOString() });
    saveLocalBuktiKas(local);
    return { id, message: 'Tersimpan di localStorage' };
  }
}

export async function deleteBuktiKasAPI(id: string): Promise<{ message: string }> {
  try {
    const result = await apiRequest<{ message: string }>(`/bukti-kas/${id}`, {
      method: 'DELETE',
    });
    
    // Sync ke localStorage
    const local = getLocalBuktiKas().filter(b => b.id !== id);
    saveLocalBuktiKas(local);
    
    return result;
  } catch (error) {
    console.warn('Gagal delete bukti kas via API, delete di localStorage');
    const local = getLocalBuktiKas().filter(b => b.id !== id);
    saveLocalBuktiKas(local);
    return { message: 'Deleted dari localStorage' };
  }
}

// ==================== PENGATURAN ====================

export async function fetchPengaturan(): Promise<any> {
  try {
    return await apiRequest<any>('/pengaturan');
  } catch (error) {
    console.warn('Gagal fetch pengaturan dari API, menggunakan localStorage');
    return getLocalPengaturan();
  }
}

export async function updatePengaturan(data: any): Promise<{ message: string }> {
  try {
    const result = await apiRequest<{ message: string }>('/pengaturan', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Sync ke localStorage
    saveLocalPengaturan(data);
    
    return result;
  } catch (error) {
    console.warn('Gagal update pengaturan via API, update di localStorage');
    saveLocalPengaturan(data);
    return { message: 'Updated di localStorage' };
  }
}

// ==================== SALDO ====================

export async function fetchSaldo(tahun?: string): Promise<any> {
  try {
    const query = tahun ? `?tahun=${tahun}` : '';
    return await apiRequest<any>(`/saldo${query}`);
  } catch (error) {
    console.warn('Gagal fetch saldo dari API, menggunakan localStorage');
    return getLocalSaldoAwal();
  }
}

export async function updateSaldo(data: any): Promise<{ message: string }> {
  try {
    const result = await apiRequest<{ message: string }>('/saldo', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Sync ke localStorage
    saveLocalSaldoAwal(data);
    
    return result;
  } catch (error) {
    console.warn('Gagal update saldo via API, update di localStorage');
    saveLocalSaldoAwal(data);
    return { message: 'Updated di localStorage' };
  }
}

// ==================== LAPORAN ====================

export async function fetchLaporanRingkasan(tahun: string, bulan?: string): Promise<any> {
  try {
    const params = new URLSearchParams({ tahun });
    if (bulan) params.append('bulan', bulan);
    return await apiRequest<any>(`/laporan/ringkasan?${params.toString()}`);
  } catch (error) {
    console.warn('Gagal fetch laporan dari API');
    return null;
  }
}

// ==================== HEALTH CHECK ====================

export async function checkHealth(): Promise<{ status: string; message: string }> {
  try {
    log('🔍 Checking API health...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.API_TIMEOUT);
    
    // Gunakan health.php yang lebih sederhana dan robust
    const url = `${API_BASE}/health.php`;
    log(`📡 Health check URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    log(`📥 Health check response: ${response.status} ${response.statusText}`);
    
    // Get response text first
    const responseText = await response.text();
    log(`📝 Response body: ${responseText.substring(0, 200)}`);
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      return { 
        status: 'offline', 
        message: 'API mengembalikan response kosong' 
      };
    }
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      log(`✅ Health check success:`, data);
      return { 
        status: data.status || 'ok', 
        message: data.message || 'API terhubung' 
      };
    } catch (parseError) {
      log(`❌ Failed to parse JSON:`, parseError);
      log(`📄 Raw response:`, responseText);
      
      // Return error with actual response
      return { 
        status: 'error', 
        message: `API tidak mengembalikan JSON valid. Response: ${responseText.substring(0, 100)}` 
      };
    }
  } catch (error) {
    log(`❌ Health check failed:`, error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { status: 'offline', message: 'Request timeout' };
      }
      if (error.message.includes('Failed to fetch')) {
        return { status: 'offline', message: 'Tidak bisa terhubung ke API. Pastikan backend sudah di-upload.' };
      }
      return { status: 'offline', message: error.message };
    }
    
    return { status: 'offline', message: 'API tidak tersedia' };
  }
}

// ==================== SYNC ====================

export async function syncLocalToMySQL(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('🔄 Starting sync to MySQL...');
    console.log('📍 API URL:', `${API_BASE}/sync.php`);
    
    // Prepare all data
    const syncData = {
      transaksi: getLocalTransaksi(),
      bukti_kas: getLocalBuktiKas(),
      pengaturan: getLocalPengaturan(),
      saldo: getLocalSaldoAwal(),
    };
    
    console.log('📦 Data to sync:', {
      transaksi: syncData.transaksi.length,
      bukti_kas: syncData.bukti_kas.length,
      pengaturan: syncData.pengaturan ? 'yes' : 'no',
      saldo: syncData.saldo ? 'yes' : 'no',
    });
    
    // Use dedicated sync endpoint
    const result = await apiRequest<{ success: boolean; message: string; result?: any; error?: string }>('/sync.php', {
      method: 'POST',
      body: JSON.stringify(syncData),
    });
    
    console.log('✅ Sync result:', result);
    
    // Validasi result
    if (!result || typeof result !== 'object') {
      return { success: false, message: 'Sync gagal: Response dari server tidak valid' };
    }
    
    if (result.success) {
      const r = result.result;
      if (!r) {
        return { success: true, message: 'Sync berhasil!', details: null };
      }
      const message = `Sync berhasil! Transaksi: ${r.transaksi?.success || 0}, Bukti Kas: ${r.bukti_kas?.success || 0}`;
      return { success: true, message, details: r };
    } else {
      const errorMsg = result.error || result.message || 'Unknown error dari server';
      return { success: false, message: 'Sync gagal: ' + errorMsg };
    }
  } catch (error) {
    console.error('❌ Sync error:', error);
    
    // Provide detailed error message
    let errorMessage = 'Sync gagal';
    if (error instanceof Error) {
      const errMsg = error.message;
      
      if (errMsg.includes('404')) {
        errorMessage = 'Endpoint /sync.php tidak ditemukan. Pastikan file sync.php sudah di-upload ke folder /api/';
      } else if (errMsg.includes('500')) {
        errorMessage = 'Server error (500). Cek error log di sync_error.log untuk detail.';
      } else if (errMsg.includes('Failed to fetch')) {
        errorMessage = 'Tidak bisa terhubung ke server. Pastikan backend PHP sudah di-upload dan URL API benar.';
      } else if (errMsg.includes('JSON valid')) {
        errorMessage = 'Server tidak mengembalikan JSON valid. Cek error log di sync_error.log.';
      } else if (errMsg.includes('response kosong')) {
        errorMessage = 'Server mengembalikan response kosong. Cek error log di sync_error.log.';
      } else if (errMsg.includes('AbortError') || errMsg.includes('timeout')) {
        errorMessage = 'Request timeout. Server terlalu lama merespons.';
      } else {
        errorMessage = 'Sync gagal: ' + errMsg;
      }
    } else {
      errorMessage = 'Sync gagal: Unknown error';
    }
    
    return { success: false, message: errorMessage };
  }
}
