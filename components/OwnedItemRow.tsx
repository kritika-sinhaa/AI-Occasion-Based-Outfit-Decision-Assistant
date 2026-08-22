import { OutfitItem } from "@/lib/types";
import { ItemGraphic } from "@/components/ItemGraphic";

export function OwnedItemRow({ item }: { item: OutfitItem }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink/8 bg-white p-2.5">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
        <ItemGraphic
          category={item.slot}
          color={item.color}
          imageDataUrl={item.imageDataUrl}
          imageUrl={item.imageUrl}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
        <p className="text-xs capitalize text-ink/45">{item.slot}</p>
      </div>
      <span className="shrink-0 rounded-full bg-moss/10 px-2.5 py-1 text-[11px] font-semibold text-moss">
        In your wardrobe
      </span>
    </div>
  );
}
