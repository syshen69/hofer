// ---------------------------------------------------------------
// Einfacher Seitenwechsel über die Adresse (#/lager, #/produktion …)
// Vorteil: funktioniert auf GitHub Pages ohne Server-Einstellungen.
// ---------------------------------------------------------------

import { zeigeDashboard } from "./dashboard.js";
import { produktion, lager, bestellungen } from "./platzhalter.js";
import { zeigeVerwaltung } from "./verwaltung.js";

export const SEITEN = [
  { pfad: "dashboard",    titel: "Start",        zeichen: "◧", zeige: zeigeDashboard },
  { pfad: "produktion",   titel: "Produktion",   zeichen: "⚙", zeige: produktion },
  { pfad: "lager",        titel: "Lager",        zeichen: "▤", zeige: lager },
  { pfad: "bestellungen", titel: "Bestellungen", zeichen: "≡", zeige: bestellungen },
  { pfad: "verwaltung",   titel: "Verwaltung",   zeichen: "⚒", zeige: zeigeVerwaltung },
];

export function aktuellerPfad() {
  const roh = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  return SEITEN.some((s) => s.pfad === roh) ? roh : "dashboard";
}

export function zeichneSeite(bereich) {
  const pfad = aktuellerPfad();
  const seite = SEITEN.find((s) => s.pfad === pfad);

  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.classList.toggle("aktiv", el.dataset.nav === pfad);
  });

  bereich.scrollTop = 0;
  window.scrollTo(0, 0);
  seite.zeige(bereich);
}

export function starteRouter(bereich) {
  window.addEventListener("hashchange", () => zeichneSeite(bereich));
  if (!window.location.hash) window.location.hash = "#/dashboard";
  zeichneSeite(bereich);
}
