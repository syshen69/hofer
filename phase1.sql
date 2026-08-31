-- ===============================================================
-- PHASE 1 – Benutzer und Rechte
--
-- Diesen Text komplett kopieren und im Supabase-Dashboard unter
-- "SQL Editor" einfügen und ausführen ("Run").
-- Er kann gefahrlos mehrfach ausgeführt werden.
-- ===============================================================

-- ---------------------------------------------------------------
-- 1. Benutzertabelle
--    Hängt an der eingebauten Anmeldung von Supabase (auth.users).
--    Hier stehen nur Name, Rolle und ob das Konto aktiv ist.
-- ---------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text        not null,
  full_name   text,
  role        text        not null default 'admin'
              check (role in ('owner', 'admin', 'employee')),
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Benutzer der Betriebs-App';

-- ---------------------------------------------------------------
-- 2. Hilfsfunktion: Rolle des angemeldeten Benutzers
--    "security definer" ist nötig, damit die Rechteregeln unten
--    sich nicht selbst blockieren.
-- ---------------------------------------------------------------

create or replace function public.meine_rolle()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.bin_aktiv()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_active from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------
-- 3. Profil automatisch anlegen, sobald ein Konto entsteht
-- ---------------------------------------------------------------

create or replace function public.neuer_benutzer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_neuer_benutzer on auth.users;
create trigger trg_neuer_benutzer
  after insert on auth.users
  for each row execute function public.neuer_benutzer();

-- ---------------------------------------------------------------
-- 4. Schutz: Rolle und Status darf nur der Besitzer ändern
--    Verhindert, dass sich jemand selbst zum Besitzer macht.
-- ---------------------------------------------------------------

create or replace function public.profil_schutz()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role
      or new.is_active is distinct from old.is_active)
     and coalesce(public.meine_rolle(), '') <> 'owner' then
    raise exception 'Nur der Besitzer darf Rolle oder Status ändern';
  end if;

  -- Die eigene E-Mail und ID lassen wir grundsätzlich in Ruhe.
  new.id := old.id;
  new.email := old.email;
  return new;
end;
$$;

drop trigger if exists trg_profil_schutz on public.profiles;
create trigger trg_profil_schutz
  before update on public.profiles
  for each row execute function public.profil_schutz();

-- ---------------------------------------------------------------
-- 5. Zugriffsregeln (Row Level Security)
--    Diese Regeln gelten in der Datenbank selbst. Auch wer die App
--    umgeht und die Schnittstelle direkt anspricht, kommt nicht
--    daran vorbei.
-- ---------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "benutzer lesen" on public.profiles;
create policy "benutzer lesen"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "eigenes profil aendern" on public.profiles;
create policy "eigenes profil aendern"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "besitzer aendert alle" on public.profiles;
create policy "besitzer aendert alle"
  on public.profiles for update
  to authenticated
  using (public.meine_rolle() = 'owner')
  with check (public.meine_rolle() = 'owner');

-- Löschen ist für niemanden erlaubt. Benutzer werden deaktiviert,
-- damit die Historie erhalten bleibt.
drop policy if exists "kein loeschen" on public.profiles;

-- ===============================================================
-- FERTIG.
--
-- Nächster Schritt, NACHDEM du dich das erste Mal in der App
-- angemeldet hast: dich selbst zum Besitzer machen.
-- Dafür diese eine Zeile ausführen und die E-Mail anpassen:
--
--   update public.profiles
--   set role = 'owner', full_name = 'Saheesan'
--   where email = 'deine@email.ch';
--
-- ===============================================================
