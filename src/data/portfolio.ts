export const profile = {
  name: "Sitt Naing",
  role: "UI/UX designer & front-end developer",
  location: "Singapore",
  headline: "I design by building usable prototypes.",
  intro:
    "Aspiring UI/UX designer studying IT at Singapore Polytechnic. My work sits between interaction design, applied web apps, and small AI pipelines — from webcam hand-tracking in 3D to clinical screening forms used at community events.",
  email: "sittn40@gmail.com",
  github: "https://github.com/SINING-NEO",
  githubHandle: "SINING-NEO",
  linkedin: "https://www.linkedin.com/in/sitt-naingg",
  linkedinHandle: "sitt-naingg",
  portfolioV1: "https://sitt-portfoloi.vercel.app",
  /** Drop a square photo at public/me.jpg and set this to "/me.jpg". */
  photo: "" as string,
  availability: "Open to UI/UX internships, junior product design work, and prototype-heavy freelance projects.",
};

export const about = {
  statement: "I design by building — prototypes that go from an idea to something you can actually use.",
  bio: [
    "I'm **Sitt Naing**, an aspiring UI/UX designer based in Singapore, studying for a Diploma in Information Technology at Singapore Polytechnic.",
    "My work sits between **interaction design, applied web apps, and small AI pipelines** — from webcam hand-tracking in 3D to clinical screening forms and conversational insurance flows.",
    "I prototype first, ship early, and let the real bugs teach me what the design needs. When something doesn't add up, like the cost of my AI video pipeline, **I stop and say so**.",
  ],
  closing: "I like clear flows, honest trade-offs, and interfaces that keep working — on camera, offline, and on a phone.",
};

export const education = {
  school: "Singapore Polytechnic",
  course: "Diploma in Information Technology",
  focus: "UI/UX focus · Project INC 2026–27",
};

export const award = {
  title: "Winner, AI Hackathon",
  org: "Autodesk × Singapore Polytechnic",
  date: "Apr 2026",
  project: "BugHound",
  detail:
    "Part of the four-person team behind BugHound, an AI project for software testing and QA, with team lead Jason Hyuntai Kim, project manager Rishov Barman, and Davier Yeo.",
  href: "https://www.linkedin.com/posts/sitt-naingg_ai-hackathon-autodesk-activity-7445725909493391360-tvRU",
};

export type Link = { label: string; href: string };

export type Project = {
  id: string;
  title: string;
  tagline: string;
  role: string;
  team: "Solo" | "Team";
  period: string;
  status?: string;
  /** Wrap key phrases in **double asterisks** to bold them. */
  lede: string;
  highlights: string[];
  outcome: string;
  stack: string[];
  links: Link[];
  visual: Visual;
};

export type Visual =
  | { kind: "image"; src: string; alt: string; caption: string; position?: string }
  | { kind: "poster"; words: string[]; caption: string; bg: string; fg: string };

export const featured: Project[] = [
  {
    id: "vsms",
    title: "VSMS",
    tagline: "Event operations for community vision screening",
    role: "Full-stack developer",
    team: "Team",
    period: "Jul – Aug 2026",
    lede:
      "A secure event-operations app for **planning, running, and auditing community vision-screening events**. Screeners need fast forms that keep working on poor connections, and every result has to be auditable. I built the **screening stations**, moved them onto **editable dynamic schemas**, and made them work **offline-first**.",
    highlights: [
      "Built the staff screening stations — visual acuity, refraction, colour vision, and eye health — then moved them onto editable dynamic field schemas so organisers can change forms without code.",
      "Designed a station library with dedicated create/edit pages, template import, and field-level flag rules that keep clinical flagging intact when forms are schema-driven.",
      "Shipped QR camera check-in at each station, a next-queue pass display, and station-scoped screener auth.",
      "Made the app offline-first: an installable PWA that auto-downloads screening packs when a screener opens an event, with conflict feedback and idempotent sync.",
      "Wrote PostgreSQL routines for result locking, completeness checks, and flag auditing, with tests for sync conflicts and pre-upgrade stations.",
    ],
    outcome:
      "My largest body of work — 5 merged pull requests (#57, #64, #65, #81, #144) through code review and CI.",
    stack: ["React", "TypeScript", "Vite", "Express", "Prisma", "PostgreSQL", "OpenAPI", "PWA"],
    links: [{ label: "Repository", href: "https://github.com/NachikethReddyY/vsms" }],
    visual: {
      kind: "poster",
      words: ["Visual acuity", "Refraction", "Colour vision", "Eye health"],
      caption: "four screening stations, one schema-driven form system",
      bg: "#0f5c4d",
      fg: "#e7f5ef",
    },
  },
  {
    id: "air-draw",
    title: "Air Draw 3D",
    tagline: "Turn a webcam into a 3D pen",
    role: "Designer & developer",
    team: "Solo",
    period: "May – Jun 2026",
    status: "Live",
    lede:
      "A browser app that **turns a webcam into a 3D pen** — the project I'd imagined since childhood. Pinch or point to paint glowing strokes in space with **no special hardware**. The design challenge was making an **invisible input feel understandable**.",
    highlights: [
      "Real-time hand tracking with MediaPipe, rendered as 3D tube strokes in Three.js and React Three Fiber.",
      "Designed two gesture modes — pinch-to-draw and point-to-draw — plus colour, brush size, undo, and a live skeleton overlay so users understand what the camera sees.",
      "Debugged real deployment issues across browsers: Edge camera startup, black preview frames, mirrored overlay alignment, WASM paths, and a safer WebGL fallback.",
    ],
    outcome: "Live on Vercel, hardened through a round of real-browser camera and deploy fixes.",
    stack: ["React", "TypeScript", "MediaPipe", "Three.js", "React Three Fiber"],
    links: [
      { label: "Live app", href: "https://air-draw-3d.vercel.app" },
      { label: "Repository", href: "https://github.com/SINING-NEO/air-draw-3d" },
    ],
    visual: {
      kind: "image",
      src: "/work/air-draw.webp",
      alt: "Air Draw 3D: a dark 3D grid scene with a gesture and sensitivity control panel on the left",
      caption: "drawing scene with gesture guide, sensitivity, draw mode, and colour controls",
      position: "left center",
    },
  },
  {
    id: "pruassist",
    title: "PruAssist",
    tagline: "Conversational insurance navigator",
    role: "Product designer & developer",
    team: "Solo",
    period: "Jun 2026",
    status: "Academic prototype",
    lede:
      "An academic prototype of a **conversational insurance navigator**. Consultations overwhelm customers and leave representatives without context, so I designed an assistant that **prepares both sides** — built on one rule: **the assistant explains, the advisor decides**.",
    highlights: [
      "Designed separate customer and representative portals, connected by a shared live session.",
      "Mapped a 4-step consultation flow: intent and profiling, comparison, confidence check, and a handoff summary for the rep.",
      "Built a rep briefing dashboard, FR Q&A chat, and Rep Desk assistant, with Redis-backed sessions on Vercel and a mobile workspace.",
    ],
    outcome: "Iterated from a portal demo to a second, fuller prototype in four days.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Redis"],
    links: [
      { label: "Live prototype", href: "https://fin-tech-prototyping-2nd.vercel.app" },
      { label: "First version", href: "https://fin-tech-prototype.vercel.app" },
      { label: "Repository", href: "https://github.com/SINING-NEO/fin_tech_prototyping_2nd" },
    ],
    visual: {
      kind: "image",
      src: "/work/pruassist.webp",
      alt: "PruAssist portal chooser with a red Customer portal card and a dark Financial Representative card",
      caption: "portal chooser — customer intake on one side, rep workspace on the other",
    },
  },
  {
    id: "content-pipeline",
    title: "AI Shorts Pipeline",
    tagline: "Plan, generate, approve, publish, measure",
    role: "Backend developer",
    team: "Solo",
    period: "Jun 2026",
    status: "Paused",
    lede:
      "Could one person run a short-form video channel end to end with AI? A Node backend that **plans, generates, approves, publishes, and measures** YouTube Shorts — which I **paused after measuring the unit economics**.",
    highlights: [
      "Express API with BullMQ job queues on Redis, PostgreSQL, and Zod validation, plus a dashboard for tracking jobs.",
      "Perplexity for scripts, hooks, and captions; OpusClip for clipping; YouTube Data API for upload; Meta Graph API planned for Reels.",
      "Docker Compose for the local stack.",
    ],
    outcome:
      "I paused it after measuring the unit economics: one Short could cost a few dollars in video APIs, and views weren't revenue.",
    stack: ["Node.js", "Express", "PostgreSQL", "Redis", "BullMQ", "Docker"],
    links: [{ label: "Repository", href: "https://github.com/SINING-NEO/automated_video_upload" }],
    visual: {
      kind: "poster",
      words: ["Topic", "Script", "Clip", "Upload", "Measure"],
      caption: "perplexity → opusclip → youtube data api, queued with bullmq",
      bg: "#ff5a1f",
      fg: "#140800",
    },
  },
  {
    id: "telegram",
    title: "Telegram Assistants",
    tagline: "Auto-reply for a personal account and an AI agent bot",
    role: "Developer",
    team: "Solo",
    period: "Jun 2026",
    lede:
      "Two takes on one idea, **built in a single day**: let messages get a useful reply when I can't. A **rule-based responder** for my personal account with Gemini fallback, and a bot that keeps **one AI agent per chat**.",
    highlights: [
      "Personal-account service in Python (Telethon): keyword and regex rules, cooldowns, allow/block lists, then Gemini replies with model fallback and logging.",
      "Bot in TypeScript that keeps one Cursor SDK agent per chat, with optional MCP tool servers, so follow-ups continue the same conversation.",
    ],
    outcome: "Two working services shipped in one day.",
    stack: ["Python", "Telethon", "Gemini", "TypeScript", "Cursor SDK", "MCP"],
    links: [
      { label: "Auto-reply repo", href: "https://github.com/SINING-NEO/auto_reply_service_tele" },
      { label: "Bot repo", href: "https://github.com/SINING-NEO/tele_bot" },
    ],
    visual: {
      kind: "poster",
      words: ["Rules", "Cooldown", "Gemini", "Reply"],
      caption: "telethon rule engine with model fallback · cursor sdk agent per chat",
      bg: "#1d4ed8",
      fg: "#eef2ff",
    },
  },
  {
    id: "cryptix",
    title: "Cryptix Security Study",
    tagline: "OWASP analysis of a game-store web app",
    role: "Security analyst (A04)",
    team: "Team",
    period: "Jun 2026",
    lede:
      "A four-person **secure-coding study** of a game-store web app, where each member owned one OWASP Top 10 category. Mine was **A04: Insecure Design** — from scouting to the report section and a fix.",
    highlights: [
      "Scouted the app and wrote the Insecure Design section of the vulnerability report.",
      "Shipped a fix for role handling in user registration.",
      "Kept weekly tracking logs across the three-week study.",
    ],
    outcome: "Delivered the A04 report and the registration role fix.",
    stack: ["OWASP", "Node.js", "Express", "MySQL", "JWT"],
    links: [{ label: "Repository", href: "https://github.com/NachikethReddyY/turbo-funicular" }],
    visual: {
      kind: "poster",
      words: ["A04", "Insecure", "Design"],
      caption: "owasp top 10 · scouting report, vulnerability write-up, registration fix",
      bg: "#0b0b0b",
      fg: "#d9f99d",
    },
  },
];

export const resumeSummary =
  "Aspiring UI/UX designer and front-end developer who designs by building working prototypes. Shipped a hand-tracking 3D drawing app, a conversational insurance prototype, and offline-first clinical screening stations for a team event-operations platform. Comfortable from interface design through React, TypeScript, Node.js, and PostgreSQL.";

export const resumeBullets: Record<string, string[]> = {
  vsms: [
    "Built visual acuity, refraction, colour vision, and eye-health screening stations, then migrated them to editable dynamic field schemas with field-level clinical flag rules.",
    "Delivered QR station check-in, a next-queue display, station-scoped auth, and an installable offline PWA that auto-downloads screening packs with conflict-safe sync.",
    "Wrote PostgreSQL routines for result locking, completeness, and flag auditing; merged 5 pull requests through code review and CI.",
  ],
  "air-draw": [
    "Designed and built a webcam drawing app using MediaPipe hand tracking and Three.js / React Three Fiber, with pinch and point gestures, colour, brush size, undo, and a skeleton overlay.",
    "Resolved cross-browser camera, overlay-mirroring, WASM, and WebGL issues to ship it live on Vercel.",
  ],
  pruassist: [
    "Designed customer and representative portals around a 4-step consultation flow (profiling, comparison, confidence, handoff) on the principle that the assistant explains and the advisor decides.",
    "Built a rep briefing dashboard, FR Q&A chat, and Redis-backed shared sessions on Vercel; iterated from first demo to second prototype in four days.",
  ],
  "content-pipeline": [
    "Built an Express + BullMQ + PostgreSQL pipeline that scripts with Perplexity, clips with OpusClip, and uploads Shorts via the YouTube Data API.",
    "Paused the project after cost analysis showed per-video API spend outweighed expected returns.",
  ],
  telegram: [
    "Shipped two auto-reply services in a day: a Telethon rule engine with Gemini fallback, and a TypeScript bot running a persistent Cursor SDK agent per chat with MCP tools.",
  ],
  cryptix: [
    "Owned OWASP A04 (Insecure Design) in a four-person secure-coding study: wrote the scouting and vulnerability report sections and shipped a registration role-handling fix.",
  ],
};

export const resumeSkills: { label: string; items: string }[] = [
  { label: "Design", items: "Interaction design, conversational flows, form design, responsive UI, accessibility, case studies" },
  { label: "Front-end", items: "React, TypeScript, JavaScript, Next.js, Vite, Tailwind CSS, Three.js, React Three Fiber, MediaPipe, PWA" },
  { label: "Back-end", items: "Node.js, Express, PostgreSQL, PL/pgSQL, Prisma, Redis, BullMQ, Zod, OpenAPI, Docker Compose" },
  { label: "AI & tooling", items: "Cursor SDK, MCP, Gemini, Perplexity API, Git, GitHub, CI, Vercel, OWASP Top 10" },
];

export type SideProject = {
  title: string;
  short: string;
  blurb: string;
  stack: string[];
  links: Link[];
  image?: { src: string; alt: string };
};

export const sideProjects: SideProject[] = [
  {
    title: "Still Here",
    short: "local-first heartbreak support app with a personalised plan",
    blurb:
      "A calm, local-first space for getting through heartbreak — educational support, not therapy. A short survey shapes a personal plan across eight psychology-informed approaches, with mood check-ins, a win jar, journaling, breathing, and curated playlists. No accounts, no analytics; everything stays on the device.",
    stack: ["React", "Vite", "JavaScript", "localStorage"],
    links: [
      { label: "Live", href: "https://no-more-broken.vercel.app" },
      { label: "Code", href: "https://github.com/SINING-NEO/no_more_broken" },
    ],
    image: {
      src: "/work/still-here.webp",
      alt: "Still Here: a dark, calm page titled 'Let grief be grief.' with a personalised grief-pacing plan card",
    },
  },
  {
    title: "Forever Yours",
    short: "interactive, configurable proposal site",
    blurb:
      "A cinematic proposal site: typewriter intro, memory cards, swipe-through reasons, fortune hearts, a love meter, and a final question whose “No” button runs away. Fully configurable from one file, with background music that unlocks on mobile.",
    stack: ["React", "TypeScript", "Vite"],
    links: [
      { label: "Live", href: "https://foreveryours-psi.vercel.app" },
      { label: "Code", href: "https://github.com/SINING-NEO/forever_yours" },
    ],
    image: {
      src: "/work/forever-yours.webp",
      alt: "Forever Yours: a glowing purple and pink intro card asking 'Who is this for?' with name fields",
    },
  },
  {
    title: "React SEEDs Teaching Kit",
    short: "starter, reference, and cheat sheet for new IT students",
    blurb:
      "A hands-on template for teaching React to new IT students: a starter project with TODOs, a finished reference, and a step-by-step cheat sheet.",
    stack: ["React", "JavaScript"],
    links: [{ label: "Code", href: "https://github.com/SINING-NEO/REACT-SEEDs-Porfolio-" }],
  },
  {
    title: "Portfolio v1",
    short: "accessible case-study portfolio",
    blurb:
      "My first portfolio, written as case studies (role, problem, approach, outcome) with skip links, focus styles, and reduced-motion support.",
    stack: ["React", "Vite", "CSS"],
    links: [
      { label: "Live", href: "https://sitt-portfoloi.vercel.app" },
      { label: "Code", href: "https://github.com/SINING-NEO/sitt_portfoloi" },
    ],
    image: {
      src: "/work/portfolio-v1.webp",
      alt: "Portfolio v1: a warm off-white hero reading 'Building calm interfaces for people, prototypes, and AI-era tools.'",
    },
  },
];

export const skillGroups: { title: string; skills: string[] }[] = [
  {
    title: "Design & UX",
    skills: [
      "Interaction design",
      "Conversational flows",
      "Clinical form design",
      "Gesture design",
      "Responsive & mobile UI",
      "Accessibility",
      "Local-first privacy",
      "Case-study writing",
    ],
  },
  {
    title: "Front-end",
    skills: ["React", "TypeScript", "JavaScript", "Next.js", "Vite", "Tailwind CSS", "PWA & offline"],
  },
  {
    title: "3D & input",
    skills: ["Three.js", "React Three Fiber", "MediaPipe"],
  },
  {
    title: "Back-end & data",
    skills: ["Node.js", "Express", "PostgreSQL", "PL/pgSQL", "Prisma", "Redis", "BullMQ", "Zod", "OpenAPI", "Docker Compose"],
  },
  {
    title: "AI & automation",
    skills: ["Cursor & Cursor SDK", "MCP", "Google Gemini", "Perplexity API", "Telegram Bot API", "YouTube Data API"],
  },
  {
    title: "Quality & delivery",
    skills: ["OWASP Top 10", "Code review", "CI", "Offline sync testing", "Vercel", "GitHub Pages"],
  },
];
