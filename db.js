// ---------------------------------------------------------------
// Verbindung zur Datenbank.
//
// Die Supabase-Bibliothek wird aus dem Internet geladen. Falls der
// erste Anbieter nicht antwortet, wird nach 6 Sekunden automatisch
// ein zweiter versucht. So bleibt die App nicht stumm haengen.
// ---------------------------------------------------------------

import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

const ANBIETER = [
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm",
  "https://esm.sh/@supabase/supabase-js@2",
  "https://unpkg.com/@supabase/supabase-js@2/dist/module/index.js",
];

export function mitZeitlimit(versprechen, ms, name = "Datenbank") {
  return Promise.race([
    versprechen,
    new Promise((_, ablehnen) =>
      setTimeout(() => ablehnen(new Error("Zeitüberschreitung bei " + name)), ms)
    ),
  ]);
}

async function ladeBibliothek() {
  let letzterFehler;
  for (const adresse of ANBIETER) {
    try {
      const modul = await mitZeitlimit(import(adresse), 6000, adresse);
      if (modul?.createClient) return modul.createClient;
    } catch (fehler) {
      letzterFehler = fehler;
      console.warn("Anbieter nicht erreichbar:", adresse, fehler.message);
    }
  }
  throw new Error(
    "Die Supabase-Bibliothek konnte von keinem Anbieter geladen werden. " +
    "Meist liegt das an einem Werbeblocker oder einer Firewall. " +
    "Letzter Fehler: " + (letzterFehler?.message || "unbekannt")
  );
}

const createClient = await ladeBibliothek();

export const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,

    // Supabase sperrt normalerweise ueber die Browser-Funktion
    // navigator.locks, damit mehrere offene Tabs sich nicht in die
    // Quere kommen. Diese Sperre kann sich in manchen Browsern
    // selbst blockieren, und dann antwortet die Anmeldung nie.
    // Wir ersetzen sie durch eine Fassung ohne Sperre. Fuer unseren
    // Fall ist das unbedenklich: die Anmeldung wird ohnehin nur
    // beim Start und beim Anmelden geprueft.
    lock: async (_name, _zeit, aufgabe) => await aufgabe(),
  },
});

// Wandelt Datenbankfehler in verstaendliche Saetze um.
export function fehlertext(error) {
  if (!error) return "Unbekannter Fehler";
  const m = error.message || String(error);

  if (m.includes("Invalid login credentials")) return "E-Mail oder Passwort stimmt nicht.";
  if (m.includes("Email not confirmed")) return "Die E-Mail-Adresse wurde noch nicht bestätigt.";
  if (m.includes("User already registered")) return "Diese E-Mail-Adresse hat bereits ein Konto.";
  if (m.includes("Password should be")) return "Das Passwort ist zu kurz (mindestens 8 Zeichen).";
  if (m.includes("row-level security") || m.includes("violates row-level"))
    return "Dafür fehlen dir die Rechte.";
  if (m.includes("duplicate key")) return "Dieser Eintrag existiert bereits.";
  if (m.includes("Failed to fetch")) return "Keine Verbindung zum Server. WLAN prüfen.";

  return m;
}
