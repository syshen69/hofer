import { esc } from "./ui.js";

// Diese Seiten werden in den Phasen 4 bis 7 mit Inhalt gefüllt.
// Sie stehen jetzt schon da, damit die Navigation vollständig ist
// und du den Aufbau der App auf dem Handy schon beurteilen kannst.

export function zeigePlatzhalter(bereich, titel, phase, punkte) {
  bereich.innerHTML = `
    <h1 class="seitentitel">${esc(titel)}</h1>
    <div class="karte karte--hinweis">
      <h2>Kommt in Phase ${esc(phase)}</h2>
      <p>Geplant für diesen Bereich:</p>
      <ul class="liste">
        ${punkte.map((p) => `<li>${esc(p)}</li>`).join("")}
      </ul>
    </div>`;
}

export const produktion = (b) => zeigePlatzhalter(b, "Produktion", 4, [
  "Stückzahlen im Wochenraster erfassen",
  "Maschinen und Maschinenparks verwalten",
  "Auswertung nach Zeitraum, Maschine und Park",
]);

export const lager = (b) => zeigePlatzhalter(b, "Lager", "5 und 6", [
  "Artikelsuche mit Bestand je Fach",
  "Entnahme, Wareneingang, Umlagerung, Korrektur",
  "Lagerplätze anlegen und Artikel zuteilen",
  "Letzte 10 Änderungen je Fach",
]);

export const bestellungen = (b) => zeigePlatzhalter(b, "Bestellungen", 7, [
  "Positionen erfassen und abhaken",
  "Automatisch nach Lieferant gruppiert",
  "Lieferanten verwalten",
  "Letzte 100 Positionen je Lieferant",
]);
