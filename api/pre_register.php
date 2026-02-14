<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_fail(405, 'Gebruik POST.');
}

$body = read_json_body();

$email = strtolower(trim((string)($body['email'] ?? '')));
$newsletter = (int)!!($body['newsletter_opt_in'] ?? false);
$city = $body['city'] ?? null;

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_fail(400, 'Ongeldig e-mailadres.');
}
if (strlen($email) > 254) {
    json_fail(400, 'Ongeldig e-mailadres.');
}
if ($email === 'admin') {
    json_fail(400, 'Dit e-mailadres is gereserveerd.');
}

if ($city !== null) {
    $city = trim((string)$city);
    if ($city === '') {
        $city = null;
    } else {
        $len = function_exists('mb_strlen') ? mb_strlen($city) : strlen($city);
        if ($len > 120) {
            json_fail(400, 'Gemeente/stad is te lang.');
        }
    }
}

$pdo = db();

try {
    $pdo->beginTransaction();

    $settings = $pdo->query('SELECT participant_seq, next_gold_at FROM settings WHERE id = 1 FOR UPDATE')->fetch();
    if (!$settings) {
        $pdo->rollBack();
        json_fail(500, 'Serverinstellingen ontbreken (settings).');
    }

    $st = $pdo->prepare('SELECT id, player_no, has_submitted_answer, is_correct, is_gold FROM participants WHERE email = :email FOR UPDATE');
    $st->execute([':email' => $email]);
    $existing = $st->fetch();

    if ($existing) {
        if ((int)$existing['has_submitted_answer'] === 1 && (int)$existing['is_correct'] === 1) {
            $pdo->rollBack();
            json_fail(409, 'U hebt al deelgenomen aan deze wedstrijd; bedankt voor uw deelname.', [
                'code' => 'already_played',
            ]);
        }

        $up = $pdo->prepare('UPDATE participants SET city = :city, newsletter_opt_in = :newsletter WHERE id = :id');
        $up->execute([
            ':city' => $city,
            ':newsletter' => $newsletter,
            ':id' => (int)$existing['id'],
        ]);

        $playerNo = (int)$existing['player_no'];
        $isGold = (int)$existing['is_gold'];
        $alreadyRegistered = true;
    } else {
        $participantSeq = (int)$settings['participant_seq'];
        $nextGoldAt = (int)$settings['next_gold_at'];

        $playerNo = $participantSeq + 1;
        $isGold = (int)($playerNo === $nextGoldAt);

        $ins = $pdo->prepare('
            INSERT INTO participants (player_no, email, city, newsletter_opt_in, answer, is_correct, has_submitted_answer, is_gold)
            VALUES (:player_no, :email, :city, :newsletter, NULL, NULL, 0, :is_gold)
        ');
        $ins->execute([
            ':player_no' => $playerNo,
            ':email' => $email,
            ':city' => $city,
            ':newsletter' => $newsletter,
            ':is_gold' => $isGold,
        ]);

        $pdo->prepare('UPDATE settings SET participant_seq = participant_seq + 1 WHERE id = 1')->execute();
        if ($isGold === 1) {
            $pdo->prepare('UPDATE settings SET next_gold_at = next_gold_at + gold_interval WHERE id = 1')->execute();
        }
        $alreadyRegistered = false;
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_fail(500, 'Serverfout.');
}

echo json_encode([
    'ok' => true,
    'already_registered' => $alreadyRegistered,
    'player_no' => $playerNo,
    'is_gold' => $isGold === 1,
], JSON_UNESCAPED_UNICODE);
