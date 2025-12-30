<?php

// Database connection factory
$dbPath = getenv('DB_DATABASE') ?: __DIR__ . '/../storage/database.sqlite';
$dir = dirname($dbPath);

if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

// Initialize schema if database is new or empty
if (!file_exists($dbPath) || filesize($dbPath) === 0) {
    $schema = file_get_contents(__DIR__ . '/../database/schema.sql');
    $pdo->exec($schema);
}

return $pdo;
