import { aktuellesProfil } from "./auth.js";
import { esc } from "./ui.js";

function begruessung() {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

export function zeigeDashboard(bereich) {
  const p = aktuellesProfil();
  const name = p?.full_name || p?.email?.split("@")[0] || "";

  bereich.innerHTML = `
    <h1 class="seitentitel">${esc(begruessung())}${name ? ", " + esc(name) : ""}</h1>

    <div class="schnellzugriff">
      <a class="kachel" href="#/lager"><span class="kachel__zeichen">⌕</span>Artikel suchen</a>
      <a class="kachel" href="#/lager"><span class="kachel__zeichen">−</span>Entnahme</a>
      <a class="kachel" href="#/lager"><span class="kachel__zeichen">+</span>Wareneingang</a>
      <a class="kachel" href="#/bestellungen"><span class="kachel__zeichen">≡</span>Bestellen</a>
    </div>

    <div class="karte karte--hinweis">
      <h2>Aufbau läuft</h2>
      <p>Die Grundlage steht: Anmeldung, Benutzer und die Verbindung zur Datenbank
         funktionieren. Die Zahlen an dieser Stelle kommen, sobald Produktion und
         Lager gebaut sind.</p>
      <p class="fortschritt">Phase 1 von 9 abgeschlossen</p>
    </div>`;
}
