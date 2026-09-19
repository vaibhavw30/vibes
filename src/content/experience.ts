import type { Experience } from "./schema";

/*
 * Experience (Model 1) — real roles, kept separate from the Projects grid.
 *
 * Source of truth: Vaibhav's canonical fact ledger (2026-09). Resumes lead; the
 * site follows. Titles, dates, and numbers below are copied from that ledger:
 *  - OddsOn was a Software Engineer Intern role, May–Aug 2025 (NOT founding
 *    engineer; the Jan–May 2026 dates on old resumes were wrong).
 *  - GTSF fund is $3.1M (the earlier $2.7M is outdated). GTSF is not on the
 *    ledger's locked timeline; kept here from his earlier account.
 *  - EPIC: control-loop rate, model accuracy, and on-target latency are still
 *    unmeasured. Never write numbers for them.
 *  - Big Data Big Impact closes the Aug 2025 → May 2026 gap; keep it.
 *
 * Order: reverse chronological, current roles first.
 */

export const experience: Experience[] = [
  {
    org: "EPIC Lab · Georgia Tech",
    role: "Undergraduate ML Researcher (Prosthesis Team)",
    timeframe: "Aug 2026 to present",
    typeTag: "Research",
    oneLine:
      "Train temporal convolutional networks on OpenSim inverse-dynamics targets for a powered knee-and-ankle prosthesis, running inside the real-time control loop on its embedded Linux controller.",
    oneLineStatus: "confirmed",
    status: "current",
  },
  {
    org: "GTSF (Georgia Tech Student Foundation)",
    role: "Quantitative Developer / Analyst",
    timeframe: "Aug 2026 to present",
    typeTag: "Research",
    oneLine:
      "Quant developer/analyst on the $3.1M student-managed fund, building backtesting infrastructure and trading strategies.",
    oneLineStatus: "confirmed",
    status: "current",
  },
  {
    org: "DataMorph.ai",
    role: "Software Engineer Intern",
    timeframe: "May 2026 to Aug 2026",
    typeTag: "Internship",
    oneLine:
      "Owned the agent layer of a data platform University of California campuses run analytics on: 21 MCP tools over a 29,980-node dependency graph, 45x less context per call, and agent reliability raised from 83% to 100%.",
    oneLineStatus: "confirmed",
    status: "past",
  },
  {
    org: "Trustworthy Robotics Lab",
    role: "Machine Learning Researcher",
    timeframe: "Apr 2026 to present",
    typeTag: "Research",
    oneLine:
      "Feature-engineered truth and other modality directions in LLMs, steering with XGBoost to improve on linear-probe and contrastive-mean-difference baselines.",
    oneLineStatus: "confirmed",
    status: "current",
  },
  {
    org: "Big Data Big Impact",
    role: "ML Infrastructure Developer",
    timeframe: "Sept 2025 to May 2026",
    typeTag: "Research",
    oneLine:
      "Trained a supervised CNN in PyTorch on multi-year satellite imagery (macro F1 0.758) and served it from a containerized Flask app on GCP, on a four-person team.",
    oneLineStatus: "confirmed",
    status: "past",
  },
  {
    org: "OddsOn",
    role: "Software Engineer Intern",
    timeframe: "May 2025 to Aug 2025",
    typeTag: "Internship",
    oneLine:
      "Built a sports prediction app on a four-person team: a multithreaded C++17 service sustaining 50K+ ops/sec at sub-millisecond latency, and a React Native client with 500+ monthly active users.",
    oneLineStatus: "confirmed",
    status: "past",
  },
  {
    org: "RIA Advisory",
    role: "Software Engineer Intern",
    timeframe: "Jun 2024 to Aug 2024",
    typeTag: "Internship",
    oneLine:
      "Built enterprise applications in Java, Spring Boot, and MySQL for a global Oracle Cloud rollout at an 800+ consultant firm.",
    oneLineStatus: "confirmed",
    status: "past",
  },
];

/** Roles whose one-liner is a draft scaffold awaiting Vaibhav's substance. */
export const draftOneLineRoles = experience.filter(
  (e) => e.oneLineStatus === "draft",
);
