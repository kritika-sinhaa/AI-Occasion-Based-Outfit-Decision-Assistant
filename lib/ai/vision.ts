import { ClothingCategory, StyleTag } from "@/lib/types";

export interface DetectedAttributes {
  category: ClothingCategory;
  subCategory: string;
  color: string;
  pattern: string;
  styleTags: StyleTag[];
  confidence: number; // 0-1, always shown to the user, never hidden
}

const NAMED_COLORS: { name: string; rgb: [number, number, number] }[] = [
  { name: "Black", rgb: [20, 20, 20] },
  { name: "White", rgb: [245, 245, 245] },
  { name: "Beige", rgb: [222, 202, 173] },
  { name: "Navy", rgb: [30, 40, 70] },
  { name: "Blue", rgb: [60, 100, 180] },
  { name: "Emerald", rgb: [20, 120, 90] },
  { name: "Rust", rgb: [168, 83, 47] },
  { name: "Camel", rgb: [180, 140, 90] },
  { name: "Gold", rgb: [200, 165, 70] },
  { name: "Silver", rgb: [190, 190, 195] },
  { name: "Brown", rgb: [90, 60, 40] },
  { name: "Charcoal", rgb: [60, 60, 63] },
  { name: "Nude", rgb: [225, 190, 165] },
  { name: "Grey", rgb: [140, 140, 140] },
];

function nearestColorName(r: number, g: number, b: number): string {
  let best = NAMED_COLORS[0];
  let bestDist = Infinity;
  for (const c of NAMED_COLORS) {
    const d = (r - c.rgb[0]) ** 2 + (g - c.rgb[1]) ** 2 + (b - c.rgb[2]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best.name;
}

/** Extracts the dominant color of an image by averaging pixels on a small canvas. Runs client-side. */
export function extractDominantColor(imageEl: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  const size = 32;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "Black";
  ctx.drawImage(imageEl, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }
  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);
  return nearestColorName(r, g, b);
}

const CATEGORY_KEYWORDS: { category: ClothingCategory; subCategory: string; keywords: string[] }[] = [
  { category: "dress", subCategory: "dress", keywords: ["dress", "gown"] },
  { category: "top", subCategory: "top", keywords: ["top", "shirt", "blouse", "tee", "tshirt", "t-shirt", "kurta"] },
  { category: "bottom", subCategory: "jeans", keywords: ["jean", "denim"] },
  { category: "bottom", subCategory: "trousers", keywords: ["trouser", "pant", "chino", "skirt", "palazzo"] },
  { category: "footwear", subCategory: "heels", keywords: ["heel"] },
  { category: "footwear", subCategory: "sneakers", keywords: ["sneaker", "shoe", "boot", "sandal", "flat", "loafer"] },
  { category: "outerwear", subCategory: "jacket", keywords: ["jacket", "blazer", "coat"] },
  { category: "bag", subCategory: "bag", keywords: ["bag", "clutch", "tote", "sling"] },
  { category: "jewelry", subCategory: "earrings", keywords: ["earring", "necklace", "jewel"] },
  { category: "accessory", subCategory: "accessory", keywords: ["belt", "watch", "sunglasses", "scarf"] },
];

function guessCategoryFromFilename(filename: string): { category: ClothingCategory; subCategory: string; matched: boolean } {
  const name = filename.toLowerCase();
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some((kw) => name.includes(kw))) {
      return { category: entry.category, subCategory: entry.subCategory, matched: true };
    }
  }
  return { category: "top", subCategory: "top", matched: false };
}

function styleTagsForColor(color: string): StyleTag[] {
  if (["Black", "Beige", "White", "Navy", "Charcoal"].includes(color)) return ["minimal", "classic"];
  if (["Gold", "Emerald", "Silver"].includes(color)) return ["elegant", "chic"];
  if (["Rust", "Camel", "Brown"].includes(color)) return ["boho", "classic"];
  return ["casual"];
}

/**
 * Mock/demo wardrobe classifier. Dominant-color extraction is real (pixel averaging);
 * category/subcategory/pattern are heuristic filename guesses standing in for a real
 * vision model. Confidence is always surfaced and the user must confirm before the item
 * is treated as "owned" — this is the human-in-the-loop guardrail, not a shortcut.
 */
export function classifyImage(imageEl: HTMLImageElement, filename: string): DetectedAttributes {
  const color = extractDominantColor(imageEl);
  const { category, subCategory, matched } = guessCategoryFromFilename(filename);
  return {
    category,
    subCategory,
    color,
    pattern: "Solid",
    styleTags: styleTagsForColor(color),
    confidence: matched ? 0.78 : 0.42,
  };
}
