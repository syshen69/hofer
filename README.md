# Betriebs-App – Phase 1

Anmeldung, Grundgeruest und Verbindung zur Datenbank.

## Aufbau

Alle Dateien liegen bewusst flach nebeneinander, ohne Unterordner.
So lassen sie sich auf GitHub in einem Schritt hochladen.

| Datei | Zweck |
| --- | --- |
| index.html | Startseite |
| app.css | Gestaltung |
| config.js | Zugangsdaten, App-Name, Version |
| db.js | Verbindung zur Datenbank |
| auth.js | Anmelden, Abmelden, Profil |
| ui.js | Meldungen, Dialoge, Formatierung |
| router.js | Seitenwechsel |
| app.js | Startpunkt der App |
| profiles.js | Datenbankzugriff Benutzer |
| login.js | Anmeldeseite |
| dashboard.js | Startseite nach der Anmeldung |
| platzhalter.js | Produktion, Lager, Bestellungen (Phase 4-7) |
| verwaltung.js | Benutzer und eigenes Konto |
| sw.js | Service Worker (Installation aufs Handy) |
| app.webmanifest | Angaben fuer die Installation |
| icon-*.png | App-Symbole |
| phase1.sql | Datenbank-Einrichtung (bereits ausgefuehrt) |

## Hochladen

Alle Dateien markieren und auf GitHub unter "Add file -> Upload files"
hineinziehen. Gleichnamige Dateien werden ueberschrieben.

## Nach einer Aenderung

APP_VERSION in config.js und VERSION in sw.js hochzaehlen,
damit alle Geraete die neue Fassung laden.
