<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_fail(405, 'Gebruik POST.');
}

$body = read_json_body();

$email = strtolower(trim((string)($body['email'] ?? '')));
$answerRaw = $body['answer'] ?? null;
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

if (!is_numeric($answerRaw)) {
    json_fail(400, 'Ongeldige telling.');
}
$answer = (int)$answerRaw;
if ($answer < 0 || $answer > 9999) {
    json_fail(400, 'Ongeldige telling.');
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

    // Lock settings row to avoid double-awarding gold on concurrency.
    $st = $pdo->query('SELECT participant_seq, next_gold_at, gold_interval, correct_answer FROM settings WHERE id = 1 FOR UPDATE');
    $settings = $st->fetch();
    if (!$settings) {
        $pdo->rollBack();
        json_fail(500, 'Serverinstellingen ontbreken (settings).');
    }

    $participantSeq = (int)$settings['participant_seq'];
    $nextGoldAt = (int)$settings['next_gold_at'];
    $correctAnswer = (int)$settings['correct_answer'];
    $isCorrect = (int)($answer === $correctAnswer);
    $playerNo = $participantSeq + 1;
    $isGold = (int)($playerNo === $nextGoldAt);

    try {
        $ins = $pdo->prepare('
            INSERT INTO participants (player_no, email, city, newsletter_opt_in, answer, is_correct, is_gold)
            VALUES (:player_no, :email, :city, :newsletter, :answer, :is_correct, :is_gold)
        ');
        $ins->execute([
            ':player_no' => $playerNo,
            ':email' => $email,
            ':city' => $city,
            ':newsletter' => $newsletter,
            ':answer' => $answer,
            ':is_correct' => $isCorrect,
            ':is_gold' => $isGold,
        ]);
    } catch (PDOException $e) {
        // Duplicate email (already played)
        if ($e->getCode() === '23000') {
            $pdo->rollBack();
            json_fail(409, 'U hebt al deelgenomen aan deze wedstrijd; bedankt voor uw deelname.', [
                'code' => 'already_played',
            ]);
        }
        throw $e;
    }

    $uSeq = $pdo->prepare('UPDATE settings SET participant_seq = participant_seq + 1 WHERE id = 1');
    $uSeq->execute();

    if ($isGold === 1) {
        $u2 = $pdo->prepare('UPDATE settings SET next_gold_at = next_gold_at + gold_interval WHERE id = 1');
        $u2->execute();
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
    'player_no' => $playerNo,
    'is_correct' => $isCorrect === 1,
    'is_gold' => $isGold === 1,
], JSON_UNESCAPED_UNICODE);
