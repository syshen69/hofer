// ---------------------------------------------------------------
// Startpunkt der App.
// ---------------------------------------------------------------

import { db } from "./db.js";
import { profilLaden, aktuellesProfil, abmelden } from "./auth.js";
import { zeigeLogin } from "./login.js";
import { SEITEN, starteRouter } from "./router.js";
import { APP_NAME } from "./config.js";
import { esc, meldung, nachfragen } from "./ui.js";

const wurzel = document.querySelector("#root");
const boot = document.querySelector("#boot");

async function start() {
  try {
    const profil = await profilLaden();
    boot.hidden = true;
    wurzel.hidden = false;

    if (!profil) {
      zeigeLogin(wurzel, start);
      return;
    }

    if (profil.is_active === false) {
      await abmelden();
      zeigeLogin(wurzel, start);
      meldung("Dieses Konto ist deaktiviert. Bitte an den Besitzer wenden.", "fehler");
      return;
    }

    zeichneGeruest(profil);
  } catch (err) {
    boot.hidden = true;
    wurzel.hidden = false;
    wurzel.innerHTML = `<div class="login"><div class="login__karte">
      <h2>Verbindung fehlgeschlagen</h2>
      <p>${esc(err.message)}</p>
      <button class="knopf knopf--haupt knopf--breit" onclick="location.reload()">Neu versuchen</button>
    </div></div>`;
  }
}

function zeichneGeruest(profil) {
  const anzeigename = profil.full_name || profil.email;

  wurzel.innerHTML = `
    <header class="kopf">
      <span class="kopf__balken"></span>
      <span class="kopf__firma">${esc(APP_NAME)}</span>
      <span class="kopf__benutzer" data-benutzername>${esc(anzeigename)}</span>
      <button class="kopf__abmelden" id="abmelden" title="Abmelden">Abmelden</button>
    </header>

    <div class="rahmen">
      <nav class="nav" aria-label="Hauptnavigation">
        ${SEITEN.map((s) => `
          <a class="nav__punkt" data-nav="${s.pfad}" href="#/${s.pfad}">
            <span class="nav__zeichen" aria-hidden="true">${s.zeichen}</span>
            <span class="nav__text">${esc(s.titel)}</span>
          </a>`).join("")}
      </nav>

      <main class="inhalt" id="inhalt"></main>
    </div>`;

  document.querySelector("#abmelden").addEventListener("click", async () => {
    const ok = await nachfragen({
      titel: "Abmelden",
      text: "Du musst dich danach neu anmelden.",
      bestaetigen: "Abmelden",
    });
    if (!ok) return;
    await abmelden();
    location.hash = "";
    start();
  });

  starteRouter(document.querySelector("#inhalt"));
}

// Wenn sich die Anmeldung ändert (z. B. Sitzung abgelaufen),
// die App neu aufbauen.
db.auth.onAuthStateChange((ereignis) => {
  if (ereignis === "SIGNED_OUT") {
    zeigeLogin(wurzel, start);
  }
});

// Service Worker für die Installation als App
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Nicht schlimm: die App läuft auch ohne, nur nicht installierbar.
    });
  });
}

start();
