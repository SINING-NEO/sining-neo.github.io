import { useEffect, useState } from "react";
import {
  about,
  ai,
  award,
  education,
  featured,
  profile,
  sideProjects,
  skillGroups,
  type Project,
  type Visual,
} from "../data/portfolio";
import { Label, Reveal, Rich, TextLink, ThemeToggle, cx } from "../components/ui";

const pad = "px-5 sm:px-8 lg:px-12";
const num = (i: number) => String(i + 1).padStart(2, "0");

export default function Home() {
  return (
    <>
      <a
        href="#work"
        className="sr-only z-50 bg-fg px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to work
      </a>
      <Header />
      <main>
        <Cover />
        <About />
        <Index />
        {featured.map((p, i) => (
          <ProjectSlide key={p.id} project={p} index={i} />
        ))}
        <MoreWork />
        <Skills />
        <AiSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#work", label: "work", always: true },
    { href: "#about", label: "about" },
    { href: "#skills", label: "skills" },
    { href: "#ai", label: "ai" },
    { href: "#contact", label: "contact" },
  ];

  return (
    <header
      className={cx(
        "sticky top-0 z-40 border-b bg-bg/85 backdrop-blur-md transition-colors",
        scrolled ? "border-line" : "border-transparent",
      )}
    >
      <div className={cx("flex h-14 items-center justify-between", pad)}>
        <a href="#" className="text-[13px] font-bold tracking-tight">
          {profile.name}
        </a>
        <nav aria-label="Main" className="flex items-center gap-5 text-[13px] font-semibold sm:gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cx("transition-opacity hover:opacity-60", !l.always && "hidden md:inline")}
            >
              {l.label}
            </a>
          ))}
          <a href="/resume" className="transition-opacity hover:opacity-60">
            resume
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function LocalTime() {
  const fmt = () =>
    new Intl.DateTimeFormat("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Singapore",
    }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);
  return <>{time}</>;
}

function Cover() {
  return (
    <section className={cx("flex min-h-[calc(100svh-3.5rem)] flex-col justify-between py-6", pad)}>
      <div className="flex justify-between text-[13px] font-semibold">
        <span>{profile.role}</span>
        <span className="text-right">
          {profile.location} — <LocalTime />
        </span>
      </div>

      <Reveal className="mx-auto w-fit py-16">
        <h1 className="display text-[clamp(4.5rem,19vw,20rem)]">
          <span className="sr-only">{profile.name} — </span>Portfolio.
        </h1>
        <div className="mt-2 flex items-start justify-between gap-6 sm:mt-4">
          <span className="text-base font-semibold tracking-tight sm:text-2xl">{profile.name}</span>
          <span className="display text-3xl sm:text-6xl lg:text-7xl">2026</span>
        </div>
      </Reveal>

      <div className="flex items-end justify-between text-[13px] font-semibold">
        <a href="#work" className="hover:opacity-60">
          selected work 01 — {num(featured.length - 1)}
        </a>
        <span aria-hidden className="text-muted">
          scroll ↓
        </span>
      </div>
    </section>
  );
}

function TimelineRow({ date, title, lines }: { date: string[]; title: string; lines: string[] }) {
  return (
    <li className="grid grid-cols-[6.5rem_1fr] gap-4 py-2.5">
      <span className="text-[11px] leading-tight font-medium text-muted uppercase">
        {date.map((d) => (
          <span key={d} className="block">
            {d}
          </span>
        ))}
      </span>
      <span className="text-[13px] leading-snug">
        <span className="block font-bold">{title}</span>
        {lines.map((l) => (
          <span key={l} className="block text-muted">
            {l}
          </span>
        ))}
      </span>
    </li>
  );
}

function About() {
  return (
    <section id="about" aria-label="About" className={cx("border-t border-line py-20 lg:py-28", pad)}>
      <div className="grid gap-x-10 gap-y-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="display max-w-[17ch] text-[clamp(2.1rem,4vw,3.6rem)] leading-[1.02] font-bold tracking-[-0.03em]">
              {about.statement}
            </p>
          </Reveal>

          <Reveal className="mt-16 grid gap-8 sm:grid-cols-[minmax(0,14rem)_1fr]">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                className="aspect-[4/5] w-full object-cover grayscale"
              />
            ) : (
              <div
                aria-hidden
                className="display grid aspect-[4/5] w-full max-w-56 place-items-center bg-fg text-[5.5rem] text-bg"
              >
                SN
              </div>
            )}
            <div className="max-w-md space-y-3 text-[14px] leading-relaxed text-muted">
              {about.bio.map((b) => (
                <p key={b}>
                  <Rich text={b} />
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-14 grid items-end gap-10 sm:grid-cols-[minmax(0,14rem)_1fr]">
            <div>
              <Label>contact</Label>
              <ul className="mt-3 space-y-1.5 text-[13px]">
                <li>
                  <a href={`mailto:${profile.email}`} className="hover:underline">
                    ✉ {profile.email}
                  </a>
                </li>
                <li>
                  <a href={profile.github} target="_blank" rel="noreferrer" className="hover:underline">
                    ↗ github.com/{profile.githubHandle}
                  </a>
                </li>
                <li>
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                    ↗ linkedin.com/in/{profile.linkedinHandle}
                  </a>
                </li>
              </ul>
            </div>
            <p className="display max-w-[22ch] text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.05] font-bold tracking-[-0.025em]">
              {about.closing}
            </p>
          </Reveal>
        </div>

        <Reveal delay={120} className="space-y-10 lg:col-span-4 lg:col-start-9">
          <div>
            <Label>education</Label>
            <ul className="mt-2">
              <TimelineRow date={["current"]} title={education.course} lines={["UI/UX focus", education.school]} />
              <TimelineRow date={["2026 –", "2027"]} title="Project INC" lines={[education.school]} />
            </ul>
          </div>
          <div>
            <Label>award</Label>
            <ul className="mt-2">
              <TimelineRow date={[award.date]} title={award.title} lines={[award.org, `Team ${award.project}`]} />
            </ul>
          </div>
          <div>
            <Label>experience</Label>
            <ul className="mt-2">
              {featured.map((p) => (
                <TimelineRow
                  key={p.id}
                  date={p.period.split(" – ").map((d, i, a) => (i < a.length - 1 ? `${d} –` : d))}
                  title={p.title}
                  lines={[p.role, p.team === "Team" ? "Team project" : "Solo project"]}
                />
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Index() {
  return (
    <section id="work" aria-label="Selected work" className={cx("border-t border-line py-20 lg:py-28", pad)}>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Label>selected work</Label>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">
            Six projects from 2026 — team and solo — each shown as the problem, what I built, and how it turned out.
          </p>
        </div>
        <ol className="lg:col-span-8">
          {featured.map((p, i) => (
            <li key={p.id} className="border-b border-line first:border-t">
              <a
                href={`#${p.id}`}
                className="group grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 py-4 transition-colors hover:bg-fg hover:text-bg sm:grid-cols-[5rem_1fr_10rem_6rem] sm:px-3"
              >
                <span className="display text-2xl sm:text-3xl">{num(i)}.</span>
                <span>
                  <span className="display block text-2xl tracking-[-0.03em] sm:text-3xl">{p.title}</span>
                  <span className="mt-1 block text-[13px] text-muted group-hover:text-bg/70">{p.tagline}</span>
                </span>
                <span className="hidden text-[13px] sm:block">{p.role}</span>
                <span className="text-right text-[13px]">
                  {p.period.split(" ").pop()} <span aria-hidden>↓</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function VisualPanel({ visual, className }: { visual: Visual; className?: string }) {
  if (visual.kind === "image") {
    return (
      <img
        src={visual.src}
        alt={visual.alt}
        loading="lazy"
        className={cx("h-full w-full object-cover", className)}
        style={{ objectPosition: visual.position ?? "center" }}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={visual.words.join(", ")}
      className={cx("@container flex h-full w-full flex-col justify-center p-[6cqw]", className)}
      style={{ background: visual.bg, color: visual.fg }}
    >
      {visual.words.map((w) => (
        <span key={w} className="display block text-[clamp(2.5rem,11cqw,9rem)] leading-[0.92]">
          {w}
        </span>
      ))}
    </div>
  );
}

function ProjectSlide({ project: p, index }: { project: Project; index: number }) {
  return (
    <section id={p.id} aria-labelledby={`${p.id}-title`} className="border-t border-line">
      <div className="grid lg:min-h-[88svh] lg:grid-cols-12">
        <Reveal className={cx("flex flex-col justify-between gap-16 py-12 lg:col-span-5 lg:py-14", pad)}>
          <p aria-hidden className="display text-[clamp(5rem,10vw,10rem)]">
            {num(index)}.
          </p>
          <div>
            <h3 id={`${p.id}-title`} className="display text-[clamp(2.25rem,3.6vw,3.5rem)] leading-none tracking-[-0.035em]">
              {p.title}
            </h3>
            <p className="mt-2 text-[14px] font-medium">{p.tagline}</p>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-muted">
              <Rich text={p.lede} />
            </p>
            <dl className="mt-7 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-4 text-[12px]">
              <div>
                <dt className="text-muted">role</dt>
                <dd className="mt-0.5 font-semibold">{p.role}</dd>
              </div>
              <div>
                <dt className="text-muted">{p.team === "Team" ? "team project" : "solo project"}</dt>
                <dd className="mt-0.5 font-semibold">{p.period}</dd>
              </div>
              <div>
                <dt className="text-muted">status</dt>
                <dd className="mt-0.5 font-semibold">{p.status ?? "Shipped"}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {p.links.map((l) => (
                <TextLink key={l.href} href={l.href}>
                  {l.label.toLowerCase()}
                </TextLink>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="relative aspect-[16/11] overflow-hidden bg-soft lg:col-span-7 lg:aspect-auto">
          <VisualPanel visual={p.visual} className="absolute inset-0" />
        </div>
      </div>

      <div className={cx("grid gap-10 border-t border-line py-12 lg:grid-cols-12 lg:py-16", pad)}>
        <Reveal className="lg:col-span-5">
          <Label>outcome</Label>
          <p className="display mt-3 max-w-[24ch] text-[clamp(1.4rem,2.2vw,2rem)] leading-[1.08] font-bold tracking-[-0.025em]">
            {p.outcome}
          </p>
        </Reveal>
        <Reveal delay={100} className="lg:col-span-7">
          <Label>contribution</Label>
          <ul className="mt-3 grid gap-x-8 gap-y-3 text-[13px] leading-relaxed text-muted sm:grid-cols-2">
            {p.highlights.map((h) => (
              <li key={h} className="border-t border-line pt-3">
                {h}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[12px] text-muted">
            <span className="font-semibold text-fg">tools</span> — {p.stack.join(", ")}
          </p>
          <p className="mt-1 text-[12px] text-muted">
            <span className="font-semibold text-fg">fig. {num(index)}</span> — {p.visual.caption}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function MoreWork() {
  return (
    <section aria-labelledby="more" className={cx("border-t border-line py-20 lg:py-28", pad)}>
      <div className="mb-12 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Label>
            <span id="more">more work</span>
          </Label>
        </div>
        <p className="display max-w-[20ch] text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.04] font-bold tracking-[-0.025em] lg:col-span-8">
          Smaller builds where I practise tone, motion, and care.
        </p>
      </div>
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {sideProjects.map((s, i) => (
          <Reveal key={s.title} delay={(i % 2) * 100} as="article">
            <div className="group aspect-[16/10] overflow-hidden bg-soft">
              {s.image ? (
                <img
                  src={s.image.src}
                  alt={s.image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="display flex h-full w-full flex-col justify-end bg-fg p-8 text-[clamp(2.5rem,6vw,5rem)] text-bg">
                  <span>React</span>
                  <span>SEEDs.</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start justify-between gap-6">
              <div>
                <h3 className="text-[15px] font-bold tracking-tight">{s.title}</h3>
                <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted">{s.blurb}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {s.links.map((l) => (
                  <TextLink key={l.href} href={l.href}>
                    {l.label.toLowerCase()}
                  </TextLink>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" aria-label="Skills" className={cx("border-t border-line py-20 lg:py-28", pad)}>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Label>skills</Label>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">
            Everything listed here shows up in at least one project on this page.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-8">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={(i % 3) * 80}>
              <h3 className="border-b border-line pb-2 text-[13px] font-bold lowercase">{g.title}</h3>
              <ul className="mt-3 space-y-1 text-[13px] text-muted">
                {g.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiSection() {
  const modelCount = ai.models.reduce((n, g) => n + g.names.length, 0);

  return (
    <section id="ai" aria-label="AI" className={cx("border-t border-line py-20 lg:py-28", pad)}>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Label>ai</Label>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">
            Where AI runs inside my projects, how I build with it, and the models I work with.
          </p>
        </div>
        <Reveal className="lg:col-span-8">
          <p className="display max-w-[22ch] text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.04] font-bold tracking-[-0.025em]">
            {ai.statement}
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <h3 className="border-b border-line pb-2 text-[13px] font-bold lowercase">shipped in my projects</h3>
          <ul>
            {ai.shipped.map((s) => (
              <li key={s.name} className="border-b border-line py-3">
                <p className="text-[13px] font-bold">{s.name}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{s.use}</p>
                <p className="mt-1 text-[11px] font-medium text-muted uppercase">{s.project}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-4">
          <h3 className="border-b border-line pb-2 text-[13px] font-bold lowercase">building with ai</h3>
          <ol>
            {ai.workflow.map((w, i) => (
              <li key={w.step} className="grid grid-cols-[2.5rem_1fr] border-b border-line py-3">
                <span className="display text-xl">{num(i)}</span>
                <span>
                  <span className="block text-[13px] font-bold">{w.step}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{w.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={160} className="lg:col-span-4">
          <h3 className="flex items-baseline justify-between border-b border-line pb-2 text-[13px] font-bold lowercase">
            models in my toolkit
            <span className="display text-xl">{modelCount}</span>
          </h3>
          <div className="space-y-4 pt-3">
            {ai.models.map((g) => (
              <div key={g.provider}>
                <p className="text-[11px] font-medium text-muted uppercase">{g.provider}</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {g.names.map((n) => (
                    <li key={n} className="border border-line px-2 py-1 text-[12px] font-semibold transition-colors hover:bg-fg hover:text-bg">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[12px] leading-relaxed text-muted">{ai.modelsNote}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" aria-label="Contact" className={cx("border-t border-line py-20 lg:py-28", pad)}>
      <Reveal>
        <p className="display text-[clamp(4.5rem,16vw,16rem)]">Let's talk.</p>
      </Reveal>
      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <p className="max-w-sm text-[14px] leading-relaxed text-muted lg:col-span-4">{profile.availability}</p>
        <div className="lg:col-span-8">
          <a
            href={`mailto:${profile.email}`}
            className="display text-[clamp(1.75rem,4.5vw,4rem)] leading-none tracking-[-0.035em] underline decoration-2 underline-offset-[0.15em] hover:opacity-70"
          >
            {profile.email}
          </a>
          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2">
            <button type="button" onClick={copy} className="text-[13px] font-semibold underline underline-offset-4">
              {copied ? "copied ✓" : "copy email"}
            </button>
            <TextLink href={profile.github}>github</TextLink>
            <TextLink href={profile.linkedin}>linkedin</TextLink>
            <TextLink href="/resume">resume</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={cx("flex flex-wrap justify-between gap-3 border-t border-line py-6 text-[12px]", pad)}>
      <span className="font-semibold">© 2026 {profile.name}</span>
      <span className="text-muted">designed and built by me · react, tailwind, vite</span>
      <a href="#" className="font-semibold hover:opacity-60">
        back to top ↑
      </a>
    </footer>
  );
}
