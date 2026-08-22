import { OutfitItem } from "@/lib/types";
import { ItemGraphic } from "@/components/ItemGraphic";

export function ProductCard({ item }: { item: OutfitItem }) {
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="aspect-[4/3] w-full">
        <ItemGraphic category={item.slot} color={item.color} imageDataUrl={item.imageDataUrl} />
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[13px] font-medium leading-snug text-ink">{item.name}</p>
        <p className="mt-0.5 text-xs text-ink/45">{item.platform} · demo listing</p>
        <div className="mt-2 flex flex-1 items-end justify-between gap-2">
          <span className="font-display text-lg text-ink">₹{item.price.toLocaleString("en-IN")}</span>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-cream transition hover:bg-ink/85"
            >
              Buy Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
