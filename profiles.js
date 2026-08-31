// ---------------------------------------------------------------
// Datenzugriff: Benutzer
// Alle Datenbankabfragen zu Benutzern stehen nur hier.
// ---------------------------------------------------------------

import { db, fehlertext } from "./db.js";

export async function alleBenutzer() {
  const { data, error } = await db
    .from("profiles")
    .select("id, email, full_name, role, is_active, created_at")
    .order("full_name", { ascending: true });
  if (error) throw new Error(fehlertext(error));
  return data;
}

export async function nameAendern(id, name) {
  const { error } = await db
    .from("profiles")
    .update({ full_name: name })
    .eq("id", id);
  if (error) throw new Error(fehlertext(error));
}

// Nur der Besitzer darf das (wird zusätzlich in der Datenbank geprüft).
export async function rolleAendern(id, rolle) {
  const { error } = await db.from("profiles").update({ role: rolle }).eq("id", id);
  if (error) throw new Error(fehlertext(error));
}

export async function aktivSetzen(id, aktiv) {
  const { error } = await db.from("profiles").update({ is_active: aktiv }).eq("id", id);
  if (error) throw new Error(fehlertext(error));
}
