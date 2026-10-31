<?php
/**
 * Debug Script - Diagnosa Error 500
 * Upload file ini ke folder /api/ di hosting Anda
 * Akses via: https://credo.my.id/bosp/api/debug.php
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug Error 500 - BOSP</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 30px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #dc2626;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 10px;
        }
        h2 {
            color: #1e40af;
            margin-top: 30px;
        }
        .test-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #fafafa;
        }
        .success {
            background: #d1fae5;
            border-color: #10b981;
        }
        .error {
            background: #fee2e2;
            border-color: #ef4444;
        }
        .warning {
            background: #fef3c7;
            border-color: #f59e0b;
        }
        .info {
            background: #dbeafe;
            border-color: #3b82f6;
        }
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-size: 12px;
            line-height: 1.5;
        }
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .status-icon {
            font-size: 24px;
            margin-right: 10px;
        }
        button {
            background: #1e40af;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        button:hover {
            background: #1e3a8a;
        }
        .log-entry {
            background: #f8fafc;
            border-left: 3px solid #3b82f6;
            padding: 10px;
            margin: 10px 0;
            font-family: monospace;
            font-size: 12px;
        }
        .error-log {
            border-left-color: #ef4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Debug Error 500 - Sync API</h1>
        <p>Script ini akan membantu mendiagnosa penyebab error 500 saat sinkronisasi</p>

        <?php
        // Test 1: PHP Configuration
        echo '<div class="test-section info">';
        echo '<h2>1. PHP Configuration</h2>';
        echo '<p><strong>PHP Version:</strong> ' . PHP_VERSION . '</p>';
        echo '<p><strong>Memory Limit:</strong> ' . ini_get('memory_limit') . '</p>';
        echo '<p><strong>Max Execution Time:</strong> ' . ini_get('max_execution_time') . 's</p>';
        echo '<p><strong>Post Max Size:</strong> ' . ini_get('post_max_size') . '</p>';
        echo '<p><strong>Upload Max Filesize:</strong> ' . ini_get('upload_max_filesize') . '</p>';
        echo '<p><strong>Display Errors:</strong> ' . (ini_get('display_errors') ? 'ON' : 'OFF') . '</p>';
        echo '<p><strong>Error Reporting:</strong> ' . error_reporting() . '</p>';
        echo '</div>';

        // Test 2: File Permissions
        echo '<div class="test-section info">';
        echo '<h2>2. File Permissions</h2>';
        $files = ['config.php', 'sync.php', 'index.php'];
        foreach ($files as $file) {
            $path = __DIR__ . '/' . $file;
            if (file_exists($path)) {
                $perms = substr(sprintf('%o', fileperms($path)), -4);
                $writable = is_writable($path) ? '✅ Writable' : '❌ Not Writable';
                echo "<p><strong>$file:</strong> $perms - $writable</p>";
            } else {
                echo "<p><strong>$file:</strong> ❌ NOT FOUND</p>";
            }
        }
        
        // Check log file
        $logFile = __DIR__ . '/sync_error.log';
        if (file_exists($logFile)) {
            echo "<p><strong>sync_error.log:</strong> ✅ Exists (" . filesize($logFile) . " bytes)</p>";
        } else {
            echo "<p><strong>sync_error.log:</strong> ⚠️ Not created yet</p>";
        }
        echo '</div>';

        // Test 3: Database Connection
        echo '<div class="test-section info">';
        echo '<h2>3. Database Connection Test</h2>';
        try {
            require_once __DIR__ . '/config.php';
            echo '<p class="success">✅ Config loaded successfully</p>';
            
            $db = Database::getInstance()->getConnection();
            echo '<p class="success">✅ Database connected</p>';
            
            // Test query
            $stmt = $db->query("SELECT 1 as test");
            $result = $stmt->fetch();
            echo '<p class="success">✅ Database query works</p>';
            
            // Check tables
            $stmt = $db->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo '<p><strong>Tables found:</strong> ' . count($tables) . '</p>';
            echo '<p>' . implode(', ', $tables) . '</p>';
            
        } catch (Exception $e) {
            echo '<p class="error">❌ Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
            echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
        }
        echo '</div>';

        // Test 4: Sync Endpoint Test
        echo '<div class="test-section info">';
        echo '<h2>4. Sync Endpoint Test</h2>';
        
        // Test with small data
        $testData = [
            'transaksi' => [],
            'bukti_kas' => [],
            'pengaturan' => [
                'namaSekolah' => 'Test School',
                'npsn' => '123456'
            ],
            'saldo' => [
                'tanggal' => date('Y-m-d'),
                'jumlah' => 0,
                'keterangan' => 'Test'
            ]
        ];
        
        echo '<p>Testing sync with empty data...</p>';
        
        $ch = curl_init('http://' . $_SERVER['HTTP_HOST'] . '/bosp/api/sync.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            echo '<p class="error">❌ cURL Error: ' . htmlspecialchars($error) . '</p>';
        } else {
            echo '<p><strong>HTTP Code:</strong> ' . $httpCode . '</p>';
            if ($httpCode == 200) {
                echo '<p class="success">✅ Sync endpoint works!</p>';
                echo '<pre>' . htmlspecialchars($response) . '</pre>';
            } else {
                echo '<p class="error">❌ Sync endpoint returned error</p>';
                echo '<pre>' . htmlspecialchars($response) . '</pre>';
            }
        }
        echo '</div>';

        // Test 5: Error Log
        echo '<div class="test-section info">';
        echo '<h2>5. Error Log</h2>';
        
        if (file_exists($logFile)) {
            $logContent = file_get_contents($logFile);
            $lines = explode("\n", $logContent);
            $recentLines = array_slice($lines, -20); // Last 20 lines
            
            echo '<p><strong>Last 20 log entries:</strong></p>';
            foreach ($recentLines as $line) {
                if (trim($line)) {
                    $class = (strpos($line, 'Error') !== false || strpos($line, 'Exception') !== false) ? 'error-log' : '';
                    echo '<div class="log-entry ' . $class . '">' . htmlspecialchars($line) . '</div>';
                }
            }
            
            echo '<button onclick="clearLog()">Clear Log</button>';
        } else {
            echo '<p class="warning">⚠️ No error log found yet. Try sync first.</p>';
        }
        echo '</div>';

        // Test 6: PHP Error Log
        echo '<div class="test-section info">';
        echo '<h2>6. PHP Error Log (Last 20 entries)</h2>';
        
        $phpErrorLog = ini_get('error_log');
        if ($phpErrorLog && file_exists($phpErrorLog)) {
            $content = file_get_contents($phpErrorLog);
            $lines = explode("\n", $content);
            $recentLines = array_slice($lines, -20);
            
            foreach ($recentLines as $line) {
                if (trim($line) && (strpos($line, 'sync') !== false || strpos($line, 'bosp') !== false)) {
                    echo '<div class="log-entry">' . htmlspecialchars($line) . '</div>';
                }
            }
        } else {
            echo '<p class="warning">⚠️ PHP error log not accessible</p>';
        }
        echo '</div>';

        // Recommendations
        echo '<div class="test-section warning">';
        echo '<h2>📋 Recommendations</h2>';
        echo '<ol>';
        echo '<li>If you see database errors, check credentials in <code>config.php</code></li>';
        echo '<li>If you see memory errors, increase <code>memory_limit</code> in php.ini</li>';
        echo '<li>If you see timeout errors, increase <code>max_execution_time</code></li>';
        echo '<li>Check file permissions - all PHP files should be 644</li>';
        echo '<li>Check error log for detailed error messages</li>';
        echo '<li>Try sync with smaller data first</li>';
        echo '</ol>';
        echo '</div>';
        ?>

        <div class="test-section info">
            <h2>🔗 Quick Links</h2>
            <ul>
                <li><a href="test.php" target="_blank">Test Backend</a></li>
                <li><a href="health" target="_blank">API Health Check</a></li>
                <li><a href="../" target="_blank">Application</a></li>
            </ul>
        </div>
    </div>

    <script>
        function clearLog() {
            if (confirm('Clear error log?')) {
                fetch('debug.php?action=clearLog', { method: 'POST' })
                    .then(() => location.reload());
            }
        }
    </script>
</body>
</html>

<?php
// Handle clear log action
if (isset($_GET['action']) && $_GET['action'] === 'clearLog') {
    $logFile = __DIR__ . '/sync_error.log';
    if (file_exists($logFile)) {
        file_put_contents($logFile, '');
        echo json_encode(['success' => true]);
    }
    exit();
}
?>
