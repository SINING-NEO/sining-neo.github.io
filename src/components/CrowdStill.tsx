import { useEffect, useRef } from "react";

const FRAMES = [
  "/crowd-frames/crowd-px-01.png",
  "/crowd-frames/crowd-px-02.png",
  "/crowd-frames/crowd-px-03.png",
  "/crowd-frames/crowd-px-04.png",
  "/crowd-frames/crowd-px-05.png",
  "/crowd-frames/crowd-px-06.png",
];
const DELAY = 160;
const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * About media: you standing still while the crowd moves.
 * Uses a canvas frame player instead of a GIF — iOS Safari freezes GIFs under
 * CSS transforms and in Low Power Mode; canvas keeps the loop reliable on mobile.
 */
export function CrowdStill({ alt, className }: { src?: string; alt: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia(REDUCED).matches;
    let raf = 0;
    let visible = false;
    let frame = 0;
    let last = 0;
    let dir = 1;
    const images: HTMLImageElement[] = [];
    let ready = 0;

    const draw = (i: number) => {
      const img = images[i];
      if (!img?.complete || !img.naturalWidth) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 224;
      const h = canvas.clientHeight || 280;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
    };

    const tick = (t: number) => {
      if (!visible || still) return;
      if (!last) last = t;
      if (t - last >= DELAY) {
        last = t;
        frame += dir;
        if (frame >= FRAMES.length - 1) {
          frame = FRAMES.length - 1;
          dir = -1;
        } else if (frame <= 0) {
          frame = 0;
          dir = 1;
        }
        draw(frame);
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!visible || still || raf || ready < FRAMES.length) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    FRAMES.forEach((src, i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        ready++;
        if (i === 0) draw(0);
        if (ready === FRAMES.length) wake();
      };
      img.src = src;
      images[i] = img;
    });

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.15 },
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.visibilityState === "visible" && visible) wake();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={className}
    />
  );
}
