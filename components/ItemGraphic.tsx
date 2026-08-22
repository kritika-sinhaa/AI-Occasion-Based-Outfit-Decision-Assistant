import { ClothingCategory } from "@/lib/types";
import { colorHex, readableTextOn } from "@/lib/ui/colors";
import { CategoryIcon } from "@/components/CategoryIcon";
import clsx from "clsx";
import { useState } from "react";

export function ItemGraphic({
  category,
  color,
  className,
  imageDataUrl,
  imageUrl,
  size = "md",
}: {
  category: ClothingCategory;
  color: string;
  className?: string;
  imageDataUrl?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [stockImageFailed, setStockImageFailed] = useState(false);

  if (imageDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageDataUrl}
        alt={`${color} ${category}`}
        className={clsx("h-full w-full object-cover", className)}
      />
    );
  }

  if (imageUrl && !stockImageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={`${color} ${category}`}
        className={clsx("h-full w-full object-cover", className)}
        onError={() => setStockImageFailed(true)}
      />
    );
  }

  const hex = colorHex(color);
  const iconColor = readableTextOn(hex);
  const iconSize = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-14 w-14" : "h-9 w-9";

  return (
    <div
      className={clsx("flex h-full w-full items-center justify-center", className)}
      style={{ backgroundColor: hex }}
    >
      <CategoryIcon category={category} className={iconSize} />
      <style jsx>{`
        div :global(svg) {
          color: ${iconColor};
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
