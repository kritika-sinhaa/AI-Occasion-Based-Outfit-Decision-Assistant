import { Product, ClothingCategory, StyleTag, Gender, Platform } from "@/lib/types";
import { buildBuyUrl } from "@/lib/data/urls";

let counter = 0;
function p(
  name: string,
  category: ClothingCategory,
  subCategory: string,
  color: string,
  styleTags: StyleTag[],
  gender: Gender,
  price: number,
  platform: Platform
): Product {
  counter += 1;
  return {
    id: `prod_${counter.toString().padStart(3, "0")}`,
    name,
    category,
    subCategory,
    color,
    styleTags,
    gender,
    price,
    platform,
    url: buildBuyUrl(platform, name),
    image: `${category}:${color}`,
    isDemoData: true,
  };
}

/**
 * Mock / demo product catalog. Prices, platforms, and availability are illustrative
 * sample data — NOT live inventory. Designed to be swapped for a real product feed
 * or affiliate API without changing the engine or UI that consume it.
 */
export const CATALOG: Product[] = [
  // ---- Women: Tops ----
  p("Black Ribbed Bodysuit Top", "top", "top", "Black", ["minimal", "elegant", "chic"], "women", 899, "Myntra"),
  p("Beige Satin Cami Top", "top", "top", "Beige", ["minimal", "elegant"], "women", 1199, "Zara"),
  p("White Poplin Shirt", "top", "shirt", "White", ["classic", "formal", "minimal"], "women", 1099, "Myntra"),
  p("Emerald Wrap Blouse", "top", "blouse", "Emerald", ["elegant", "chic"], "women", 1799, "Nykaa Fashion"),
  p("Rust Off-Shoulder Top", "top", "top", "Rust", ["trendy", "boho"], "women", 949, "Meesho"),
  p("Black Sequin Halter Top", "top", "top", "Black", ["edgy", "trendy", "chic"], "women", 1599, "Zara"),

  // ---- Women: Bottoms ----
  p("Beige Tailored Trousers", "bottom", "trousers", "Beige", ["minimal", "classic", "formal"], "women", 1499, "Myntra"),
  p("Black Straight-Fit Trousers", "bottom", "trousers", "Black", ["minimal", "classic", "elegant"], "women", 1399, "Zara"),
  p("Blue Denim Jeans", "bottom", "jeans", "Blue", ["casual", "classic"], "women", 1299, "Myntra"),
  p("Black Wide-Leg Palazzo", "bottom", "palazzo", "Black", ["boho", "elegant"], "women", 1099, "Meesho"),
  p("Camel Pleated Midi Skirt", "bottom", "skirt", "Camel", ["elegant", "classic"], "women", 1699, "Nykaa Fashion"),

  // ---- Women: Dresses ----
  p("Black Slip Midi Dress", "dress", "dress", "Black", ["minimal", "elegant", "chic"], "women", 2199, "Zara"),
  p("Emerald Wrap Dress", "dress", "dress", "Emerald", ["elegant", "chic"], "women", 2499, "Nykaa Fashion"),
  p("Beige Cowl Neck Slip Dress", "dress", "dress", "Beige", ["minimal", "elegant"], "women", 2099, "Myntra"),
  p("Black Sequin Bodycon Dress", "dress", "dress", "Black", ["edgy", "trendy", "chic"], "women", 2799, "Myntra"),
  p("Rust Floral Wrap Dress", "dress", "dress", "Rust", ["boho", "casual"], "women", 1799, "Meesho"),
  p("Navy Satin Slip Dress", "dress", "dress", "Navy", ["elegant", "classic"], "women", 2399, "Zara"),

  // ---- Women: Footwear ----
  p("Black Strappy Heels", "footwear", "heels", "Black", ["elegant", "chic", "classic"], "women", 1899, "Myntra"),
  p("Beige Block Heel Sandals", "footwear", "heels", "Beige", ["minimal", "classic"], "women", 1599, "Myntra"),
  p("Black Pointed Flats", "footwear", "flats", "Black", ["minimal", "classic", "casual"], "women", 1299, "Myntra"),
  p("Gold Metallic Heels", "footwear", "heels", "Gold", ["trendy", "chic", "edgy"], "women", 2099, "Nykaa Fashion"),
  p("White Leather Sneakers", "footwear", "sneakers", "White", ["casual", "minimal"], "women", 2299, "Myntra"),
  p("Nude Ankle Strap Sandals", "footwear", "sandals", "Nude", ["boho", "casual"], "women", 1099, "Meesho"),

  // ---- Women: Jewelry ----
  p("Gold Drop Earrings", "jewelry", "earrings", "Gold", ["elegant", "chic", "classic"], "women", 599, "Nykaa Fashion"),
  p("Minimal Gold Hoops", "jewelry", "earrings", "Gold", ["minimal", "classic"], "women", 399, "Myntra"),
  p("Silver Stud Earrings", "jewelry", "earrings", "Silver", ["minimal", "casual"], "women", 349, "Myntra"),
  p("Statement Crystal Earrings", "jewelry", "earrings", "Silver", ["edgy", "trendy", "chic"], "women", 899, "Nykaa Fashion"),
  p("Layered Gold Necklace", "jewelry", "necklace", "Gold", ["boho", "trendy"], "women", 749, "Meesho"),

  // ---- Women: Bags ----
  p("Black Structured Sling Bag", "bag", "sling bag", "Black", ["minimal", "elegant", "classic"], "women", 1799, "Myntra"),
  p("Beige Woven Tote", "bag", "tote", "Beige", ["boho", "casual"], "women", 1499, "Meesho"),
  p("Gold Chain Clutch", "bag", "clutch", "Gold", ["elegant", "chic"], "women", 1299, "Nykaa Fashion"),

  // ---- Women: Outerwear ----
  p("Black Tailored Blazer", "outerwear", "blazer", "Black", ["formal", "classic", "minimal"], "women", 2599, "Zara"),
  p("Camel Trench Coat", "outerwear", "coat", "Camel", ["classic", "elegant"], "women", 3499, "Zara"),
  p("Denim Jacket", "outerwear", "jacket", "Blue", ["casual", "edgy"], "women", 1899, "Myntra"),

  // ---- Men: Tops ----
  p("White Linen Shirt", "top", "shirt", "White", ["minimal", "classic", "formal"], "men", 1299, "Myntra"),
  p("Black Mock Neck Tee", "top", "tee", "Black", ["minimal", "casual"], "men", 699, "Myntra"),
  p("Navy Slim Fit Shirt", "top", "shirt", "Navy", ["classic", "formal"], "men", 1399, "Myntra"),
  p("Beige Linen Kurta", "top", "kurta", "Beige", ["classic", "elegant"], "men", 1599, "Meesho"),
  p("Black Bomber Bowling Shirt", "top", "shirt", "Black", ["trendy", "edgy"], "men", 1199, "Amazon"),

  // ---- Men: Bottoms ----
  p("Charcoal Tailored Trousers", "bottom", "trousers", "Charcoal", ["formal", "classic", "minimal"], "men", 1699, "Myntra"),
  p("Black Slim Chinos", "bottom", "chinos", "Black", ["minimal", "classic", "casual"], "men", 1399, "Myntra"),
  p("Blue Denim Jeans", "bottom", "jeans", "Blue", ["casual"], "men", 1499, "Myntra"),
  p("Beige Cotton Chinos", "bottom", "chinos", "Beige", ["classic", "casual"], "men", 1299, "Amazon"),

  // ---- Men: Footwear ----
  p("Black Leather Derby Shoes", "footwear", "formal shoes", "Black", ["formal", "classic", "elegant"], "men", 2499, "Myntra"),
  p("White Minimal Sneakers", "footwear", "sneakers", "White", ["minimal", "casual"], "men", 2799, "Myntra"),
  p("Brown Leather Loafers", "footwear", "loafers", "Brown", ["classic", "elegant"], "men", 2299, "Myntra"),
  p("Black Chelsea Boots", "footwear", "boots", "Black", ["edgy", "trendy"], "men", 2999, "Amazon"),

  // ---- Men: Accessories / Outerwear ----
  p("Black Leather Belt", "accessory", "belt", "Black", ["classic", "formal", "minimal"], "men", 599, "Myntra"),
  p("Silver Chain Bracelet", "accessory", "bracelet", "Silver", ["edgy", "trendy"], "men", 499, "Amazon"),
  p("Navy Blazer", "outerwear", "blazer", "Navy", ["formal", "classic", "elegant"], "men", 2999, "Zara"),
  p("Black Bomber Jacket", "outerwear", "jacket", "Black", ["casual", "edgy", "trendy"], "men", 2199, "Myntra"),

  // ---- Unisex accessories ----
  p("Tortoise Sunglasses", "accessory", "sunglasses", "Brown", ["classic", "trendy"], "unisex", 799, "Myntra"),
  p("Minimal Leather Watch", "accessory", "watch", "Black", ["minimal", "classic"], "unisex", 1999, "Amazon"),
  p("Canvas Crossbody Bag", "bag", "crossbody", "Beige", ["casual", "minimal"], "unisex", 1099, "Meesho"),

  // ---- Budget-friendly picks (helps low-budget scenarios stay achievable) ----
  p("Black Basic Camisole", "top", "top", "Black", ["minimal", "casual"], "women", 399, "Meesho"),
  p("Black Flat Sandals", "footwear", "sandals", "Black", ["minimal", "casual"], "women", 599, "Meesho"),
  p("Simple Stud Earrings", "jewelry", "earrings", "Gold", ["minimal", "classic"], "women", 249, "Meesho"),
  p("Plain White Tee", "top", "tee", "White", ["minimal", "casual"], "men", 349, "Meesho"),
  p("Basic Canvas Sneakers", "footwear", "sneakers", "White", ["casual", "minimal"], "men", 999, "Meesho"),
];

export function getCatalog(): Product[] {
  return CATALOG;
}
