// src/lib/intent-engine.ts
//
// A small, self-contained "mini AI" intent engine written in plain TypeScript.
// It understands natural language, common misspellings and paraphrases, and when
// it is not confident enough it returns a *clarification* so the UI can ask the
// user a human-like follow-up question ("Did you mean you want to onboard a new
// customer?") instead of failing silently.
//
// Design:
//  - Each intent is defined by exact phrases (unambiguous, high confidence) and
//    by concept groups (words that, when matched via fuzzy similarity, indicate
//    the intent). An intent needs at least `minGroups` of its groups to match.
//  - Exact phrase match  -> decision "route"     (run the workflow directly)
//  - Fuzzy-only match    -> decision "clarify"   (ask the user to confirm)
//  - No match            -> decision "none"       (fall through to other logic)

export type IntentId =
  | "onboard_customer"
  | "file_claim"
  | "compare_plans"
  | "plan_details"
  | "recommend_plan"
  | "buy_policy"
  | "talk_to_human";

export interface IntentDef {
  id: IntentId;
  label: string; // human phrase used in the clarification question
  exactPhrases: string[];
  groups: { words: string[] }[];
  minGroups: number;
}

// Canonical phrase re-sent to the chat handler when the user confirms a
// clarification. These mirror the app's existing trigger wording so the normal
// workflow code runs unchanged.
export const CANONICAL_PHRASE: Record<IntentId, string> = {
  onboard_customer: "onboard a new customer",
  file_claim: "i want to file a claim",
  buy_policy: "i want to buy a new policy",
  compare_plans: "compare the plans",
  plan_details: "compare the plans",
  recommend_plan: "recommend a plan for me",
  talk_to_human: "talk to a real person",
};

const PLAN_NAMES = ["bronze", "silver", "gold", "platinum"];

const INTENTS: IntentDef[] = [
  {
    id: "onboard_customer",
    label: "onboard a new customer",
    exactPhrases: [
      "onboard",
      "on board",
      "on-board",
      "onboarding",
      "create customer",
      "create a customer",
      "new customer",
      "register customer",
      "setup customer",
      "set up customer",
      "create company",
      "new corporate",
    ],
    groups: [
      { words: ["onboard", "onboarding", "on-board"] },
      {
        words: [
          "customer",
          "corporate",
          "company",
          "organization",
          "organisation",
          "client",
          "account",
        ],
      },
    ],
    minGroups: 1,
  },
  {
    id: "file_claim",
    label: "file an insurance claim",
    exactPhrases: [
      "claim",
      "claims",
      "file claim",
      "report claim",
      "submit claim",
      "insurance claim",
      "make a claim",
    ],
    groups: [
      { words: ["claim", "claims"] },
      { words: ["insurance", "policy", "medical", "reimburse", "expense"] },
    ],
    minGroups: 1,
  },
  {
    id: "buy_policy",
    label: "buy a new insurance policy",
    exactPhrases: [
      "buy policy",
      "buy a policy",
      "purchase policy",
      "purchase a policy",
      "get a quote",
      "get quote",
      "new policy",
      "purches",
      "subscribe policy",
    ],
    groups: [
      { words: ["buy", "purchase", "purches", "subscribe", "quote"] },
      { words: ["policy", "plan", "insurance", "coverage"] },
    ],
    minGroups: 2,
  },
  {
    id: "compare_plans",
    label: "compare insurance plans",
    exactPhrases: [
      "compare",
      "compare plans",
      "comparison",
      "difference between",
      "vs",
      "plan comparison",
      "which is better",
    ],
    groups: [
      { words: ["compare", "comparison", "difference", "vs", "better"] },
      { words: ["plan", "plans", "policy", "policies"] },
    ],
    minGroups: 2,
  },
  {
    id: "plan_details",
    label: "see a plan's details",
    exactPhrases: [
      "plan details",
      "show plan",
      "details of",
      "tell me about",
      "explain plan",
    ],
    groups: [
      { words: [...PLAN_NAMES, "plan", "policy"] },
      { words: ["details", "detail", "info", "information", "about", "show", "explain"] },
    ],
    minGroups: 2,
  },
  {
    id: "recommend_plan",
    label: "get a plan recommendation",
    exactPhrases: [
      "recommend",
      "which plan",
      "what plan",
      "help me choose",
      "suggest plan",
      "best plan for me",
    ],
    groups: [
      { words: ["recommend", "suggest", "choose", "which", "best"] },
      { words: ["plan", "plans", "policy", "policies"] },
    ],
    minGroups: 2,
  },
  {
    id: "talk_to_human",
    label: "talk to a real person",
    exactPhrases: [
      "talk to",
      "speak to",
      "real person",
      "human agent",
      "connect with",
      "talk to human",
      "live agent",
      "customer support",
    ],
    groups: [
      { words: ["talk", "speak", "connect", "contact", "reach"] },
      { words: ["human", "person", "agent", "representative", "support"] },
    ],
    minGroups: 2,
  },
];

export interface IntentResult {
  intent: IntentId | null;
  confidence: number; // 0..1
  decision: "route" | "clarify" | "none";
  label: string | null;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function analyzeIntent(input: string): IntentResult {
  const q = normalize(input);
  if (!q) return { intent: null, confidence: 0, decision: "none", label: null };
  const tokens = q.split(" ");

  let best: { def: IntentDef; score: number; exact: boolean } | null = null;

  for (const def of INTENTS) {
    let exact = false;
    for (const phrase of def.exactPhrases) {
      if (q.includes(phrase)) {
        exact = true;
        break;
      }
    }

    let matchedGroups = 0;
    let bestSim = 0;
    for (const group of def.groups) {
      let hit = false;
      for (const word of group.words) {
        if (q.includes(word)) {
          hit = true;
          bestSim = Math.max(bestSim, 1);
          break;
        }
        for (const token of tokens) {
          if (token.length < 3) continue;
          const sim = similarity(token, word);
          if (sim >= 0.6) {
            hit = true;
            bestSim = Math.max(bestSim, sim);
            break;
          }
        }
      }
      if (hit) matchedGroups++;
    }

    if (matchedGroups < def.minGroups) continue;

    // Score: exact matches are essentially certain; fuzzy matches scale with
    // similarity and the number of concept groups that lined up.
    const score = exact
      ? 0.97
      : 0.55 + bestSim * 0.4 + (matchedGroups - def.minGroups) * 0.03;

    if (!best || score > best.score) best = { def, score, exact };
  }

  if (!best) {
    return { intent: null, confidence: 0, decision: "none", label: null };
  }

  if (best.exact) {
    return {
      intent: best.def.id,
      confidence: best.score,
      decision: "route",
      label: best.def.label,
    };
  }

  // Fuzzy-only match: we recognise it but we are not 100% sure, so ask.
  return {
    intent: best.def.id,
    confidence: best.score,
    decision: "clarify",
    label: best.def.label,
  };
}

export function isYesAnswer(q: string): boolean {
  return (
    /^(yes|yep|yeah|yup|sure|correct|right|go ahead|do it)\b/.test(q) ||
    q === "clarify_yes" ||
    q === "yes"
  );
}

export function isNoAnswer(q: string): boolean {
  return (
    /^(no|nope|nah|cancel|wrong|incorrect|never mind)\b/.test(q) ||
    q === "clarify_no" ||
    q === "no"
  );
}
