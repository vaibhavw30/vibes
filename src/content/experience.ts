import type { Experience } from "./schema";

/*
 * Experience (Model 1) — real roles, kept separate from the Projects grid.
 *
 * One-liners below are now grounded in Vaibhav's own account (2026-07 review):
 *  - DataMorph: the June 2026 intern task plan (synthetic-data NL module + "Ask
 *    AI to fix" copilot). We describe HIS work, not the broader Agent Builder spec.
 *  - OddsAreOn: founding-team software developer — live REST API integrations +
 *    an AI autocomplete harness (sports-odds product).
 *  - Trustworthy Robotics: the `llm-activation-steering-research` repo IS this
 *    role's work — feature-engineering truth/modality directions, XGBoost steering.
 *  - GTSF: incoming quant dev/analyst on the $2.7M student-managed fund; the
 *    `tariff-modelling` project was done for GTSF. Not started; training completed.
 *  - EPIC: incoming ML/robotics researcher on the EPIC Prosthesis Team
 *    (epic.gatech.edu), inverse dynamics. Early — details light by his own note.
 *
 * Timeframes are only set where he gave one; the rest stay TODO(vaibhav). No
 * fabricated dates or metrics ($2.7M is his stated figure).
 */

export const experience: Experience[] = [
  {
    org: "DataMorph",
    role: "Software Engineering Intern",
    timeframe: "Summer 2026",
    typeTag: "Internship",
    oneLine:
      "Built the natural-language synthetic-data module (conversational schema edits and greenfield row generation over an agentic LLM loop) and shipped an 'Ask AI to fix' copilot for failed jobs.",
    oneLineStatus: "confirmed",
    status: "past", // TODO(vaibhav): confirm — internship still ongoing or wrapped?
  },
  {
    org: "OddsAreOn",
    role: "Founding Engineer",
    timeframe: "TODO(vaibhav)",
    typeTag: "Founding",
    oneLine:
      "Founding-team software developer. Built live REST API integrations and an AI autocomplete harness.",
    oneLineStatus: "confirmed",
    status: "past",
  },
  {
    org: "Trustworthy Robotics Lab",
    role: "Machine Learning Researcher",
    timeframe: "TODO(vaibhav)",
    typeTag: "Research",
    oneLine:
      "Feature-engineered truth and other modality directions in LLMs, steering with XGBoost to improve on linear-probe and contrastive-mean-difference baselines.",
    oneLineStatus: "confirmed",
    status: "past", // TODO(vaibhav): current or past? (the repo is still active)
  },
  {
    org: "GTSF (Georgia Tech Student Foundation)",
    role: "Quantitative Developer / Analyst",
    timeframe: "Incoming",
    typeTag: "Research",
    oneLine:
      "Incoming quant developer/analyst on the $2.7M student-managed fund, building backtesting infrastructure and trading strategies.",
    oneLineStatus: "confirmed",
    status: "incoming",
  },
  {
    org: "EPIC Lab · Georgia Tech",
    role: "ML / Robotics Researcher (Prosthesis Team)",
    timeframe: "Incoming",
    typeTag: "Research",
    oneLine:
      "Incoming researcher on the EPIC Prosthesis Team, working on deep learning and robotics for prosthetic control using inverse dynamics.",
    oneLineStatus: "confirmed",
    status: "incoming",
  },
];

/** Roles whose one-liner is a draft scaffold awaiting Vaibhav's substance. */
export const draftOneLineRoles = experience.filter(
  (e) => e.oneLineStatus === "draft",
);
