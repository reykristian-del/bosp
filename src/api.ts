/**
 * API Service - Koneksi ke Backend PHP/MySQL
 * Sistem Pembukuan BOSP - SMP Negeri 1 Tulang Bawang Barat
 * 
 * Untuk mengaktifkan koneksi MySQL:
 * 1. Setup backend PHP (lihat folder backend/)
 * 2. Ubah USE_API menjadi true
 * 3. Sesuaikan API_BASE_URL dengan URL backend Anda
 */

const USE_API = false; // Ubah ke true untuk menggunakan MySQL
const API_BASE_URL = 'http://localhost/bosp-backend/api';

// Helper function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Transaksi API
export const TransaksiAPI = {
  getAll: (params?: { jenis?: string; tahun?: string; bulan?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/transaksi${query ? '?' + query : ''}`);
  },
  
  getById: (id: string) => apiRequest(`/transaksi/${id}`),
  
  create: (data: any) => apiRequest('/transaksi', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => apiRequest(`/transaksi/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => apiRequest(`/transaksi/${id}`, {
    method: 'DELETE',
  }),
};

// Bukti Kas API
export const BuktiKasAPI = {
  getAll: () => apiRequest('/bukti-kas'),
  
  getById: (id: string) => apiRequest(`/bukti-kas/${id}`),
  
  create: (data: any) => apiRequest('/bukti-kas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => apiRequest(`/bukti-kas/${id}`, {
    method: 'DELETE',
  }),
};

// Pengaturan API
export const PengaturanAPI = {
  get: () => apiRequest('/pengaturan'),
  
  update: (data: any) => apiRequest('/pengaturan', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Saldo API
export const SaldoAPI = {
  get: (tahun?: string) => apiRequest(`/saldo${tahun ? '?tahun=' + tahun : ''}`),
  
  update: (data: any) => apiRequest('/saldo', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Laporan API
export const LaporanAPI = {
  ringkasan: (tahun: string, bulan?: string) => {
    const params = new URLSearchParams({ tahun });
    if (bulan) params.append('bulan', bulan);
    return apiRequest(`/laporan/ringkasan?${params.toString()}`);
  },
  
  kategori: (tahun: string, bulan?: string) => {
    const params = new URLSearchParams({ tahun });
    if (bulan) params.append('bulan', bulan);
    return apiRequest(`/laporan/kategori?${params.toString()}`);
  },
  
  bulanan: (tahun: string) => apiRequest(`/laporan/bulanan?tahun=${tahun}`),
};

// Check if API mode is enabled
export function isApiMode(): boolean {
  return USE_API;
}
