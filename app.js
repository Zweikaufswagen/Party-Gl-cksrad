(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const C = window.PartyCore;
  const SVG = "http://www.w3.org/2000/svg";
  let config, storage, record = null, state = "loading", frameId = 0, toastTimer;
  let soundEnabled = false, audioContext = null, activeDraw = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setState(next) { state = next; document.body.dataset.state = next; }
  function tell(message) { $("liveStatus").textContent = message; }
  function toast(message) {
    $("toast").textContent = message; $("toast").hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { $("toast").hidden = true; }, 4500);
  }
  function block(error) {
    cancelAnimationFrame(frameId); setState("blocked");
    $("spinButton").disabled = true; $("spinButtonText").textContent = "Drehen nicht verfügbar";
    $("spinBadge").textContent = "BITTE PRÜFEN";
    $("errorCard").hidden = false;
    $("errorTitle").textContent = error.code === "CONFIG" ? "Die Party ist noch nicht startklar." : "Kurzer Boxenstopp.";
    $("errorMessage").textContent = error.message || "Die App konnte nicht gestartet werden. Bitte lade die Seite neu oder sprich die Gastgeber an.";
    tell($("errorMessage").textContent);
    if (record && $("resultCard").hidden) renderResult(record, false);
    console.error("Party-Glücksrad:", error);
  }
  function node(tag, attrs, content) {
    const n = document.createElementNS(SVG, tag);
    for (const [name, value] of Object.entries(attrs || {})) n.setAttribute(name, String(value));
    if (content !== undefined) n.textContent = content;
    return n;
  }
  function point(angle, radius) {
    const rad = angle * Math.PI / 180;
    return `${(300 + radius * Math.cos(rad)).toFixed(3)},${(300 + radius * Math.sin(rad)).toFixed(3)}`;
  }
  function renderWheel(tasks) {
    const wheel = $("wheel"); wheel.replaceChildren();
    wheel.append(node("title", {}, `Glücksrad mit ${tasks.length} gleich wahrscheinlichen Aufgaben`));
    const step = 360 / tasks.length;
    tasks.forEach((task, i) => {
      const center = -90 + i * step;
      const start = point(center - step / 2, 296), end = point(center + step / 2, 296);
      const group = node("g", {"data-task-id": task.id});
      group.append(node("path", {
        d: `M300,300 L${start} A296,296 0 ${step > 180 ? 1 : 0} 1 ${end} Z`,
        fill: task.color, stroke: "#17181e", "stroke-width": "2.5"
      }));
      const textGroup = node("g", { transform: `rotate(${i * step} 300 300)`, fill: C.contrastingInk(task.color) });
      // Number-only slices remain readable for dense wheels. Full task appears on reveal.
      if (tasks.length > 16) {
        textGroup.append(node("text", {x:300,y:100,"text-anchor":"middle","font-size":22,"font-family":"Arial, sans-serif","font-weight":700}, String(i + 1).padStart(2,"0")));
      } else {
        textGroup.append(node("text", {x:300,y:88,"text-anchor":"middle","font-size": tasks.length > 12 ? 24 : 29,"font-family":"Arial, sans-serif"}, task.emoji));
        const words = task.label.split(/\s+/);
        const lines = [""];
        for (const word of words) {
          const current = lines.length - 1;
          if (lines[current] && (lines[current] + " " + word).length > 10 && lines.length < 3) lines.push(word);
          else lines[current] += (lines[current] ? " " : "") + word;
        }
        lines.forEach((line, j) => {
          const attrs = { x:300,y:117+j*18,"text-anchor":"middle","font-size":tasks.length > 12 ? 14 : 16,"font-family":"Arial, sans-serif","font-weight":700 };
          if (line.length > 11) { attrs.textLength = tasks.length > 12 ? 70 : 90; attrs.lengthAdjust = "spacingAndGlyphs"; }
          textGroup.append(node("text", attrs, line));
        });
      }
      group.append(textGroup); wheel.append(group);
    });
    wheel.append(node("circle", {cx:300,cy:300,r:296,fill:"none",stroke:"#f4f1e930","stroke-width":2}));
  }
  function applyBranding() {
    document.title = `${config.name} · Party-Glücksrad`;
    document.documentElement.style.setProperty("--accent", config.accentColor);
    document.documentElement.style.setProperty("--accent-ink", C.contrastingInk(config.accentColor));
    document.querySelectorAll("[data-party-name]").forEach(n => { n.textContent = config.name; });
    $("partyEdition").textContent = config.edition;
    const headline = $("mainHeading"); headline.replaceChildren();
    config.headline.split("\n").forEach((line, i) => {
      if (i) headline.append(document.createElement("br"));
      const el = i ? document.createElement("span") : document.createTextNode(line);
      if (i) el.textContent = line;
      headline.append(el);
    });
    $("partyIntro").textContent = config.intro;
    $("footerNote").textContent = config.footerNote;
    $("taskCount").textContent = String(config.tasks.length).padStart(2, "0");
  }
  function safeAudio() {
    if (!soundEnabled) return null;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) { soundEnabled = false; updateSound(); return null; }
      if (!audioContext) audioContext = new Audio();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      return audioContext;
    } catch (_) { return null; }
  }
  function tone(freq, duration, volume = .025) {
    if (!soundEnabled || !audioContext || audioContext.state !== "running") return;
    try {
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = "sine"; oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch (_) { /* Audio is optional; drawing must never depend on it. */ }
  }
  function updateSound() {
    $("soundToggle").setAttribute("aria-pressed", String(soundEnabled));
    $("soundToggle").setAttribute("aria-label", soundEnabled ? "Sound ausschalten" : "Sound einschalten");
    $("soundToggle").title = soundEnabled ? "Sound ausschalten" : "Sound einschalten";
  }
  async function underLock(action) {
    if (navigator.locks && typeof navigator.locks.request === "function") {
      return navigator.locks.request(C.storageKey(config.partyId), {mode:"exclusive"}, action);
    }
    // Best-effort fallback on older browsers / non-secure network HTTP.
    // localStorage itself has no atomic compare-and-set; HTTPS + Web Locks is preferred.
    await new Promise(resolve => setTimeout(resolve, 30 + C.randomInt(90, window.crypto)));
    return action();
  }
  async function spin() {
    if (state !== "ready") return;
    setState("claiming"); $("spinButton").disabled = true;
    $("spinButtonText").textContent = "Dein Dreh wird gesichert …";
    safeAudio();
    try {
      const claimed = await underLock(() => C.claimDraw(storage, config, window.crypto));
      record = claimed.record;
      if (!claimed.created) { showResult(record, false); return; }
      // Allow competing fallback contexts to settle, then honor the persisted record.
      if (!navigator.locks) {
        await new Promise(resolve => setTimeout(resolve, 100));
        record = C.readRecord(storage, config.partyId) || record;
      }
      renderWheel(record.wheel);
      animate(record);
    } catch (error) { block(error); }
  }
  function animate(saved) {
    setState("spinning"); activeDraw = saved.drawId;
    $("spinButtonText").textContent = "Deine Mission kommt …";
    $("spinBadge").textContent = "DREH GESPEICHERT";
    $("wheelStatus").textContent = "DER ZUFALL HAT ENTSCHIEDEN.";
    tell("Das Rad dreht sich. Deine Aufgabe ist bereits gespeichert.");
    const duration = reducedMotion.matches ? 150 : config.spinDurationMs;
    const started = performance.now(); let lastTick = -1;
    const step = 360 / saved.wheel.length;
    function frame(now) {
      if (state !== "spinning" || activeDraw !== saved.drawId) return;
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 5);
      const angle = saved.rotation * eased;
      $("wheel").style.transform = `rotate(${angle}deg)`;
      const tick = Math.floor((angle + step / 2) / step);
      if (!reducedMotion.matches && tick !== lastTick) { tone(620, .035, .018); lastTick = tick; }
      if (progress < 1) frameId = requestAnimationFrame(frame);
      else showResult(record || saved, true);
    }
    frameId = requestAnimationFrame(frame);
  }
  function renderResult(saved, focus) {
    $("resultCategory").textContent = saved.task.category;
    $("resultEmoji").textContent = saved.task.emoji;
    $("resultTitle").textContent = saved.task.title;
    $("resultDescription").textContent = saved.task.description;
    $("resultCard").style.setProperty("--task-color", saved.task.color);
    $("resultCard").hidden = false;
    $("completeButton").hidden = !config.allowCompletion;
    $("completeButton").disabled = !!saved.completedAt;
    $("completeButton").textContent = saved.completedAt ? "Erledigt. Gut gemacht! ✓" : "Mission erledigt ✓";
    $("resultKicker").textContent = saved.completedAt ? "MISSION ACCOMPLISHED" : "DEINE MISSION FÜR HEUTE";
    const date = new Date(saved.drawnAt).toLocaleString("de-DE", {day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
    $("savedNote").textContent = `Gezogen am ${date} · Ein Dreh, eine Mission. Auch nach dem Neuladen.`;
    if (focus) {
      $("resultCard").focus({preventScroll:true});
      if (window.innerWidth <= 760) $("resultCard").scrollIntoView({behavior:reducedMotion.matches ? "auto" : "smooth",block:"center"});
    }
  }
  function showResult(saved, celebrate) {
    cancelAnimationFrame(frameId); record = saved; setState("done"); activeDraw = null;
    renderWheel(saved.wheel);
    $("wheel").style.transform = `rotate(${saved.rotation % 360}deg)`;
    $("spinControls").hidden = true;
    $("taskCount").textContent = String(saved.wheel.length).padStart(2,"0");
    $("spinBadge").textContent = "DREH EINGELÖST";
    $("wheelStatus").textContent = saved.completedAt ? "GUTE STORY. GUTER ABEND." : "DEINE MISSION STEHT FEST.";
    $("hubSymbol").textContent = "✓"; $("hubText").textContent = "DEINS";
    renderResult(saved, celebrate);
    tell(`Deine Aufgabe: ${saved.task.title} ${saved.task.description}`);
    if (celebrate) {
      tone(523.25,.18); setTimeout(() => tone(659.25,.2),110); setTimeout(() => tone(783.99,.35),220);
      if (config.confetti && !reducedMotion.matches) confetti();
    }
  }
  function sync() {
    if (!storage || !config || state === "loading" || state === "blocked") return;
    try {
      const latest = C.readRecord(storage, config.partyId);
      if (!latest) return; // Never reopen a draw in this tab after manual deletion.
      if (state === "claiming") return;
      if (state === "spinning" && latest.drawId === record?.drawId) { record = latest; return; }
      if (!record || latest.drawId !== record.drawId || latest.completedAt !== record.completedAt || state === "ready") showResult(latest,false);
    } catch (error) { block(error); }
  }
  async function complete() {
    if (!record || record.completedAt || state !== "done") return;
    $("completeButton").disabled = true;
    try {
      const completed = await underLock(() => {
        const latest = C.readRecord(storage,config.partyId) || record;
        if (latest.completedAt) return latest;
        return C.writeRecord(storage, {...latest, completedAt:new Date().toISOString()});
      });
      showResult(completed,false); toast("Mission erledigt. Gute Geschichte gesammelt. ✨");
      if (config.confetti && !reducedMotion.matches) confetti();
    } catch (_) {
      $("completeButton").disabled = false;
      toast("Die Erledigt-Markierung konnte nicht gespeichert werden. Deine Aufgabe bleibt bestehen.");
    }
  }
  async function copyTask() {
    if (!record) return;
    const content = `${config.name}\n${record.task.emoji} ${record.task.title}\n\n${record.task.description}`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error();
      await navigator.clipboard.writeText(content); toast("Deine Aufgabe wurde kopiert.");
    } catch (_) {
      const input = document.createElement("textarea"); input.value = content;
      input.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.append(input); input.select();
      let copied = false; try { copied = document.execCommand("copy"); } catch (_) { /* fallback below */ }
      input.remove(); $("copyButton").focus({preventScroll:true});
      toast(copied ? "Deine Aufgabe wurde kopiert." : "Kopieren nicht möglich. Markiere den Aufgabentext oder mache einen Screenshot.");
    }
  }
  let confettiFrame = 0;
  function confetti() {
    const canvas = $("confettiCanvas"), ctx = canvas.getContext("2d");
    if (!ctx) return;
    cancelAnimationFrame(confettiFrame);
    const w = innerWidth, h = innerHeight, scale = Math.min(devicePixelRatio || 1,2);
    canvas.width = w * scale; canvas.height = h * scale; ctx.setTransform(scale,0,0,scale,0,0);
    const colors = [config.accentColor,"#c2afff","#ffb48a","#f4f1e9"];
    const pieces = Array.from({length:80}, (_,i) => ({x:w/2,y:h*.55,vx:(Math.random()-.5)*13,vy:-Math.random()*14-5,spin:Math.random()*6,color:colors[i%4],size:4+Math.random()*5}));
    const start = performance.now(); let previous = start;
    function paint(now) {
      const dt = Math.min((now - previous)/16.667,3); previous = now;
      ctx.clearRect(0,0,w,h);
      for (const p of pieces) {
        p.x += p.vx*dt; p.y += p.vy*dt; p.vy += .19*dt; p.spin += .09*dt;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.spin); ctx.fillStyle=p.color;
        ctx.globalAlpha=Math.max(0,1-(now-start)/2600); ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.6); ctx.restore();
      }
      if (now-start<2600 && !reducedMotion.matches) confettiFrame=requestAnimationFrame(paint);
      else ctx.clearRect(0,0,w,h);
    }
    confettiFrame=requestAnimationFrame(paint);
  }
  function bind() {
    $("spinButton").addEventListener("click",spin);
    $("completeButton").addEventListener("click",complete);
    $("copyButton").addEventListener("click",copyTask);
    $("soundToggle").addEventListener("click",() => { soundEnabled=!soundEnabled; updateSound(); safeAudio(); tone(660,.1); });
    $("privacyButton").addEventListener("click",() => $("privacyDialog").showModal());
    $("closePrivacy").addEventListener("click",() => $("privacyDialog").close());
    $("privacyDialog").addEventListener("click",event => {
      if (event.target!==$("privacyDialog")) return;
      const r=$("privacyDialog").getBoundingClientRect();
      if (event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) $("privacyDialog").close();
    });
    window.addEventListener("storage",event => { if (event.key===null || event.key===C.storageKey(config.partyId)) sync(); });
    window.addEventListener("focus",sync); window.addEventListener("pageshow",sync);
    document.addEventListener("visibilitychange",() => { if (!document.hidden) sync(); });
  }
  try {
    if (!C) throw new Error("core.js konnte nicht geladen werden. Bitte die vollständigen App-Dateien hochladen.");
    config=C.validateConfig(window.PARTY_CONFIG); applyBranding(); bind();
    renderWheel(config.tasks);
    try { storage=window.localStorage; }
    catch (_) { throw new C.PartyError("STORAGE","Der Browser blockiert den lokalen Speicher. Bitte erlaube Website-Daten und lade die Seite neu."); }
    record=C.readRecord(storage,config.partyId);
    if (record) showResult(record,false);
    else {
      C.probeStorage(storage); setState("ready");
      $("spinButton").disabled=false; $("spinButtonText").textContent="Jetzt Rad drehen";
    }
  } catch (error) { block(error); }
})();
