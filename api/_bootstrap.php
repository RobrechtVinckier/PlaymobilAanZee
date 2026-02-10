<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function json_fail(int $status, string $message, array $extra = []): never
{
    http_response_code($status);
    echo json_encode(array_merge([
        'ok' => false,
        'message' => $message,
    ], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return $_POST;
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return $_POST;
    }
    return $data;
}

$configPath = __DIR__ . '/config.local.php';
if (!file_exists($configPath)) {
    json_fail(500, 'Server niet geconfigureerd: maak api/config.local.php op basis van api/config.example.php.');
}

$CFG = require $configPath;
if (!is_array($CFG)) {
    json_fail(500, 'Ongeldige serverconfig.');
}

foreach (['db_host', 'db_name', 'db_user', 'db_pass', 'admin_password'] as $k) {
    if (!array_key_exists($k, $CFG) || trim((string)$CFG[$k]) === '') {
        json_fail(500, "Serverconfig mist sleutel: {$k}");
    }
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    /** @var array $GLOBALS */
    $cfg = $GLOBALS['CFG'];
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $cfg['db_host'],
        $cfg['db_name']
    );

    try {
        $pdo = new PDO($dsn, $cfg['db_user'], $cfg['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (Throwable $e) {
        json_fail(500, 'Database connectie mislukt.');
    }

    return $pdo;
}

function require_admin(array $body): void
{
    $pw = (string)($body['password'] ?? '');
    $expected = (string)$GLOBALS['CFG']['admin_password'];
    if ($pw === '' || !hash_equals($expected, $pw)) {
        json_fail(401, 'Geen toegang.');
    }
}
