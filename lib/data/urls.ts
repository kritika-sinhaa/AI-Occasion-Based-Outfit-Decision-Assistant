import { Platform } from "@/lib/types";

/**
 * Builds a real, working deep-link into each retailer's *search results* for the given
 * product query — not the bare homepage. This is demo/mock catalog data: we don't have
 * live product IDs from these retailers, so a scoped search link is the honest stand-in.
 * Swap this for real product-page URLs once a live catalog/affiliate feed is wired in.
 */
export function buildBuyUrl(platform: Platform, query: string): string {
  const q = encodeURIComponent(query);
  switch (platform) {
    case "Myntra":
      return `https://www.myntra.com/search?q=${q}`;
    case "Amazon":
      return `https://www.amazon.in/s?k=${q}`;
    case "Nykaa Fashion":
      return `https://www.nykaafashion.com/catalogsearch/result/?q=${q}`;
    case "Meesho":
      return `https://www.meesho.com/search?q=${q}`;
    case "Zara":
      return `https://www.zara.com/in/en/search?searchTerm=${q}`;
    default:
      return `https://www.google.com/search?q=${q}`;
  }
}
