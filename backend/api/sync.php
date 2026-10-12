<?php
/**
 * Sync Endpoint - Bulk Upload Data
 * Untuk sinkronisasi data dari localStorage ke MySQL
 */

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    $db = Database::getInstance()->getConnection();
    $input = getInput();
    
    $result = [
        'transaksi' => ['success' => 0, 'failed' => 0, 'errors' => []],
        'bukti_kas' => ['success' => 0, 'failed' => 0, 'errors' => []],
        'pengaturan' => ['success' => false, 'error' => null],
        'saldo' => ['success' => false, 'error' => null],
    ];
    
    // Sync Transaksi
    if (isset($input['transaksi']) && is_array($input['transaksi'])) {
        foreach ($input['transaksi'] as $t) {
            try {
                // Check if exists
                $stmt = $db->prepare("SELECT id FROM transaksi WHERE id = ?");
                $stmt->execute([$t['id']]);
                
                if ($stmt->fetch()) {
                    // Update
                    $stmt = $db->prepare("
                        UPDATE transaksi SET 
                            tanggal = ?, no_bukti = ?, uraian = ?, kategori = ?, kode_rekening = ?, 
                            jumlah = ?, pajak = ?, jenis = ?, keterangan = ?, penerima = ?, status_bukti = ?
                        WHERE id = ?
                    ");
                    $stmt->execute([
                        $t['tanggal'], $t['noBukti'] ?? $t['no_bukti'] ?? '',
                        $t['uraian'], $t['kategori'] ?? '', $t['kodeRekening'] ?? $t['kode_rekening'] ?? '',
                        $t['jumlah'], $t['pajak'] ?? 0, $t['jenis'],
                        $t['keterangan'] ?? '', $t['penerima'] ?? '', $t['statusBukti'] ?? $t['status_bukti'] ?? false,
                        $t['id']
                    ]);
                } else {
                    // Insert
                    $stmt = $db->prepare("
                        INSERT INTO transaksi (id, tanggal, no_bukti, uraian, kategori, kode_rekening, jumlah, pajak, jenis, keterangan, penerima, status_bukti)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([
                        $t['id'], $t['tanggal'], $t['noBukti'] ?? $t['no_bukti'] ?? '',
                        $t['uraian'], $t['kategori'] ?? '', $t['kodeRekening'] ?? $t['kode_rekening'] ?? '',
                        $t['jumlah'], $t['pajak'] ?? 0, $t['jenis'],
                        $t['keterangan'] ?? '', $t['penerima'] ?? '', $t['statusBukti'] ?? $t['status_bukti'] ?? false
                    ]);
                }
                $result['transaksi']['success']++;
            } catch (Exception $e) {
                $result['transaksi']['failed']++;
                $result['transaksi']['errors'][] = "ID: {$t['id']} - " . $e->getMessage();
            }
        }
    }
    
    // Sync Bukti Kas
    if (isset($input['bukti_kas']) && is_array($input['bukti_kas'])) {
        foreach ($input['bukti_kas'] as $b) {
            try {
                // Delete old if exists
                $stmt = $db->prepare("DELETE FROM bukti_kas WHERE id = ?");
                $stmt->execute([$b['id']]);
                
                // Insert bukti kas
                $stmt = $db->prepare("
                    INSERT INTO bukti_kas (id, transaksi_id, no_bukti, tanggal, telah_terima_dari, penerima, jumlah_uang, terbilang, untuk_pembayaran, kategori, kode_rekening)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $b['id'],
                    $b['transaksiId'] ?? $b['transaksi_id'] ?? '',
                    $b['noBukti'] ?? $b['no_bukti'] ?? '',
                    $b['tanggal'],
                    $b['telahTerimaDari'] ?? $b['telah_terima_dari'] ?? '',
                    $b['penerima'] ?? '',
                    $b['jumlahUang'] ?? $b['jumlah_uang'] ?? 0,
                    $b['terbilang'] ?? '',
                    $b['untukPembayaran'] ?? $b['untuk_pembayaran'] ?? '',
                    $b['kategori'] ?? '',
                    $b['kodeRekening'] ?? $b['kode_rekening'] ?? '',
                ]);
                
                // Insert items
                if (isset($b['items']) && is_array($b['items'])) {
                    $stmt = $db->prepare("
                        INSERT INTO bukti_kas_item (bukti_kas_id, kode_rekening, uraian, volume, satuan, harga_satuan, pajak, jumlah)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ");
                    foreach ($b['items'] as $item) {
                        $stmt->execute([
                            $b['id'],
                            $item['kodeRekening'] ?? $item['kode_rekening'] ?? '',
                            $item['uraian'] ?? '',
                            $item['volume'] ?? '',
                            $item['satuan'] ?? '',
                            $item['hargaSatuan'] ?? $item['harga_satuan'] ?? 0,
                            $item['pajak'] ?? 0,
                            $item['jumlah'] ?? 0,
                        ]);
                    }
                }
                
                // Insert dokumen pendukung
                if (isset($b['dokumenPendukung']) && is_array($b['dokumenPendukung'])) {
                    $stmt = $db->prepare("INSERT INTO dokumen_pendukung (bukti_kas_id, nama_dokumen) VALUES (?, ?)");
                    foreach ($b['dokumenPendukung'] as $dok) {
                        $stmt->execute([$b['id'], $dok]);
                    }
                }
                
                $result['bukti_kas']['success']++;
            } catch (Exception $e) {
                $result['bukti_kas']['failed']++;
                $result['bukti_kas']['errors'][] = "ID: {$b['id']} - " . $e->getMessage();
            }
        }
    }
    
    // Sync Pengaturan
    if (isset($input['pengaturan'])) {
        try {
            $p = $input['pengaturan'];
            $stmt = $db->query("SELECT id FROM pengaturan ORDER BY id DESC LIMIT 1");
            $existing = $stmt->fetch();
            
            if ($existing) {
                $stmt = $db->prepare("
                    UPDATE pengaturan SET 
                        nama_sekolah = ?, npsn = ?, alamat = ?, kelurahan = ?, kecamatan = ?, kabupaten = ?, 
                        provinsi = ?, kode_pos = ?, telepon = ?, email = ?, kepala_sekolah = ?, nip_kepsek = ?, 
                        bendahara = ?, nip_bendahara = ?, tahun_anggaran = ?, sumber_dana = ?
                    WHERE id = ?
                ");
                $stmt->execute([
                    $p['namaSekolah'] ?? '', $p['npsn'] ?? '', $p['alamat'] ?? '',
                    $p['kelurahan'] ?? '', $p['kecamatan'] ?? '', $p['kabupaten'] ?? '',
                    $p['provinsi'] ?? '', $p['kodePos'] ?? '', $p['telepon'] ?? '',
                    $p['email'] ?? '', $p['kepalaSekolah'] ?? '', $p['nipKepsek'] ?? '',
                    $p['bendahara'] ?? '', $p['nipBendahara'] ?? '', $p['tahunAnggaran'] ?? '',
                    $p['sumberDana'] ?? '', $existing['id']
                ]);
            } else {
                $stmt = $db->prepare("
                    INSERT INTO pengaturan (nama_sekolah, npsn, alamat, kelurahan, kecamatan, kabupaten, provinsi, kode_pos, telepon, email, kepala_sekolah, nip_kepsek, bendahara, nip_bendahara, tahun_anggaran, sumber_dana)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $p['namaSekolah'] ?? '', $p['npsn'] ?? '', $p['alamat'] ?? '',
                    $p['kelurahan'] ?? '', $p['kecamatan'] ?? '', $p['kabupaten'] ?? '',
                    $p['provinsi'] ?? '', $p['kodePos'] ?? '', $p['telepon'] ?? '',
                    $p['email'] ?? '', $p['kepalaSekolah'] ?? '', $p['nipKepsek'] ?? '',
                    $p['bendahara'] ?? '', $p['nipBendahara'] ?? '', $p['tahunAnggaran'] ?? '',
                    $p['sumberDana'] ?? ''
                ]);
            }
            $result['pengaturan']['success'] = true;
        } catch (Exception $e) {
            $result['pengaturan']['error'] = $e->getMessage();
        }
    }
    
    // Sync Saldo
    if (isset($input['saldo'])) {
        try {
            $s = $input['saldo'];
            $tahun = $s['tahun_anggaran'] ?? date('Y');
            
            $stmt = $db->prepare("SELECT id FROM saldo_awal WHERE tahun_anggaran = ?");
            $stmt->execute([$tahun]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                $stmt = $db->prepare("UPDATE saldo_awal SET tanggal = ?, jumlah = ?, keterangan = ? WHERE id = ?");
                $stmt->execute([$s['tanggal'], $s['jumlah'], $s['keterangan'] ?? '', $existing['id']]);
            } else {
                $stmt = $db->prepare("INSERT INTO saldo_awal (tanggal, jumlah, keterangan, tahun_anggaran) VALUES (?, ?, ?, ?)");
                $stmt->execute([$s['tanggal'], $s['jumlah'], $s['keterangan'] ?? '', $tahun]);
            }
            $result['saldo']['success'] = true;
        } catch (Exception $e) {
            $result['saldo']['error'] = $e->getMessage();
        }
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Sync berhasil',
        'result' => $result,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    jsonResponse([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], 500);
}
