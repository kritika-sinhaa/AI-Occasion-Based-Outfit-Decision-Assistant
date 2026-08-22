import { StyleTag } from "@/lib/types";

const STYLE_SYNONYMS: Record<StyleTag, string[]> = {
  minimal: ["minimal", "minimalist", "simple", "clean", "understated"],
  elegant: ["elegant", "sophisticated", "refined", "graceful"],
  classic: ["classic", "timeless", "traditional"],
  casual: ["casual", "relaxed", "everyday", "laidback", "laid-back"],
  formal: ["formal", "professional", "office", "corporate"],
  boho: ["boho", "bohemian", "earthy"],
  edgy: ["edgy", "bold", "street", "streetwear"],
  trendy: ["trendy", "fashionable", "modern", "fashion-forward"],
  chic: ["chic", "glam", "glamorous", "polished"],
};

/** Free-text -> known style tags. This is the lightweight "NLU" layer; swap for an LLM call later. */
export function parseStyleTags(styleText: string): StyleTag[] {
  const text = styleText.toLowerCase();
  const found = new Set<StyleTag>();
  (Object.keys(STYLE_SYNONYMS) as StyleTag[]).forEach((tag) => {
    if (STYLE_SYNONYMS[tag].some((syn) => text.includes(syn))) {
      found.add(tag);
    }
  });
  if (found.size === 0) found.add("classic");
  return Array.from(found);
}

export type Silhouette = "topBottom" | "dress";

export interface OccasionProfile {
  silhouettes: Silhouette[];
  colorBias: string[];
  defaultStyleTags: StyleTag[];
  suggestOuterwear: boolean;
  suggestBag: boolean;
  label: string;
}

const OCCASION_PROFILES: { keywords: string[]; profile: OccasionProfile }[] = [
  {
    keywords: ["night party", "club", "party", "night out"],
    profile: {
      silhouettes: ["dress", "topBottom"],
      colorBias: ["Black", "Gold", "Emerald", "Navy"],
      defaultStyleTags: ["chic", "elegant"],
      suggestOuterwear: false,
      suggestBag: true,
      label: "Evening",
    },
  },
  {
    keywords: ["wedding", "reception", "sangeet", "shaadi"],
    profile: {
      silhouettes: ["dress", "topBottom"],
      colorBias: ["Emerald", "Rust", "Gold", "Camel"],
      defaultStyleTags: ["elegant", "classic"],
      suggestOuterwear: false,
      suggestBag: true,
      label: "Celebration",
    },
  },
  {
    keywords: ["office", "work", "meeting", "interview", "corporate"],
    profile: {
      silhouettes: ["topBottom"],
      colorBias: ["Black", "Beige", "Navy", "Charcoal", "White"],
      defaultStyleTags: ["formal", "classic", "minimal"],
      suggestOuterwear: true,
      suggestBag: true,
      label: "Workwear",
    },
  },
  {
    keywords: ["date", "dinner", "date night"],
    profile: {
      silhouettes: ["dress", "topBottom"],
      colorBias: ["Black", "Emerald", "Navy"],
      defaultStyleTags: ["elegant", "chic"],
      suggestOuterwear: false,
      suggestBag: true,
      label: "Date Night",
    },
  },
  {
    keywords: ["brunch", "casual outing", "day out", "hangout", "lunch"],
    profile: {
      silhouettes: ["topBottom", "dress"],
      colorBias: ["White", "Beige", "Blue", "Camel"],
      defaultStyleTags: ["casual", "minimal"],
      suggestOuterwear: false,
      suggestBag: true,
      label: "Daytime Casual",
    },
  },
  {
    keywords: ["festive", "diwali", "celebration", "puja", "festival"],
    profile: {
      silhouettes: ["dress", "topBottom"],
      colorBias: ["Rust", "Gold", "Emerald", "Camel"],
      defaultStyleTags: ["boho", "elegant", "trendy"],
      suggestOuterwear: false,
      suggestBag: true,
      label: "Festive",
    },
  },
];

const DEFAULT_PROFILE: OccasionProfile = {
  silhouettes: ["topBottom", "dress"],
  colorBias: ["Black", "Beige", "White", "Navy"],
  defaultStyleTags: ["classic"],
  suggestOuterwear: false,
  suggestBag: true,
  label: "Occasion",
};

export function parseOccasion(occasionText: string): OccasionProfile {
  const text = occasionText.toLowerCase();
  const match = OCCASION_PROFILES.find((entry) => entry.keywords.some((kw) => text.includes(kw)));
  return match ? match.profile : DEFAULT_PROFILE;
}
