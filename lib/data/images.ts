import { ClothingCategory, Gender } from "@/lib/types";

/**
 * Builds a real stock photo URL for a mock catalog product via LoremFlickr —
 * a keyword-tagged real-photo service (not a specific opaque photo ID we'd have to
 * guess/verify). This is demo/mock catalog data: we don't have a live product feed
 * with real photography, so a topically-matched stock photo is the honest stand-in.
 * Swap this for real product images once a live catalog/affiliate feed is wired in.
 *
 * `ItemGraphic` falls back to a colored icon tile if this image ever fails to load,
 * so a slow/unavailable photo never breaks the layout.
 */

const SUBCATEGORY_KEYWORDS: Record<string, string> = {
  top: "top,fashion",
  shirt: "shirt,fashion",
  blouse: "blouse,fashion",
  tee: "tshirt",
  kurta: "kurta,indian",
  trousers: "trousers,fashion",
  jeans: "jeans,denim",
  palazzo: "palazzo,pants",
  chinos: "chinos,pants",
  skirt: "skirt,fashion",
  dress: "dress,fashion",
  heels: "heels,shoes",
  flats: "flats,shoes",
  sneakers: "sneakers,shoes",
  sandals: "sandals,shoes",
  "formal shoes": "dress-shoes",
  loafers: "loafers,shoes",
  boots: "boots,shoes",
  earrings: "earrings,jewelry",
  necklace: "necklace,jewelry",
  "sling bag": "handbag",
  tote: "tote-bag",
  clutch: "clutch-bag",
  crossbody: "crossbody-bag",
  blazer: "blazer,fashion",
  coat: "coat,fashion",
  jacket: "jacket,fashion",
  belt: "belt,leather",
  bracelet: "bracelet,jewelry",
  sunglasses: "sunglasses",
  watch: "wristwatch",
};

const CATEGORY_KEYWORDS: Record<ClothingCategory, string> = {
  top: "top,fashion",
  bottom: "pants,fashion",
  dress: "dress,fashion",
  footwear: "shoes,fashion",
  outerwear: "jacket,fashion",
  bag: "handbag",
  jewelry: "jewelry",
  accessory: "accessory,fashion",
};

function genderKeyword(gender: Gender): string {
  return gender === "men" ? "men" : gender === "women" ? "women" : "";
}

export function buildImageUrl(
  category: ClothingCategory,
  subCategory: string,
  gender: Gender
): string {
  const base = SUBCATEGORY_KEYWORDS[subCategory.toLowerCase()] ?? CATEGORY_KEYWORDS[category];
  const tags = [base, genderKeyword(gender)].filter(Boolean).join(",");
  // Fixed per-lock so the same product always resolves to the same photo across renders.
  const lock = Math.abs(hashCode(`${category}:${subCategory}:${gender}`)) % 100000;
  return `https://loremflickr.com/400/400/${encodeURIComponent(tags)}?lock=${lock}`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
