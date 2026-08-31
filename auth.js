// ---------------------------------------------------------------
// Anmeldung und Benutzerprofil
// ---------------------------------------------------------------

import { db, fehlertext } from "./db.js";

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
  const { error } = await db.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: passwort,
  });
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
export async function profilLaden() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    profil = null;
    return null;
  }

  const { data, error } = await db
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .eq("id", session.user.id)
    .single();

  if (error) {
    // Kann kurz nach der Registrierung passieren, bevor der
    // Trigger das Profil angelegt hat.
    profil = { id: session.user.id, email: session.user.email, full_name: null, role: "admin", is_active: true };
    return profil;
  }

  profil = data;
  return profil;
}

export async function angemeldet() {
  const { data: { session } } = await db.auth.getSession();
  return !!session;
}
