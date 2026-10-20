<?php
/**
 * DIRECT ACCESS - Test Koneksi Database
 * File ini bisa diakses langsung tanpa routing
 * URL: https://credo.my.id/bosp/api/direct-test.php
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'ok',
    'message' => 'PHP is working',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'file' => __FILE__,
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
