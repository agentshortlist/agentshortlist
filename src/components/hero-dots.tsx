"use client";

import { useEffect, useRef } from "react";

// Campo de puntos del hero. Cada punto:
//  - se aparta del puntero con una campana gaussiana (hasta 16 px en el centro, ~100 px de radio),
//    de modo que alrededor del cursor queda un hueco y no se puede situar el puntero sobre un punto;
//  - flota con una deriva lenta y propia (fase aleatoria);
//  - titila de forma esporádica y desigual.
// WebGL (GPU) con respaldo en canvas 2D que calcula exactamente lo mismo. Pausado fuera de pantalla
// y con la pestaña oculta. Con reduce-motion se dibuja una vez, sin deriva, titileo ni repulsión.
const GAP = 24;
const GAP_SMALL = 30;
const JITTER = 5;
const PUSH = 16; // px de desplazamiento máximo
const FALL_K = 19600; // 2·σ²: σ ≈ 99 px
const DRIFT = 1.55; // px
const ALPHA_BASE = 0.48;
const HOVER_ALPHA = 0.8; // brillo extra junto al puntero: en reposo los puntos van apagados y se encienden al acercarse
const SIZE = 2.05; // diámetro en px
// Tema claro: puntos oscuros, algo más opacos y grandes (se mezclan con "multiplicar" en el CSS).
const LIGHT = { color: [0.06, 0.06, 0.07] as const, alpha: 0.58, size: 2.45 };
const DARK = { color: [1, 1, 1] as const, alpha: ALPHA_BASE, size: SIZE };
const isLight = () => document.documentElement.classList.contains("light");
const MOUSE_TAU = 0.08; // s: suavizado del puntero, independiente de los fps
const MAX_DT = 0.05;
const AWAY = -500; // sin puntero, el "puntero" se aparta fuera del campo: en reposo no hay zona brillante, solo puntos apagados

const VERT = `
attribute vec2 a_pos;
attribute float a_phase;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_dpr;
uniform float u_motion;
uniform float u_alpha_base;
uniform float u_size;
varying float v_alpha;
void main() {
  vec2 p = a_pos;
  vec2 delta = p - u_mouse;
  float dist = length(delta);
  float fall = exp(-(dist * dist) / ${FALL_K.toFixed(1)}) * u_motion;
  vec2 dir = delta / max(dist, 0.001);
  p += dir * fall * ${PUSH.toFixed(1)};
  p += vec2(sin(u_time * 0.14 + a_phase), cos(u_time * 0.11 + a_phase * 1.27)) * (${DRIFT.toFixed(2)} * u_motion);
  float spark = 0.5 + 0.5 * sin(u_time * 1.15 + a_phase * 3.7);
  float spark2 = 0.5 + 0.5 * sin(u_time * 0.47 + a_phase * 1.9);
  float twinkle = 1.0 + pow(spark * spark2, 7.0) * 0.65 * u_motion;
  v_alpha = (u_alpha_base + fall * ${HOVER_ALPHA.toFixed(2)}) * twinkle;
  vec2 clip = (p / u_res) * 2.0 - 1.0;
  clip.y *= -1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = (u_size + fall * 1.8) * u_dpr;
}`;

const FRAG = `
precision mediump float;
uniform vec3 u_color;
varying float v_alpha;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = dot(c, c);
  if (d > 1.0) discard;
  float a = v_alpha * (1.0 - smoothstep(0.28, 1.0, d));
  gl_FragColor = vec4(u_color, a);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

// Rejilla con jitter determinista y fase propia por punto.
function buildGrid(w: number, h: number) {
  const gap = w < 720 ? GAP_SMALL : GAP;
  const cols = Math.ceil(w / gap) + 1;
  const rows = Math.ceil(h / gap) + 1;
  const pos = new Float32Array(cols * rows * 2);
  const phase = new Float32Array(cols * rows);
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
      const f = n - Math.floor(n);
      pos[i * 2] = c * gap + (f - 0.5) * JITTER;
      pos[i * 2 + 1] = r * gap + (1 - f - 0.5) * JITTER;
      phase[i] = f * Math.PI * 2;
      i++;
    }
  }
  return { pos, phase, count: i };
}

export function HeroDots() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion = reduced ? 0 : 1;
    let canvas = document.createElement("canvas");

    let w = 1;
    let h = 1;
    let dpr = 1;
    let grid = buildGrid(1, 1);
    let sizeK = 1;
    let alphaK = 1; // en pantallas estrechas el campo es más discreto
    let mx = 0; // puntero suavizado
    let my = 0;
    let tx = 0; // destino
    let ty = 0;
    let started = false;
    let raf = 0;
    let lastTick = 0;
    let visible = true;
    let hidden = document.visibilityState === "hidden";
    const t0 = performance.now();

    type Renderer = { resize: () => void; draw: (t: number) => void; dispose: () => void };
    let renderer: Renderer | null = null;

    // ---------- WebGL ----------
    const makeGL = (): Renderer | null => {
      const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: false });
      if (!gl) return null;
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      const prog = gl.createProgram();
      if (!vs || !fs || !prog) return null;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
      gl.useProgram(prog);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      const aPos = gl.getAttribLocation(prog, "a_pos");
      const aPhase = gl.getAttribLocation(prog, "a_phase");
      const u = (n: string) => gl.getUniformLocation(prog, n);
      const uRes = u("u_res"), uMouse = u("u_mouse"), uTime = u("u_time"), uDpr = u("u_dpr");
      const uMotion = u("u_motion"), uColor = u("u_color"), uAlpha = u("u_alpha_base"), uSize = u("u_size");
      const bPos = gl.createBuffer();
      const bPhase = gl.createBuffer();
      return {
        resize: () => {
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
          gl.bufferData(gl.ARRAY_BUFFER, grid.pos, gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, bPhase);
          gl.bufferData(gl.ARRAY_BUFFER, grid.phase, gl.STATIC_DRAW);
        },
        draw: (t) => {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.useProgram(prog);
          gl.uniform2f(uRes, w, h);
          gl.uniform2f(uMouse, mx, my);
          gl.uniform1f(uTime, t);
          gl.uniform1f(uDpr, dpr);
          gl.uniform1f(uMotion, motion);
          const th = isLight() ? LIGHT : DARK;
          gl.uniform3f(uColor, th.color[0], th.color[1], th.color[2]);
          gl.uniform1f(uAlpha, th.alpha * alphaK);
          gl.uniform1f(uSize, th.size * sizeK);
          gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
          gl.enableVertexAttribArray(aPos);
          gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, bPhase);
          gl.enableVertexAttribArray(aPhase);
          gl.vertexAttribPointer(aPhase, 1, gl.FLOAT, false, 0, 0);
          gl.drawArrays(gl.POINTS, 0, grid.count);
        },
        dispose: () => {
          gl.deleteBuffer(bPos);
          gl.deleteBuffer(bPhase);
          gl.deleteProgram(prog);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
        },
      };
    };

    // ---------- Respaldo canvas 2D: misma fórmula ----------
    const make2D = (): Renderer | null => {
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return null;
      // Sprite con el mismo borde suave que el fragment shader: 1 - smoothstep(0.28, 1, d)
      const S = 32;
      const makeSprite = (rgb: number) => {
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = S;
      const sctx = sprite.getContext("2d")!;
      const img = sctx.createImageData(S, S);
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const cx = ((x + 0.5) / S) * 2 - 1;
          const cy = ((y + 0.5) / S) * 2 - 1;
          const d = cx * cx + cy * cy;
          const k = Math.min(Math.max((d - 0.28) / 0.72, 0), 1);
          const a = d > 1 ? 0 : 1 - k * k * (3 - 2 * k);
          const i = (y * S + x) * 4;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = rgb;
          img.data[i + 3] = Math.round(a * 255);
        }
      }
      sctx.putImageData(img, 0, 0);
      return sprite;
      };
      const spriteDark = makeSprite(255);
      const spriteLight = makeSprite(16);
      return {
        resize: () => ctx.setTransform(dpr, 0, 0, dpr, 0, 0),
        draw: (t) => {
          ctx.clearRect(0, 0, w, h);
          const th = isLight() ? LIGHT : DARK;
          const sprite = isLight() ? spriteLight : spriteDark;
          for (let i = 0; i < grid.count; i++) {
            const x = grid.pos[i * 2];
            const y = grid.pos[i * 2 + 1];
            const ph = grid.phase[i];
            const dx = x - mx;
            const dy = y - my;
            const dist = Math.hypot(dx, dy);
            const fall = Math.exp(-(dist * dist) / FALL_K) * motion;
            const inv = 1 / Math.max(dist, 0.001);
            const px = x + dx * inv * fall * PUSH + Math.sin(t * 0.14 + ph) * DRIFT * motion;
            const py = y + dy * inv * fall * PUSH + Math.cos(t * 0.11 + ph * 1.27) * DRIFT * motion;
            const spark = (0.5 + 0.5 * Math.sin(t * 1.15 + ph * 3.7)) * (0.5 + 0.5 * Math.sin(t * 0.47 + ph * 1.9));
            const twinkle = 1 + Math.pow(spark, 7) * 0.65 * motion;
            ctx.globalAlpha = Math.min((th.alpha * alphaK + fall * HOVER_ALPHA) * twinkle, 1);
            const size = th.size * sizeK + fall * 1.8;
            ctx.drawImage(sprite, px - size / 2, py - size / 2, size, size);
          }
          ctx.globalAlpha = 1;
        },
        dispose: () => {},
      };
    };

    const init = () => {
      renderer = makeGL();
      if (!renderer) {
        // Si WebGL falla, un canvas ya "tomado" por un contexto gl no admite 2d: se crea uno nuevo.
        canvas.remove();
        canvas = document.createElement("canvas");
        host.appendChild(canvas);
        renderer = make2D();
      }
    };

    const size = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      grid = buildGrid(w, h);
      alphaK = w < 720 ? 0.85 : 1.12;
      sizeK = w < 720 ? 1 : 1.1;
      if (!started) {
        mx = tx = AWAY;
        my = ty = AWAY;
        started = true;
      }
      renderer?.resize();
    };

    const render = (now: number) => {
      renderer?.draw((now - t0) / 1000);
      canvas.classList.add("is-drawn");
    };

    const schedule = () => {
      if (!raf && visible && !hidden && !reduced) {
        lastTick = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || hidden) return;
      const dt = lastTick === 0 ? 1 / 60 : Math.min((now - lastTick) / 1000, MAX_DT);
      lastTick = now;
      const a = 1 - Math.exp(-dt / MOUSE_TAU);
      mx += (tx - mx) * a;
      my += (ty - my) * a;
      render(now);
      schedule(); // continuo: los puntos flotan y titilan siempre (en GPU, coste mínimo)
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      tx = e.clientX - rect.left;
      ty = e.clientY - rect.top;
    };
    const onLeave = () => {
      tx = AWAY;
      ty = AWAY;
    };

    // En móvil la barra del navegador cambia la altura al hacer scroll: no reconstruimos la rejilla por cambios pequeños.
    let lastW = 0, lastH = 0;
    const ro = new ResizeObserver(() => {
      if (!renderer) return;
      const r = host.getBoundingClientRect();
      if (lastW && Math.floor(r.width) === lastW && Math.abs(Math.floor(r.height) - lastH) < 160) return;
      lastW = Math.floor(r.width);
      lastH = Math.floor(r.height);
      size();
      render(performance.now());
    });
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) schedule();
    });
    const onVisibility = () => {
      hidden = document.visibilityState === "hidden";
      if (!hidden) schedule();
    };

    let disposed = false;
    const start = () => {
      if (disposed) return;
      host.appendChild(canvas);
      init();
      size();
      render(performance.now());
      ro.observe(host);
      io.observe(host);
      if (!reduced) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", onVisibility);
        schedule();
      }
    };

    // Compilar shaders y crear buffers bloquea el hilo principal unos cientos de ms en móviles lentos:
    // se difiere a un momento ocioso, después de que la página se haya pintado.
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const startHandle = idle ? idle(start, { timeout: 1500 }) : window.setTimeout(start, 600);

    return () => {
      disposed = true;
      const cancel = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (idle && cancel) cancel(startHandle);
      else window.clearTimeout(startHandle);
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer?.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="hero-dots" aria-hidden="true" />;
}
