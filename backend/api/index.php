<?php
/**
 * API Router - Simplified Version
 * Lebih robust untuk subfolder /bosp/api/
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load config
try {
    require_once __DIR__ . '/config.php';
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to load config: ' . $e->getMessage()
    ]);
    exit();
}

// Get request path
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove base path (/bosp/api or /api)
$path = preg_replace('#^/bosp/api#', '', $path);
$path = preg_replace('#^/api#', '', $path);
$path = trim($path, '/');

// Get HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get database connection
try {
    $db = Database::getInstance()->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

// Route requests
try {
    // Health check
    if ($path === 'health' || $path === 'health/') {
        echo json_encode([
            'status' => 'ok',
            'message' => 'API is working',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
    
    // Transaksi endpoints
    if (preg_match('#^transaksi/?$#', $path)) {
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM transaksi ORDER BY tanggal DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
            exit();
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                exit();
            }
            
            $stmt = $db->prepare("
                INSERT INTO transaksi (id, tanggal, no_bukti, uraian, kategori, kode_rekening, jumlah, pajak, jenis, keterangan, penerima, status_bukti, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $input['id'] ?? uniqid(),
                $input['tanggal'],
                $input['noBukti'] ?? '',
                $input['uraian'],
                $input['kategori'] ?? '',
                $input['kodeRekening'] ?? '',
                $input['jumlah'],
                $input['pajak'] ?? 0,
                $input['jenis'],
                $input['keterangan'] ?? '',
                $input['penerima'] ?? '',
                $input['statusBukti'] ?? false
            ]);
            
            echo json_encode(['success' => true, 'id' => $input['id'] ?? 'created']);
            exit();
        }
    }
    
    // Transaksi by ID
    if (preg_match('#^transaksi/([a-zA-Z0-9]+)$#', $path, $matches)) {
        $id = $matches[1];
        
        if ($method === 'GET') {
            $stmt = $db->prepare("SELECT * FROM transaksi WHERE id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$data) {
                http_response_code(404);
                echo json_encode(['error' => 'Transaksi not found']);
                exit();
            }
            
            echo json_encode($data);
            exit();
        } elseif ($method === 'PUT') {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                exit();
            }
            
            $fields = [];
            $values = [];
            
            foreach ($input as $key => $value) {
                $dbKey = $key;
                // Convert camelCase to snake_case
                if ($key === 'noBukti') $dbKey = 'no_bukti';
                elseif ($key === 'kodeRekening') $dbKey = 'kode_rekening';
                elseif ($key === 'statusBukti') $dbKey = 'status_bukti';
                
                $fields[] = "$dbKey = ?";
                $values[] = $value;
            }
            
            $values[] = $id;
            $sql = "UPDATE transaksi SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($values);
            
            echo json_encode(['success' => true]);
            exit();
        } elseif ($method === 'DELETE') {
            $stmt = $db->prepare("DELETE FROM transaksi WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
            exit();
        }
    }
    
    // Bukti Kas endpoints
    if (preg_match('#^bukti-kas/?$#', $path)) {
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM bukti_kas ORDER BY tanggal DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get items for each bukti kas
            foreach ($data as &$bukti) {
                $stmt = $db->prepare("SELECT * FROM bukti_kas_item WHERE bukti_kas_id = ?");
                $stmt->execute([$bukti['id']]);
                $bukti['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $stmt = $db->prepare("SELECT nama_dokumen FROM dokumen_pendukung WHERE bukti_kas_id = ?");
                $stmt->execute([$bukti['id']]);
                $bukti['dokumenPendukung'] = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'nama_dokumen');
            }
            
            echo json_encode($data);
            exit();
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                exit();
            }
            
            $stmt = $db->prepare("
                INSERT INTO bukti_kas (id, transaksi_id, no_bukti, tanggal, telah_terima_dari, penerima, jumlah_uang, terbilang, untuk_pembayaran, kategori, kode_rekening, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $input['id'] ?? uniqid(),
                $input['transaksiId'] ?? '',
                $input['noBukti'] ?? '',
                $input['tanggal'],
                $input['telahTerimaDari'] ?? '',
                $input['penerima'] ?? '',
                $input['jumlahUang'],
                $input['terbilang'] ?? '',
                $input['untukPembayaran'] ?? '',
                $input['kategori'] ?? '',
                $input['kodeRekening'] ?? ''
            ]);
            
            // Insert items
            if (isset($input['items'])) {
                $stmt = $db->prepare("
                    INSERT INTO bukti_kas_item (bukti_kas_id, kode_rekening, uraian, volume, satuan, harga_satuan, pajak, jumlah)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                foreach ($input['items'] as $item) {
                    $stmt->execute([
                        $input['id'],
                        $item['kodeRekening'] ?? '',
                        $item['uraian'] ?? '',
                        $item['volume'] ?? '',
                        $item['satuan'] ?? '',
                        $item['hargaSatuan'] ?? 0,
                        $item['pajak'] ?? 0,
                        $item['jumlah'] ?? 0
                    ]);
                }
            }
            
            // Insert dokumen pendukung
            if (isset($input['dokumenPendukung'])) {
                $stmt = $db->prepare("INSERT INTO dokumen_pendukung (bukti_kas_id, nama_dokumen) VALUES (?, ?)");
                foreach ($input['dokumenPendukung'] as $dok) {
                    $stmt->execute([$input['id'], $dok]);
                }
            }
            
            echo json_encode(['success' => true, 'id' => $input['id'] ?? 'created']);
            exit();
        }
    }
    
    // Pengaturan endpoints
    if (preg_match('#^pengaturan/?$#', $path)) {
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM pengaturan LIMIT 1");
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($data ?: []);
            exit();
        } elseif ($method === 'PUT') {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                exit();
            }
            
            // Check if exists
            $stmt = $db->query("SELECT id FROM pengaturan LIMIT 1");
            $existing = $stmt->fetch();
            
            if ($existing) {
                $fields = [];
                $values = [];
                
                foreach ($input as $key => $value) {
                    $dbKey = $key;
                    // Convert camelCase to snake_case
                    if ($key === 'namaSekolah') $dbKey = 'nama_sekolah';
                    elseif ($key === 'kepalaSekolah') $dbKey = 'kepala_sekolah';
                    elseif ($key === 'nipKepsek') $dbKey = 'nip_kepsek';
                    elseif ($key === 'nipBendahara') $dbKey = 'nip_bendahara';
                    elseif ($key === 'tahunAnggaran') $dbKey = 'tahun_anggaran';
                    elseif ($key === 'sumberDana') $dbKey = 'sumber_dana';
                    elseif ($key === 'kodePos') $dbKey = 'kode_pos';
                    
                    $fields[] = "$dbKey = ?";
                    $values[] = $value;
                }
                
                $values[] = $existing['id'];
                $sql = "UPDATE pengaturan SET " . implode(', ', $fields) . " WHERE id = ?";
                $stmt = $db->prepare($sql);
                $stmt->execute($values);
            } else {
                $stmt = $db->prepare("
                    INSERT INTO pengaturan (nama_sekolah, npsn, alamat, kelurahan, kecamatan, kabupaten, provinsi, kode_pos, telepon, email, kepala_sekolah, nip_kepsek, bendahara, nip_bendahara, tahun_anggaran, sumber_dana)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $input['namaSekolah'] ?? '',
                    $input['npsn'] ?? '',
                    $input['alamat'] ?? '',
                    $input['kelurahan'] ?? '',
                    $input['kecamatan'] ?? '',
                    $input['kabupaten'] ?? '',
                    $input['provinsi'] ?? '',
                    $input['kodePos'] ?? '',
                    $input['telepon'] ?? '',
                    $input['email'] ?? '',
                    $input['kepalaSekolah'] ?? '',
                    $input['nipKepsek'] ?? '',
                    $input['bendahara'] ?? '',
                    $input['nipBendahara'] ?? '',
                    $input['tahunAnggaran'] ?? '',
                    $input['sumberDana'] ?? ''
                ]);
            }
            
            echo json_encode(['success' => true]);
            exit();
        }
    }
    
    // Saldo endpoints
    if (preg_match('#^saldo/?$#', $path)) {
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM saldo_awal ORDER BY id DESC LIMIT 1");
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($data ?: ['jumlah' => 0]);
            exit();
        } elseif ($method === 'PUT') {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                exit();
            }
            
            $stmt = $db->prepare("
                INSERT INTO saldo_awal (tanggal, jumlah, keterangan, tahun_anggaran)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE tanggal = VALUES(tanggal), jumlah = VALUES(jumlah), keterangan = VALUES(keterangan)
            ");
            $stmt->execute([
                $input['tanggal'],
                $input['jumlah'],
                $input['keterangan'] ?? '',
                $input['tahunAnggaran'] ?? date('Y')
            ]);
            
            echo json_encode(['success' => true]);
            exit();
        }
    }
    
    // 404 - Endpoint not found
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'Endpoint not found',
        'path' => $path,
        'method' => $method
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'path' => $path
    ]);
}
