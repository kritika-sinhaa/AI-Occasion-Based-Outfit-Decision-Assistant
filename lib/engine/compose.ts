import {
  ClothingCategory,
  Gender,
  Outfit,
  OutfitItem,
  OutfitRequest,
  Product,
  RefinementConstraints,
  StyleTag,
  WardrobeItem,
} from "@/lib/types";
import { getCatalog } from "@/lib/data/catalog";
import { buildImageUrl } from "@/lib/data/images";
import { Silhouette } from "@/lib/engine/parse";
import { explainOutfit } from "@/lib/ai/explain";
import { v4 as uuid } from "uuid";

export interface ComposeParams {
  request: OutfitRequest;
  lookName: string;
  silhouette: Silhouette;
  wardrobe: WardrobeItem[];
  styleTags: StyleTag[];
  colorBias: string[];
  suggestOuterwear: boolean;
  suggestBag: boolean;
  constraints: RefinementConstraints;
  refinementHistory: string[];
  /** Budget can be overridden by an explicit refinement ("keep it under ₹3000") */
  budgetOverride?: number;
  /** Catalog/wardrobe item ids to avoid reusing — e.g. items already shown in this session's
   *  other looks, so "Regenerate looks" surfaces different picks instead of the identical result
   *  a fully deterministic engine would otherwise return. Falls back to the excluded item if it's
   *  the only candidate, so a look is never left unfillable just to satisfy this preference. */
  excludeRefIds?: string[];
  /** Preserves an existing outfit's id across a refinement — the store's updateOutfit replaces
   *  an outfit by matching id, so a refined outfit must keep the original's id or the update is
   *  silently dropped. Omitted (a fresh uuid is generated) when composing a brand-new look. */
  id?: string;
}

const EMPTY_CONSTRAINTS: RefinementConstraints = {
  addStyleTags: [],
  removeStyleTags: [],
  excludeColors: [],
  excludeSubCategories: [],
  preferSubCategorySubstitutions: {},
  wardrobePreferenceBoost: 0,
};

export function emptyConstraints(): RefinementConstraints {
  return { ...EMPTY_CONSTRAINTS, addStyleTags: [], removeStyleTags: [], excludeColors: [], excludeSubCategories: [], preferSubCategorySubstitutions: {} };
}

export function requiredSlots(silhouette: Silhouette): ClothingCategory[] {
  return silhouette === "dress" ? ["dress", "footwear"] : ["top", "bottom", "footwear"];
}

function genderMatches(itemGender: Gender, requestGender: Gender): boolean {
  return itemGender === requestGender || itemGender === "unisex";
}

/** A wardrobe item with no recorded gender (added before this field existed, or the demo
 *  wardrobe) is always eligible — only an item explicitly tagged for the *other* gender is
 *  excluded, so a men's request doesn't pull in items confirmed under a women's context. */
function wardrobeGenderMatches(itemGender: Gender | undefined, requestGender: Gender): boolean {
  return itemGender === undefined || genderMatches(itemGender, requestGender);
}

function isExcluded(
  color: string,
  subCategory: string,
  constraints: RefinementConstraints
): boolean {
  const colorExcluded = constraints.excludeColors.some(
    (c) => c.toLowerCase() === color.toLowerCase()
  );
  const subExcluded = constraints.excludeSubCategories.some(
    (s) => s.toLowerCase() === subCategory.toLowerCase()
  );
  return colorExcluded || subExcluded;
}

function effectiveStyleTags(base: StyleTag[], constraints: RefinementConstraints): StyleTag[] {
  const set = new Set(base);
  constraints.addStyleTags.forEach((t) => set.add(t));
  constraints.removeStyleTags.forEach((t) => set.delete(t));
  if (set.size === 0) set.add("classic");
  return Array.from(set);
}

function scoreStyleColor(itemStyleTags: StyleTag[], itemColor: string, styleTags: StyleTag[], colorBias: string[]): number {
  const styleOverlap = itemStyleTags.filter((t) => styleTags.includes(t)).length;
  const colorMatch = colorBias.some((c) => c.toLowerCase() === itemColor.toLowerCase()) ? 1 : 0;
  return styleOverlap * 2 + colorMatch;
}

function pickWardrobeItem(
  slot: ClothingCategory,
  wardrobe: WardrobeItem[],
  styleTags: StyleTag[],
  colorBias: string[],
  constraints: RefinementConstraints,
  requestGender: Gender,
  excludeRefIds: string[] = []
): WardrobeItem | null {
  const all = wardrobe.filter(
    (w) =>
      w.category === slot &&
      w.confirmed &&
      wardrobeGenderMatches(w.gender, requestGender) &&
      !isExcluded(w.color, w.subCategory, constraints)
  );
  // Prefer an item not already used elsewhere in this session, but fall back to the full
  // pool if that exclusion would leave no candidate at all.
  const candidates = all.filter((w) => !excludeRefIds.includes(w.id));
  const pool = candidates.length > 0 ? candidates : all;
  if (pool.length === 0) return null;

  const boosted = constraints.wardrobePreferenceBoost > 0;
  const scored = pool
    .map((w) => ({ item: w, score: scoreStyleColor(w.styleTags, w.color, styleTags, colorBias) }))
    .sort((a, b) => b.score - a.score);

  if (boosted) return scored[0].item; // "use more of my wardrobe" — take best available regardless of score
  const best = scored[0];
  return best.score >= 1 ? best.item : null; // require at least some style/color affinity by default
}

function pickCatalogProduct(
  slot: ClothingCategory,
  catalog: Product[],
  gender: Gender,
  styleTags: StyleTag[],
  colorBias: string[],
  constraints: RefinementConstraints,
  cheapestOnly = false,
  excludeRefIds: string[] = []
): Product | null {
  let candidates = catalog.filter(
    (pr) =>
      pr.category === slot &&
      genderMatches(pr.gender, gender) &&
      !isExcluded(pr.color, pr.subCategory, constraints)
  );

  // Honor an explicit substitution like heels -> flats when one applies to this slot.
  const preferredSub = Object.values(constraints.preferSubCategorySubstitutions);
  if (preferredSub.length > 0) {
    const matchingSub = candidates.filter((pr) =>
      preferredSub.some((s) => s.toLowerCase() === pr.subCategory.toLowerCase())
    );
    if (matchingSub.length > 0) candidates = matchingSub;
  }

  if (candidates.length === 0) return null;

  // Prefer a product not already used elsewhere in this session, but fall back to the full
  // pool if that exclusion would leave no candidate at all.
  const fresh = candidates.filter((pr) => !excludeRefIds.includes(pr.id));
  const pool = fresh.length > 0 ? fresh : candidates;

  if (cheapestOnly) {
    return [...pool].sort((a, b) => a.price - b.price)[0];
  }

  const scored = pool
    .map((pr) => ({ item: pr, score: scoreStyleColor(pr.styleTags, pr.color, styleTags, colorBias) }))
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price);
  return scored[0].item;
}

function toOutfitItem(slot: ClothingCategory, source: "wardrobe", item: WardrobeItem): OutfitItem;
function toOutfitItem(slot: ClothingCategory, source: "catalog", item: Product): OutfitItem;
function toOutfitItem(slot: ClothingCategory, source: "wardrobe" | "catalog", item: WardrobeItem | Product): OutfitItem {
  if (source === "wardrobe") {
    const w = item as WardrobeItem;
    return {
      slot,
      source: "wardrobe",
      refId: w.id,
      name: w.name,
      color: w.color,
      price: 0,
      image: `${w.category}:${w.color}`,
      // Stand-in stock photo for wardrobe items with no real upload (e.g. the demo wardrobe).
      // ItemGraphic prefers imageDataUrl, so a real upload always wins over this.
      imageUrl: w.imageDataUrl ? undefined : buildImageUrl(w.category, w.subCategory),
      imageDataUrl: w.imageDataUrl,
    };
  }
  const pr = item as Product;
  return {
    slot,
    source: "catalog",
    refId: pr.id,
    name: pr.name,
    color: pr.color,
    price: pr.price,
    image: pr.image,
    imageUrl: pr.imageUrl,
    platform: pr.platform,
    url: pr.url,
  };
}

export function composeOutfit(params: ComposeParams): Outfit {
  const {
    request,
    lookName,
    silhouette,
    wardrobe,
    colorBias,
    suggestOuterwear,
    suggestBag,
    constraints,
    refinementHistory,
  } = params;
  const excludeRefIds = params.excludeRefIds ?? [];
  const catalog = getCatalog();
  const styleTags = effectiveStyleTags(params.styleTags, constraints);
  const budget = params.budgetOverride ?? request.budget;

  const required = requiredSlots(silhouette);
  const optional: ClothingCategory[] = ["jewelry"];
  if (suggestBag) optional.push("bag");
  if (suggestOuterwear) optional.push("outerwear");

  const items: OutfitItem[] = [];
  const unresolvedRequired: ClothingCategory[] = [];

  // Pass 1: fill required slots, wardrobe first.
  for (const slot of required) {
    const owned = pickWardrobeItem(slot, wardrobe, styleTags, colorBias, constraints, request.gender, excludeRefIds);
    if (owned) {
      items.push(toOutfitItem(slot, "wardrobe", owned));
      continue;
    }
    const product = pickCatalogProduct(
      slot,
      catalog,
      request.gender,
      styleTags,
      colorBias,
      constraints,
      false,
      excludeRefIds
    );
    if (product) {
      items.push(toOutfitItem(slot, "catalog", product));
    } else {
      unresolvedRequired.push(slot);
    }
  }

  // Budget enforcement: if the required-slot total exceeds budget, swap the priciest
  // catalog picks for the cheapest available alternative in that slot, one at a time.
  let budgetNote: string | undefined;
  let withinBudget = true;
  const requiredCost = () => items.filter((i) => i.source === "catalog").reduce((s, i) => s + i.price, 0);

  let guard = 0;
  while (requiredCost() > budget && guard < required.length + 1) {
    guard += 1;
    const catalogItems = items.filter((i) => i.source === "catalog").sort((a, b) => b.price - a.price);
    if (catalogItems.length === 0) break;
    const priciest = catalogItems[0];
    const cheaper = pickCatalogProduct(
      priciest.slot,
      catalog,
      request.gender,
      styleTags,
      colorBias,
      constraints,
      true
    );
    if (!cheaper || cheaper.price >= priciest.price) break;
    const idx = items.findIndex((i) => i.slot === priciest.slot && i.source === "catalog");
    items[idx] = toOutfitItem(priciest.slot, "catalog", cheaper);
  }

  if (requiredCost() > budget) {
    withinBudget = false;
    const shortfall = requiredCost() - budget;
    budgetNote = `Even with the most affordable matching pieces, this look needs about ₹${requiredCost().toLocaleString(
      "en-IN"
    )} — ₹${shortfall.toLocaleString("en-IN")} over your ₹${budget.toLocaleString(
      "en-IN"
    )} budget. Try raising your budget slightly, or add more items to your wardrobe so we can reuse what you own.`;
  }

  // Pass 2: add optional slots only if they fit within the remaining budget.
  for (const slot of optional) {
    const owned = pickWardrobeItem(slot, wardrobe, styleTags, colorBias, constraints, request.gender, excludeRefIds);
    if (owned) {
      items.push(toOutfitItem(slot, "wardrobe", owned));
      continue;
    }
    if (!withinBudget) continue; // don't pile on more cost when already over budget
    const product = pickCatalogProduct(
      slot,
      catalog,
      request.gender,
      styleTags,
      colorBias,
      constraints,
      false,
      excludeRefIds
    );
    if (product && requiredCost() + product.price <= budget) {
      items.push(toOutfitItem(slot, "catalog", product));
    }
  }

  const ownedItems = items.filter((i) => i.source === "wardrobe");
  const toBuyItems = items.filter((i) => i.source === "catalog");
  const totalCost = toBuyItems.reduce((s, i) => s + i.price, 0);

  const outfit: Outfit = {
    id: params.id ?? uuid(),
    lookName,
    items,
    ownedItems,
    toBuyItems,
    totalCost,
    withinBudget,
    budgetNote:
      budgetNote ??
      (unresolvedRequired.length > 0
        ? `We couldn't find a suitable ${unresolvedRequired.join(", ")} in stock for this look. Showing the rest of the outfit — try adjusting your style or gender preference.`
        : undefined),
    whyExplanation: "",
    matchedStyleTags: styleTags,
    request: { ...request, budget },
    refinementHistory,
    createdAt: new Date().toISOString(),
  };

  outfit.whyExplanation = explainOutfit(outfit);
  return outfit;
}
