<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_fail(405, 'Gebruik POST.');
}

$body = read_json_body();
require_admin($body);

$remaining = $body['remaining_to_gold'] ?? null;
if (!is_numeric($remaining)) {
    json_fail(400, 'Ongeldige waarde.');
}
$remaining = (int)$remaining;
if ($remaining < 1 || $remaining > 1000) {
    json_fail(400, 'Ongeldige waarde.');
}

$pdo = db();

try {
    $pdo->beginTransaction();
    $settings = $pdo->query('SELECT participant_seq FROM settings WHERE id = 1 FOR UPDATE')->fetch();
    if (!$settings) {
        $pdo->rollBack();
        json_fail(500, 'Serverinstellingen ontbreken (settings).');
    }

    $participantSeq = (int)$settings['participant_seq'];
    $nextGoldAt = $participantSeq + $remaining;

    $u = $pdo->prepare('UPDATE settings SET next_gold_at = :n WHERE id = 1');
    $u->execute([':n' => $nextGoldAt]);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_fail(500, 'Update mislukt.');
}

echo json_encode([
    'ok' => true,
    'next_gold_at' => $nextGoldAt,
    'remaining_to_gold' => $remaining,
], JSON_UNESCAPED_UNICODE);
