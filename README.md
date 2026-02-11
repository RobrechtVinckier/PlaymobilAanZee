# PlaymobilAanZee

Mobile-only wedstrijdsite (NL) + minimale PHP API voor opslag in MySQL (cPanel).

## cPanel / MySQL Setup

1. Maak een MySQL database + user in cPanel (MySQL Databases) en geef de user **ALL PRIVILEGES** op de database.
2. Importeer `db/schema.sql` via phpMyAdmin (Import).
3. Maak op de server het bestand `api/config.local.php` (wordt niet meegecommit) op basis van `api/config.example.php`.

## Lokaal testen (Docker)

Er zit een `docker-compose.yml` in de repo zodat je geen PHP/MySQL lokaal hoeft te installeren.

1. Start:
   - `docker compose up -d --build`
2. Open:
   - `http://localhost:8080`
3. Reset DB (alles wissen):
   - `docker compose down -v`

Bij schema-updates (zoals extra kolommen) moet je lokaal meestal ook resetten met `docker compose down -v` en daarna opnieuw `docker compose up -d --build`.

De API gebruikt in Docker env vars (`PAZ_DB_HOST`, `PAZ_DB_NAME`, `PAZ_DB_USER`, `PAZ_DB_PASS`, `PAZ_ADMIN_PASSWORD`). In productie (cPanel) gebruik je `api/config.local.php`.

## Belangrijk

- Zet `admin_password` in `api/config.local.php` op iets anders dan `admin` voor je live gaat.
- De juiste vlaggetjes-telling kan je aanpassen in de DB in tabel `settings` (veld `correct_answer`).

## Admin

- Typ `admin` als e-mailadres op de site om de admin login te zien.
- Wachtwoord = `admin_password` uit `api/config.local.php`.
- In het admin paneel kan je zien hoeveel deelnemers er zijn, hoeveel juist/fout, en wie de gouden winnaars zijn.
- "Volgende gouden prijs over" bepaalt hoeveel deelnemers er nog moeten bijkomen tot de volgende gouden prijs.
- Gouden prijs: standaard elke 100e **unieke** deelnemer (1 deelnemer = 1 e-mail).
