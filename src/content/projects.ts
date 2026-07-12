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
 * OTHER RULES HONORED:
 *  - BoxIt: repoUrl null (PRIVATE, never exposed); status "coming-soon"; boxit.best only.
 *  - FirstWave: role honesty — FRONTEND LEAD (React + Mapbox + FastAPI), not ML author.
 *  - clearRx / aquatic-sustainability: forks, included per Vaibhav; contribution flagged.
 *  - youtubeUrl null everywhere — demos not recorded yet (placeholders later).
 */

export const projects: Project[] = [
  {
    slug: "boxit",
    title: "BoxIt",
    oneLiner:
      "Peer-to-peer storage marketplace for college students — box-priced, verified, transport built in.",
    whyShort:
      "As an out-of-state student, I saw college storage was expensive, inconvenient, and low-trust — and that students would rather earn money hosting it.",
    whyFull:
      "As an out-of-state student, I watched every May and August turn into the same logistics scramble: commercial units sold out months ahead, self-storage needed a car most freshmen don't have, and three-month minimums forced people to pay for time they didn't use. Meanwhile students with space could be earning from it. BoxIt is the peer-to-peer market between those two — priced per box, restricted to verified .edu peers, with a video-verified chain of custody so the trust problem isn't hand-waved.",
    whyStatus: "confirmed",
    typeTag: "Personal",
    domainTags: ["Systems/Backend", "Full-Stack", "Infra/Cloud"],
    role: "Founder / builder",
    timeframe: "2026 – present",
    team: "TODO(vaibhav): solo or team?",
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
    youtubeUrl: null,
    status: "coming-soon",
    coverImage: null,
    gallery: [],
    featured: true,
  },
  {
    slug: "tariff-modelling",
    title: "Liberation Day and After",
    oneLiner:
      "Structural breaks in U.S. equity sector correlations after the April 2025 tariff shock.",
    whyShort:
      "I'm fascinated by how huge macro movements ripple through sectors and reshape market structure.",
    whyFull:
      "I'm fascinated by how a single huge macro movement ripples through sectors and quietly reshapes market structure. The April 2, 2025 tariff announcement was a clean natural experiment: I wanted to see whether the correlations between equity sectors actually broke — structurally, not just noisily — in the days after, using the GICS sector ETFs against rates and volatility.",
    whyStatus: "confirmed",
    // Done for GTSF (quant training/mentorship). TODO(vaibhav): tag as Research
    // (GTSF-affiliated) or keep Personal? Leaning Research given the affiliation.
    typeTag: "Personal",
    domainTags: ["Quant", "Data", "Applied-Research"],
    role: "Author · GTSF quant mentorship",
    timeframe: "Spring 2026",
    team: "GTSF (Georgia Tech Student Foundation)",
    stack: ["Python", "pandas", "Jupyter", "Yahoo Finance", "FRED"],
    metrics: [],
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
      "AI food-pantry discovery — finds pantries near any location, extracts structured hours/eligibility, streams them onto a live map.",
    whyShort:
      "I noticed Atlanta's food-insecurity problem was driven by disconnected food banks and a lack of understanding — I wanted to bridge that gap.",
    whyFull:
      "I noticed Atlanta's food-insecurity problem wasn't only about supply — it was about connection and understanding between food banks and the people who needed them. Hours, eligibility, and ID requirements were scattered or missing. EquiTable discovers pantries near any location, scrapes and extracts that structured data with an LLM, and streams it live onto a map, with a scheduled agent keeping it fresh so the information doesn't rot.",
    whyStatus: "confirmed",
    typeTag: "Personal",
    domainTags: ["ML/AI", "Full-Stack", "Infra/Cloud"],
    role: "TODO(vaibhav): solo / role?",
    timeframe: "2026",
    team: "TODO(vaibhav)",
    stack: [
      "Python",
      "LangGraph",
      "Gemini",
      "Google Places API",
      "AWS ECS Fargate",
      "MongoDB",
    ],
    metrics: [],
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
      "Predictive EMS staging dashboard — forecasts where 911 calls will cluster and pre-positions idle ambulances.",
    // DRAFT from README. Problem framing is well-documented; keep role honest.
    whyShort:
      "Emergency demand is predictable — Friday nights in the Bronx, summer weekends in Brooklyn — but ambulances still sit and wait for the call instead of moving ahead of it.",
    whyFull:
      "NYC EMS takes over 1.5 million calls a year, and in the worst boroughs the average response runs past the 8-minute mark where cardiac-arrest survival drops fast. The problem isn't a shortage of ambulances — it's placement, and the demand is predictable enough to stage for. FirstWave forecasts where calls will cluster over the next hour and shows dispatchers where to pre-position idle units before those calls come in. I led the frontend: the React + Mapbox dashboard that makes the forecast legible and the FastAPI integration behind it — not the ML forecasting pipeline itself.",
    whyStatus: "draft",
    typeTag: "Hackathon",
    domainTags: ["Full-Stack", "Frontend", "Data"],
    role: "Frontend lead (React + Mapbox dashboard, FastAPI integration)",
    timeframe: "2026 · GT Hacklytics",
    team: "Hackathon team",
    stack: ["React", "Mapbox", "FastAPI", "Python"],
    metrics: [
      // Real project results from the README (team outcome, not solo claim).
      { label: "Within 8-min window", value: "64.7% → 86.0%" },
      { label: "Bronx coverage", value: "48.2% → 96.7%" },
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
      "A C++ NBA prediction engine — backtested on historical games and wired to the Kalshi API to bring quantitative reasoning to sports markets.",
    whyShort:
      "I've always been into the NBA and into predictions, and I wanted to bring real quantitative reasoning to it — not gut calls, but a backtested engine meeting live markets.",
    whyFull:
      "I've followed the NBA and been drawn to prediction for as long as I can remember, and I wanted to treat it the way a quant treats any market — with an actual model instead of gut calls. So I brought benchwarmer to C++, built the prediction engine, backtested it against historical games, and wired it up to the Kalshi API so the forecasts meet real prices. That's the through-line: bringing quantitative reasoning to sports.",
    whyStatus: "confirmed",
    typeTag: "Personal",
    domainTags: ["Quant", "ML/AI", "Data"],
    role: "Solo",
    timeframe: "2026",
    team: "Solo",
    stack: ["C++", "XGBoost", "Kalshi API", "Python"],
    metrics: [],
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
      "Feature-engineering truth and other modality directions in LLM activations, then steering with XGBoost to beat linear-probe and contrastive-mean-difference baselines.",
    // Grounded in Vaibhav's own description of the work; confirm the motivation framing.
    whyShort:
      "The standard ways to find a 'truth direction' in a model — linear probes, contrastive mean differences — leave signal on the table, so I tried to feature-engineer better directions and actually steer on them.",
    whyFull:
      "Truth, and other high-level concepts, show up as directions in a model's activations — but the usual ways to recover them (a linear probe, or the contrastive mean difference between true and false statements) are blunt. I treated it as a feature-engineering problem: find richer truth and modality directions, then steer with XGBoost on top of them to move the model's behavior further than the linear baselines could. The harder lesson on gemma-2-2b was that a direction you can decode at ~99% accuracy isn't necessarily one you can push — reading a concept and steering it are not the same axis.",
    whyStatus: "draft",
    typeTag: "Research",
    domainTags: ["ML/AI", "Applied-Research"],
    role: "Researcher, Trustworthy Robotics Lab",
    timeframe: "2026",
    team: "Trustworthy Robotics Lab",
    stack: ["Python", "PyTorch", "gemma-2-2b", "XGBoost", "NCSA DeltaAI (GH200)"],
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
      "Auto-updating, deduped Postgres feed of internship postings — isolated pollers, nightly digest.",
    // DRAFT from README. Problem is implicit but strongly supported by the design.
    whyShort:
      "Internship postings are scattered across a dozen boards and go stale fast — I was tired of refreshing all of them, so I built one feed that watches them for me.",
    whyFull:
      "Recruiting season means the same role lives on Greenhouse, Lever, Ashby, and three GitHub lists at once, half of them already filled by the time you look. I wanted a single deduped feed that polls every source on a schedule, keeps one clean record per posting, and emails me a nightly digest — with each source isolated so one broken board never takes the whole pipeline down.",
    whyStatus: "draft",
    typeTag: "Personal",
    domainTags: ["Systems/Backend", "Data", "Infra/Cloud"],
    role: "Solo",
    timeframe: "2026",
    team: "Solo",
    stack: ["Python", "Supabase / Postgres", "GitHub Actions", "SMTP"],
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
      "Algorithmic trading bot for IMC's 5-round competition — EDA, baseline strategies, backtester.",
    // DRAFT from README. Motivation inferred from the competition's structure.
    whyShort:
      "I wanted to see whether my read on a market would actually hold up against a live order book — not just a clean backtest.",
    whyFull:
      "IMC Prosperity drops you into a synthetic market where every timestep you submit orders against bots, and one-timestep order life plus position limits punish lazy assumptions. I wanted to know whether simple, well-understood strategies — pinning a stable product to its fair value, trading a drifting one carefully — could survive adversarial fills. So I built the boring part first: proper EDA, honest baselines, and a backtester, then iterated from there.",
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
      "Drug–drug interaction assistant — an evaluated RAG system with grounded, streamed answers for providers.",
    // DRAFT from README. Problem stated; keep the co-build + retrieval-focus honest.
    whyShort:
      "Whether two prescriptions interact shouldn't come down to a provider's memory — but a tool that answers it is only useful if you can trust the answer.",
    whyFull:
      "Drug–drug interactions are exactly the kind of thing a computer should catch, but a lookup is only as good as its retrieval and its honesty about uncertainty. With Ashwin at HackGT, I rebuilt the assistant from a fragile FAISS name-lookup prototype into a real, evaluated RAG system — dense plus hybrid retrieval, cross-encoder reranking, and answers streamed with their grounding — so the interaction risk it reports is actually defensible. I focused on the retrieval and evaluation side.",
    whyStatus: "draft",
    typeTag: "Hackathon",
    domainTags: ["ML/AI", "Full-Stack"],
    role: "Co-built with Ashwin V — rebuilt the retrieval/RAG system",
    timeframe: "HackGT",
    team: "Ashwin V + Vaibhav W",
    stack: ["TypeScript", "Python", "BGE embeddings", "cross-encoder reranker", "SSE"],
    metrics: [],
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
      "Watershed monitoring — geolocating water vulnerabilities and access inequities from satellite + historical data.",
    // DRAFT from the README's Motivation section. Note: this is the TEAM's framing
    // (GT Big Data fork) — confirm your specific contribution and personal angle.
    whyShort:
      "Clean water fails quietly in the places with the least data — I wanted a way to see watershed risk and water-access gaps on a map before they turn into emergencies.",
    whyFull:
      "This started as a GT Big Data project around a real gap: in many less-developed regions there's too little infrastructure and data to catch contamination, predict floods or droughts, or track whether water stays affordable. The idea was to aggregate satellite imagery and historical datasets into one interface that geolocates watershed anomalies and inequities, so citizens and governments can act earlier. (Team effort — my specific contribution is flagged separately in the role field.)",
    whyStatus: "draft",
    typeTag: "Research", // TODO(vaibhav): Research vs Personal (GT Big Data club project)
    domainTags: ["ML/AI", "Data", "Applied-Research"],
    role: "TODO(vaibhav): your contribution on the team",
    timeframe: "2026",
    team: "GT Big Data",
    stack: ["Python", "Jupyter", "Computer vision (CNNs)", "Time-series (RNN/LSTM)"],
    metrics: [],
    repoUrl: "https://github.com/vaibhavw30/aquatic-sustainability", // FORK (gt-big-data) — included per Vaibhav
    demoUrl: null,
    youtubeUrl: null,
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
