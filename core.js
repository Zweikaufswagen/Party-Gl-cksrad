/* Shared, dependency-free validation and draw logic. Also usable with Node.js. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PartyCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const PREFIX = "party-wheel:v1:";
  const MAX_TASKS = 30;
  const DEFAULT_COLORS = ["#c2afff", "#d4ff7f", "#ffb48a"];
  class PartyError extends Error {
    constructor(code, message) { super(message); this.name = "PartyError"; this.code = code; }
  }
  function text(value, label, max, fallback) {
    if (value === undefined && fallback !== undefined) value = fallback;
    if (typeof value !== "string" || !value.trim() || value.length > max) {
      throw new PartyError("CONFIG", `${label}: Bitte 1 bis ${max} Zeichen verwenden.`);
    }
    return value.trim();
  }
  function color(value, fallback) {
    const result = value === undefined ? fallback : value;
    if (typeof result !== "string" || !/^#[0-9a-f]{6}$/i.test(result)) {
      throw new PartyError("CONFIG", "Farben müssen als #RRGGBB angegeben werden.");
    }
    return result.toLowerCase();
  }
  function boolean(value, fallback, label) {
    if (value === undefined) return fallback;
    if (typeof value !== "boolean") throw new PartyError("CONFIG", `${label} muss true oder false sein.`);
    return value;
  }
  function task(value, i) {
    if (!value || typeof value !== "object") throw new PartyError("CONFIG", `Aufgabe ${i + 1} fehlt.`);
    const id = text(value.id, `ID von Aufgabe ${i + 1}`, 64);
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new PartyError("CONFIG", "Aufgaben-IDs: nur Buchstaben, Zahlen, - und _.");
    return {
      id,
      label: text(value.label, `Rad-Beschriftung ${i + 1}`, 22),
      emoji: text(value.emoji, `Emoji ${i + 1}`, 16, "✨"),
      category: text(value.category, `Kategorie ${i + 1}`, 40, "DEINE MISSION"),
      title: text(value.title, `Titel ${i + 1}`, 100),
      description: text(value.description, `Aufgabentext ${i + 1}`, 1200),
      color: color(value.color, DEFAULT_COLORS[i % DEFAULT_COLORS.length])
    };
  }
  function validateConfig(raw) {
    if (!raw || typeof raw !== "object") throw new PartyError("CONFIG", "config.js fehlt oder enthält keine gültige PARTY_CONFIG.");
    const partyId = text(raw.partyId, "Party-ID", 80);
    if (!/^[a-zA-Z0-9_-]+$/.test(partyId)) throw new PartyError("CONFIG", "Party-ID: nur Buchstaben, Zahlen, - und _.");
    if (!Array.isArray(raw.tasks) || raw.tasks.length < 2 || raw.tasks.length > MAX_TASKS) {
      throw new PartyError("CONFIG", `Bitte 2 bis ${MAX_TASKS} Aufgaben eintragen.`);
    }
    const tasks = raw.tasks.map(task);
    if (new Set(tasks.map(t => t.id)).size !== tasks.length) throw new PartyError("CONFIG", "Jede Aufgabe braucht eine eindeutige ID.");
    const duration = raw.spinDurationMs === undefined ? 6200 : raw.spinDurationMs;
    if (!Number.isInteger(duration) || duration < 2000 || duration > 12000) throw new PartyError("CONFIG", "Drehdauer: ganze Zahl von 2000 bis 12000 Millisekunden.");
    return {
      partyId,
      name: text(raw.name, "Partyname", 60, "AFTER HOURS"),
      edition: text(raw.edition, "Untertitel", 80, "DIE PARTY-EDITION"),
      headline: text(raw.headline, "Überschrift", 120, "Ein Dreh.\nDeine Mission."),
      intro: text(raw.intro, "Einleitung", 400, "Dreh das Rad und entdecke deine Aufgabe."),
      footerNote: text(raw.footerNote, "Hinweis", 400, "Alles kann. Nichts muss. Respektiere Grenzen."),
      accentColor: color(raw.accentColor, "#d4ff7f"),
      spinDurationMs: duration,
      confetti: boolean(raw.confetti, true, "confetti"),
      allowCompletion: boolean(raw.allowCompletion, true, "allowCompletion"),
      tasks
    };
  }
  function storageKey(partyId) { return PREFIX + partyId; }
  function validateRecord(raw, partyId) {
    try {
      if (!raw || raw.version !== 1 || raw.partyId !== partyId || !/^[0-9a-f]{32}$/.test(raw.drawId)) throw new Error();
      if (typeof raw.drawnAt !== "string" || !Number.isFinite(Date.parse(raw.drawnAt))) throw new Error();
      if (raw.completedAt !== null && (typeof raw.completedAt !== "string" || !Number.isFinite(Date.parse(raw.completedAt)))) throw new Error();
      if (!Number.isFinite(raw.rotation) || raw.rotation < 0 || raw.rotation > 36000) throw new Error();
      const savedTask = task(raw.task, 0);
      if (!Array.isArray(raw.wheel) || raw.wheel.length < 2 || raw.wheel.length > MAX_TASKS) throw new Error();
      const wheel = raw.wheel.map((t, i) => ({
        id: text(t.id, "ID", 64), label: text(t.label, "Beschriftung", 22),
        emoji: text(t.emoji, "Emoji", 16), color: color(t.color, DEFAULT_COLORS[i % 3])
      }));
      if (new Set(wheel.map(t => t.id)).size !== wheel.length || !wheel.some(t => t.id === savedTask.id)) throw new Error();
      return { version: 1, partyId, drawId: raw.drawId, drawnAt: raw.drawnAt,
        completedAt: raw.completedAt, rotation: raw.rotation, task: savedTask, wheel };
    } catch (_) {
      throw new PartyError("CORRUPT", "Dein gespeicherter Spielstand ist nicht lesbar. Ein neuer Dreh bleibt gesperrt. Bitte sprich die Gastgeber an.");
    }
  }
  function readRecord(storage, partyId) {
    let raw;
    try { raw = storage.getItem(storageKey(partyId)); }
    catch (_) { throw new PartyError("STORAGE", "Der Browser blockiert den lokalen Speicher. Bitte erlaube Website-Daten und lade die Seite neu."); }
    if (raw === null) return null;
    try { return validateRecord(JSON.parse(raw), partyId); }
    catch (error) {
      if (error instanceof PartyError) throw error;
      throw new PartyError("CORRUPT", "Dein gespeicherter Spielstand ist beschädigt. Ein neuer Dreh bleibt gesperrt. Bitte sprich die Gastgeber an.");
    }
  }
  function writeRecord(storage, record) {
    const key = storageKey(record.partyId);
    try {
      const encoded = JSON.stringify(record);
      storage.setItem(key, encoded);
      if (storage.getItem(key) !== encoded) throw new Error("Read-back failed");
    } catch (_) {
      throw new PartyError("STORAGE", "Deine Aufgabe konnte nicht sicher gespeichert werden. Das Rad bleibt gesperrt. Bitte erlaube lokalen Speicher und lade die Seite neu.");
    }
    return record;
  }
  function probeStorage(storage) {
    const key = PREFIX + "probe:" + Date.now() + ":" + Math.random();
    try {
      storage.setItem(key, "ok");
      if (storage.getItem(key) !== "ok") throw new Error();
      storage.removeItem(key);
    } catch (_) {
      throw new PartyError("STORAGE", "Dein Browser kann keine Website-Daten speichern. Ohne Speicherung ist kein Dreh möglich. Bitte prüfe die Browser-Einstellungen.");
    }
  }
  // Rejection sampling avoids modulo bias. Web Crypto is also available on HTTP.
  function randomInt(max, cryptoProvider) {
    if (!Number.isInteger(max) || max < 1 || max > 0x100000000) throw new RangeError("Invalid random range");
    if (!cryptoProvider || typeof cryptoProvider.getRandomValues !== "function") throw new PartyError("RANDOM", "Dieser Browser unterstützt die Zufallsauswahl nicht. Bitte aktualisiere ihn.");
    const limit = Math.floor(0x100000000 / max) * max;
    const value = new Uint32Array(1);
    do { cryptoProvider.getRandomValues(value); } while (value[0] >= limit);
    return value[0] % max;
  }
  function createRecord(config, cryptoProvider) {
    const index = randomInt(config.tasks.length, cryptoProvider);
    const step = 360 / config.tasks.length;
    const jitter = (randomInt(10001, cryptoProvider) / 10000 - 0.5) * step * 0.40;
    const finalAngle = ((-index * step + jitter) % 360 + 360) % 360;
    const bytes = new Uint8Array(16);
    cryptoProvider.getRandomValues(bytes);
    return {
      version: 1, partyId: config.partyId,
      drawId: Array.from(bytes, x => x.toString(16).padStart(2, "0")).join(""),
      drawnAt: new Date().toISOString(), completedAt: null,
      rotation: 360 * 6 + finalAngle,
      task: { ...config.tasks[index] },
      wheel: config.tasks.map(({id, label, emoji, color}) => ({id, label, emoji, color}))
    };
  }
  // Call while holding the origin-wide Web Lock whenever supported.
  function claimDraw(storage, config, cryptoProvider) {
    const existing = readRecord(storage, config.partyId);
    if (existing) return { record: existing, created: false };
    const record = createRecord(config, cryptoProvider);
    writeRecord(storage, record); // Persist BEFORE starting any animation or revealing the task.
    return { record, created: true };
  }
  function exportConfig(config) {
    return "/* Erstellt im Party-Glücksrad-Editor. Diese Datei ersetzt config.js. */\nwindow.PARTY_CONFIG = " +
      JSON.stringify(validateConfig(config), null, 2).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + ";\n";
  }
  function contrastingInk(hex) {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) > 0.179 ? "#14151a" : "#ffffff";
  }
  return { PREFIX, MAX_TASKS, DEFAULT_COLORS, PartyError, validateConfig, validateRecord, storageKey,
    readRecord, writeRecord, probeStorage, randomInt, createRecord, claimDraw, exportConfig, contrastingInk };
});
