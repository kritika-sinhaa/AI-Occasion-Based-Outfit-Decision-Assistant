import { ClothingCategory } from "@/lib/types";

const commonProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/** Distinct illustrations per specific item type (heels vs sneakers, blazer vs coat, etc.) —
 *  so an item's graphic actually reflects what it is, not just its broad category. Falls back
 *  to the category-level glyph below when a subcategory has no dedicated illustration. */
function bySubCategory(subCategory: string | undefined, common: typeof commonProps & { className?: string }): JSX.Element | null {
  switch (subCategory?.toLowerCase()) {
    // -- top family --
    case "tee":
      return (
        <svg {...common}>
          <path d="M7 5 L4 8 L6 10.5 L7.5 9 V19 H16.5 V9 L18 10.5 L20 8 L17 5 Q12 7.5 7 5 Z" />
        </svg>
      );
    case "shirt":
      return (
        <svg {...common}>
          <path d="M7 5 L3.5 8.5 L6 11 L7.5 9.2 V21 H16.5 V9.2 L18 11 L20.5 8.5 L17 5 Q14.5 7 12 7 Q9.5 7 7 5 Z" />
          <path d="M10 5.5 L12 8 L14 5.5" />
          <path d="M12 9 V19" />
        </svg>
      );
    case "blouse":
      return (
        <svg {...common}>
          <path d="M7.5 5 L4 8.5 L6.3 11 L7.7 9.3 V20 H16.3 V9.3 L17.7 11 L20 8.5 L16.5 5 Q12 7.6 7.5 5 Z" />
          <path d="M10.5 6.3 L12 7.6 L10.2 8.6 Z" />
          <path d="M13.5 6.3 L12 7.6 L13.8 8.6 Z" />
        </svg>
      );
    case "kurta":
      return (
        <svg {...common}>
          <path d="M8 4 L5 7 L7 9.5 L8.5 8 V21 H15.5 V8 L17 9.5 L19 7 L16 4 Q12 6.3 8 4 Z" />
          <path d="M9 17 V21" />
          <path d="M15 17 V21" />
        </svg>
      );

    // -- bottom family --
    case "jeans":
      return (
        <svg {...common}>
          <path d="M6 4 H18 L18.6 20 H14 L12 10 L10 20 H5.4 Z" />
          <path d="M8.2 5.5 V17" />
          <path d="M15.8 5.5 V17" />
          <path d="M7.5 5.2 Q9 6.2 10.5 5.2" />
        </svg>
      );
    case "palazzo":
      return (
        <svg {...common}>
          <path d="M7 4 H17 L19 20 H13.5 L12 9 L10.5 20 H5 Z" />
        </svg>
      );
    case "skirt":
      return (
        <svg {...common}>
          <path d="M8 4 H16 L19 20 H5 Z" />
        </svg>
      );
    case "chinos":
      return (
        <svg {...common}>
          <path d="M6.5 4 H17.5 L18 20 H14.2 L12 10.5 L9.8 20 H6 Z" />
          <path d="M9.6 17.5 H14.4" />
        </svg>
      );

    // -- footwear family --
    case "heels":
      return (
        <svg {...common}>
          <path d="M4 19 Q4 15.5 8 14.5 L15 12 Q17 11 17.5 9 L19 10 Q20 11.5 19.5 15 L19.7 18.5 Q19.7 19.5 18.5 19.5 H5 Q4 19.5 4 19 Z" />
        </svg>
      );
    case "flats":
      return (
        <svg {...common}>
          <path d="M4 18 Q4 15 8 14.5 L16 13.5 Q19 13.5 19.5 16 V18 Q19.5 19 18.5 19 H5 Q4 19 4 18 Z" />
          <path d="M8 14.5 Q9 12.5 11 13" />
        </svg>
      );
    case "sneakers":
      return (
        <svg {...common}>
          <path d="M4 18.5 Q4 15 8 14 L14 12.5 Q17 12 18 10.5 L19.5 11.5 Q20.5 13 20 15.5 L20.3 18 Q20.3 19.5 19 19.5 H5 Q4 19.5 4 18.5 Z" />
          <path d="M4.3 18 H20" />
          <path d="M9 14.5 L11 13.2" />
          <path d="M10 15.5 L12 14.2" />
        </svg>
      );
    case "sandals":
      return (
        <svg {...common}>
          <path d="M4 18 Q4 15.5 8 15 L16 14 Q19.5 14 19.7 17 V18.5 Q19.7 19.5 18.5 19.5 H5 Q4 19.5 4 18 Z" />
          <path d="M8 15 L11 12.5" />
          <path d="M13 13.5 L16 14" />
          <path d="M9.5 13.8 V19" />
        </svg>
      );
    case "formal shoes":
      return (
        <svg {...common}>
          <path d="M4 18.5 Q4 15.5 8.5 14.8 L15.5 13 Q18 12.3 19 10.5 L20 11 Q21 12.5 20.3 15.5 L20.5 18 Q20.5 19.3 19.3 19.3 H5 Q4 19.3 4 18.5 Z" />
          <path d="M11 14 L13 13" />
          <path d="M12 15 L14 14" />
        </svg>
      );
    case "loafers":
      return (
        <svg {...common}>
          <path d="M4 18.5 Q4 15.5 8 14.7 L15 13.2 Q18 12.5 19 11 L20 11.8 Q21 13 20.5 16 L20.7 18 Q20.7 19.3 19.5 19.3 H5 Q4 19.3 4 18.5 Z" />
          <path d="M9.5 15 Q11.5 13.8 13.5 14.6" />
        </svg>
      );
    case "boots":
      return (
        <svg {...common}>
          <path d="M4 19 Q4 16 7.5 15.3 L13 14 V6 H18 V12 Q18 13.5 19 14.5 L19.7 15 Q20.3 16 20 18.5 Q20 19.5 19 19.5 H5 Q4 19.5 4 19 Z" />
        </svg>
      );

    // -- jewelry family --
    case "necklace":
      return (
        <svg {...common}>
          <path d="M6 6 Q12 14 18 6" />
          <path d="M12 13 L10.5 17 L12 19 L13.5 17 Z" />
        </svg>
      );

    // -- bag family --
    case "tote":
      return (
        <svg {...common}>
          <rect x="3" y="10" width="18" height="11" rx="1.5" />
          <path d="M7 10 V5.5 Q7 4 8.5 4 Q10 4 10 5.5 V10" />
          <path d="M14 10 V5.5 Q14 4 15.5 4 Q17 4 17 5.5 V10" />
        </svg>
      );
    case "clutch":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="8" rx="1.5" />
          <circle cx="12" cy="11" r="1" />
        </svg>
      );
    case "crossbody":
      return (
        <svg {...common}>
          <rect x="6" y="11" width="12" height="9" rx="1.5" />
          <path d="M7 11 Q3 6 3 2" />
          <path d="M17 11 Q21 6 21 2" />
        </svg>
      );

    // -- outerwear family --
    case "coat":
      return (
        <svg {...common}>
          <path d="M9 3 L5 6 L6.5 9 L8 8 V22 H16 V8 L17.5 9 L19 6 L15 3 Q12 5 9 3 Z" />
          <path d="M8 15 H16" />
        </svg>
      );
    case "jacket":
      return (
        <svg {...common}>
          <path d="M9 3 L5 6 L6.5 9 L8 8 V16 H16 V8 L17.5 9 L19 6 L15 3 Q12 5 9 3 Z" />
        </svg>
      );

    // -- accessory family --
    case "belt":
      return (
        <svg {...common}>
          <path d="M3 12 H21" />
          <rect x="10" y="9" width="4" height="6" rx="1" />
        </svg>
      );
    case "bracelet":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="7" ry="5" />
        </svg>
      );
    case "sunglasses":
      return (
        <svg {...common}>
          <circle cx="8" cy="12" r="3.2" />
          <circle cx="16" cy="12" r="3.2" />
          <path d="M11.2 12 H12.8" />
          <path d="M4.8 11 L2 9" />
          <path d="M19.2 11 L22 9" />
        </svg>
      );
    case "watch":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4.5" />
          <path d="M10 3 H14 V7.5 H10 Z" />
          <path d="M10 16.5 H14 V21 H10 Z" />
          <path d="M16.3 12 H18" />
        </svg>
      );

    default:
      return null;
  }
}

export function CategoryIcon({
  category,
  subCategory,
  className,
}: {
  category: ClothingCategory;
  subCategory?: string;
  className?: string;
}) {
  const common = { ...commonProps, className };

  const specific = bySubCategory(subCategory, common);
  if (specific) return specific;

  switch (category) {
    case "top":
      return (
        <svg {...common}>
          <path d="M8 4 L4 7 L6 10 L8 8.5 V20 H16 V8.5 L18 10 L20 7 L16 4 Q14 6 12 6 Q10 6 8 4 Z" />
        </svg>
      );
    case "bottom":
      return (
        <svg {...common}>
          <path d="M6 4 H18 L18.6 20 H14 L12 10 L10 20 H5.4 Z" />
        </svg>
      );
    case "dress":
      return (
        <svg {...common}>
          <path d="M9 4 L8 7 L5 20 H19 L16 7 L15 4 Q12 6 9 4 Z" />
          <path d="M9 4 Q12 6 15 4" />
        </svg>
      );
    case "footwear":
      return (
        <svg {...common}>
          <path d="M4 18 Q4 14 8 13 L13 11 Q15 10 16 8 L18 9 Q20 10 20 13 V18 Q20 19 19 19 H5 Q4 19 4 18 Z" />
        </svg>
      );
    case "outerwear":
      return (
        <svg {...common}>
          <path d="M9 3 L5 6 L6.5 9 L8 8 V21 H10 V13 H14 V21 H16 V8 L17.5 9 L19 6 L15 3 Q12 5 9 3 Z" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <rect x="4" y="9" width="16" height="12" rx="2" />
          <path d="M8 9 V6 Q8 3 12 3 Q16 3 16 6 V9" />
        </svg>
      );
    case "jewelry":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M12 12 L9 20 H15 Z" />
        </svg>
      );
    case "accessory":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.4" />
        </svg>
      );
  }
}
