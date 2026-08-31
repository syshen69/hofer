import { alleBenutzer, rolleAendern, aktivSetzen, nameAendern } from "./profiles.js";
import { aktuellesProfil, istBesitzer, passwortAendern } from "./auth.js";
import { esc, meldung, laedt, datum, nachfragen } from "./ui.js";
import { APP_VERSION } from "./config.js";

const ROLLEN = {
  owner: "Besitzer",
  admin: "Administrator",
  employee: "Mitarbeiter",
};

export async function zeigeVerwaltung(bereich) {
  bereich.innerHTML = `<h1 class="seitentitel">Verwaltung</h1>${laedt("Benutzer werden geladen …")}`;

  let benutzer = [];
  try {
    benutzer = await alleBenutzer();
  } catch (err) {
    bereich.innerHTML = `<h1 class="seitentitel">Verwaltung</h1>
      <div class="karte karte--fehler"><p>${esc(err.message)}</p></div>`;
    return;
  }

  const ich = aktuellesProfil();
  const besitzer = istBesitzer();

  bereich.innerHTML = `
    <h1 class="seitentitel">Verwaltung</h1>

    <section class="karte">
      <h2>Benutzer</h2>
      <table class="tabelle">
        <thead>
          <tr><th>Name</th><th>E-Mail</th><th>Rolle</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${benutzer.map((b) => `
            <tr class="${b.is_active ? "" : "zeile--inaktiv"}">
              <td>${esc(b.full_name || "–")}${b.id === ich?.id ? ' <span class="marke">du</span>' : ""}</td>
              <td class="klein">${esc(b.email)}</td>
              <td>
                ${besitzer && b.id !== ich?.id
                  ? `<select class="auswahl" data-rolle="${esc(b.id)}">
                       ${Object.entries(ROLLEN).map(([w, t]) =>
                         `<option value="${w}" ${b.role === w ? "selected" : ""}>${t}</option>`).join("")}
                     </select>`
                  : esc(ROLLEN[b.role] || b.role)}
              </td>
              <td>
                ${besitzer && b.id !== ich?.id
                  ? `<button class="linkknopf" data-aktiv="${esc(b.id)}" data-wert="${b.is_active ? "0" : "1"}">
                       ${b.is_active ? "Deaktivieren" : "Aktivieren"}</button>`
                  : (b.is_active ? "aktiv" : "inaktiv")}
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
      <p class="hinweis">Neue Benutzer legst du im Supabase-Dashboard unter
        Authentication → Users an. Ab Phase 3 geht das direkt hier.</p>
    </section>

    <section class="karte">
      <h2>Mein Konto</h2>
      <label class="feld">
        <span>Anzeigename</span>
        <input type="text" id="mein-name" value="${esc(ich?.full_name || "")}"
               placeholder="Vorname Nachname">
      </label>
      <button class="knopf" id="name-speichern">Name speichern</button>

      <label class="feld feld--abstand">
        <span>Neues Passwort</span>
        <input type="password" id="neues-passwort" autocomplete="new-password"
               placeholder="mindestens 8 Zeichen">
      </label>
      <button class="knopf" id="passwort-speichern">Passwort ändern</button>
    </section>

    <section class="karte">
      <h2>Über die App</h2>
      <p class="klein">Version ${esc(APP_VERSION)} · angemeldet als ${esc(ich?.email || "")}</p>
    </section>`;

  // Rolle ändern
  bereich.querySelectorAll("[data-rolle]").forEach((el) => {
    el.addEventListener("change", async () => {
      try {
        await rolleAendern(el.dataset.rolle, el.value);
        meldung("Rolle geändert.");
      } catch (err) {
        meldung(err.message, "fehler");
        zeigeVerwaltung(bereich);
      }
    });
  });

  // Benutzer aktivieren/deaktivieren
  bereich.querySelectorAll("[data-aktiv]").forEach((el) => {
    el.addEventListener("click", async () => {
      const einschalten = el.dataset.wert === "1";
      if (!einschalten) {
        const ok = await nachfragen({
          titel: "Benutzer deaktivieren",
          text: "Die Person kann sich danach nicht mehr anmelden. Bisherige Einträge bleiben erhalten.",
          bestaetigen: "Deaktivieren",
          gefahr: true,
        });
        if (!ok) return;
      }
      try {
        await aktivSetzen(el.dataset.aktiv, einschalten);
        meldung(einschalten ? "Benutzer aktiviert." : "Benutzer deaktiviert.");
        zeigeVerwaltung(bereich);
      } catch (err) {
        meldung(err.message, "fehler");
      }
    });
  });

  // Eigenen Namen speichern
  bereich.querySelector("#name-speichern").addEventListener("click", async () => {
    const name = bereich.querySelector("#mein-name").value.trim();
    try {
      await nameAendern(ich.id, name);
      ich.full_name = name;
      meldung("Name gespeichert.");
      document.querySelector("[data-benutzername]")?.replaceChildren(name || ich.email);
    } catch (err) {
      meldung(err.message, "fehler");
    }
  });

  // Eigenes Passwort ändern
  bereich.querySelector("#passwort-speichern").addEventListener("click", async () => {
    const pw = bereich.querySelector("#neues-passwort").value;
    if (pw.length < 8) {
      meldung("Das Passwort braucht mindestens 8 Zeichen.", "warn");
      return;
    }
    try {
      await passwortAendern(pw);
      bereich.querySelector("#neues-passwort").value = "";
      meldung("Passwort geändert.");
    } catch (err) {
      meldung(err.message, "fehler");
    }
  });
}
