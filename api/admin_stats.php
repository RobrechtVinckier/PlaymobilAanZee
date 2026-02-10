<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_fail(405, 'Gebruik POST.');
}

$body = read_json_body();
require_admin($body);

$pdo = db();

try {
    $settings = $pdo->query('SELECT participant_seq, next_gold_at FROM settings WHERE id = 1')->fetch();
    if (!$settings) {
        throw new RuntimeException('Missing settings');
    }
    $participantSeq = (int)$settings['participant_seq'];
    $nextGoldAt = (int)$settings['next_gold_at'];

    $total = $participantSeq;
    $correct = (int)$pdo->query('SELECT COUNT(*) FROM participants WHERE is_correct = 1')->fetchColumn();
    $wrong = (int)$pdo->query('SELECT COUNT(*) FROM participants WHERE is_correct = 0')->fetchColumn();
    $gold = (int)$pdo->query('SELECT COUNT(*) FROM participants WHERE is_gold = 1')->fetchColumn();
    $remainingToGold = max(1, $nextGoldAt - $participantSeq);

    $winners = $pdo->query('SELECT player_no, email, created_at FROM participants WHERE is_gold = 1 ORDER BY player_no DESC LIMIT 200')
        ->fetchAll();
} catch (Throwable $e) {
    json_fail(500, 'Kon stats niet laden.');
}

echo json_encode([
    'ok' => true,
    'stats' => [
        'total' => $total,
        'correct' => $correct,
        'wrong' => $wrong,
        'gold' => $gold,
        'next_gold_at' => $nextGoldAt,
        'remaining_to_gold' => $remainingToGold,
    ],
    'winners' => $winners,
], JSON_UNESCAPED_UNICODE);
