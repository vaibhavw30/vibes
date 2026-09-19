import type { Project } from "./schema";

/*
 * Project inventory — derived from the GitHub enumeration of github.com/vaibhavw30
 * (source of truth) + PRD/resume context.
 *
 * "WHY" PROVENANCE (whyStatus):
 *  - "confirmed" → Vaibhav's own words / verbatim source-of-truth (tariff, EquiTable, BoxIt).
 *  - "draft"     → drafted from the README for his review. Grounded in documented
 *                  problem statements — NOT invented motivation. The personal hook
 *                  on some (esp. benchwarmer) still needs his confirmation; notes
 *                  inline. UI must visibly flag drafts (never ship as confirmed).
 *
 * FACTS: numbers and framings follow Vaibhav's canonical fact ledger (2026-09).
 * Never claim: BoxIt's CV fraud layer (not built), live trading / PnL for the
 * benchwarmer engine (replay only), Spark on FirstWave (DuckDB only), the 24%
 * EquiTable scraping figure (placeholder).
 *
 * OTHER RULES HONORED:
 *  - BoxIt: repoUrl null (PRIVATE, never exposed); status "coming-soon"; boxit.best only.
 *  - FirstWave: role honesty — FRONTEND LEAD (React + Mapbox + FastAPI), not ML author.
 *  - clearRx / aquatic-sustainability: forks, included per Vaibhav; contribution flagged.
 *  - youtubeUrl null everywhere — demos not recorded yet (placeholders later).
 *
 * COPY: brief, plain, no em dashes, no corny sign-off lines. Keep the noticed
 * problem; cut the flourish.
 */

export const projects: Project[] = [
  {
    slug: "boxit",
    title: "BoxIt",
    oneLiner:
      "Peer-to-peer storage marketplace for college students. Priced per box, verified, transport built in.",
    whyShort:
      "College storage is expensive, inconvenient, and low-trust. Students with spare space would rather earn money hosting it.",
    whyFull:
      "As an out-of-state student, every May and August brought the same scramble: commercial units sold out months ahead, self-storage needed a car most freshmen don't have, and three-month minimums meant paying for unused time. Meanwhile students with space could be earning from it. BoxIt connects the two: priced per box, restricted to verified .edu peers, with a video-verified chain of custody.",
    whyStatus: "confirmed",
    typeTag: "Personal",
    domainTags: ["Systems/Backend", "Full-Stack", "Infra/Cloud"],
    role: "Founder / builder",
    timeframe: "2026 to present",
    team: "Solo, over six months",
    stack: [
      "React Native (Expo)",
      "AWS Lambda (Python)",
      "Supabase / Postgres",
      "AWS S3",
      "Stripe Connect",
    ],
    metrics: [],
    repoUrl: null, // PRIVATE — never expose
    demoUrl: "https://boxit.best",
    // PUBLIC design docs repo (no source): link it as docs, never as repoUrl.
    docsUrl: "https://github.com/vaibhavw30/boxit-architecture",
    youtubeUrl: null,
    status: "coming-soon",
    coverImage: null,
    gallery: [],
    featured: true,
    // Design-level only (schema note): the repo stays private through launch, so
    // this describes the SHAPE of the system. No implementation, no business logic.
    architecture: {
      intro:
        "The source stays private through launch, so this is the shape of the system rather than the code. It moves money between students and stores custody evidence, so most of the design work went into those two paths.",
      points: [
        "Booking lifecycle modeled as an 8-status state machine.",
        "41 services on AWS Lambda behind 35 REST endpoints, over a 12-table Postgres schema. Each route carries its own rate limit.",
        "Exactly-once payout settlement across 4 concurrent write paths. Idempotency keys come from the payout itself, and an append-only, event-sourced ledger is the source of truth.",
        "A lost update returns a 409 rather than allowing a silent overwrite.",
        "Tenant isolation enforced by row-level-security policies in Postgres, not in application code.",
        "A reconciliation sweep runs 10 severity-classified drift detectors against the payment processor, alerting on a mismatch before it reaches a user.",
        "2,680 automated tests, at a 3.3:1 backend test-to-code ratio.",
      ],
    },
  },
  {
    slug: "tariff-modelling",
    title: "Liberation Day and After",
    oneLiner:
      "Whether the April 2025 tariff shock durably changed how U.S. equity sectors move together, and whether a forecast that says 70% is right 70% of the time.",
    whyShort:
      "I wanted to see how one big macro shock ripples through sectors and reshapes market structure.",
    whyFull:
      "The April 2, 2025 tariff announcement was a clean natural experiment. I wanted to see whether the correlations between equity sectors actually broke in a structural way, not just noisily, in the days after. I ran structural-break tests, GARCH(1,1) volatility models, and a 2,000-iteration bootstrap over 11 sector ETFs and 323 trading days. Then I recalibrated the ensemble forecasts, because a model that's confidently wrong is a different problem from one that's honestly uncertain.",
    whyStatus: "confirmed",
    // Done for GTSF (quant training/mentorship). TODO(vaibhav): tag as Research
    // (GTSF-affiliated) or keep Personal? Leaning Research given the affiliation.
    typeTag: "Personal",
    domainTags: ["Quant", "Data", "Applied-Research"],
    role: "Author · GTSF quant mentorship",
    timeframe: "Spring 2026",
    team: "GTSF (Georgia Tech Student Foundation)",
    stack: ["Python", "pandas", "Jupyter", "Yahoo Finance", "FRED"],
    metrics: [
      { label: "Energy beta, conditioned on regime", value: "0.66 → 0.08" },
      { label: "Expected calibration error", value: "0.050" },
      { label: "Brier score", value: "0.2115" },
    ],
    repoUrl: "https://github.com/vaibhavw30/tariff-modelling",
    demoUrl: null,
    youtubeUrl: null,
    status: "shipped",
    coverImage: null,
    gallery: [],
    featured: true,
  },
  {
    slug: "equitable",
    title: "EquiTable",
    oneLiner:
      "Helps families find nearby food pantries with accurate hours. Agents scrape and grade pantry pages, escalating across three Gemini tiers when confidence drops, and stream results onto a live map.",
    whyShort:
      "Atlanta's food-insecurity problem was driven by disconnected food banks and missing information. I wanted to bridge that gap.",
    whyFull:
      "Atlanta's food-insecurity problem was as much about connection as supply. Hours, eligibility, and ID requirements were scattered or missing. EquiTable finds pantries near any location, extracts that structured data with an LLM, and streams it onto a live map as each source resolves. The hard part is keeping it fresh, so a curator agent re-checks the stalest pantries first, and a crashed run resumes where it stopped instead of starting over.",
    whyStatus: "confirmed",
    typeTag: "Personal",
    domainTags: ["ML/AI", "Full-Stack", "Infra/Cloud"],
    role: "TODO(vaibhav): solo / role?",
    timeframe: "2026",
    team: "TODO(vaibhav)",
    stack: [
      "React 19 + Vite",
      "FastAPI",
      "LangGraph",
      "Gemini",
      "LangSmith",
      "MongoDB",
      "Kubernetes",
    ],
    metrics: [
      { label: "Tests", value: "246" },
      { label: "Running cost", value: "$0/month" },
    ],
    repoUrl: "https://github.com/vaibhavw30/EquiTable",
    demoUrl: null,
    youtubeUrl: null,
    status: "shipped",
    coverImage: null,
    gallery: [],
    featured: true,
  },
  {
    slug: "firstwave",
    title: "FirstWave",
    oneLiner:
      "Predictive EMS staging dashboard. Forecasts where 911 calls will cluster and pre-positions idle ambulances.",
    // DRAFT from README. Problem framing is well-documented; keep role honest.
    whyShort:
      "Emergency demand is predictable, like Friday nights in the Bronx or summer weekends in Brooklyn. Ambulances still wait for the call instead of moving ahead of it.",
    whyFull:
      "NYC EMS takes over 1.5 million calls a year. In the worst boroughs the average response runs past the 8-minute mark where cardiac-arrest survival drops fast. The problem is placement rather than the number of ambulances, and demand is predictable enough to stage for. FirstWave forecasts where calls will cluster over the next hour and shows dispatchers where to pre-position idle units before they come in. I led the frontend: the React and Mapbox dashboard that makes the forecast legible, and the FastAPI integration behind it, not the ML forecasting pipeline itself.",
    whyStatus: "draft",
    typeTag: "Hackathon",
    domainTags: ["Full-Stack", "Frontend", "Data"],
    role: "Frontend lead (React + Mapbox dashboard, FastAPI integration)",
    timeframe: "2026 · GT Hacklytics",
    team: "Four-person team",
    stack: ["React", "Mapbox", "FastAPI", "Python", "XGBoost", "DuckDB", "OSMnx"],
    metrics: [
      // Real project results from the README (team outcome, not solo claim).
      { label: "Within 8-min window", value: "64.7% → 86.0%" },
      { label: "Bronx coverage", value: "48.2% → 96.7%" },
      { label: "Median time saved", value: "3 min 19 sec" },
    ],
    repoUrl: "https://github.com/vaibhavw30/FirstWave",
    demoUrl: null,
    youtubeUrl: null,
    status: "shipped",
    coverImage: null,
    gallery: [],
    featured: false,
  },
  {
    slug: "benchwarmer",
    title: "Benchwarmer",
    oneLiner:
      "An NBA prediction engine plus a C++20 market data recorder that rebuilds the order book from a live feed and replays any recorded session byte-for-byte.",
    whyShort:
      "I follow the NBA and I like prediction. I wanted to treat it like a market: a backtested engine against live prices, not gut calls.",
    whyFull:
      "I wanted to treat NBA games the way a quant treats any market, with a model instead of gut calls. I built the engine in C++, backtested it against historical games, and wired it to the Kalshi API so the forecasts meet real prices. The recorder replays every recorded session through the same ingest, decision, and execution path, so a change in behavior traces back to a commit. It has only ever run on replay, never with real money.",
    whyStatus: "confirmed",
    typeTag: "Personal",
    domainTags: ["Quant", "ML/AI", "Data"],
    role: "Solo",
    timeframe: "2026",
    team: "Solo",
    stack: ["C++20", "Boost.Beast", "simdjson", "XGBoost", "Kalshi API", "Python"],
    metrics: [{ label: "Byte-identical replay tests", value: "33" }],
    repoUrl: "https://github.com/vaibhavw30/benchwarmer",
    demoUrl: null,
    youtubeUrl: null,
    status: "in-progress",
    coverImage: null,
    gallery: [],
    featured: true,
  },
  {
    // This repo IS Vaibhav's Trustworthy Robotics Lab research (see experience.ts).
    slug: "llm-activation-steering",
    title: "Steering Truth in LLMs",
    oneLiner:
      "Feature-engineering truth and modality directions in LLM activations, then steering with XGBoost to beat linear-probe and contrastive-mean-difference baselines.",
    // Grounded in Vaibhav's own description of the work; confirm the motivation framing.
    whyShort:
      "The standard ways to find a 'truth direction' in a model, like linear probes and contrastive mean differences, leave signal on the table. I tried to feature-engineer better directions and steer on them.",
    whyFull:
      "Truth and other high-level concepts show up as directions in a model's activations, but the usual ways to recover them (a linear probe, or the contrastive mean difference between true and false statements) are blunt. I treated it as a feature-engineering problem: find richer directions, then steer with XGBoost to move behavior further than the linear baselines could. On gemma-2-2b, a direction I could decode at ~99% accuracy still wasn't one I could steer on.",
    whyStatus: "draft",
    typeTag: "Research",
    domainTags: ["ML/AI", "Applied-Research"],
    role: "Researcher, Trustworthy Robotics Lab",
    timeframe: "Apr 2026 to present",
    team: "Trustworthy Robotics Lab",
    stack: [
      "Python",
      "PyTorch",
      "gemma-2-2b",
      "Sparse autoencoders",
      "XGBoost",
      "NCSA DeltaAI (GH200)",
    ],
    metrics: [],
    repoUrl: "https://github.com/vaibhavw30/llm-activation-steering-research",
    demoUrl: null,
    youtubeUrl: null,
    status: "in-progress",
    coverImage: null,
    gallery: [],
    featured: false,
  },
  {
    slug: "jobmaxxing",
    title: "jobmaxxing",
    oneLiner:
      "Auto-updating, deduped Postgres feed of internship postings. Isolated pollers back off blocked sources, and an LLM only sees the records rules can't route.",
    // DRAFT from README. Problem is implicit but strongly supported by the design.
    whyShort:
      "Internship postings are scattered across a dozen boards and go stale fast. I was tired of refreshing all of them, so I built one feed that watches them for me.",
    whyFull:
      "Recruiting season means the same role lives on Greenhouse, Lever, Ashby, and three GitHub lists at once, half of them already filled by the time you look. I wanted a single deduped feed that polls every source on a schedule, keeps one clean record per posting, and emails me a nightly digest. Each source runs isolated so one broken board never takes the whole pipeline down.",
    whyStatus: "draft",
    typeTag: "Personal",
    domainTags: ["Systems/Backend", "Data", "Infra/Cloud"],
    role: "Solo",
    timeframe: "2026",
    team: "Solo",
    stack: ["Python", "Supabase / Postgres", "Docker", "GitHub Actions", "MCP"],
    metrics: [],
    repoUrl: "https://github.com/vaibhavw30/jobmaxxing",
    demoUrl: null,
    youtubeUrl: null,
    status: "in-progress",
    coverImage: null,
    gallery: [],
    featured: false,
  },
  {
    slug: "imc-prosperity",
    title: "IMC Prosperity 4",
    oneLiner:
      "Algorithmic trading bot for IMC's 5-round competition, with EDA, baseline strategies, and a backtester.",
    // DRAFT from README. Motivation inferred from the competition's structure.
    whyShort:
      "I wanted to see whether my read on a market would hold up against a live order book, not just a clean backtest.",
    whyFull:
      "IMC Prosperity drops you into a synthetic market where you submit orders against bots each timestep, with one-timestep order life and position limits. I wanted to know whether simple strategies, like pinning a stable product to its fair value or trading a drifting one carefully, could survive adversarial fills. I built the EDA, baselines, and a backtester first, then iterated.",
    whyStatus: "draft",
    typeTag: "Personal", // TODO(vaibhav): Personal vs Hackathon (multi-week competition)
    domainTags: ["Quant", "Data"],
    role: "TODO(vaibhav): solo / team?",
    timeframe: "2026",
    team: "TODO(vaibhav)",
    stack: ["Python", "pandas", "numpy", "prosperity4btest"],
    metrics: [],
    repoUrl: "https://github.com/vaibhavw30/imc4",
    demoUrl: null,
    youtubeUrl: null,
    status: "shipped",
    coverImage: null,
    gallery: [],
    featured: false,
  },
  {
    slug: "clearrx",
    title: "clearRx",
    oneLiner:
      "Surfaces drug interaction risk to a clinician in one query instead of several lookups, with the source document behind every answer.",
    // DRAFT from README. Problem stated; keep the co-build + retrieval-focus honest.
    whyShort:
      "Whether two prescriptions interact shouldn't come down to a provider's memory, and a lookup tool only helps if you can trust its answer.",
    whyFull:
      "Drug-drug interactions are exactly the kind of thing a computer should catch, but a lookup is only as good as its retrieval and its honesty about uncertainty. It started as a team project at HackGT where I was a main contributor. Afterward I reworked it entirely on my own, replacing exact name matching with hybrid dense and BM25 retrieval plus cross-encoder reranking. Every retriever change was scored against an LLM-as-judge harness over 80+ labeled clinical queries, and every interaction it reports links to its source, because an unsourced answer isn't usable by someone about to act on it.",
    whyStatus: "draft",
    typeTag: "Hackathon",
    domainTags: ["ML/AI", "Full-Stack"],
    role: "Main contributor on the team build, then rebuilt it solo",
    timeframe: "HackGT",
    team: "Team project, then solo",
    stack: ["TypeScript", "Python", "BGE embeddings", "BM25", "cross-encoder reranker", "Pinecone"],
    metrics: [
      { label: "Precision@5", value: "62% → 88%" },
      { label: "Labeled clinical queries", value: "80+" },
    ],
    repoUrl: "https://github.com/vaibhavw30/clearRx", // FORK (ashwinvijayakumar24/clearRx) — included per Vaibhav
    demoUrl: null,
    youtubeUrl: null,
    status: "shipped",
    coverImage: null,
    gallery: [],
    featured: false,
  },
  {
    slug: "aquatic-sustainability",
    title: "Aquatic Sustainability",
    oneLiner:
      "Watershed monitoring: geolocating water vulnerabilities and access inequities from satellite and historical data.",
    // DRAFT from the README's Motivation section. Note: this is the TEAM's framing
    // (GT Big Data fork) — confirm your specific contribution and personal angle.
    whyShort:
      "Water problems go undetected in the places with the least monitoring data. I wanted to see watershed risk and access gaps on a map before they turn into emergencies.",
    whyFull:
      "This started as a GT Big Data project around a real gap: many less-developed regions have too little infrastructure and data to catch contamination, predict floods or droughts, or track whether water stays affordable. The idea was to aggregate satellite imagery and historical datasets into one interface that geolocates watershed anomalies and inequities, so citizens and governments can act earlier. On a four-person team, I built the ML infrastructure: a supervised CNN in PyTorch on multi-year satellite imagery, served from a containerized Flask app on GCP.",
    whyStatus: "draft",
    typeTag: "Research", // TODO(vaibhav): Research vs Personal (GT Big Data club project)
    domainTags: ["ML/AI", "Data", "Applied-Research"],
    role: "ML infrastructure developer",
    timeframe: "Sept 2025 to May 2026",
    team: "Big Data Big Impact (four people)",
    stack: ["Python", "PyTorch", "Flask", "GCP", "SQL"],
    metrics: [{ label: "Macro F1", value: "0.758" }],
    repoUrl: "https://github.com/vaibhavw30/aquatic-sustainability", // FORK (gt-big-data) — included per Vaibhav
    demoUrl: null,
    youtubeUrl: null,
    status: "shipped",
    coverImage: null,
    gallery: [],
    featured: false,
  },
  {
    slug: "automated-umbrella",
    title: "Automated Umbrella",
    oneLiner:
      "A temperature-triggered umbrella built from bare components: Arduino firmware in C driving a motor and solenoid off a DHT sensor.",
    // DRAFT: facts from the fact ledger; the personal motivation is unknown.
    // TODO(vaibhav): why did you build it? Replace whyShort with your reason.
    whyShort:
      "The one project where I built the hardware and the software, and learned the software is only as good as the thing it drives.",
    whyFull:
      "I soldered the electrical path, wrote the C firmware that reads a DHT temperature sensor and drives the actuator, and designed the mount in CAD. The motor stalled under torque. I traced it on the bench with a multimeter and found the fault was mechanical, not electrical: the mount was wrong. It took three printed revisions before the fit held under real load.",
    whyStatus: "draft",
    typeTag: "Coursework",
    domainTags: ["Hardware"],
    role: "Hardware and firmware",
    timeframe: "Spring 2025 · class capstone",
    team: "TODO(vaibhav)",
    stack: ["Arduino", "C", "DHT sensor", "Motor driver", "Solenoid", "CAD + 3D printing"],
    metrics: [{ label: "Printed mount revisions", value: "3" }],
    repoUrl: null,
    demoUrl: null,
    youtubeUrl: "https://youtu.be/CNzC8-Uby8g",
    status: "shipped",
    coverImage: null,
    gallery: [],
    featured: false,
  },
];

/** Home "selected work" teaser — 3–4 featured projects (PRD §4.2). */
export const featuredProjects = projects.filter((p) => p.featured);

/** Projects whose "why" is drafted from the README and awaiting Vaibhav's sign-off. */
export const draftWhyProjects = projects.filter((p) => p.whyStatus === "draft");

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
