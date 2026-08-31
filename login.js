import { anmelden, passwortZuruecksetzen } from "./auth.js";
import { meldung, esc } from "./ui.js";
import { APP_NAME } from "./config.js";

export function zeigeLogin(wurzel, nachErfolg) {
  wurzel.innerHTML = `
    <div class="login">
      <div class="login__karte">
        <div class="login__marke">
          <span class="login__balken"></span>
          <div>
            <div class="login__firma">${esc(APP_NAME)}</div>
            <div class="login__untertitel">Produktion · Lager · Bestellungen</div>
          </div>
        </div>

        <form id="login-form" novalidate>
          <label class="feld">
            <span>E-Mail</span>
            <input type="email" id="login-email" autocomplete="username"
                   inputmode="email" required>
          </label>

          <label class="feld">
            <span>Passwort</span>
            <input type="password" id="login-passwort" autocomplete="current-password" required>
          </label>

          <button type="submit" class="knopf knopf--haupt knopf--breit" id="login-knopf">
            Anmelden
          </button>
        </form>

        <button class="linkknopf" id="passwort-vergessen">Passwort vergessen</button>
      </div>
    </div>`;

  const form = wurzel.querySelector("#login-form");
  const knopf = wurzel.querySelector("#login-knopf");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = wurzel.querySelector("#login-email").value;
    const passwort = wurzel.querySelector("#login-passwort").value;

    if (!email || !passwort) {
      meldung("E-Mail und Passwort eingeben.", "warn");
      return;
    }

    knopf.disabled = true;
    knopf.textContent = "Anmelden …";
    try {
      await anmelden(email, passwort);
      nachErfolg();
    } catch (err) {
      meldung(err.message, "fehler");
      knopf.disabled = false;
      knopf.textContent = "Anmelden";
    }
  });

  wurzel.querySelector("#passwort-vergessen").addEventListener("click", async () => {
    const email = wurzel.querySelector("#login-email").value;
    if (!email) {
      meldung("Zuerst die E-Mail-Adresse eintragen.", "warn");
      return;
    }
    try {
      await passwortZuruecksetzen(email);
      meldung("E-Mail zum Zurücksetzen wurde verschickt.");
    } catch (err) {
      meldung(err.message, "fehler");
    }
  });
}
