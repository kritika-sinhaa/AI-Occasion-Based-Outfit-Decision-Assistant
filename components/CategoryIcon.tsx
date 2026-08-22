import { ClothingCategory } from "@/lib/types";

export function CategoryIcon({ category, className }: { category: ClothingCategory; className?: string }) {
  const common = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };
  switch (category) {
    case "top":
      return (
        <svg {...common}><path d="M8 4 L4 7 L6 10 L8 8.5 V20 H16 V8.5 L18 10 L20 7 L16 4 Q14 6 12 6 Q10 6 8 4 Z" /></svg>
      );
    case "bottom":
      return (
        <svg {...common}><path d="M6 4 H18 L18.6 20 H14 L12 10 L10 20 H5.4 Z" /></svg>
      );
    case "dress":
      return (
        <svg {...common}><path d="M9 4 L8 7 L5 20 H19 L16 7 L15 4 Q12 6 9 4 Z" /><path d="M9 4 Q12 6 15 4" /></svg>
      );
    case "footwear":
      return (
        <svg {...common}><path d="M4 18 Q4 14 8 13 L13 11 Q15 10 16 8 L18 9 Q20 10 20 13 V18 Q20 19 19 19 H5 Q4 19 4 18 Z" /></svg>
      );
    case "outerwear":
      return (
        <svg {...common}><path d="M9 3 L5 6 L6.5 9 L8 8 V21 H10 V13 H14 V21 H16 V8 L17.5 9 L19 6 L15 3 Q12 5 9 3 Z" /></svg>
      );
    case "bag":
      return (
        <svg {...common}><rect x="4" y="9" width="16" height="12" rx="2" /><path d="M8 9 V6 Q8 3 12 3 Q16 3 16 6 V9" /></svg>
      );
    case "jewelry":
      return (
        <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M12 12 L9 20 H15 Z" /></svg>
      );
    case "accessory":
    default:
      return (
        <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.4" /></svg>
      );
  }
}
