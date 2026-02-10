-- MySQL schema for Playmobil aan Zee competition
-- Import via phpMyAdmin or mysql CLI.

CREATE TABLE IF NOT EXISTS settings (
  id TINYINT UNSIGNED NOT NULL,
  participant_seq INT UNSIGNED NOT NULL DEFAULT 0,
  next_gold_at INT UNSIGNED NOT NULL,
  gold_interval INT UNSIGNED NOT NULL DEFAULT 100,
  correct_answer INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (id, participant_seq, next_gold_at, gold_interval, correct_answer)
VALUES (1, 0, 100, 100, 0)
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS participants (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  player_no INT UNSIGNED NOT NULL,
  email VARCHAR(254) NOT NULL,
  city VARCHAR(120) NULL,
  newsletter_opt_in TINYINT(1) NOT NULL DEFAULT 0,
  answer INT UNSIGNED NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  is_gold TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_participants_email (email),
  UNIQUE KEY uq_participants_player_no (player_no),
  KEY idx_participants_is_correct (is_correct),
  KEY idx_participants_is_gold (is_gold),
  KEY idx_participants_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
