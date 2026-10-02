import { Fragment, useEffect, useRef, type ElementType, type ReactNode } from "react";
import { useTheme } from "../lib/theme";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
  id,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} id={id} className={cx("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/** Renders **bold** segments inside plain text. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="font-semibold text-fg">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cx("text-[13px] font-bold tracking-tight lowercase", className)}>{children}</h2>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group inline-flex items-center gap-1 text-[13px] font-semibold underline decoration-line decoration-1 underline-offset-4 transition hover:decoration-fg"
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        ↗
      </span>
    </a>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="inline-flex items-center gap-2 text-[13px] font-semibold lowercase"
    >
      <span
        aria-hidden
        className="relative inline-block h-3.5 w-3.5 rounded-full border-[1.5px] border-fg"
        style={{ background: "linear-gradient(90deg, var(--fg) 50%, transparent 50%)" }}
      />
      {theme === "dark" ? "light" : "dark"}
    </button>
  );
}
