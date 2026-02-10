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
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v);
}

function prefersReducedMotion() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function setMsg(el, msg, kind) {
  if (!el) return;
  el.textContent = msg || "";
  el.classList.remove("formMsg--ok", "formMsg--err");
  if (kind === "ok") el.classList.add("formMsg--ok");
  if (kind === "err") el.classList.add("formMsg--err");
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

document.addEventListener("DOMContentLoaded", () => {
  const intro = $("intro");
  const hiddenFlag = $("hiddenFlag");
  const flagToast = $("flagToast");
  const emailEl = $("email");
  const answerEl = $("answer");
  const step2 = $("step2");
  const form = $("entryForm");
  const formMsg = $("formMsg");
  const submitBtn = $("submitBtn");
  const overlay = $("overlay");
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
  const goldRemaining = $("goldRemaining");
  const goldMinus = $("goldMinus");
  const goldPlus = $("goldPlus");
  const goldApply = $("goldApply");
  const winnersList = $("winnersList");

  const goldScreen = $("goldScreen");
  const goldTitle = $("goldTitle");
  const confettiGold = $("confettiGold");

  let confettiRun = null;
  let confettiGoldRun = null;
  let foundFlag = false;
  let adminPw = "";
  let remainingLocal = null;

  function showOverlay(title, text, { confettiMode = "none" } = {}) {
    overlayTitle.textContent = title || "";
    overlayText.textContent = text || "";
    show(overlay);
    if (!prefersReducedMotion() && confettiMode !== "none") {
      if (confettiRun) confettiRun.stop();
      confettiRun = createConfetti(confetti, { loop: confettiMode === "loop" });
    }
  }

  function hideOverlay() {
    hide(overlay);
    if (confettiRun) confettiRun.stop();
    confettiRun = null;
  }

  function setBusy(isBusy) {
    const els = [
      submitBtn,
      emailEl,
      answerEl,
      $("newsletter"),
      $("city"),
      adminLogin,
      adminPassword,
      adminRefresh,
      goldApply,
      goldMinus,
      goldPlus,
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

  function enterGoldScreen(rank) {
    goldTitle.textContent =
      "Je bent onze " +
      String(rank) +
      "ste speler! Je hebt de gouden prijs gewonnen!";
    show(goldScreen);
    if (!prefersReducedMotion()) {
      if (confettiGoldRun) confettiGoldRun.stop();
      confettiGoldRun = createConfetti(confettiGold, { loop: true });
    }
  }

  function updateStep2() {
    const email = String(emailEl.value || "").trim();
    const adminMode = email.toLowerCase() === "admin";
    if (adminMode) {
      show(adminGate);
      setMsg(adminGateMsg, "", "");
      hide(entryFields);
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
    if (ok) {
      step2.classList.add("step2--on");
      answerEl.disabled = false;
      step2.setAttribute("aria-hidden", "false");
    } else {
      step2.classList.remove("step2--on");
      answerEl.disabled = true;
      step2.setAttribute("aria-hidden", "true");
    }
  }

  async function adminFetchStats() {
    setBusy(true);
    setMsg(adminMsg, "Laden...", "");
    setMsg(adminGateMsg, "", "");
    const res = await jsonPost("api/admin_stats.php", { password: adminPw });
    setBusy(false);

    if (!res.ok || !res.data || !res.data.ok) {
      const msg =
        res.status === 0
          ? "Geen verbinding met server."
          : (res.data && res.data.message) || "Admin login mislukt.";
      setMsg(adminGateMsg, msg, "err");
      return false;
    }

    const s = res.data.stats;
    statTotal.textContent = String(s.total);
    statCorrect.textContent = String(s.correct);
    statWrong.textContent = String(s.wrong);
    statGold.textContent = String(s.gold);

    remainingLocal = s.remaining_to_gold;
    goldRemaining.textContent = String(remainingLocal);

    winnersList.textContent = "";
    const winners = res.data.winners || [];
    if (winners.length === 0) {
      winnersList.textContent = "Nog geen gouden winnaars.";
    } else {
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

    setMsg(adminMsg, "OK.", "ok");
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
      setTimeout(() => intro.classList.add("intro--wash"), 900);
      setTimeout(() => {
        intro.classList.add("intro--hide");
        setTimeout(() => hide(intro), 540);
      }, 1900);
    };
    doIntro();
  }

  // Hidden flag easter egg
  if (hiddenFlag) {
    hiddenFlag.addEventListener("click", () => {
      if (foundFlag) return;
      foundFlag = true;
      hiddenFlag.classList.add("hiddenFlag--found");
      if (flagToast) flagToast.textContent = "Je vond een vlaggetje! Goed speuren!";
    });
  }

  if (emailEl) {
    emailEl.addEventListener("input", updateStep2);
    updateStep2();
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
        setMsg(adminGateMsg, "Wachtwoord ontbreekt.", "err");
        return;
      }

      showOverlay("Admin", "Admin paneel wordt geladen...", { confettiMode: "none" });
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
    goldRemaining.textContent = String(remainingLocal);
  }

  if (goldMinus) {
    goldMinus.addEventListener("click", () => {
      if (remainingLocal == null) return;
      remainingLocal = clamp(Number(remainingLocal) - 1, 1, 1000000);
      updateRemainingUI();
    });
  }

  if (goldPlus) {
    goldPlus.addEventListener("click", () => {
      if (remainingLocal == null) return;
      remainingLocal = clamp(Number(remainingLocal) + 1, 1, 1000000);
      updateRemainingUI();
    });
  }

  if (goldApply) {
    goldApply.addEventListener("click", async () => {
      if (remainingLocal == null) return;
      setBusy(true);
      setMsg(adminMsg, "Toepassen...", "");
      const res = await jsonPost("api/admin_update.php", {
        password: adminPw,
        remaining_to_gold: Number(remainingLocal),
      });
      setBusy(false);
      if (!res.ok || !res.data || !res.data.ok) {
        setMsg(
          adminMsg,
          (res.data && res.data.message) || "Updaten mislukt.",
          "err"
        );
        return;
      }
      remainingLocal = res.data.remaining_to_gold;
      updateRemainingUI();
      setMsg(adminMsg, "OK.", "ok");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setMsg(formMsg, "", "");

      const email = String(emailEl.value || "").trim();
      const isAdmin = email.toLowerCase() === "admin";
      if (isAdmin) {
        setMsg(formMsg, "Gebruik de admin knop hierboven.", "err");
        return;
      }

      // Trigger native validation UI where possible
      if (!emailEl.checkValidity()) {
        emailEl.reportValidity();
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
      setMsg(formMsg, "Versturen...", "");

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
            ? "Geen verbinding met server."
            : data.message ||
              (code === "already_played"
                ? "U hebt al deelgenomen aan deze wedstrijd; bedankt voor uw deelname."
                : "Er ging iets mis. Probeer opnieuw.");
        setMsg(formMsg, msg, "err");
        return;
      }

      // Success UI
      emailEl.disabled = true;
      answerEl.disabled = true;
      $("newsletter").disabled = true;
      $("city").disabled = true;
      if (submitBtn) submitBtn.disabled = true;

      if (data.is_gold) {
        enterGoldScreen(data.player_no);
        return;
      }

      if (data.is_correct) {
        showOverlay(
          "Goed gedaan!",
          "Je antwoord is binnen. Bedankt voor je deelname!",
          { confettiMode: "burst" }
        );
        setMsg(formMsg, "Ingediend. Succes!", "ok");
      } else {
        showOverlay(
          "Dankjewel!",
          "Je antwoord is binnen. Misschien nog eens tellen? (Je kan maar 1x deelnemen per e-mail.)",
          { confettiMode: "none" }
        );
        setMsg(formMsg, "Ingediend.", "ok");
      }
    });
  }
});
