/* Mobile-first contest app (no frameworks). */

function $(id) {
  return document.getElementById(id);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function isLikelyEmail(s) {
  // HTML input[type=email] is the first line of defense; this is just UX.
  const v = String(s || "").trim();
  if (v.length < 6) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function prefersReducedMotion() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function setMsg(el, msg, kind, keepKey = false) {
  if (!el) return;
  if (!keepKey && el.dataset) {
    delete el.dataset.msgKey;
  }
  el.textContent = msg || "";
  el.classList.remove("formMsg--ok", "formMsg--err");
  if (kind === "ok") el.classList.add("formMsg--ok");
  if (kind === "err") el.classList.add("formMsg--err");
}

function setMsgKey(el, key, kind) {
  if (!el) return;
  if (el.dataset) el.dataset.msgKey = key;
  setMsg(el, t(key), kind, true);
}

function show(el) {
  if (!el) return;
  el.hidden = false;
}

function hide(el) {
  if (!el) return;
  el.hidden = true;
}

function jsonPost(url, body) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  })
    .then(async (r) => {
      const data = await r.json().catch(() => null);
      return { ok: r.ok, status: r.status, data };
    })
    .catch(() => ({ ok: false, status: 0, data: null }));
}

function createConfetti(canvas, { loop = false } = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let running = true;
  let pieces = [];
  let last = performance.now();
  let endAt = loop ? Infinity : performance.now() + 4500;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(n) {
    const rect = canvas.getBoundingClientRect();
    const colors = [
      "#ff3b65",
      "#ff8fab",
      "#0aa5ff",
      "#24c3ff",
      "#ffd166",
      "#17c964",
      "#ffffff",
    ];
    for (let i = 0; i < n; i++) {
      const x = Math.random() * rect.width;
      const y = -20 - Math.random() * rect.height * 0.2;
      const s = 4 + Math.random() * 8;
      pieces.push({
        x,
        y,
        s,
        vx: -0.6 + Math.random() * 1.2,
        vy: 2.4 + Math.random() * 3.6,
        r: Math.random() * Math.PI,
        vr: -0.18 + Math.random() * 0.36,
        c: colors[(Math.random() * colors.length) | 0],
        o: 0.7 + Math.random() * 0.3,
      });
    }
  }

  function tick(now) {
    if (!running) return;
    const dt = Math.min(32, now - last);
    last = now;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Keep a gentle stream for loop mode.
    if (loop) spawn(Math.random() < 0.4 ? 2 : 0);

    for (const p of pieces) {
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.r += p.vr * (dt / 16);
      p.vy += 0.02 * (dt / 16);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha = p.o;
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.7);
      ctx.restore();
    }

    pieces = pieces.filter((p) => p.y < rect.height + 40);

    if (now < endAt) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  resize();
  spawn(loop ? 36 : 70);
  requestAnimationFrame(tick);

  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  return {
    stop() {
      running = false;
      window.removeEventListener("resize", onResize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}

const I18N = {
  nl: {
    page_title: "Playmobil aan Zee | Wedstrijd",
    logo_aria: "Smiley logo",
    intro_title: "Playmobil aan Zee",
    intro_subtitle: "Wedstrijd",
    hero_brand: "Playmobil aan Zee Wedstrijd",
    hero_title: "Welkom!",
    hero_text:
      "Tel alle verborgen vlaggetjes in elk diorama op de beurs, tel ze samen, en vul het totaal hieronder in!",
    form_aria: "Wedstrijdformulier",
    form_title: "Doe mee",
    label_email: "E-mailadres",
    email_placeholder: "jij@voorbeeld.be",
    label_newsletter: "Ja, je mag mij mailen voor de nieuwsbrief (optioneel)",
    admin_gate_note: "Admin modus. Vul het wachtwoord in.",
    label_password: "Wachtwoord",
    admin_open_btn: "Open admin paneel",
    label_city: "Gemeente/stad (optioneel)",
    city_placeholder: "bv. Oostende",
    label_city_hint: "Alleen voor statistieken.",
    continue_btn: "Verder",
    label_answer: "Totaal van de rekensom van alle vlagjes",
    submit_btn: "Versturen",
    admin_panel_aria: "Admin paneel",
    admin_title: "Admin",
    admin_refresh_btn: "Ververs",
    stat_total: "Deelnemers",
    stat_correct: "Juist",
    stat_wrong: "Fout",
    stat_gold: "Goud",
    gold_label: "Volgende gouden prijs over",
    gold_unit: "deelnemers",
    gold_apply_btn: "Toepassen",
    winners_title: "Gouden winnaars",
    legal_summary: "Privacy & voorwaarden",
    legal_p1:
      "We verzamelen je e-mailadres om deelname te registreren en dubbele deelnames te vermijden. Gemeente/stad is optioneel en enkel voor statistieken.",
    legal_p2:
      "Nieuwsbrief: alleen als je het vakje aanvinkt. Je kan je altijd uitschrijven.",
    footer_note: "© Playmobil aan Zee",
    overlay_close: "Sluiten",
    gold_screen_text: "Je scherm blijft zo staan. Laat dit zien aan onze crew.",
    lang_switch_aria: "Taalkeuze",
    trophy_aria: "Trofee",
    gold_winner_title: "Je hebt een hoofdprijs gewonnen !",
    msg_loading: "Laden...",
    msg_no_connection: "Geen verbinding met server.",
    msg_admin_login_failed: "Admin login mislukt.",
    msg_no_winners: "Nog geen gouden winnaars.",
    msg_ok: "OK.",
    msg_invalid_email: "Vul eerst een geldig e-mailadres in.",
    msg_saving: "Opslaan...",
    msg_already_played:
      "U hebt al deelgenomen aan deze wedstrijd; bedankt voor uw deelname.",
    msg_try_again: "Er ging iets mis. Probeer opnieuw.",
    msg_fill_total: "Top! Vul nu je totaal in.",
    msg_password_missing: "Wachtwoord ontbreekt.",
    overlay_admin_title: "Admin",
    overlay_admin_loading: "Admin paneel wordt geladen...",
    msg_applying: "Toepassen...",
    msg_update_failed: "Updaten mislukt.",
    msg_admin_continue: "Klik op 'Verder' om admin login te openen.",
    msg_continue_first: "Klik eerst op 'Verder'.",
    msg_sending: "Versturen...",
    msg_submitted: "Ingediend. Succes!",
    overlay_correct_title: "🎉JOEPIE!🎉Helemaal juist!",
    overlay_correct_text:
      "Helaas geen hoofdprijs, maar je kan alsnog een figuur afhalen bij de crew.",
    overlay_wrong_title: ":( Sorry, dat is niet correct.",
    overlay_wrong_text: "Probeer opnieuw met hetzelfde emailadres.",
    msg_wrong_short: "Probeer opnieuw met hetzelfde emailadres.",
  },
  en: {
    page_title: "Playmobil aan Zee | Contest",
    logo_aria: "Smiley logo",
    intro_title: "Playmobil aan Zee",
    intro_subtitle: "Contest",
    hero_brand: "Playmobil aan Zee Contest",
    hero_title: "Welcome!",
    hero_text:
      "Count all hidden flags in each diorama at the fair, add them up, and enter the total below!",
    form_aria: "Contest form",
    form_title: "Join",
    label_email: "Email address",
    email_placeholder: "you@example.com",
    label_newsletter: "Yes, you may email me about the newsletter (optional)",
    admin_gate_note: "Admin mode. Enter the password.",
    label_password: "Password",
    admin_open_btn: "Open admin panel",
    label_city: "City/municipality (optional)",
    city_placeholder: "e.g. Ostend",
    label_city_hint: "Only for statistics.",
    continue_btn: "Continue",
    label_answer: "Total of the flags count",
    submit_btn: "Send",
    admin_panel_aria: "Admin panel",
    admin_title: "Admin",
    admin_refresh_btn: "Refresh",
    stat_total: "Participants",
    stat_correct: "Correct",
    stat_wrong: "Wrong",
    stat_gold: "Gold",
    gold_label: "Next gold prize in",
    gold_unit: "participants",
    gold_apply_btn: "Apply",
    winners_title: "Gold winners",
    legal_summary: "Privacy & terms",
    legal_p1:
      "We collect your email to register participation and avoid duplicates. City/municipality is optional and for statistics only.",
    legal_p2:
      "Newsletter: only if you tick the box. You can unsubscribe at any time.",
    footer_note: "© Playmobil aan Zee",
    overlay_close: "Close",
    gold_screen_text: "This screen stays on. Show it to our crew.",
    lang_switch_aria: "Language switcher",
    trophy_aria: "Trophy",
    gold_winner_title: "You won a grand prize!",
    msg_loading: "Loading...",
    msg_no_connection: "No connection to server.",
    msg_admin_login_failed: "Admin login failed.",
    msg_no_winners: "No gold winners yet.",
    msg_ok: "OK.",
    msg_invalid_email: "Please enter a valid email address first.",
    msg_saving: "Saving...",
    msg_already_played:
      "You have already participated in this contest; thanks for joining.",
    msg_try_again: "Something went wrong. Please try again.",
    msg_fill_total: "Great! Now enter your total.",
    msg_password_missing: "Password missing.",
    overlay_admin_title: "Admin",
    overlay_admin_loading: "Loading admin panel...",
    msg_applying: "Applying...",
    msg_update_failed: "Update failed.",
    msg_admin_continue: "Click 'Continue' to open admin login.",
    msg_continue_first: "Click 'Continue' first.",
    msg_sending: "Sending...",
    msg_submitted: "Submitted. Good luck!",
    overlay_correct_title: "🎉YAY!🎉Correct!",
    overlay_correct_text:
      "No grand prize, but you can still pick up a figure from the crew.",
    overlay_wrong_title: ":( Sorry, that's not correct.",
    overlay_wrong_text: "Try again with the same email address.",
    msg_wrong_short: "Try again with the same email address.",
  },
  de: {
    page_title: "Playmobil aan Zee | Wettbewerb",
    logo_aria: "Smiley-Logo",
    intro_title: "Playmobil aan Zee",
    intro_subtitle: "Wettbewerb",
    hero_brand: "Playmobil aan Zee Wettbewerb",
    hero_title: "Willkommen!",
    hero_text:
      "Zähle alle versteckten Fähnchen in jedem Diorama auf der Messe, addiere sie und trage die Gesamtzahl unten ein!",
    form_aria: "Wettbewerbsformular",
    form_title: "Mitmachen",
    label_email: "E-Mail-Adresse",
    email_placeholder: "du@beispiel.de",
    label_newsletter: "Ja, ihr dürft mir zum Newsletter mailen (optional)",
    admin_gate_note: "Admin-Modus. Passwort eingeben.",
    label_password: "Passwort",
    admin_open_btn: "Admin-Bereich öffnen",
    label_city: "Stadt/Gemeinde (optional)",
    city_placeholder: "z. B. Ostende",
    label_city_hint: "Nur für Statistiken.",
    continue_btn: "Weiter",
    label_answer: "Gesamtsumme der Fähnchen",
    submit_btn: "Senden",
    admin_panel_aria: "Admin-Bereich",
    admin_title: "Admin",
    admin_refresh_btn: "Aktualisieren",
    stat_total: "Teilnehmer",
    stat_correct: "Richtig",
    stat_wrong: "Falsch",
    stat_gold: "Gold",
    gold_label: "Nächster Goldpreis in",
    gold_unit: "Teilnehmern",
    gold_apply_btn: "Anwenden",
    winners_title: "Gold-Gewinner",
    legal_summary: "Datenschutz & Bedingungen",
    legal_p1:
      "Wir sammeln deine E-Mail-Adresse, um die Teilnahme zu registrieren und doppelte Teilnahmen zu vermeiden. Stadt/Gemeinde ist optional und nur für Statistiken.",
    legal_p2:
      "Newsletter: nur wenn du das Kästchen ankreuzt. Du kannst dich jederzeit abmelden.",
    footer_note: "© Playmobil aan Zee",
    overlay_close: "Schließen",
    gold_screen_text: "Dieser Bildschirm bleibt stehen. Zeig ihn unserem Team.",
    lang_switch_aria: "Sprachauswahl",
    trophy_aria: "Pokal",
    gold_winner_title: "Du hast einen Hauptpreis gewonnen!",
    msg_loading: "Laden...",
    msg_no_connection: "Keine Verbindung zum Server.",
    msg_admin_login_failed: "Admin-Login fehlgeschlagen.",
    msg_no_winners: "Noch keine Gold-Gewinner.",
    msg_ok: "OK.",
    msg_invalid_email: "Bitte zuerst eine gültige E-Mail-Adresse eingeben.",
    msg_saving: "Speichern...",
    msg_already_played:
      "Du hast bereits an diesem Wettbewerb teilgenommen; danke fürs Mitmachen.",
    msg_try_again: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
    msg_fill_total: "Super! Gib jetzt deine Summe ein.",
    msg_password_missing: "Passwort fehlt.",
    overlay_admin_title: "Admin",
    overlay_admin_loading: "Admin-Bereich wird geladen...",
    msg_applying: "Wird angewendet...",
    msg_update_failed: "Aktualisierung fehlgeschlagen.",
    msg_admin_continue: "Klicke auf 'Weiter', um den Admin-Login zu öffnen.",
    msg_continue_first: "Bitte zuerst auf 'Weiter' klicken.",
    msg_sending: "Senden...",
    msg_submitted: "Eingereicht. Viel Erfolg!",
    overlay_correct_title: "🎉Juhu!🎉Alles richtig!",
    overlay_correct_text:
      "Leider kein Hauptpreis, aber du kannst trotzdem eine Figur beim Team abholen.",
    overlay_wrong_title: ":( Sorry, das ist nicht korrekt.",
    overlay_wrong_text: "Versuche es erneut mit derselben E-Mail-Adresse.",
    msg_wrong_short: "Versuche es erneut mit derselben E-Mail-Adresse.",
  },
  fr: {
    page_title: "Playmobil aan Zee | Concours",
    logo_aria: "Logo sourire",
    intro_title: "Playmobil aan Zee",
    intro_subtitle: "Concours",
    hero_brand: "Concours Playmobil aan Zee",
    hero_title: "Bienvenue !",
    hero_text:
      "Compte tous les drapeaux cachés dans chaque diorama au salon, additionne-les et saisis le total ci-dessous !",
    form_aria: "Formulaire du concours",
    form_title: "Participer",
    label_email: "Adresse e-mail",
    email_placeholder: "toi@exemple.fr",
    label_newsletter: "Oui, vous pouvez m'envoyer la newsletter (optionnel)",
    admin_gate_note: "Mode admin. Entrez le mot de passe.",
    label_password: "Mot de passe",
    admin_open_btn: "Ouvrir le panneau admin",
    label_city: "Ville/commune (optionnel)",
    city_placeholder: "ex. Ostende",
    label_city_hint: "Uniquement pour les statistiques.",
    continue_btn: "Continuer",
    label_answer: "Total du comptage des drapeaux",
    submit_btn: "Envoyer",
    admin_panel_aria: "Panneau admin",
    admin_title: "Admin",
    admin_refresh_btn: "Rafraichir",
    stat_total: "Participants",
    stat_correct: "Correct",
    stat_wrong: "Faux",
    stat_gold: "Or",
    gold_label: "Prochain prix or dans",
    gold_unit: "participants",
    gold_apply_btn: "Appliquer",
    winners_title: "Gagnants or",
    legal_summary: "Confidentialite & conditions",
    legal_p1:
      "Nous collectons votre e-mail pour enregistrer la participation et eviter les doublons. Ville/commune est optionnel et uniquement pour les statistiques.",
    legal_p2:
      "Newsletter : seulement si vous cochez la case. Vous pouvez vous desinscrire a tout moment.",
    footer_note: "© Playmobil aan Zee",
    overlay_close: "Fermer",
    gold_screen_text:
      "Cet ecran reste affiche. Montrez-le a notre equipe.",
    lang_switch_aria: "Choix de langue",
    trophy_aria: "Trophee",
    gold_winner_title: "Vous avez gagne un grand prix !",
    msg_loading: "Chargement...",
    msg_no_connection: "Pas de connexion au serveur.",
    msg_admin_login_failed: "Connexion admin echouee.",
    msg_no_winners: "Pas encore de gagnants or.",
    msg_ok: "OK.",
    msg_invalid_email: "Veuillez d'abord saisir une adresse e-mail valide.",
    msg_saving: "Enregistrement...",
    msg_already_played:
      "Vous avez deja participe a ce concours ; merci pour votre participation.",
    msg_try_again: "Une erreur s'est produite. Veuillez reessayer.",
    msg_fill_total: "Super ! Saisissez maintenant votre total.",
    msg_password_missing: "Mot de passe manquant.",
    overlay_admin_title: "Admin",
    overlay_admin_loading: "Chargement du panneau admin...",
    msg_applying: "Application...",
    msg_update_failed: "Mise a jour echouee.",
    msg_admin_continue: "Cliquez sur 'Continuer' pour ouvrir l'admin.",
    msg_continue_first: "Cliquez d'abord sur 'Continuer'.",
    msg_sending: "Envoi...",
    msg_submitted: "Envoye. Bonne chance !",
    overlay_correct_title: "🎉Bravo !🎉Correct !",
    overlay_correct_text:
      "Malheureusement pas de grand prix, mais vous pouvez quand meme retirer une figurine aupres de notre equipe.",
    overlay_wrong_title: ":( Desole, ce n'est pas correct.",
    overlay_wrong_text:
      "Essayez a nouveau avec la meme adresse e-mail.",
    msg_wrong_short: "Essayez a nouveau avec la meme adresse e-mail.",
  },
};

const SUPPORTED_LANGS = ["nl", "en", "de", "fr"];
let currentLang = "nl";

function getLangFromUrl() {
  const params = new URLSearchParams(window.location.search || "");
  const lang = String(params.get("lang") || "").toLowerCase();
  return SUPPORTED_LANGS.includes(lang) ? lang : null;
}

function t(key) {
  const dict = I18N[currentLang] || I18N.nl;
  return dict[key] || I18N.nl[key] || key;
}

function applyTranslations() {
  document.title = t("page_title");
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const raw = el.dataset.i18nAttr || "";
    const parts = raw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    for (const part of parts) {
      const [attr, key] = part.split(":").map((s) => s.trim());
      if (!attr || !key) continue;
      el.setAttribute(attr, t(key));
    }
  });

  document.querySelectorAll("[data-msg-key]").forEach((el) => {
    const key = el.dataset.msgKey;
    if (!key) return;
    el.textContent = t(key);
  });
}

function setLang(lang, { updateUrl = true } = {}) {
  const normalized = String(lang || "").toLowerCase();
  const next = SUPPORTED_LANGS.includes(normalized) ? normalized : "nl";
  currentLang = next;
  applyTranslations();
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState({}, "", url);
  }

  document.querySelectorAll(".langSwitch__btn").forEach((btn) => {
    const isActive = btn.dataset.lang === next;
    btn.classList.toggle("langSwitch__btn--active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const urlLang = getLangFromUrl();
  setLang(urlLang || "nl", { updateUrl: !!urlLang });

  document.querySelectorAll(".langSwitch__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = String(btn.dataset.lang || "").toLowerCase();
      setLang(lang, { updateUrl: true });
    });
  });

  const intro = $("intro");
  const emailEl = $("email");
  const continueBtn = $("continueBtn");
  const continueMsg = $("continueMsg");
  const answerEl = $("answer");
  const step2 = $("step2");
  const form = $("entryForm");
  const formMsg = $("formMsg");
  const submitBtn = $("submitBtn");
  const overlay = $("overlay");
  const overlayCard = $("overlayCard");
  const overlayClose = $("overlayClose");
  const overlayTitle = $("overlayTitle");
  const overlayText = $("overlayText");
  const confetti = $("confetti");

  const adminGate = $("adminGate");
  const adminPassword = $("adminPassword");
  const adminLogin = $("adminLogin");
  const adminGateMsg = $("adminGateMsg");
  const entryFields = $("entryFields");
  const adminPanel = $("adminPanel");
  const adminMsg = $("adminMsg");
  const adminRefresh = $("adminRefresh");

  const statTotal = $("statTotal");
  const statCorrect = $("statCorrect");
  const statWrong = $("statWrong");
  const statGold = $("statGold");
  const goldRemainingInput = $("goldRemainingInput");
  const goldMinus = $("goldMinus");
  const goldPlus = $("goldPlus");
  const goldApply = $("goldApply");
  const winnersList = $("winnersList");

  const goldScreen = $("goldScreen");
  const goldTitle = $("goldTitle");
  const confettiGold = $("confettiGold");

  let confettiRun = null;
  let confettiGoldRun = null;
  let overlayOnClose = null;
  let overlayPersistent = false;
  let adminPw = "";
  let remainingLocal = null;
  let entryUnlocked = false;
  let adminGateActive = false;

  function showOverlay(
    title,
    text,
    { confettiMode = "none", tone = "normal", onClose = null, persistent = false } = {}
  ) {
    overlayTitle.textContent = title || "";
    overlayText.textContent = text || "";
    overlayOnClose = typeof onClose === "function" ? onClose : null;
    overlayPersistent = !!persistent;
    if (overlayCard) {
      overlayCard.classList.remove("overlay__card--error", "overlay__card--winner");
      if (tone === "error") {
        overlayCard.classList.add("overlay__card--error");
      }
      if (tone === "winner") {
        overlayCard.classList.add("overlay__card--winner");
      }
    }
    if (overlayClose) {
      overlayClose.hidden = overlayPersistent;
    }
    show(overlay);
    if (!prefersReducedMotion() && confettiMode !== "none") {
      if (confettiRun) confettiRun.stop();
      confettiRun = createConfetti(confetti, { loop: confettiMode === "loop" });
    }
  }

  function hideOverlay(force = false) {
    if (overlayPersistent && !force) {
      return;
    }
    hide(overlay);
    if (confettiRun) confettiRun.stop();
    confettiRun = null;
    overlayPersistent = false;
    if (overlayClose) {
      overlayClose.hidden = false;
    }
    if (overlayOnClose) {
      const fn = overlayOnClose;
      overlayOnClose = null;
      fn();
    }
  }

  function resetForNextPlayer() {
    const emailValue = String(emailEl.value || "");
    form.reset();
    emailEl.value = emailValue;
    entryUnlocked = false;
    setMsg(formMsg, "", "");
    setMsg(continueMsg, "", "");
    emailEl.disabled = false;
    answerEl.disabled = true;
    step2.classList.remove("step2--on");
    step2.setAttribute("aria-hidden", "true");
    updateStep2();
    emailEl.focus();
  }

  function setBusy(isBusy) {
    const els = [
      submitBtn,
      emailEl,
      continueBtn,
      answerEl,
      $("newsletter"),
      $("city"),
      adminLogin,
      adminPassword,
      adminRefresh,
      goldApply,
      goldMinus,
      goldPlus,
      goldRemainingInput,
    ];

    for (const el of els) {
      if (!el) continue;
      if (isBusy) {
        el.dataset.prevDisabled = String(!!el.disabled);
        el.disabled = true;
      } else {
        const prev = el.dataset.prevDisabled;
        if (prev !== undefined) {
          el.disabled = prev === "true";
          delete el.dataset.prevDisabled;
        } else {
          el.disabled = false;
        }
      }
    }
  }

  function enterGoldScreen() {
    goldTitle.textContent = t("gold_winner_title");
    show(goldScreen);
    if (!prefersReducedMotion()) {
      if (confettiGoldRun) confettiGoldRun.stop();
      confettiGoldRun = createConfetti(confettiGold, { loop: true });
    }
  }

  function updateStep2() {
    const email = String(emailEl.value || "").trim();
    const adminMode = email.toLowerCase() === "admin" && adminGateActive;
    if (adminMode) {
      entryUnlocked = false;
      show(adminGate);
      setMsg(adminGateMsg, "", "");
      hide(entryFields);
      setMsg(continueMsg, "", "");
      step2.classList.remove("step2--on");
      answerEl.disabled = true;
      step2.setAttribute("aria-hidden", "true");
      setMsg(formMsg, "", "");
      return;
    }

    hide(adminGate);
    hide(adminPanel);
    setMsg(adminGateMsg, "", "");
    show(entryFields);

    const ok = isLikelyEmail(email);
    if (ok && entryUnlocked) {
      step2.classList.add("step2--on");
      answerEl.disabled = false;
      step2.setAttribute("aria-hidden", "false");
      setMsg(continueMsg, "", "");
    } else {
      step2.classList.remove("step2--on");
      answerEl.disabled = true;
      step2.setAttribute("aria-hidden", "true");
    }
  }

  async function adminFetchStats() {
    setBusy(true);
    setMsgKey(adminMsg, "msg_loading", "");
    setMsg(adminGateMsg, "", "");
    const res = await jsonPost("api/admin_stats.php", { password: adminPw });
    setBusy(false);

    if (!res.ok || !res.data || !res.data.ok) {
      if (res.status === 0) {
        setMsgKey(adminGateMsg, "msg_no_connection", "err");
      } else if (res.data && res.data.message) {
        setMsg(adminGateMsg, res.data.message, "err");
      } else {
        setMsgKey(adminGateMsg, "msg_admin_login_failed", "err");
      }
      return false;
    }

    const s = res.data.stats;
    statTotal.textContent = String(s.total);
    statCorrect.textContent = String(s.correct);
    statWrong.textContent = String(s.wrong);
    statGold.textContent = String(s.gold);

    remainingLocal = clamp(Number(s.remaining_to_gold), 1, 1000);
    if (goldRemainingInput) {
      goldRemainingInput.value = String(remainingLocal);
    }

    winnersList.textContent = "";
    const winners = res.data.winners || [];
    if (winners.length === 0) {
      if (winnersList.dataset) {
        winnersList.dataset.msgKey = "msg_no_winners";
      }
      winnersList.textContent = t("msg_no_winners");
    } else {
      if (winnersList.dataset) {
        delete winnersList.dataset.msgKey;
      }
      for (const w of winners) {
        const row = document.createElement("div");
        row.className = "winner";
        const left = document.createElement("div");
        left.textContent = w.email;
        const right = document.createElement("div");
        right.className = "winner__id";
        right.textContent = "#" + w.player_no;
        row.appendChild(left);
        row.appendChild(right);
        winnersList.appendChild(row);
      }
    }

    setMsgKey(adminMsg, "msg_ok", "ok");
    setMsg(adminGateMsg, "", "");
    return true;
  }

  // Intro animation
  if (intro) {
    const doIntro = () => {
      if (prefersReducedMotion()) {
        intro.classList.add("intro--hide");
        setTimeout(() => hide(intro), 200);
        return;
      }
      setTimeout(() => intro.classList.add("intro--wash"), 700);
      setTimeout(() => {
        intro.classList.add("intro--hide");
        setTimeout(() => hide(intro), 540);
      }, 2500);
    };
    doIntro();
  }

  const legalDetails = document.querySelector("details.legal");
  if (legalDetails) {
    legalDetails.open = false;
  }

  if (emailEl) {
    emailEl.addEventListener("input", () => {
      adminGateActive = false;
      entryUnlocked = false;
      setMsg(continueMsg, "", "");
      updateStep2();
    });
    updateStep2();
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", async () => {
      const email = String(emailEl.value || "").trim();
      if (email.toLowerCase() === "admin") {
        adminGateActive = true;
        updateStep2();
        setMsg(continueMsg, "", "");
        if (adminPassword) {
          adminPassword.focus();
        }
        return;
      }
      adminGateActive = false;
      if (!emailEl.checkValidity()) {
        setMsgKey(continueMsg, "msg_invalid_email", "err");
        emailEl.reportValidity();
        return;
      }

      const newsletter = $("newsletter").checked;
      const city = String($("city").value || "").trim();

      setBusy(true);
      setMsgKey(continueMsg, "msg_saving", "");
      const res = await jsonPost("api/pre_register.php", {
        email,
        newsletter_opt_in: newsletter,
        city: city.length ? city : null,
      });
      setBusy(false);

      const data = res.data || {};
      if (!res.ok || !data || data.ok !== true) {
        const code = data.code || "";
        const msg =
          res.status === 0
            ? t("msg_no_connection")
            : data.message ||
              (code === "already_played"
                ? t("msg_already_played")
                : t("msg_try_again"));
        if (res.status === 0) {
          setMsgKey(continueMsg, "msg_no_connection", "err");
        } else if (code === "already_played") {
          setMsgKey(continueMsg, "msg_already_played", "err");
        } else if (data.message) {
          setMsg(continueMsg, msg, "err");
        } else {
          setMsgKey(continueMsg, "msg_try_again", "err");
        }
        if (code === "already_played") {
          setMsgKey(formMsg, "msg_already_played", "err");
        }
        return;
      }

      entryUnlocked = true;
      updateStep2();
      setMsgKey(continueMsg, "msg_fill_total", "ok");
      if (!answerEl.disabled) {
        answerEl.focus();
      }
    });
  }

  if (overlayClose) overlayClose.addEventListener("click", hideOverlay);
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hideOverlay();
    });
  }

  if (adminLogin) {
    adminLogin.addEventListener("click", async () => {
      adminPw = String(adminPassword.value || "");
      if (adminPw.length === 0) {
        setMsgKey(adminGateMsg, "msg_password_missing", "err");
        return;
      }

      showOverlay(t("overlay_admin_title"), t("overlay_admin_loading"), {
        confettiMode: "none",
      });
      const ok = await adminFetchStats();
      hideOverlay();
      if (ok) {
        show(adminPanel);
      } else {
        hide(adminPanel);
      }
    });
  }

  if (adminRefresh) {
    adminRefresh.addEventListener("click", adminFetchStats);
  }

  function updateRemainingUI() {
    if (remainingLocal == null) return;
    if (goldRemainingInput) {
      goldRemainingInput.value = String(remainingLocal);
    }
  }

  if (goldMinus) {
    goldMinus.addEventListener("click", () => {
      if (remainingLocal == null) return;
      remainingLocal = clamp(Number(remainingLocal) - 1, 1, 1000);
      updateRemainingUI();
    });
  }

  if (goldPlus) {
    goldPlus.addEventListener("click", () => {
      if (remainingLocal == null) return;
      remainingLocal = clamp(Number(remainingLocal) + 1, 1, 1000);
      updateRemainingUI();
    });
  }

  if (goldRemainingInput) {
    goldRemainingInput.addEventListener("input", () => {
      const n = Number(goldRemainingInput.value);
      if (!Number.isFinite(n)) return;
      remainingLocal = clamp(Math.floor(n), 1, 1000);
    });
  }

  if (goldApply) {
    goldApply.addEventListener("click", async () => {
      if (goldRemainingInput) {
        const n = Number(goldRemainingInput.value);
        if (Number.isFinite(n)) {
          remainingLocal = clamp(Math.floor(n), 1, 1000);
        }
      }
      if (remainingLocal == null) return;
      setBusy(true);
      setMsgKey(adminMsg, "msg_applying", "");
      const res = await jsonPost("api/admin_update.php", {
        password: adminPw,
        remaining_to_gold: Number(remainingLocal),
      });
      setBusy(false);
      if (!res.ok || !res.data || !res.data.ok) {
        if (res.data && res.data.message) {
          setMsg(adminMsg, res.data.message, "err");
        } else {
          setMsgKey(adminMsg, "msg_update_failed", "err");
        }
        return;
      }
      remainingLocal = res.data.remaining_to_gold;
      updateRemainingUI();
      setMsgKey(adminMsg, "msg_ok", "ok");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setMsg(formMsg, "", "");

      const email = String(emailEl.value || "").trim();
      const isAdmin = email.toLowerCase() === "admin";
      if (isAdmin) {
        setMsgKey(formMsg, "msg_admin_continue", "err");
        return;
      }

      // Trigger native validation UI where possible
      if (!emailEl.checkValidity()) {
        emailEl.reportValidity();
        return;
      }
      if (!entryUnlocked) {
        setMsgKey(continueMsg, "msg_continue_first", "err");
        return;
      }
      if (answerEl.disabled || !answerEl.checkValidity()) {
        answerEl.reportValidity();
        return;
      }

      const answer = Number(answerEl.value);
      const newsletter = $("newsletter").checked;
      const city = String($("city").value || "").trim();

      setBusy(true);
      setMsgKey(formMsg, "msg_sending", "");

      const res = await jsonPost("api/submit.php", {
        email,
        answer,
        newsletter_opt_in: newsletter,
        city: city.length ? city : null,
      });

      setBusy(false);

      const data = res.data || {};
      if (!res.ok || !data || data.ok !== true) {
        const code = data.code || "";
        const msg =
          res.status === 0
            ? t("msg_no_connection")
            : data.message ||
              (code === "already_played"
                ? t("msg_already_played")
                : t("msg_try_again"));
        if (res.status === 0) {
          setMsgKey(formMsg, "msg_no_connection", "err");
        } else if (code === "already_played") {
          setMsgKey(formMsg, "msg_already_played", "err");
        } else if (data.message) {
          setMsg(formMsg, msg, "err");
        } else {
          setMsgKey(formMsg, "msg_try_again", "err");
        }
        return;
      }

      if (data.is_gold) {
        emailEl.disabled = true;
        answerEl.disabled = true;
        $("newsletter").disabled = true;
        $("city").disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        enterGoldScreen();
        return;
      }

      if (data.is_correct) {
        emailEl.disabled = true;
        answerEl.disabled = true;
        $("newsletter").disabled = true;
        $("city").disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        showOverlay(
          t("overlay_correct_title"),
          t("overlay_correct_text"),
          { confettiMode: "loop", tone: "winner", persistent: true }
        );
        setMsgKey(formMsg, "msg_submitted", "ok");
      } else {
        showOverlay(
          t("overlay_wrong_title"),
          t("overlay_wrong_text"),
          { confettiMode: "none", tone: "error", onClose: resetForNextPlayer }
        );
        setMsgKey(formMsg, "msg_wrong_short", "err");
      }
    });
  }
});
