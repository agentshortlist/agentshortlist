// Sonidos de interfaz sintetizados con Web Audio (sin ficheros de audio).
// - Nada suena hasta el primer gesto del usuario (política de autoplay) ni al cargar la página.
// - Activados por defecto con volumen suave; el lector puede silenciarlos y se recuerda su elección.
// - Cada cue tiene un enfriamiento mínimo para que no se solapen ni saturen.

export type Cue = "hover" | "focus" | "press" | "select" | "open" | "close" | "toggle-on" | "toggle-off" | "copy" | "error" | "info" | "typing" | "success";
type Note = { f: number; t: number; d: number; g: number; type?: OscillatorType };

const KEY = "agentshortlist:sound";
export const SOUND_EVENT = "agentshortlist-sound";
const DEFAULT_VOLUME = 0.5;

const CUES: Record<Cue, Note[]> = {
  hover: [{ f: 1568, t: 0, d: 0.03, g: 0.05 }],
  focus: [{ f: 988, t: 0, d: 0.045, g: 0.07 }],
  press: [{ f: 392, t: 0, d: 0.07, g: 0.17, type: "triangle" }, { f: 784, t: 0, d: 0.035, g: 0.06 }],
  select: [{ f: 587, t: 0, d: 0.065, g: 0.15, type: "triangle" }, { f: 880, t: 0.045, d: 0.09, g: 0.12 }],
  open: [{ f: 523, t: 0, d: 0.065, g: 0.13 }, { f: 659, t: 0.05, d: 0.065, g: 0.13 }, { f: 784, t: 0.1, d: 0.1, g: 0.13 }],
  close: [{ f: 784, t: 0, d: 0.065, g: 0.12 }, { f: 659, t: 0.05, d: 0.065, g: 0.12 }, { f: 523, t: 0.1, d: 0.1, g: 0.12 }],
  "toggle-on": [{ f: 659, t: 0, d: 0.07, g: 0.14 }, { f: 988, t: 0.06, d: 0.11, g: 0.13 }],
  "toggle-off": [{ f: 988, t: 0, d: 0.07, g: 0.13 }, { f: 659, t: 0.06, d: 0.11, g: 0.12 }],
  copy: [{ f: 784, t: 0, d: 0.05, g: 0.13 }, { f: 1047, t: 0.05, d: 0.1, g: 0.12 }],
  error: [{ f: 220, t: 0, d: 0.12, g: 0.19, type: "triangle" }, { f: 196, t: 0.1, d: 0.15, g: 0.17, type: "triangle" }],
  info: [{ f: 740, t: 0, d: 0.08, g: 0.11 }, { f: 1109, t: 0.07, d: 0.13, g: 0.09 }],
  typing: [{ f: 1760, t: 0, d: 0.014, g: 0.05, type: "square" }],
  success: [{ f: 523, t: 0, d: 0.07, g: 0.13 }, { f: 659, t: 0.065, d: 0.07, g: 0.13 }, { f: 784, t: 0.13, d: 0.07, g: 0.13 }, { f: 1047, t: 0.195, d: 0.16, g: 0.13 }],
};

const COOLDOWN: Partial<Record<Cue, number>> = { hover: 70, focus: 80, typing: 38 };
const DEFAULT_COOLDOWN = 55;

let ctx: AudioContext | null = null;
let filter: BiquadFilterNode | null = null;
let master: GainNode | null = null;
let enabled = true;
let volume = DEFAULT_VOLUME;
let loaded = false;
let played = 0;
const last = new Map<Cue, number>();
let voices = 0;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as { enabled?: unknown; volume?: unknown };
      if (typeof p.enabled === "boolean") enabled = p.enabled;
      if (typeof p.volume === "number" && Number.isFinite(p.volume)) volume = Math.min(1, Math.max(0, p.volume));
    }
  } catch {}
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ enabled, volume }));
  } catch {}
  window.dispatchEvent(new Event(SOUND_EVENT));
}

export const isSoundEnabled = () => {
  load();
  return enabled && volume > 0;
};
export const soundPlayCount = () => played;

// Debe llamarse dentro de un gesto del usuario (pointerdown, keydown): crea y reanuda el contexto de audio.
export function unlockSound() {
  load();
  if (typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!ctx) {
    ctx = new AC({ latencyHint: "interactive" });
    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 4800;
    master = ctx.createGain();
    master.gain.value = volume;
    filter.connect(master);
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setSoundEnabled(on: boolean, announce = true) {
  load();
  enabled = on;
  save();
  if (on) {
    if (volume === 0) volume = DEFAULT_VOLUME;
    if (master) master.gain.value = volume;
    if (announce) playSound("toggle-on");
  }
}

export function playSound(cue: Cue) {
  load();
  if (typeof window === "undefined" || !enabled || volume <= 0 || document.hidden) return;
  if (!ctx || !filter || ctx.state === "closed") return; // aún sin gesto del usuario: silencio
  if (ctx.state === "suspended") void ctx.resume();
  const now = performance.now();
  const wait = COOLDOWN[cue] ?? DEFAULT_COOLDOWN;
  if (now - (last.get(cue) ?? -1e9) < wait) return;
  last.set(cue, now);
  played++;
  const t0 = ctx.currentTime + 0.005;
  const jitter = cue === "typing" ? 0.85 + Math.random() * 0.4 : 1;
  for (const n of CUES[cue]) {
    if (voices >= 24) break;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = n.type ?? "sine";
    osc.frequency.value = n.f * jitter;
    const s = t0 + n.t;
    const e = s + n.d;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(n.g, s + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, e);
    osc.connect(g);
    g.connect(filter);
    voices++;
    osc.onended = () => {
      voices--;
      osc.disconnect();
      g.disconnect();
    };
    osc.start(s);
    osc.stop(e + 0.02);
  }
}
