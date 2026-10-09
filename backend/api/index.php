<?php
/**
 * API Router - Sistem Pembukuan BOSP
 * SMP Negeri 1 Tulang Bawang Barat
 * 
 * Endpoint:
 * GET    /api/transaksi          - List semua transaksi
 * POST   /api/transaksi          - Tambah transaksi
 * PUT    /api/transaksi/{id}     - Update transaksi
 * DELETE /api/transaksi/{id}     - Hapus transaksi
 * 
 * GET    /api/bukti-kas          - List semua bukti kas
 * POST   /api/bukti-kas          - Buat bukti kas
 * DELETE /api/bukti-kas/{id}     - Hapus bukti kas
 * 
 * GET    /api/pengaturan         - Ambil pengaturan
 * PUT    /api/pengaturan         - Update pengaturan
 * 
 * GET    /api/saldo              - Ambil saldo awal
 * PUT    /api/saldo              - Update saldo awal
 * 
 * GET    /api/laporan/ringkasan  - Laporan ringkasan
 * GET    /api/laporan/kategori   - Laporan per kategori
 * GET    /api/laporan/bulanan    - Laporan per bulan
 */

require_once __DIR__ . '/config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Simple router
$path = preg_replace('#^/api#', '', $path);
$path = rtrim($path, '/');
$segments = explode('/', trim($path, '/'));

$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;
$action = $segments[1] ?? null;

try {
    switch ($resource) {
        case 'transaksi':
            handleTransaksi($db, $method, $id);
            break;
        case 'bukti-kas':
            handleBuktiKas($db, $method, $id);
            break;
        case 'pengaturan':
            handlePengaturan($db, $method);
            break;
        case 'saldo':
            handleSaldo($db, $method);
            break;
        case 'laporan':
            handleLaporan($db, $method, $action);
            break;
        default:
            jsonResponse(['message' => 'API Sistem Pembukuan BOSP - SMP Negeri 1 Tulang Bawang Barat', 'version' => '1.0']);
    }
} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}

/**
 * Handle Transaksi endpoints
 */
function handleTransaksi($db, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $db->prepare("SELECT * FROM transaksi WHERE id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetch();
                if (!$result) jsonResponse(['error' => 'Transaksi tidak ditemukan'], 404);
                jsonResponse($result);
            } else {
                $where = "1=1";
                $params = [];
                
                if (isset($_GET['jenis'])) {
                    $where .= " AND jenis = ?";
                    $params[] = $_GET['jenis'];
                }
                if (isset($_GET['tahun'])) {
                    $where .= " AND YEAR(tanggal) = ?";
                    $params[] = $_GET['tahun'];
                }
                if (isset($_GET['bulan'])) {
                    $where .= " AND MONTH(tanggal) = ?";
                    $params[] = $_GET['bulan'];
                }
                if (isset($_GET['status_bukti'])) {
                    $where .= " AND status_bukti = ?";
                    $params[] = $_GET['status_bukti'];
                }
                
                $stmt = $db->prepare("SELECT * FROM transaksi WHERE $where ORDER BY tanggal DESC");
                $stmt->execute($params);
                jsonResponse($stmt->fetchAll());
            }
            break;
            
        case 'POST':
            $input = getInput();
            validateRequired($input, ['tanggal', 'no_bukti', 'uraian', 'jenis', 'jumlah']);
            
            $id = generateId();
            $stmt = $db->prepare("
                INSERT INTO transaksi (id, tanggal, no_bukti, uraian, kategori, kode_rekening, jumlah, jenis, keterangan, penerima, status_bukti)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
            ");
            $stmt->execute([
                $id,
                $input['tanggal'],
                $input['no_bukti'],
                $input['uraian'],
                $input['kategori'] ?? '',
                $input['kode_rekening'] ?? '',
                $input['jumlah'],
                $input['jenis'],
                $input['keterangan'] ?? '',
                $input['penerima'] ?? '',
            ]);
            
            jsonResponse(['id' => $id, 'message' => 'Transaksi berhasil ditambahkan'], 201);
            break;
            
        case 'PUT':
            if (!$id) jsonResponse(['error' => 'ID diperlukan'], 400);
            $input = getInput();
            
            $fields = [];
            $params = [];
            $allowed = ['tanggal', 'no_bukti', 'uraian', 'kategori', 'kode_rekening', 'jumlah', 'jenis', 'keterangan', 'penerima', 'status_bukti'];
            
            foreach ($allowed as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            if (empty($fields)) jsonResponse(['error' => 'Tidak ada data untuk diupdate'], 400);
            
            $params[] = $id;
            $stmt = $db->prepare("UPDATE transaksi SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($params);
            
            jsonResponse(['message' => 'Transaksi berhasil diupdate']);
            break;
            
        case 'DELETE':
            if (!$id) jsonResponse(['error' => 'ID diperlukan'], 400);
            $stmt = $db->prepare("DELETE FROM transaksi WHERE id = ?");
            $stmt->execute([$id]);
            jsonResponse(['message' => 'Transaksi berhasil dihapus']);
            break;
            
        default:
            jsonResponse(['error' => 'Method tidak didukung'], 405);
    }
}

/**
 * Handle Bukti Kas endpoints
 */
function handleBuktiKas($db, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $db->prepare("SELECT * FROM bukti_kas WHERE id = ?");
                $stmt->execute([$id]);
                $bukti = $stmt->fetch();
                if (!$bukti) jsonResponse(['error' => 'Bukti kas tidak ditemukan'], 404);
                
                // Get items
                $stmt = $db->prepare("SELECT * FROM bukti_kas_item WHERE bukti_kas_id = ?");
                $stmt->execute([$id]);
                $bukti['items'] = $stmt->fetchAll();
                
                // Get dokumen
                $stmt = $db->prepare("SELECT * FROM dokumen_pendukung WHERE bukti_kas_id = ?");
                $stmt->execute([$id]);
                $bukti['dokumen'] = $stmt->fetchAll();
                
                jsonResponse($bukti);
            } else {
                $stmt = $db->query("SELECT * FROM bukti_kas ORDER BY tanggal DESC");
                jsonResponse($stmt->fetchAll());
            }
            break;
            
        case 'POST':
            $input = getInput();
            validateRequired($input, ['transaksi_id', 'no_bukti', 'tanggal', 'jumlah_uang']);
            
            $id = generateId();
            
            // Insert bukti kas
            $stmt = $db->prepare("
                INSERT INTO bukti_kas (id, transaksi_id, no_bukti, tanggal, telah_terima_dari, jumlah_uang, terbilang, untuk_pembayaran, kategori, kode_rekening)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $input['transaksi_id'],
                $input['no_bukti'],
                $input['tanggal'],
                $input['telah_terima_dari'] ?? '',
                $input['jumlah_uang'],
                $input['terbilang'] ?? '',
                $input['untuk_pembayaran'] ?? '',
                $input['kategori'] ?? '',
                $input['kode_rekening'] ?? '',
            ]);
            
            // Insert items
            if (isset($input['items']) && is_array($input['items'])) {
                $stmt = $db->prepare("
                    INSERT INTO bukti_kas_item (bukti_kas_id, uraian, volume, satuan, harga_satuan, jumlah)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                foreach ($input['items'] as $item) {
                    $stmt->execute([
                        $id,
                        $item['uraian'] ?? '',
                        $item['volume'] ?? '',
                        $item['satuan'] ?? '',
                        $item['harga_satuan'] ?? 0,
                        $item['jumlah'] ?? 0,
                    ]);
                }
            }
            
            // Insert dokumen pendukung
            if (isset($input['dokumen_pendukung']) && is_array($input['dokumen_pendukung'])) {
                $stmt = $db->prepare("INSERT INTO dokumen_pendukung (bukti_kas_id, nama_dokumen) VALUES (?, ?)");
                foreach ($input['dokumen_pendukung'] as $dok) {
                    $stmt->execute([$id, $dok]);
                }
            }
            
            // Update status transaksi
            $stmt = $db->prepare("UPDATE transaksi SET status_bukti = TRUE WHERE id = ?");
            $stmt->execute([$input['transaksi_id']]);
            
            jsonResponse(['id' => $id, 'message' => 'Bukti kas berhasil dibuat'], 201);
            break;
            
        case 'DELETE':
            if (!$id) jsonResponse(['error' => 'ID diperlukan'], 400);
            
            // Get bukti kas to update transaksi status
            $stmt = $db->prepare("SELECT transaksi_id FROM bukti_kas WHERE id = ?");
            $stmt->execute([$id]);
            $bukti = $stmt->fetch();
            
            $stmt = $db->prepare("DELETE FROM bukti_kas WHERE id = ?");
            $stmt->execute([$id]);
            
            // Reset status transaksi
            if ($bukti) {
                $stmt = $db->prepare("UPDATE transaksi SET status_bukti = FALSE WHERE id = ?");
                $stmt->execute([$bukti['transaksi_id']]);
            }
            
            jsonResponse(['message' => 'Bukti kas berhasil dihapus']);
            break;
            
        default:
            jsonResponse(['error' => 'Method tidak didukung'], 405);
    }
}

/**
 * Handle Pengaturan endpoints
 */
function handlePengaturan($db, $method) {
    switch ($method) {
        case 'GET':
            $stmt = $db->query("SELECT * FROM pengaturan ORDER BY id DESC LIMIT 1");
            $result = $stmt->fetch();
            jsonResponse($result ?: []);
            break;
            
        case 'PUT':
            $input = getInput();
            $stmt = $db->query("SELECT id FROM pengaturan ORDER BY id DESC LIMIT 1");
            $existing = $stmt->fetch();
            
            if ($existing) {
                $fields = [];
                $params = [];
                $allowed = ['nama_sekolah', 'npsn', 'alamat', 'kelurahan', 'kecamatan', 'kabupaten', 'provinsi', 'kode_pos', 'telepon', 'email', 'kepala_sekolah', 'nip_kepsek', 'bendahara', 'nip_bendahara', 'tahun_anggaran', 'sumber_dana'];
                
                foreach ($allowed as $field) {
                    if (isset($input[$field])) {
                        $fields[] = "$field = ?";
                        $params[] = $input[$field];
                    }
                }
                
                if (!empty($fields)) {
                    $params[] = $existing['id'];
                    $stmt = $db->prepare("UPDATE pengaturan SET " . implode(', ', $fields) . " WHERE id = ?");
                    $stmt->execute($params);
                }
            } else {
                $stmt = $db->prepare("
                    INSERT INTO pengaturan (nama_sekolah, npsn, alamat, kelurahan, kecamatan, kabupaten, provinsi, kode_pos, telepon, email, kepala_sekolah, nip_kepsek, bendahara, nip_bendahara, tahun_anggaran, sumber_dana)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $input['nama_sekolah'] ?? '',
                    $input['npsn'] ?? '',
                    $input['alamat'] ?? '',
                    $input['kelurahan'] ?? '',
                    $input['kecamatan'] ?? '',
                    $input['kabupaten'] ?? '',
                    $input['provinsi'] ?? '',
                    $input['kode_pos'] ?? '',
                    $input['telepon'] ?? '',
                    $input['email'] ?? '',
                    $input['kepala_sekolah'] ?? '',
                    $input['nip_kepsek'] ?? '',
                    $input['bendahara'] ?? '',
                    $input['nip_bendahara'] ?? '',
                    $input['tahun_anggaran'] ?? '',
                    $input['sumber_dana'] ?? '',
                ]);
            }
            
            jsonResponse(['message' => 'Pengaturan berhasil disimpan']);
            break;
            
        default:
            jsonResponse(['error' => 'Method tidak didukung'], 405);
    }
}

/**
 * Handle Saldo endpoints
 */
function handleSaldo($db, $method) {
    switch ($method) {
        case 'GET':
            $tahun = $_GET['tahun'] ?? date('Y');
            $stmt = $db->prepare("SELECT * FROM saldo_awal WHERE tahun_anggaran = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$tahun]);
            $result = $stmt->fetch();
            jsonResponse($result ?: ['jumlah' => 0]);
            break;
            
        case 'PUT':
            $input = getInput();
            $tahun = $input['tahun_anggaran'] ?? date('Y');
            
            // Check if exists
            $stmt = $db->prepare("SELECT id FROM saldo_awal WHERE tahun_anggaran = ?");
            $stmt->execute([$tahun]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                $stmt = $db->prepare("UPDATE saldo_awal SET tanggal = ?, jumlah = ?, keterangan = ? WHERE id = ?");
                $stmt->execute([$input['tanggal'], $input['jumlah'], $input['keterangan'] ?? '', $existing['id']]);
            } else {
                $stmt = $db->prepare("INSERT INTO saldo_awal (tanggal, jumlah, keterangan, tahun_anggaran) VALUES (?, ?, ?, ?)");
                $stmt->execute([$input['tanggal'], $input['jumlah'], $input['keterangan'] ?? '', $tahun]);
            }
            
            jsonResponse(['message' => 'Saldo berhasil disimpan']);
            break;
            
        default:
            jsonResponse(['error' => 'Method tidak didukung'], 405);
    }
}

/**
 * Handle Laporan endpoints
 */
function handleLaporan($db, $method, $action) {
    if ($method !== 'GET') {
        jsonResponse(['error' => 'Method tidak didukung'], 405);
    }
    
    $tahun = $_GET['tahun'] ?? date('Y');
    $bulan = $_GET['bulan'] ?? null;
    
    switch ($action) {
        case 'ringkasan':
            $where = "YEAR(tanggal) = ?";
            $params = [$tahun];
            if ($bulan) {
                $where .= " AND MONTH(tanggal) = ?";
                $params[] = $bulan;
            }
            
            // Get saldo
            $stmt = $db->prepare("SELECT jumlah FROM saldo_awal WHERE tahun_anggaran = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$tahun]);
            $saldo = $stmt->fetch();
            $saldoAwal = $saldo ? $saldo['jumlah'] : 0;
            
            // Get totals
            $stmt = $db->prepare("SELECT 
                SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE 0 END) as total_masuk,
                SUM(CASE WHEN jenis = 'keluar' THEN jumlah ELSE 0 END) as total_keluar,
                COUNT(*) as total_transaksi
                FROM transaksi WHERE $where");
            $stmt->execute($params);
            $totals = $stmt->fetch();
            
            jsonResponse([
                'saldo_awal' => (float)$saldoAwal,
                'total_masuk' => (float)($totals['total_masuk'] ?? 0),
                'total_keluar' => (float)($totals['total_keluar'] ?? 0),
                'saldo_akhir' => (float)$saldoAwal + (float)($totals['total_masuk'] ?? 0) - (float)($totals['total_keluar'] ?? 0),
                'total_transaksi' => (int)($totals['total_transaksi'] ?? 0),
            ]);
            break;
            
        case 'kategori':
            $where = "jenis = 'keluar' AND YEAR(tanggal) = ?";
            $params = [$tahun];
            if ($bulan) {
                $where .= " AND MONTH(tanggal) = ?";
                $params[] = $bulan;
            }
            
            $stmt = $db->prepare("SELECT 
                kategori,
                COUNT(*) as jumlah_transaksi,
                SUM(jumlah) as total
                FROM transaksi WHERE $where
                GROUP BY kategori ORDER BY total DESC");
            $stmt->execute($params);
            jsonResponse($stmt->fetchAll());
            break;
            
        case 'bulanan':
            $stmt = $db->prepare("SELECT 
                MONTH(tanggal) as bulan,
                SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE 0 END) as pemasukan,
                SUM(CASE WHEN jenis = 'keluar' THEN jumlah ELSE 0 END) as pengeluaran
                FROM transaksi WHERE YEAR(tanggal) = ?
                GROUP BY MONTH(tanggal) ORDER BY bulan");
            $stmt->execute([$tahun]);
            jsonResponse($stmt->fetchAll());
            break;
            
        default:
            jsonResponse(['error' => 'Action tidak valid'], 400);
    }
}
