import { useEffect, useRef, useState, type ReactNode } from "react";

const SEGMENTS = 16;
const ARMS = 30;
const DRIPS = 4;
const MEMBRANE = 120;
const REACH = 340;
const BREAK = 480;
const IDLE_SEG = 1.2;
const SENSE_SEG = 3.4;
const MAX_SEG = 28;
const INSET = 6;
const ITERATIONS = 8;
const RADIUS = 22;
const BODY = "#050505";
const TAU = Math.PI * 2;
const DESKTOP_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)";

type Pt = { x: number; y: number; px: number; py: number };
type Kind = "arm" | "fiber" | "drip";

type Tendril = {
  kind: Kind;
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
  tension: number;
};

type Box = { l: number; t: number; w: number; h: number; r: number };

type Shape = {
  path: Path2D;
  pts: Pt[];
  widths: number[];
  lit: [number, number][];
  tip: { x: number; y: number; r: number };
  thin: number;
  kind: Kind;
};

const wrap = (u: number) => ((u % 1) + 1) % 1;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function useDesktopPointer() {
  const [match, setMatch] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setMatch(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return match;
}

function perimeterPoint(b: Box, u: number) {
  const { l, t, w, h, r } = b;
  const sw = w - 2 * r;
  const sh = h - 2 * r;
  const arc = (Math.PI * r) / 2;
  let s = wrap(u) * (2 * sw + 2 * sh + 4 * arc);
  const corner = (cx: number, cy: number, a0: number) => {
    const a = a0 + s / r;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) };
  };
  if (s < sw) return { x: l + r + s, y: t, nx: 0, ny: -1 };
  s -= sw;
  if (s < arc) return corner(l + w - r, t + r, -Math.PI / 2);
  s -= arc;
  if (s < sh) return { x: l + w, y: t + r + s, nx: 1, ny: 0 };
  s -= sh;
  if (s < arc) return corner(l + w - r, t + h - r, 0);
  s -= arc;
  if (s < sw) return { x: l + w - r - s, y: t + h, nx: 0, ny: 1 };
  s -= sw;
  if (s < arc) return corner(l + r, t + h - r, Math.PI / 2);
  s -= arc;
  if (s < sh) return { x: l, y: t + h - r - s, nx: -1, ny: 0 };
  s -= sh;
  return corner(l + r, t + r, Math.PI);
}

function bottomU(b: Box, f: number) {
  const sw = b.w - 2 * b.r;
  const sh = b.h - 2 * b.r;
  const arc = (Math.PI * b.r) / 2;
  return (sw + arc + sh + arc + f * sw) / (2 * sw + 2 * sh + 4 * arc);
}

function sampleOffset(off: Float32Array, u: number) {
  const x = wrap(u) * MEMBRANE;
  const i = Math.floor(x);
  const fr = x - i;
  return off[i % MEMBRANE] * (1 - fr) + off[(i + 1) % MEMBRANE] * fr;
}

function makeTendril(kind: Kind, t: number): Tendril {
  const fiber = kind === "fiber";
  const drip = kind === "drip";
  return {
    kind,
    t,
    pts: Array.from({ length: SEGMENTS + 1 }, () => ({ x: -1e4, y: -1e4, px: -1e4, py: -1e4 })),
    seg: IDLE_SEG,
    attached: false,
    cooldown: 0,
    ox: 0,
    oy: 0,
    phase: Math.random() * TAU,
    root: fiber ? 2.2 + Math.random() * 1.6 : drip ? 5 + Math.random() * 3 : 7 + Math.random() * 5,
    reach: fiber ? 0.9 + Math.random() * 0.35 : 0.6 + Math.random() * 0.35,
    idle: drip ? 1.1 + Math.random() * 0.5 : IDLE_SEG * (0.5 + Math.random() * 0.9),
    tension: 0,
  };
}

function shapeTendril(td: Tendril, thin: number): Shape {
  const { pts, root, kind } = td;
  const n = pts.length;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  const widths: number[] = [];
  // Normal facing the light (up), so the sheen stays on the top side as tendrils twist.
  const lit: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let tx = b.x - a.x;
    let ty = b.y - a.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    const k = i / (n - 1);
    const w =
      kind === "drip"
        ? (root * Math.pow(1 - k, 0.5) * 0.7 + 1.4) * thin
        : (root * Math.pow(1 - k, 0.85) + (kind === "fiber" ? 0.5 : 0.9)) * thin;
    widths.push(w);
    left.push([pts[i].x - ty * w * 0.5, pts[i].y + tx * w * 0.5]);
    right.push([pts[i].x + ty * w * 0.5, pts[i].y - tx * w * 0.5]);
    let nx = -ty;
    let ny = tx;
    if (ny > 0 || (ny === 0 && nx > 0)) {
      nx = -nx;
      ny = -ny;
    }
    lit.push([nx, ny]);
  }

  const path = new Path2D();
  path.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n - 1; i++) {
    path.quadraticCurveTo(left[i][0], left[i][1], (left[i][0] + left[i + 1][0]) / 2, (left[i][1] + left[i + 1][1]) / 2);
  }
  path.lineTo(left[n - 1][0], left[n - 1][1]);
  path.lineTo(right[n - 1][0], right[n - 1][1]);
  for (let i = n - 2; i > 0; i--) {
    path.quadraticCurveTo(right[i][0], right[i][1], (right[i][0] + right[i - 1][0]) / 2, (right[i][1] + right[i - 1][1]) / 2);
  }
  path.lineTo(right[0][0], right[0][1]);
  path.closePath();

  const end = pts[n - 1];
  const tipR = kind === "drip" ? root * 0.55 * thin : widths[n - 1] * 0.6;
  return { path, pts, widths, lit, tip: { x: end.x, y: end.y, r: tipR }, thin, kind };
}

function glossTendril(ctx: CanvasRenderingContext2D, s: Shape) {
  const n = s.pts.length;
  const sharp = s.kind === "fiber" ? 0.45 : 0.75;
  ctx.lineCap = "round";
  for (const [offset, width, alpha] of [
    [0.18, 0.5, 0.1],
    [0.26, 0.16, sharp],
  ] as const) {
    for (let i = 1; i < n - 2; i++) {
      const k = i / (n - 1);
      const fade = Math.sin(Math.min(1, k * 1.6) * Math.PI) * (0.35 + s.thin * 0.65);
      if (fade <= 0.02) continue;
      const p = s.pts[i];
      const q = s.pts[i + 1];
      ctx.strokeStyle = `rgba(255,255,255,${(alpha * fade).toFixed(3)})`;
      ctx.lineWidth = Math.max(0.5, s.widths[i] * width);
      ctx.beginPath();
      ctx.moveTo(p.x + s.lit[i][0] * s.widths[i] * offset, p.y + s.lit[i][1] * s.widths[i] * offset);
      ctx.lineTo(q.x + s.lit[i + 1][0] * s.widths[i + 1] * offset, q.y + s.lit[i + 1][1] * s.widths[i + 1] * offset);
      ctx.stroke();
    }
  }
  if (s.kind === "drip") {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(s.tip.x - s.tip.r * 0.35, s.tip.y - s.tip.r * 0.35, s.tip.r * 0.22, 0, TAU);
    ctx.fill();
  }
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
  const enabled = useDesktopPointer();

  useEffect(() => {
    const btn = btnRef.current;
    const canvas = canvasRef.current;
    if (!enabled || !btn || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const arms = Array.from({ length: ARMS }, (_, i) =>
      makeTendril(i % 3 === 1 ? "fiber" : "arm", (i + Math.random() * 0.7) / ARMS),
    );
    const drips = Array.from({ length: DRIPS }, (_, i) =>
      makeTendril("drip", 0.12 + ((i + 0.2 + Math.random() * 0.6) / DRIPS) * 0.76),
    );
    const all = [...arms, ...drips];
    const off = new Float32Array(MEMBRANE);
    const vel = new Float32Array(MEMBRANE);
    const mouse = { x: -1e4, y: -1e4, active: false };
    const shift = { x: 0, y: 0 };
    let burst = false;
    let dark = true;
    let raf = 0;
    let frame = 0;
    let visible = false;

    const readTheme = () => {
      dark = document.documentElement.classList.contains("dark");
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
    const onDown = (e: PointerEvent) => {
      onMove(e);
      const r = btn.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (d < REACH * 1.4 + r.width / 2) burst = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    const grab = (td: Tendril) => {
      td.attached = true;
      const a = Math.random() * TAU;
      const r = 3 + Math.random() * (td.kind === "fiber" ? 16 : 9);
      td.ox = Math.cos(a) * r;
      td.oy = Math.sin(a) * r;
    };

    const step = (time: number) => {
      frame++;
      if (frame % 30 === 1) readTheme();

      const raw = btn.getBoundingClientRect();
      const baseL = raw.left - shift.x;
      const baseT = raw.top - shift.y;
      const cx = baseL + raw.width / 2;
      const cy = baseT + raw.height / 2;
      const near = mouse.active && Math.hypot(mouse.x - cx, mouse.y - cy) < REACH + raw.width / 2;
      shift.x += ((near ? clamp((mouse.x - cx) * 0.05, -12, 12) : 0) - shift.x) * 0.15;
      shift.y += ((near ? clamp((mouse.y - cy) * 0.05, -12, 12) : 0) - shift.y) * 0.15;
      btn.style.transform = `translate3d(${shift.x.toFixed(2)}px, ${shift.y.toFixed(2)}px, 0)`;
      const box: Box = {
        l: baseL + shift.x,
        t: baseT + shift.y,
        w: raw.width,
        h: raw.height,
        r: Math.min(RADIUS, raw.height / 2),
      };
      const inside =
        mouse.active && mouse.x > box.l && mouse.x < box.l + box.w && mouse.y > box.t && mouse.y < box.t + box.h;

      const lunge = burst;
      if (burst) {
        burst = false;
        for (let i = 0; i < MEMBRANE; i++) vel[i] += 4 + Math.random() * 5;
      }

      // Soft-body membrane: each edge sample springs along its normal toward a target bulge.
      const base = Array.from({ length: MEMBRANE }, (_, i) => perimeterPoint(box, i / MEMBRANE));
      const agitation = inside ? 2.6 : 1;
      for (let i = 0; i < MEMBRANE; i++) {
        const u = i / MEMBRANE;
        const p = base[i];
        let target =
          (Math.sin(time * 0.0018 + u * TAU * 3 + 1.3) * 1.3 + Math.sin(time * 0.0029 - u * TAU * 5) * 0.9) * agitation;
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          const facing = (dx * p.nx + dy * p.ny) / d;
          if (d < 240 && facing > 0) target += (1 - d / 240) ** 2 * facing * 18;
        }
        for (const td of arms) {
          if (!td.attached) continue;
          let du = Math.abs(u - td.t);
          du = Math.min(du, 1 - du) * MEMBRANE;
          const pull = td.kind === "fiber" ? 2 + 4 * td.tension : 5 + 11 * td.tension;
          target += Math.exp(-((du / 3.5) ** 2)) * pull;
        }
        const lap = off[(i + MEMBRANE - 1) % MEMBRANE] + off[(i + 1) % MEMBRANE] - 2 * off[i];
        vel[i] = (vel[i] + (target - off[i]) * 0.06 + lap * 0.22) * 0.86;
      }
      for (let i = 0; i < MEMBRANE; i++) off[i] += vel[i];

      const mem = base.map((p, i) => ({ x: p.x + p.nx * (off[i] + 1), y: p.y + p.ny * (off[i] + 1), nx: p.nx, ny: p.ny }));
      const blob = new Path2D();
      const last = mem[MEMBRANE - 1];
      blob.moveTo((last.x + mem[0].x) / 2, (last.y + mem[0].y) / 2);
      for (let i = 0; i < MEMBRANE; i++) {
        const a = mem[i];
        const b = mem[(i + 1) % MEMBRANE];
        blob.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      blob.closePath();

      const shapes: Shape[] = [];
      for (const td of all) {
        const drip = td.kind === "drip";
        const u = drip ? bottomU(box, td.t) : td.t;
        const e = perimeterPoint(box, u);
        const o = sampleOffset(off, u);
        const ax = e.x + e.nx * (o - INSET);
        const ay = e.y + e.ny * (o - INSET);
        const dx = mouse.x - ax;
        const dy = mouse.y - ay;
        const d = Math.hypot(dx, dy) || 1;
        const facing = (dx * e.nx + dy * e.ny) / d;
        const reach = REACH * td.reach;

        if (!drip) {
          if (td.cooldown > 0) td.cooldown--;
          if (lunge && !td.attached && d < BREAK * 0.9 && facing > -0.35) {
            td.cooldown = 0;
            grab(td);
          }
          if (!td.attached && mouse.active && td.cooldown === 0 && d < reach && facing > -0.1) grab(td);
          // Arms also let go once the cursor swings behind them, instead of dragging across the body.
          if (td.attached && (!mouse.active || d > BREAK * (0.85 + td.reach * 0.15) || facing < -0.45)) {
            td.attached = false;
            td.cooldown = 45 + Math.floor(Math.random() * 70);
            const tip = td.pts[SEGMENTS];
            tip.px = tip.x + (dx / d) * 14;
            tip.py = tip.y + (dy / d) * 14;
          }
        }

        const sensing = !drip && !td.attached && mouse.active && d < reach * 1.8 && facing > 0.1;
        const maxSeg = td.kind === "fiber" ? MAX_SEG * 1.2 : MAX_SEG;
        const target = drip
          ? td.idle * (1 + 0.6 * (0.5 + 0.5 * Math.sin(time * 0.0006 + td.phase)))
          : td.attached
            ? Math.min((d / SEGMENTS) * 1.12, maxSeg)
            : sensing
              ? SENSE_SEG
              : td.idle;
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
          const wave = Math.sin(time * 0.004 + i * 0.55 + td.phase) * (drip ? 0.08 : 0.28) * k;
          const push = (drip ? 0.15 : 0.45) * (1 - k) * (1 - k);
          let fx = e.nx * push - e.ny * wave;
          let fy = e.ny * push + e.nx * wave + (drip ? 0.32 : 0.09) * k;
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
        td.tension = clamp((length - 60) / 350, 0, 1);
        const thin = Math.max(0.55, Math.min(1, Math.sqrt(90 / Math.max(90, length))));
        shapes.push(shapeTendril(td, thin));
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (dark) {
        ctx.strokeStyle = "rgba(255,255,255,0.09)";
        ctx.lineWidth = 2;
        ctx.stroke(blob);
        for (const s of shapes) {
          ctx.stroke(s.path);
          ctx.beginPath();
          ctx.arc(s.tip.x, s.tip.y, s.tip.r, 0, TAU);
          ctx.stroke();
        }
      }

      ctx.fillStyle = BODY;
      if (!dark) {
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 12;
      }
      ctx.fill(blob);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      for (const s of shapes) {
        ctx.fill(s.path);
        ctx.beginPath();
        ctx.arc(s.tip.x, s.tip.y, s.tip.r, 0, TAU);
        ctx.fill();
      }

      // Liquid sheen on the body: a broad reflection that slides with the cursor, plus a wet streak along the top.
      ctx.save();
      ctx.clip(blob);
      const hx = box.l + box.w * 0.3 + (mouse.active ? clamp((mouse.x - cx) * 0.08, -60, 60) : 0);
      const hy = box.t - box.h * 0.2;
      const sheen = ctx.createRadialGradient(hx, hy, 0, hx, hy, box.w * 0.55);
      sheen.addColorStop(0, "rgba(255,255,255,0.2)");
      sheen.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sheen;
      ctx.fillRect(box.l - 60, box.t - 60, box.w + 120, box.h + 120);
      const streak = ctx.createLinearGradient(box.l, 0, box.l + box.w, 0);
      const sx = clamp((hx - box.l) / box.w, 0.15, 0.85);
      streak.addColorStop(0, "rgba(255,255,255,0)");
      streak.addColorStop(Math.max(0.01, sx - 0.12), "rgba(255,255,255,0.55)");
      streak.addColorStop(Math.min(0.99, sx + 0.25), "rgba(255,255,255,0.18)");
      streak.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = streak;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      let started = false;
      for (const p of mem) {
        if (p.ny > -0.99) continue;
        const x = p.x - p.nx * 6;
        const y = p.y - p.ny * 6;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      for (const s of shapes) glossTendril(ctx, s);

      // Sticky webbing between neighbouring arms that are holding on.
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.22)" : BODY;
      ctx.lineCap = "round";
      const held = arms.filter((td) => td.attached);
      for (let i = 0; i < held.length - 1; i++) {
        const a = held[i];
        const b = held[i + 1];
        for (const at of [0.45, 0.7, 0.9]) {
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

      raf = visible ? requestAnimationFrame(step) : 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) {
          readTheme();
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
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      btn.style.transform = "";
    };
  }, [enabled]);

  return (
    <>
      {enabled && (
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-30 h-full w-full" />
      )}
      <a
        ref={btnRef}
        href={href}
        className={enabled ? `${className ?? ""} venom-live` : className}
        style={{ position: "relative", zIndex: 31 }}
      >
        {children}
      </a>
    </>
  );
}
