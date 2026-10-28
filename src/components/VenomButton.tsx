import { useEffect, useRef, type ReactNode } from "react";

const SEGMENTS = 16;
const COUNT = 20;
const REACH = 300;
const BREAK = 420;
const IDLE_SEG = 1.2;
const SENSE_SEG = 3.2;
const MAX_SEG = 24;
const INSET = 5;
const ITERATIONS = 8;

type Pt = { x: number; y: number; px: number; py: number };

type Tendril = {
  t: number;
  pts: Pt[];
  seg: number;
  attached: boolean;
  cooldown: number;
  ox: number;
  oy: number;
  phase: number;
  root: number;
  reach: number;
  idle: number;
};

function edgePoint(r: { left: number; top: number; width: number; height: number }, t: number) {
  const { width: w, height: h } = r;
  let s = (((t % 1) + 1) % 1) * 2 * (w + h);
  if (s < w) return { x: r.left + s, y: r.top, nx: 0, ny: -1 };
  s -= w;
  if (s < h) return { x: r.left + w, y: r.top + s, nx: 1, ny: 0 };
  s -= h;
  if (s < w) return { x: r.left + w - s, y: r.top + h, nx: 0, ny: 1 };
  s -= w;
  return { x: r.left, y: r.top + h - s, nx: -1, ny: 0 };
}

function makeTendril(i: number): Tendril {
  return {
    t: (i + Math.random() * 0.7) / COUNT,
    pts: Array.from({ length: SEGMENTS + 1 }, () => ({ x: -1e4, y: -1e4, px: -1e4, py: -1e4 })),
    seg: IDLE_SEG,
    attached: false,
    cooldown: 0,
    ox: 0,
    oy: 0,
    phase: Math.random() * Math.PI * 2,
    root: 7 + Math.random() * 5,
    reach: 0.65 + Math.random() * 0.35,
    idle: IDLE_SEG * (0.5 + Math.random() * 0.9),
  };
}

function drawTendril(ctx: CanvasRenderingContext2D, pts: Pt[], root: number, thin: number, gloss: string) {
  const n = pts.length;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  const widths: number[] = [];

  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let tx = b.x - a.x;
    let ty = b.y - a.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    const w = (root * Math.pow(1 - i / (n - 1), 0.85) + 0.9) * thin;
    widths.push(w);
    left.push([pts[i].x - ty * w * 0.5, pts[i].y + tx * w * 0.5]);
    right.push([pts[i].x + ty * w * 0.5, pts[i].y - tx * w * 0.5]);
  }

  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n - 1; i++) {
    const mx = (left[i][0] + left[i + 1][0]) / 2;
    const my = (left[i][1] + left[i + 1][1]) / 2;
    ctx.quadraticCurveTo(left[i][0], left[i][1], mx, my);
  }
  ctx.lineTo(left[n - 1][0], left[n - 1][1]);
  ctx.lineTo(right[n - 1][0], right[n - 1][1]);
  for (let i = n - 2; i > 0; i--) {
    const mx = (right[i][0] + right[i - 1][0]) / 2;
    const my = (right[i][1] + right[i - 1][1]) / 2;
    ctx.quadraticCurveTo(right[i][0], right[i][1], mx, my);
  }
  ctx.lineTo(right[0][0], right[0][1]);
  ctx.closePath();
  ctx.fill();

  const tip = pts[n - 1];
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, widths[n - 1] * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Thin specular line along one side gives the "wet" symbiote sheen.
  const fill = ctx.fillStyle;
  ctx.strokeStyle = gloss;
  ctx.lineWidth = Math.max(0.6, root * 0.14 * thin);
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 1; i < n - 2; i++) {
    const x = (left[i][0] * 0.7 + pts[i].x * 0.3);
    const y = (left[i][1] * 0.7 + pts[i].y * 0.3);
    if (i === 1) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = fill;
}

export function VenomButton({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const canvas = canvasRef.current;
    if (!btn || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tendrils = Array.from({ length: COUNT }, (_, i) => makeTendril(i));
    const mouse = { x: -1e4, y: -1e4, active: false };
    const shift = { x: 0, y: 0 };
    let fg = "#000";
    let gloss = "rgba(255,255,255,0.25)";
    let raf = 0;
    let frame = 0;
    let visible = false;

    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      fg = css.getPropertyValue("--fg").trim() || "#000";
      const dark = document.documentElement.classList.contains("dark");
      gloss = dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.28)";
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    const step = (time: number) => {
      frame++;
      if (frame % 30 === 1) readColors();

      const raw = btn.getBoundingClientRect();
      const rect = { left: raw.left - shift.x, top: raw.top - shift.y, width: raw.width, height: raw.height };
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const near = mouse.active && Math.hypot(mouse.x - cx, mouse.y - cy) < REACH + rect.width / 2;
      const tx = near ? Math.max(-12, Math.min(12, (mouse.x - cx) * 0.05)) : 0;
      const ty = near ? Math.max(-12, Math.min(12, (mouse.y - cy) * 0.05)) : 0;
      shift.x += (tx - shift.x) * 0.15;
      shift.y += (ty - shift.y) * 0.15;
      btn.style.transform = `translate3d(${shift.x.toFixed(2)}px, ${shift.y.toFixed(2)}px, 0)`;
      const bx = rect.left + shift.x;
      const by = rect.top + shift.y;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = fg;
      let attachedCount = 0;

      for (const td of tendrils) {
        const e = edgePoint({ ...rect, left: bx, top: by }, td.t);
        const ax = e.x - e.nx * INSET;
        const ay = e.y - e.ny * INSET;
        const dx = mouse.x - ax;
        const dy = mouse.y - ay;
        const d = Math.hypot(dx, dy) || 1;
        const facing = (dx * e.nx + dy * e.ny) / d;

        if (td.cooldown > 0) td.cooldown--;
        if (!td.attached && mouse.active && td.cooldown === 0 && d < REACH * td.reach && facing > -0.1) {
          td.attached = true;
          const a = Math.random() * Math.PI * 2;
          const r = 3 + Math.random() * 9;
          td.ox = Math.cos(a) * r;
          td.oy = Math.sin(a) * r;
        }
        if (td.attached && (!mouse.active || d > BREAK * (0.85 + td.reach * 0.15))) {
          td.attached = false;
          td.cooldown = 45 + Math.floor(Math.random() * 70);
          // Snap: kick the tip back toward the root so it recoils.
          const tip = td.pts[SEGMENTS];
          tip.px = tip.x + (dx / d) * 14;
          tip.py = tip.y + (dy / d) * 14;
        }

        const sensing = !td.attached && mouse.active && d < REACH * 1.8 && facing > 0.1;
        const target = td.attached ? Math.min((d / SEGMENTS) * 1.12, MAX_SEG) : sensing ? SENSE_SEG : td.idle;
        td.seg += (target - td.seg) * (td.attached ? 0.14 : 0.07);

        const pts = td.pts;
        if (pts[0].x < -1e3) {
          for (const p of pts) {
            p.x = p.px = ax;
            p.y = p.py = ay;
          }
        }

        for (let i = 1; i <= SEGMENTS; i++) {
          const p = pts[i];
          const k = i / SEGMENTS;
          const vx = (p.x - p.px) * 0.93;
          const vy = (p.y - p.py) * 0.93;
          p.px = p.x;
          p.py = p.y;
          const wave = Math.sin(time * 0.004 + i * 0.55 + td.phase) * 0.28 * k;
          let fx = e.nx * 0.45 * (1 - k) * (1 - k) - e.ny * wave;
          let fy = e.ny * 0.45 * (1 - k) * (1 - k) + e.nx * wave + 0.09 * k;
          if (sensing) {
            fx += (dx / d) * 0.25 * k;
            fy += (dy / d) * 0.25 * k;
          }
          p.x += vx + fx;
          p.y += vy + fy;
        }

        if (td.attached) {
          const tip = pts[SEGMENTS];
          tip.x += (mouse.x + td.ox - tip.x) * 0.45;
          tip.y += (mouse.y + td.oy - tip.y) * 0.45;
          attachedCount++;
        }

        for (let it = 0; it < ITERATIONS; it++) {
          pts[0].x = ax;
          pts[0].y = ay;
          for (let i = 0; i < SEGMENTS; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            const sx = b.x - a.x;
            const sy = b.y - a.y;
            const dist = Math.hypot(sx, sy) || 0.0001;
            const diff = (dist - td.seg) / dist;
            const wa = i === 0 ? 0 : td.attached && i + 1 === SEGMENTS ? 0.8 : 0.5;
            const wb = 1 - wa;
            a.x += sx * diff * wa;
            a.y += sy * diff * wa;
            b.x -= sx * diff * wb;
            b.y -= sy * diff * wb;
          }
        }
        pts[0].x = pts[0].px = ax;
        pts[0].y = pts[0].py = ay;

        let length = 0;
        for (let i = 0; i < SEGMENTS; i++) length += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
        const thin = Math.max(0.55, Math.min(1, Math.sqrt(90 / Math.max(90, length))));
        drawTendril(ctx, pts, td.root, thin, gloss);
      }

      // Sticky webbing between neighbouring attached tendrils.
      ctx.strokeStyle = fg;
      ctx.lineCap = "round";
      const held = tendrils.filter((td) => td.attached);
      for (let i = 0; i < held.length - 1; i++) {
        const a = held[i];
        const b = held[i + 1];
        for (const at of [0.45, 0.7]) {
          const k = Math.round(SEGMENTS * at);
          const p = a.pts[k];
          const q = b.pts[k];
          const gap = Math.hypot(q.x - p.x, q.y - p.y);
          if (gap > 80 || gap < 4) continue;
          ctx.globalAlpha = 1 - gap / 80;
          ctx.lineWidth = 1.4 - gap / 100;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.quadraticCurveTo((p.x + q.x) / 2, (p.y + q.y) / 2 + gap * 0.25, q.x, q.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      if (attachedCount > 0) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.5 + Math.min(attachedCount, 14) * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = visible ? requestAnimationFrame(step) : 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) {
          readColors();
          raf = requestAnimationFrame(step);
        } else if (!visible) {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
      },
      { rootMargin: "200px 0px" },
    );

    resize();
    io.observe(btn);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      btn.style.transform = "";
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-30 h-full w-full" />
      <a ref={btnRef} href={href} className={className} style={{ position: "relative", zIndex: 31 }}>
        {children}
      </a>
    </>
  );
}
