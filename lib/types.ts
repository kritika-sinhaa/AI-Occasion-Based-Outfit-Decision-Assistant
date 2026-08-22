// Core domain types shared across the client store, engine, and API routes.

export type Gender = "women" | "men" | "unisex";

export type ClothingCategory =
  | "top"
  | "bottom"
  | "dress"
  | "footwear"
  | "outerwear"
  | "bag"
  | "jewelry"
  | "accessory";

export type StyleTag =
  | "minimal"
  | "elegant"
  | "classic"
  | "casual"
  | "formal"
  | "boho"
  | "edgy"
  | "trendy"
  | "chic";

export type Platform = "Myntra" | "Amazon" | "Nykaa Fashion" | "Meesho" | "Zara";

/** A single item in the mock/demo purchasable catalog. Replace with a live feed later. */
export interface Product {
  id: string;
  name: string;
  category: ClothingCategory;
  subCategory: string; // e.g. "heels", "earrings", "trousers"
  color: string;
  styleTags: StyleTag[];
  gender: Gender;
  price: number; // INR
  platform: Platform;
  /** Real, working deep-link (search/category URL) on the retailer — not the bare homepage. */
  url: string;
  image: string; // placeholder illustration (data uri / css gradient key)
  isDemoData: true;
}

/** An item the user owns, either uploaded or confirmed via the demo/mock flow. */
export interface WardrobeItem {
  id: string;
  category: ClothingCategory;
  subCategory: string;
  color: string;
  pattern: string;
  styleTags: StyleTag[];
  name: string;
  imageDataUrl?: string; // client-side preview, base64
  confirmed: boolean; // human-in-the-loop confirmation of AI-detected attributes
  source: "upload" | "demo" | "manual";
  createdAt: string;
}

export interface OutfitRequest {
  occasion: string;
  location: string;
  date: string;
  budget: number;
  style: string;
  gender: Gender;
}

export type OutfitItemSource = "wardrobe" | "catalog";

export interface OutfitItem {
  slot: ClothingCategory;
  source: OutfitItemSource;
  refId: string; // wardrobe item id or product id
  name: string;
  color: string;
  price: number; // 0 if owned
  image: string;
  imageDataUrl?: string; // present when sourced from a user-uploaded wardrobe photo
  platform?: Platform;
  url?: string;
}

export interface Outfit {
  id: string;
  lookName: string;
  items: OutfitItem[];
  ownedItems: OutfitItem[];
  toBuyItems: OutfitItem[];
  totalCost: number;
  withinBudget: boolean;
  budgetNote?: string; // guardrail messaging when budget can't be met
  whyExplanation: string;
  matchedStyleTags: StyleTag[];
  request: OutfitRequest;
  refinementHistory: string[];
  createdAt: string;
}

export interface SavedLook {
  id: string;
  outfit: Outfit;
  savedAt: string;
}

export interface RefinementConstraints {
  addStyleTags: StyleTag[];
  removeStyleTags: StyleTag[];
  excludeColors: string[];
  excludeSubCategories: string[];
  preferSubCategorySubstitutions: Record<string, string>; // from -> to
  wardrobePreferenceBoost: number;
}
