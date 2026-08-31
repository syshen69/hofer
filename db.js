// ---------------------------------------------------------------
// Verbindung zur Datenbank.
//
// WICHTIG: Diese Datei und der Ordner js/data/ sind die einzigen
// Stellen der App, die Supabase kennen. Alles andere ruft nur
// Funktionen aus js/data/ auf. Wenn du später auf einen eigenen
// Server umziehst, tauschst du nur diese Dateien aus.
// ---------------------------------------------------------------

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

export const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,      // Anmeldung bleibt nach dem Schließen erhalten
    autoRefreshToken: true,    // Sitzung wird automatisch verlängert
    detectSessionInUrl: true,
  },
});

// Kleine Hilfe: wandelt Datenbankfehler in verständliche Sätze um.
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
