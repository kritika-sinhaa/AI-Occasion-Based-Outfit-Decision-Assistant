import { RefinementConstraints, StyleTag } from "@/lib/types";

const STYLE_WORDS: StyleTag[] = [
  "minimal",
  "elegant",
  "classic",
  "casual",
  "formal",
  "boho",
  "edgy",
  "trendy",
  "chic",
];

const KNOWN_COLORS = [
  "black",
  "white",
  "beige",
  "navy",
  "blue",
  "emerald",
  "rust",
  "camel",
  "gold",
  "silver",
  "brown",
  "charcoal",
  "nude",
  "grey",
];

const KNOWN_SUBCATEGORIES = [
  "heels",
  "flats",
  "sneakers",
  "sandals",
  "boots",
  "loafers",
  "formal shoes",
  "jeans",
  "trousers",
  "chinos",
  "skirt",
  "palazzo",
  "dress",
  "blazer",
  "jacket",
  "coat",
  "earrings",
  "necklace",
  "bracelet",
  "sling bag",
  "tote",
  "clutch",
  "crossbody",
  "shirt",
  "blouse",
  "tee",
  "kurta",
];

export interface ParsedRefinement {
  constraints: RefinementConstraints;
  budgetOverride?: number;
  /** Human-readable summary of what changed, shown as a chip in the UI. */
  appliedSummary: string[];
}

function emptyConstraints(): RefinementConstraints {
  return {
    addStyleTags: [],
    removeStyleTags: [],
    excludeColors: [],
    excludeSubCategories: [],
    preferSubCategorySubstitutions: {},
    wardrobePreferenceBoost: 0,
  };
}

/**
 * Lightweight rule-based NLU for outfit refinement instructions ("make it more casual",
 * "keep it under ₹3000", "replace the heels with flats", "I don't like black").
 * Deliberately deterministic and pattern-based rather than a free-form LLM call, so
 * refinements are predictable and always preserve hard constraints (guardrail: original
 * occasion/location/date never change here — only style, budget, and item exclusions do,
 * and only when the user explicitly says so).
 */
export function parseRefinementInstruction(rawText: string): ParsedRefinement {
  const text = rawText.toLowerCase();
  const constraints = emptyConstraints();
  const applied: string[] = [];
  let budgetOverride: number | undefined;

  // Budget: "under ₹3000", "budget of 3000", "keep it below 4,000"
  const budgetMatch = text.match(/(?:under|below|less than|budget(?:\s*of)?)\s*(?:rs\.?|inr|₹)?\s*([\d,]{3,7})/i);
  if (budgetMatch) {
    const value = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
    if (!Number.isNaN(value) && value > 0) {
      budgetOverride = value;
      applied.push(`Budget ≤ ₹${value.toLocaleString("en-IN")}`);
    }
  }

  // Style intensifiers: "more casual", "less formal", "make it more minimal"
  STYLE_WORDS.forEach((style) => {
    const moreRe = new RegExp(`more\\s+${style}`, "i");
    const lessRe = new RegExp(`less\\s+${style}`, "i");
    if (moreRe.test(text)) {
      constraints.addStyleTags.push(style);
      applied.push(`More ${style}`);
    } else if (lessRe.test(text)) {
      constraints.removeStyleTags.push(style);
      applied.push(`Less ${style}`);
    }
  });

  // Wardrobe preference: "use more of my wardrobe", "more owned items"
  if (/use more (of )?(my )?wardrobe|more (owned|of my own) items|from my closet/i.test(text)) {
    constraints.wardrobePreferenceBoost = 2;
    applied.push("Prioritize my wardrobe");
  }

  // Color exclusion: "I don't like black", "avoid gold", "no navy"
  KNOWN_COLORS.forEach((color) => {
    const dislikeRe = new RegExp(
      `(don't like|dont like|no more|avoid|hate|not a fan of)\\s+${color}\\b`,
      "i"
    );
    if (dislikeRe.test(text)) {
      constraints.excludeColors.push(capitalize(color));
      applied.push(`Avoid ${capitalize(color)}`);
    }
  });

  // Substitution: "replace heels with flats", "swap the jacket for a blazer"
  const subMatch = text.match(/(?:replace|swap)\s+(?:the\s+)?([a-z\s]+?)\s+(?:with|for)\s+(?:a\s+|an\s+)?([a-z\s]+?)(?:\.|$|,)/i);
  if (subMatch) {
    const from = findKnownSubCategory(subMatch[1].trim());
    const to = findKnownSubCategory(subMatch[2].trim());
    if (from && to) {
      constraints.preferSubCategorySubstitutions[from] = to;
      constraints.excludeSubCategories.push(from);
      applied.push(`${capitalize(from)} → ${capitalize(to)}`);
    }
  }

  // Simple exclusion without substitution: "no heels", "not into sneakers"
  KNOWN_SUBCATEGORIES.forEach((sub) => {
    const noRe = new RegExp(`\\bno\\s+${escapeRegex(sub)}\\b`, "i");
    if (noRe.test(text) && !constraints.excludeSubCategories.includes(sub)) {
      constraints.excludeSubCategories.push(sub);
      applied.push(`No ${sub}`);
    }
  });

  if (applied.length === 0) {
    applied.push("Refined look");
  }

  return { constraints, budgetOverride, appliedSummary: applied };
}

function findKnownSubCategory(phrase: string): string | null {
  const cleaned = phrase.replace(/^(the|a|an)\s+/i, "").trim();
  const exact = KNOWN_SUBCATEGORIES.find((s) => cleaned === s || cleaned.includes(s));
  return exact ?? null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
