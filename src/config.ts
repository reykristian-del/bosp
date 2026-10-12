/**
 * Konfigurasi Aplikasi
 * Sistem Pembukuan BOSP - SMP Negeri 1 Tulang Bawang Barat
 */

export const APP_CONFIG = {
  // Mode penyimpanan: 'local' atau 'mysql'
  STORAGE_MODE: 'mysql' as 'local' | 'mysql',
  
  // URL Backend API (sesuaikan dengan domain hosting Anda)
  API_BASE_URL: '/api',
  
  // Timeout API dalam milidetik
  API_TIMEOUT: 10000,
  
  // Info Aplikasi
  APP_NAME: 'Sistem Pembukuan BOSP',
  SCHOOL_NAME: 'SMP Negeri 1 Tulang Bawang Barat',
  VERSION: '2.0.0',
};

// Helper untuk cek apakah menggunakan MySQL
export function isMySQLMode(): boolean {
  return APP_CONFIG.STORAGE_MODE === 'mysql';
}

// Helper untuk cek koneksi API
export async function checkAPIConnection(): Promise<boolean> {
  if (!isMySQLMode()) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.API_TIMEOUT);
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API tidak tersedia, menggunakan localStorage sebagai fallback');
    return false;
  }
}
