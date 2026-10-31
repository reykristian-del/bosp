<?php
/**
 * Health Check Endpoint
 * Simple endpoint untuk test koneksi API dan database
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize response
$response = [
    'status' => 'ok',
    'message' => 'API health check',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'checks' => []
];

// Check 1: PHP is working
$response['checks']['php'] = [
    'status' => 'ok',
    'message' => 'PHP is running'
];

// Check 2: Config file
try {
    require_once __DIR__ . '/config.php';
    $response['checks']['config'] = [
        'status' => 'ok',
        'message' => 'Config loaded'
    ];
} catch (Exception $e) {
    $response['checks']['config'] = [
        'status' => 'error',
        'message' => 'Config error: ' . $e->getMessage()
    ];
    $response['status'] = 'error';
    $response['message'] = 'Config file error';
    
    http_response_code(500);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

// Check 3: Database connection
try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT 1 as test");
    $result = $stmt->fetch();
    
    $response['checks']['database'] = [
        'status' => 'ok',
        'message' => 'Database connected'
    ];
    
    // Check 4: Tables exist
    try {
        $stmt = $db->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $response['checks']['tables'] = [
            'status' => 'ok',
            'message' => count($tables) . ' tables found',
            'tables' => $tables
        ];
        
        // Check 5: Count transaksi
        $stmt = $db->query("SELECT COUNT(*) as count FROM transaksi");
        $count = $stmt->fetch()['count'];
        
        $response['checks']['transaksi'] = [
            'status' => 'ok',
            'message' => $count . ' transaksi records'
        ];
        
    } catch (Exception $e) {
        $response['checks']['tables'] = [
            'status' => 'error',
            'message' => 'Table check error: ' . $e->getMessage()
        ];
    }
    
} catch (Exception $e) {
    $response['checks']['database'] = [
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ];
    $response['status'] = 'error';
    $response['message'] = 'Database connection failed';
    
    http_response_code(500);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

$response['message'] = 'All checks passed';

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
