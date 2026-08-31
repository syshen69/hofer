// ---------------------------------------------------------------
// Kleine Helfer für die Oberfläche.
// Werden von allen Seiten benutzt.
// ---------------------------------------------------------------

// Text sicher in HTML einsetzen (verhindert kaputte Anzeige bei
// Sonderzeichen wie < oder & in Artikelnamen).
export function esc(wert) {
  if (wert === null || wert === undefined) return "";
  return String(wert)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Kurze Meldung unten am Bildschirm.
export function meldung(text, art = "ok") {
  let box = document.querySelector(".toast-bereich");
  if (!box) {
    box = document.createElement("div");
    box.className = "toast-bereich";
    document.body.appendChild(box);
  }
  const t = document.createElement("div");
  t.className = "toast toast--" + art;
  t.textContent = text;
  box.appendChild(t);
  setTimeout(() => t.classList.add("toast--weg"), 3200);
  setTimeout(() => t.remove(), 3600);
}

// Rückfrage bei kritischen Aktionen.
// Gibt true zurück, wenn bestätigt wurde.
export function nachfragen({ titel, text, bestaetigen = "Ja, ausführen", gefahr = false }) {
  return new Promise((fertig) => {
    const huelle = document.createElement("div");
    huelle.className = "dialog-huelle";
    huelle.innerHTML = `
      <div class="dialog" role="dialog" aria-modal="true">
        <h2>${esc(titel)}</h2>
        <p>${esc(text)}</p>
        <div class="dialog__knoepfe">
          <button class="knopf knopf--still" data-nein>Abbrechen</button>
          <button class="knopf ${gefahr ? "knopf--gefahr" : "knopf--haupt"}" data-ja>${esc(bestaetigen)}</button>
        </div>
      </div>`;
    document.body.appendChild(huelle);

    const schliessen = (antwort) => { huelle.remove(); fertig(antwort); };
    huelle.querySelector("[data-ja]").onclick = () => schliessen(true);
    huelle.querySelector("[data-nein]").onclick = () => schliessen(false);
    huelle.onclick = (e) => { if (e.target === huelle) schliessen(false); };
    huelle.querySelector("[data-ja]").focus();
  });
}

// Datum und Uhrzeit im gewohnten Format.
export function datumZeit(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function datum(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// Zahlen mit Tausendertrennung, z. B. 1'250
export function zahl(n) {
  if (n === null || n === undefined || n === "") return "–";
  return Number(n).toLocaleString("de-CH");
}

// Ladeanzeige für einen Bereich
export function laedt(text = "Wird geladen …") {
  return `<div class="laedt">${esc(text)}</div>`;
}

// Anzeige, wenn noch keine Daten da sind
export function leer(text, hinweis = "") {
  return `<div class="leer">
    <p>${esc(text)}</p>
    ${hinweis ? `<p class="leer__hinweis">${esc(hinweis)}</p>` : ""}
  </div>`;
}
