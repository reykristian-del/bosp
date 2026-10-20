<?php
/**
 * DIRECT DATABASE TEST - Test Koneksi Database Langsung
 * File ini mengakses database langsung tanpa routing
 * URL: https://credo.my.id/bosp/api/direct-db-test.php
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$result = [
    'status' => 'error',
    'message' => 'Testing...',
    'timestamp' => date('Y-m-d H:i:s')
];

try {
    // Load config
    require_once __DIR__ . '/config.php';
    $result['config_loaded'] = true;
    
    // Test database connection
    $db = Database::getInstance()->getConnection();
    $result['database_connected'] = true;
    
    // Test query
    $stmt = $db->query("SELECT COUNT(*) as count FROM transaksi");
    $count = $stmt->fetch()['count'];
    $result['transaksi_count'] = $count;
    
    // Get some data
    $stmt = $db->query("SELECT * FROM transaksi ORDER BY tanggal DESC LIMIT 5");
    $transaksi = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $result['sample_data'] = $transaksi;
    
    // Get pengaturan
    $stmt = $db->query("SELECT * FROM pengaturan LIMIT 1");
    $pengaturan = $stmt->fetch(PDO::FETCH_ASSOC);
    $result['pengaturan'] = $pengaturan;
    
    $result['status'] = 'ok';
    $result['message'] = 'Database connection successful';
    
} catch (Exception $e) {
    $result['status'] = 'error';
    $result['message'] = $e->getMessage();
    $result['error_type'] = get_class($e);
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
