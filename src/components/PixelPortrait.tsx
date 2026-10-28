import { useEffect, useRef } from "react";

const SRC = "/portrait.webp";
const CELL = 7;
const RADIUS = 150;
const SPRING = 0.045;
const DAMPING = 0.86;

type Ripple = { x: number; y: number; age: number };

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function PixelPortrait({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const img = new Image();
    img.src = SRC;

    let W = 0;
    let H = 0;
    let cell = CELL;
    let n = 0;
    let hx = new Float32Array(0);
    let hy = new Float32Array(0);
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let val = new Float32Array(0);
    let color = "#fff";
    let raf = 0;
    let visible = true;
    const mouse = { x: -1e4, y: -1e4, px: -1e4, py: -1e4, inside: false };
    const ripples: Ripple[] = [];

    // Sample the photo into a grid; each cell keeps its home position and tone.
    const build = () => {
      if (!img.complete || !img.naturalWidth || !W || !H) return;
      const dark = document.documentElement.classList.contains("dark");
      color = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#fff";

      const ph = H * 1.02;
      const pw = ph * (img.naturalWidth / img.naturalHeight);
      cell = Math.max(5, Math.min(9, ph / 115));
      const cols = Math.round(pw / cell);
      const rows = Math.round(ph / cell);
      const ox = (W - cols * cell) / 2;
      const oy = H - rows * cell + cell * 2;

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0, cols, rows);
      const data = octx.getImageData(0, 0, cols, rows).data;

      const keep: number[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = ox + c * cell + cell / 2;
          const y = oy + r * cell + cell / 2;
          if (x < -cell || x > W + cell || y < -cell || y > H + cell) continue;
          let b = data[(r * cols + c) * 4] / 255;
          b = Math.pow(Math.max(0, Math.min(1, (b - 0.06) / 0.86)), 1.1);
          // Elliptical vignette around the face so the busy background falls away.
          const ex = (c / cols - 0.5) / 0.6;
          const ey = (r / rows - 0.42) / 0.66;
          const mask = 1 - smoothstep(0.62, 1, Math.hypot(ex, ey));
          const v = (dark ? b : 1 - b) * mask;
          if (v < 0.06) continue;
          keep.push(x, y, v);
        }
      }

      n = keep.length / 3;
      hx = new Float32Array(n);
      hy = new Float32Array(n);
      px = new Float32Array(n);
      py = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      val = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        hx[i] = px[i] = keep[i * 3];
        hy[i] = py[i] = keep[i * 3 + 1];
        val[i] = keep[i * 3 + 2];
      }
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      // On narrow screens the portrait sits under all the text, so keep it quieter.
      ctx.globalAlpha = W < 640 ? 0.38 : 1;
      const r2 = RADIUS * RADIUS;
      for (let i = 0; i < n; i++) {
        let s = cell * (0.16 + 0.78 * val[i]);
        if (mouse.inside) {
          const dx = hx[i] - mouse.x;
          const dy = hy[i] - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) s *= 1 + 0.45 * (1 - Math.sqrt(d2) / RADIUS);
        }
        ctx.fillRect(px[i] - s / 2, py[i] - s / 2, s, s);
      }
    };

    const step = () => {
      const mvx = mouse.inside ? mouse.x - mouse.px : 0;
      const mvy = mouse.inside ? mouse.y - mouse.py : 0;
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      const r2 = RADIUS * RADIUS;
      let energy = 0;

      for (const rp of ripples) rp.age++;
      while (ripples.length && ripples[0].age > 80) ripples.shift();

      for (let i = 0; i < n; i++) {
        let ax = (hx[i] - px[i]) * SPRING;
        let ay = (hy[i] - py[i]) * SPRING;
        if (mouse.inside) {
          const dx = px[i] - mouse.x;
          const dy = py[i] - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / RADIUS) ** 2;
            ax += (dx / d) * f * 2.6 + mvx * f * 0.22;
            ay += (dy / d) * f * 2.6 + mvy * f * 0.22;
          }
        }
        for (const rp of ripples) {
          const dx = px[i] - rp.x;
          const dy = py[i] - rp.y;
          const d = Math.hypot(dx, dy) || 1;
          const band = Math.abs(d - rp.age * 11);
          if (band < 36) {
            const f = (1 - band / 36) * (1 - rp.age / 80) * 3.2;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
        }
        vx[i] = (vx[i] + ax) * DAMPING;
        vy[i] = (vy[i] + ay) * DAMPING;
        px[i] += vx[i];
        py[i] += vy[i];
        energy += Math.abs(vx[i]) + Math.abs(vy[i]) + Math.abs(hx[i] - px[i]) * 0.1;
      }
      draw();

      // Sleep once everything has settled and the cursor is away.
      if (visible && (mouse.inside || ripples.length || energy > n * 0.01)) raf = requestAnimationFrame(step);
      else raf = 0;
    };

    const wake = () => {
      if (!raf && visible && !still) raf = requestAnimationFrame(step);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, ok: e.clientY >= rect.top && e.clientY <= rect.bottom };
    };
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      if (!mouse.inside && p.ok) {
        mouse.px = p.x;
        mouse.py = p.y;
      }
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.inside = p.ok;
      if (p.ok) wake();
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      if (!p.ok) return;
      ripples.push({ x: p.x, y: p.y, age: 0 });
      wake();
    };
    const onLeave = () => {
      mouse.inside = false;
    };

    img.onload = build;
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const themeObserver = new MutationObserver(build);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(host);
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
