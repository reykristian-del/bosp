<?php
/**
 * Test Script - Diagnosa Koneksi API & Database
 * Upload file ini ke folder /api/ di hosting Anda
 * Akses via: https://domain.com/api/test.php
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Test Backend - BOSP</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 30px auto; padding: 20px; }
        .test { margin: 15px 0; padding: 15px; border-radius: 5px; }
        .success { background: #d1fae5; border: 1px solid #10b981; }
        .error { background: #fee2e2; border: 1px solid #ef4444; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; }
        .info { background: #dbeafe; border: 1px solid #3b82f6; }
        pre { background: #f9fafb; padding: 10px; border-radius: 5px; overflow-x: auto; font-size: 12px; }
        h1 { color: #1e40af; }
        h3 { margin-top: 0; }
    </style>
</head>
<body>
    <h1>🔧 Test Backend BOSP</h1>
    
    <?php
    // Test 1: PHP Version
    echo '<div class="test info">';
    echo '<h3>1. PHP Version</h3>';
    echo '<p>Version: ' . PHP_VERSION . '</p>';
    if (version_compare(PHP_VERSION, '7.4.0', '>=')) {
        echo '<p style="color: green;">✅ PHP version OK (minimal 7.4)</p>';
    } else {
        echo '<p style="color: red;">❌ PHP version terlalu lama! Minimal 7.4</p>';
    }
    echo '</div>';
    
    // Test 2: PDO Extension
    echo '<div class="test info">';
    echo '<h3>2. PDO Extension</h3>';
    if (extension_loaded('pdo')) {
        echo '<p style="color: green;">✅ PDO extension aktif</p>';
        if (extension_loaded('pdo_mysql')) {
            echo '<p style="color: green;">✅ PDO MySQL driver aktif</p>';
        } else {
            echo '<p style="color: red;">❌ PDO MySQL driver TIDAK aktif!</p>';
        }
    } else {
        echo '<p style="color: red;">❌ PDO extension TIDAK aktif!</p>';
    }
    echo '</div>';
    
    // Test 3: Config File
    echo '<div class="test info">';
    echo '<h3>3. Config File</h3>';
    if (file_exists(__DIR__ . '/config.php')) {
        echo '<p style="color: green;">✅ File config.php ditemukan</p>';
        require_once __DIR__ . '/config.php';
        echo '<p>Database Host: ' . DB_HOST . '</p>';
        echo '<p>Database Name: ' . DB_NAME . '</p>';
        echo '<p>Database User: ' . DB_USER . '</p>';
    } else {
        echo '<p style="color: red;">❌ File config.php TIDAK ditemukan!</p>';
        echo '<p>Pastikan file config.php ada di folder yang sama dengan test.php</p>';
    }
    echo '</div>';
    
    // Test 4: Database Connection
    echo '<div class="test info">';
    echo '<h3>4. Database Connection</h3>';
    try {
        if (file_exists(__DIR__ . '/config.php')) {
            require_once __DIR__ . '/config.php';
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            echo '<p style="color: green;">✅ Koneksi database BERHASIL!</p>';
            
            // Test query
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM transaksi");
            $result = $stmt->fetch();
            echo '<p>Jumlah transaksi: ' . $result['count'] . '</p>';
            
            // Check tables
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo '<p>Tabel yang ada: ' . implode(', ', $tables) . '</p>';
            
        } else {
            echo '<p style="color: red;">❌ Tidak bisa test database karena config.php tidak ada</p>';
        }
    } catch (PDOException $e) {
        echo '<p style="color: red;">❌ Koneksi database GAGAL!</p>';
        echo '<p>Error: ' . $e->getMessage() . '</p>';
        echo '<h4>Kemungkinan penyebab:</h4>';
        echo '<ul>';
        echo '<li>Nama database salah di config.php</li>';
        echo '<li>Username/password database salah</li>';
        echo '<li>Database belum dibuat di cPanel</li>';
        echo '<li>User database belum punya privilege</li>';
        echo '<li>Schema.sql belum di-import</li>';
        echo '</ul>';
    }
    echo '</div>';
    
    // Test 5: File Permissions
    echo '<div class="test info">';
    echo '<h3>5. File Permissions</h3>';
    $files = ['index.php', 'config.php', '.htaccess'];
    foreach ($files as $file) {
        $path = __DIR__ . '/' . $file;
        if (file_exists($path)) {
            $perms = substr(sprintf('%o', fileperms($path)), -4);
            echo '<p style="color: green;">✅ ' . $file . ' (permission: ' . $perms . ')</p>';
        } else {
            echo '<p style="color: red;">❌ ' . $file . ' TIDAK ditemukan!</p>';
        }
    }
    echo '</div>';
    
    // Test 6: mod_rewrite
    echo '<div class="test info">';
    echo '<h3>6. Apache mod_rewrite</h3>';
    if (function_exists('apache_get_modules')) {
        $modules = apache_get_modules();
        if (in_array('mod_rewrite', $modules)) {
            echo '<p style="color: green;">✅ mod_rewrite aktif</p>';
        } else {
            echo '<p style="color: red;">❌ mod_rewrite TIDAK aktif!</p>';
        }
    } else {
        echo '<p style="color: orange;">⚠️ Tidak bisa检测 mod_rewrite (bukan Apache atau function tidak tersedia)</p>';
    }
    echo '</div>';
    
    // Summary
    echo '<div class="test warning">';
    echo '<h3>📋 Kesimpulan & Langkah Selanjutnya</h3>';
    echo '<ol>';
    echo '<li>Jika semua test ✅ → Backend siap digunakan</li>';
    echo '<li>Jika ada yang ❌ → Perbaiki sesuai error message</li>';
    echo '<li>Setelah backend OK → Test dari frontend: <a href="../test-api.html">test-api.html</a></li>';
    echo '<li>Jika frontend masih error → Cek URL API di src/config.ts</li>';
    echo '</ol>';
    echo '</div>';
    ?>
    
    <div class="test info">
        <h3>📖 Dokumentasi</h3>
        <ul>
            <li><a href="https://domain.com/api/health" target="_blank">Test API Health Endpoint</a></li>
            <li><a href="../test-api.html" target="_blank">Test dari Frontend</a></li>
            <li>Lihat file INTEGRASI_MYSQL.md untuk panduan lengkap</li>
        </ul>
    </div>
</body>
</html>
