// ---------------------------------------------------------------
// Anmeldung und Benutzerprofil
// ---------------------------------------------------------------

import { db, fehlertext, mitZeitlimit } from "./db.js";

// Das Profil des angemeldeten Benutzers, damit wir es nicht
// bei jedem Seitenwechsel neu laden müssen.
let profil = null;

export function aktuellesProfil() {
  return profil;
}

export function istBesitzer() {
  return profil?.role === "owner";
}

export async function anmelden(email, passwort) {
  const { error } = await mitZeitlimit(
    db.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: passwort,
    }),
    15000,
    "Anmeldung"
  );
  if (error) throw new Error(fehlertext(error));
  await profilLaden();
}

export async function abmelden() {
  await db.auth.signOut();
  profil = null;
}

export async function passwortZuruecksetzen(email) {
  const { error } = await db.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: window.location.origin + window.location.pathname,
  });
  if (error) throw new Error(fehlertext(error));
}

export async function passwortAendern(neuesPasswort) {
  const { error } = await db.auth.updateUser({ password: neuesPasswort });
  if (error) throw new Error(fehlertext(error));
}

// Lädt das Profil zum angemeldeten Konto (Name, Rolle, aktiv/inaktiv).
// Holt die gespeicherte Anmeldung. Antwortet der Browser nicht
// innerhalb von 5 Sekunden, behandeln wir das als "nicht angemeldet",
// damit wenigstens die Anmeldemaske erscheint.
async function sitzung() {
  try {
    const { data } = await mitZeitlimit(db.auth.getSession(), 5000, "Sitzung");
    return data?.session || null;
  } catch (fehler) {
    console.warn("Sitzung konnte nicht gelesen werden:", fehler.message);
    return null;
  }
}

export async function profilLaden() {
  const session = await sitzung();
  if (!session) {
    profil = null;
    return null;
  }

  let data = null, error = null;
  try {
    ({ data, error } = await mitZeitlimit(
      db.from("profiles")
        .select("id, email, full_name, role, is_active")
        .eq("id", session.user.id)
        .single(),
      10000,
      "Profil"
    ));
  } catch (fehler) {
    error = fehler;
  }

  if (error || !data) {
    // Kann kurz nach der Registrierung passieren, bevor der
    // Trigger das Profil angelegt hat.
    profil = { id: session.user.id, email: session.user.email, full_name: null, role: "admin", is_active: true };
    return profil;
  }

  profil = data;
  return profil;
}

export async function angemeldet() {
  return !!(await sitzung());
}
