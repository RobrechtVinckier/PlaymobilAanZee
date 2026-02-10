# PlaymobilAanZee

Mobile-only wedstrijdsite (NL) + minimale PHP API voor opslag in MySQL (cPanel).

## cPanel / MySQL Setup

1. Maak een MySQL database + user in cPanel (MySQL Databases) en geef de user **ALL PRIVILEGES** op de database.
2. Importeer `db/schema.sql` via phpMyAdmin (Import).
3. Maak op de server het bestand `api/config.local.php` (wordt niet meegecommit) op basis van `api/config.example.php`.

## Belangrijk

- Zet `admin_password` in `api/config.local.php` op iets anders dan `admin` voor je live gaat.
- De juiste vlaggetjes-telling kan je aanpassen in de DB in tabel `settings` (veld `correct_answer`).

## Admin

- Typ `admin` als e-mailadres op de site om de admin login te zien.
- Wachtwoord = `admin_password` uit `api/config.local.php`.
- In het admin paneel kan je zien hoeveel deelnemers er zijn, hoeveel juist/fout, en wie de gouden winnaars zijn.
- "Volgende gouden prijs over" bepaalt hoeveel deelnemers er nog moeten bijkomen tot de volgende gouden prijs.
- Gouden prijs: standaard elke 100e **unieke** deelnemer (1 deelnemer = 1 e-mail).
