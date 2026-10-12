-- ============================================
-- DATABASE BOSP - SMP NEGERI 1 TULANG BAWANG BARAT
-- Schema untuk MySQL/MariaDB
-- ============================================

CREATE DATABASE IF NOT EXISTS bosp_smpn1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bosp_smpn1;

-- Tabel Pengaturan Sekolah
CREATE TABLE IF NOT EXISTS pengaturan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_sekolah VARCHAR(200) NOT NULL,
    npsn VARCHAR(20),
    alamat TEXT,
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    kode_pos VARCHAR(10),
    telepon VARCHAR(20),
    email VARCHAR(100),
    kepala_sekolah VARCHAR(200),
    nip_kepsek VARCHAR(20),
    bendahara VARCHAR(200),
    nip_bendahara VARCHAR(20),
    tahun_anggaran VARCHAR(4),
    sumber_dana VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel Saldo Awal
CREATE TABLE IF NOT EXISTS saldo_awal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL,
    jumlah DECIMAL(18,2) NOT NULL DEFAULT 0,
    keterangan TEXT,
    tahun_anggaran VARCHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel Transaksi
CREATE TABLE IF NOT EXISTS transaksi (
    id VARCHAR(50) PRIMARY KEY,
    tanggal DATE NOT NULL,
    no_bukti VARCHAR(50) NOT NULL,
    uraian TEXT NOT NULL,
    kategori VARCHAR(200),
    kode_rekening VARCHAR(20),
    jumlah DECIMAL(18,2) NOT NULL DEFAULT 0,
    pajak DECIMAL(18,2) DEFAULT 0,
    jenis ENUM('masuk', 'keluar') NOT NULL,
    keterangan TEXT,
    penerima VARCHAR(200),
    status_bukti BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tanggal (tanggal),
    INDEX idx_jenis (jenis),
    INDEX idx_kategori (kategori),
    INDEX idx_status_bukti (status_bukti)
) ENGINE=InnoDB;

-- Tabel Bukti Kas Pengeluaran
CREATE TABLE IF NOT EXISTS bukti_kas (
    id VARCHAR(50) PRIMARY KEY,
    transaksi_id VARCHAR(50) NOT NULL,
    no_bukti VARCHAR(50) NOT NULL,
    tanggal DATE NOT NULL,
    telah_terima_dari VARCHAR(200),
    penerima VARCHAR(200),
    jumlah_uang DECIMAL(18,2) NOT NULL DEFAULT 0,
    terbilang TEXT,
    untuk_pembayaran TEXT,
    kategori VARCHAR(200),
    kode_rekening VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
    INDEX idx_tanggal (tanggal),
    INDEX idx_no_bukti (no_bukti)
) ENGINE=InnoDB;

-- Tabel Item Bukti Kas
CREATE TABLE IF NOT EXISTS bukti_kas_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bukti_kas_id VARCHAR(50) NOT NULL,
    kode_rekening VARCHAR(20),
    uraian TEXT NOT NULL,
    volume VARCHAR(50),
    satuan VARCHAR(50),
    harga_satuan DECIMAL(18,2) NOT NULL DEFAULT 0,
    pajak DECIMAL(18,2) DEFAULT 0,
    jumlah DECIMAL(18,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (bukti_kas_id) REFERENCES bukti_kas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabel Dokumen Pendukung
CREATE TABLE IF NOT EXISTS dokumen_pendukung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bukti_kas_id VARCHAR(50) NOT NULL,
    nama_dokumen VARCHAR(200) NOT NULL,
    file_path VARCHAR(500),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bukti_kas_id) REFERENCES bukti_kas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabel Users (untuk autentikasi)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(200),
    role ENUM('admin', 'bendahara', 'kepsek') DEFAULT 'bendahara',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel Log Aktivitas
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Data awal pengaturan
INSERT INTO pengaturan (nama_sekolah, kecamatan, kabupaten, provinsi, tahun_anggaran, sumber_dana) 
VALUES ('SMP NEGERI 1 TULANG BAWANG BARAT', 'Tulang Bawang Barat', 'Tulang Bawang Barat', 'Lampung', '2026', 'Dana BOSP');

-- Data user default (password: admin123 - hash bcrypt)
INSERT INTO users (username, password, nama_lengkap, role) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2SlGFWSOwWi', 'Administrator', 'admin');
