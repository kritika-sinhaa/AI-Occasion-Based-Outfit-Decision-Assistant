import { Outfit, OutfitRequest, RefinementConstraints, StyleTag, WardrobeItem } from "@/lib/types";
import { parseOccasion, parseStyleTags, Silhouette } from "@/lib/engine/parse";
import { composeOutfit, emptyConstraints } from "@/lib/engine/compose";
import { parseRefinementInstruction } from "@/lib/engine/refine";

function lookName(styleTags: StyleTag[], occasionLabel: string, silhouette: Silhouette): string {
  const primary = styleTags[0] ?? "classic";
  const primaryCap = primary.charAt(0).toUpperCase() + primary.slice(1);
  const noun = silhouette === "dress" ? "Dress Look" : "Look";
  return `${primaryCap} ${occasionLabel} ${noun}`;
}

/**
 * Deterministic outfit generation: no LLM call, fully explainable and testable.
 * `excludeRefIds` softly steers item picks away from ids already shown in a prior batch
 * (falling back to reuse if no alternative exists) — this is how "Regenerate looks" surfaces
 * different picks instead of the identical result a deterministic engine would otherwise return.
 */
export function generateOutfits(
  request: OutfitRequest,
  wardrobe: WardrobeItem[],
  excludeRefIds: string[] = []
): Outfit[] {
  const occasionProfile = parseOccasion(request.occasion);
  const requestStyleTags = parseStyleTags(request.style);
  const baseStyleTags = Array.from(new Set([...requestStyleTags, ...occasionProfile.defaultStyleTags]));

  const outfits: Outfit[] = [];
  // The mock catalog only carries dresses for women — for men/unisex requests, drop "dress"
  // from the occasion's silhouette options so those requests always resolve to a top+bottom
  // look instead of silently losing the top and bottom slots to an unfillable dress silhouette.
  const silhouettes: Silhouette[] =
    request.gender === "women"
      ? occasionProfile.silhouettes
      : occasionProfile.silhouettes.filter((s) => s !== "dress");
  const effectiveSilhouettes: Silhouette[] = silhouettes.length > 0 ? silhouettes : ["topBottom"];

  // Look 1: primary silhouette, standard matching.
  const silhouette1: Silhouette = effectiveSilhouettes[0];
  outfits.push(
    composeOutfit({
      request,
      lookName: lookName(baseStyleTags, occasionProfile.label, silhouette1),
      silhouette: silhouette1,
      wardrobe,
      styleTags: baseStyleTags,
      colorBias: occasionProfile.colorBias,
      suggestOuterwear: occasionProfile.suggestOuterwear,
      suggestBag: occasionProfile.suggestBag,
      constraints: emptyConstraints(),
      refinementHistory: [],
      excludeRefIds,
    })
  );

  // Look 2: alternate silhouette if the occasion supports one, else a reordered style variant.
  const silhouette2: Silhouette = effectiveSilhouettes[1] ?? silhouette1;
  const styleVariant2 = baseStyleTags.length > 1 ? [...baseStyleTags].reverse() : baseStyleTags;
  const colorVariant2 = [...occasionProfile.colorBias].reverse();
  const look2 = composeOutfit({
    request,
    lookName: lookName(styleVariant2, occasionProfile.label, silhouette2),
    silhouette: silhouette2,
    wardrobe,
    styleTags: styleVariant2,
    colorBias: colorVariant2,
    suggestOuterwear: occasionProfile.suggestOuterwear,
    suggestBag: occasionProfile.suggestBag,
    constraints: emptyConstraints(),
    refinementHistory: [],
    excludeRefIds: [...excludeRefIds, ...outfits[0].items.map((i) => i.refId)],
  });
  if (!looksIdentical(look2, outfits[0])) outfits.push(look2);

  // Look 3: "wardrobe hero" — maximize reuse of owned items on the primary silhouette.
  const wardrobeConstraints: RefinementConstraints = { ...emptyConstraints(), wardrobePreferenceBoost: 2 };
  const look3 = composeOutfit({
    request,
    lookName: `Wardrobe-First ${occasionProfile.label} Look`,
    silhouette: silhouette1,
    wardrobe,
    styleTags: baseStyleTags,
    colorBias: occasionProfile.colorBias,
    suggestOuterwear: occasionProfile.suggestOuterwear,
    suggestBag: occasionProfile.suggestBag,
    constraints: wardrobeConstraints,
    refinementHistory: [],
    excludeRefIds: [...excludeRefIds, ...outfits.flatMap((o) => o.items.map((i) => i.refId))],
  });
  if (wardrobe.length > 0 && outfits.every((o) => !looksIdentical(look3, o))) {
    outfits.push(look3);
  }

  return outfits.slice(0, 3);
}

function looksIdentical(a: Outfit, b: Outfit): boolean {
  const aIds = a.items.map((i) => i.refId).sort().join(",");
  const bIds = b.items.map((i) => i.refId).sort().join(",");
  return aIds === bIds;
}

/**
 * Refines a single outfit using a natural-language instruction. Occasion, location, and
 * date are always preserved (hard constraints); only style, budget, colors, and specific
 * item swaps change, and only what the instruction actually asked for.
 */
export function refineOutfit(
  outfit: Outfit,
  instruction: string,
  wardrobe: WardrobeItem[]
): { outfit: Outfit; appliedSummary: string[] } {
  const parsed = parseRefinementInstruction(instruction);
  const occasionProfile = parseOccasion(outfit.request.occasion);

  // Merge new constraints on top of everything already applied in this session.
  const mergedConstraints: RefinementConstraints = {
    addStyleTags: [...parsed.constraints.addStyleTags],
    removeStyleTags: [...parsed.constraints.removeStyleTags],
    excludeColors: Array.from(new Set([...extractPriorExclusions(outfit, "color"), ...parsed.constraints.excludeColors])),
    excludeSubCategories: Array.from(
      new Set([...extractPriorExclusions(outfit, "sub"), ...parsed.constraints.excludeSubCategories])
    ),
    preferSubCategorySubstitutions: {
      ...extractPriorSubstitutions(outfit),
      ...parsed.constraints.preferSubCategorySubstitutions,
    },
    wardrobePreferenceBoost: Math.max(
      extractPriorWardrobeBoost(outfit),
      parsed.constraints.wardrobePreferenceBoost
    ),
  };

  const baseStyleTags = Array.from(
    new Set(outfit.matchedStyleTags.filter((t) => !parsed.constraints.removeStyleTags.includes(t)))
  );

  const silhouette: Silhouette = outfit.items.some((i) => i.slot === "dress") ? "dress" : "topBottom";

  const newRequest: OutfitRequest = { ...outfit.request };
  const budgetOverride = parsed.budgetOverride ?? outfit.request.budget;
  if (parsed.budgetOverride) newRequest.budget = parsed.budgetOverride;

  const refinementHistory = [...outfit.refinementHistory, ...parsed.appliedSummary];

  const refined = composeOutfit({
    request: newRequest,
    lookName: outfit.lookName,
    silhouette,
    wardrobe,
    styleTags: baseStyleTags,
    colorBias: occasionProfile.colorBias,
    suggestOuterwear: occasionProfile.suggestOuterwear,
    suggestBag: occasionProfile.suggestBag,
    constraints: mergedConstraints,
    refinementHistory,
    budgetOverride,
  });

  return { outfit: refined, appliedSummary: parsed.appliedSummary };
}

// -- Constraint accumulation helpers -----------------------------------------------------
// The Outfit type doesn't carry its full constraint object (only a human-readable history),
// so on repeated refinements we re-derive prior exclusions/substitutions from that history
// text. This keeps refinements additive without needing server-side session state.

function extractPriorExclusions(outfit: Outfit, kind: "color" | "sub"): string[] {
  const prefix = kind === "color" ? "Avoid " : "No ";
  return outfit.refinementHistory
    .filter((h) => h.startsWith(prefix))
    .map((h) => h.slice(prefix.length));
}

function extractPriorSubstitutions(outfit: Outfit): Record<string, string> {
  const map: Record<string, string> = {};
  outfit.refinementHistory.forEach((h) => {
    const match = h.match(/^(.+) → (.+)$/);
    if (match) map[match[1].toLowerCase()] = match[2].toLowerCase();
  });
  return map;
}

function extractPriorWardrobeBoost(outfit: Outfit): number {
  return outfit.refinementHistory.some((h) => h === "Prioritize my wardrobe") ? 2 : 0;
}
