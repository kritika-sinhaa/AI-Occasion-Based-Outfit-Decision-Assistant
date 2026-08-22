import { OutfitRequest, WardrobeItem } from "@/lib/types";

export const DEMO_REQUEST: OutfitRequest = {
  occasion: "Night Party",
  location: "Bangalore",
  date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  budget: 5000,
  style: "Minimal & Elegant",
  gender: "women",
};

function demoItem(
  id: string,
  name: string,
  category: WardrobeItem["category"],
  subCategory: string,
  color: string,
  pattern: string,
  styleTags: WardrobeItem["styleTags"]
): WardrobeItem {
  return {
    id,
    name,
    category,
    subCategory,
    color,
    pattern,
    styleTags,
    confirmed: true,
    source: "demo",
    createdAt: new Date().toISOString(),
    gender: DEMO_REQUEST.gender,
  };
}

export const DEMO_WARDROBE: WardrobeItem[] = [
  demoItem("demo_wd_1", "Black Top", "top", "top", "Black", "Solid", ["minimal", "elegant", "classic"]),
  demoItem("demo_wd_2", "Blue Jeans", "bottom", "jeans", "Blue", "Solid", ["casual", "classic"]),
  demoItem("demo_wd_3", "Black Heels", "footwear", "heels", "Black", "Solid", ["elegant", "chic", "classic"]),
  demoItem("demo_wd_4", "Gold Earrings", "jewelry", "earrings", "Gold", "Solid", ["elegant", "classic", "minimal"]),
];
