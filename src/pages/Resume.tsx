import { useEffect } from "react";
import {
  award,
  education,
  featured,
  profile,
  resumeBullets,
  resumeSkills,
  resumeSummary,
  sideProjects,
} from "../data/portfolio";
import { ThemeToggle } from "../components/ui";

const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

function Heading({ children }: { children: string }) {
  return (
    <h2 className="mt-3.5 mb-1.5 border-b border-neutral-300 pb-1 text-[11px] font-bold tracking-[0.16em] text-neutral-900 uppercase">
      {children}
    </h2>
  );
}

export default function Resume() {
  useEffect(() => {
    document.title = `${profile.name} — Resume`;
  }, []);

  return (
    <div className="min-h-screen py-8 print:py-0">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between px-5">
        <a href="/" className="text-[13px] font-semibold hover:opacity-60">
          ← back to portfolio
        </a>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-fg px-4 py-1.5 text-[13px] font-semibold text-bg transition hover:opacity-80"
          >
            download pdf
          </button>
          <ThemeToggle />
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-[14mm] py-[12mm] font-sans text-[10.5px] leading-[1.4] text-neutral-800 shadow-2xl shadow-black/10 ring-1 ring-black/5 print:max-w-none print:p-0 print:shadow-none print:ring-0">
        <header>
          <h1 className="text-[24px] font-bold tracking-tight text-neutral-950">{profile.name}</h1>
          <p className="text-[12px] font-medium text-neutral-700">{profile.role}</p>
          <p className="mt-1.5 flex flex-wrap gap-x-2 text-neutral-600">
            <span>{profile.location}</span>
            <span aria-hidden>|</span>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <span aria-hidden>|</span>
            <a href={profile.github}>{strip(profile.github)}</a>
            <span aria-hidden>|</span>
            <a href={profile.linkedin}>{strip(profile.linkedin)}</a>
          </p>
        </header>

        <Heading>Summary</Heading>
        <p>{resumeSummary}</p>

        <Heading>Education</Heading>
        <p>
          <span className="font-semibold text-neutral-950">{education.course}</span> — {education.school}
          <span className="text-neutral-600"> · {education.focus}</span>
        </p>

        <Heading>Awards</Heading>
        <div className="flex justify-between gap-4">
          <p>
            <span className="font-semibold text-neutral-950">{award.title}</span> — {award.org} (team {award.project})
          </p>
          <span className="shrink-0 text-neutral-600">{award.date}</span>
        </div>

        <Heading>Projects</Heading>
        <div className="space-y-2">
          {featured.map((p) => (
            <section key={p.id}>
              <div className="flex justify-between gap-4">
                <p>
                  <span className="font-semibold text-neutral-950">{p.title}</span>
                  <span className="text-neutral-600"> — {p.tagline}</span>
                </p>
                <span className="shrink-0 text-neutral-600">{p.period}</span>
              </div>
              <p className="text-neutral-600 italic">
                {p.role} · {p.team === "Team" ? "Team project" : "Solo project"} · {p.stack.slice(0, 6).join(", ")}
              </p>
              <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
                {resumeBullets[p.id].map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Heading>Other projects</Heading>
        <p>
          {sideProjects.map((s, i) => (
            <span key={s.title}>
              <span className="font-semibold text-neutral-950">{s.title}</span> — {s.short}
              {i < sideProjects.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>

        <Heading>Skills</Heading>
        <dl className="space-y-0.5">
          {resumeSkills.map((s) => (
            <div key={s.label} className="flex gap-2">
              <dt className="w-20 shrink-0 font-semibold text-neutral-950">{s.label}</dt>
              <dd>{s.items}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>
  );
}
