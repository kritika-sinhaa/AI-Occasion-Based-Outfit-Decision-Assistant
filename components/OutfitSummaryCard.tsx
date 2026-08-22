import { Outfit } from "@/lib/types";
import { ItemGraphic } from "@/components/ItemGraphic";
import clsx from "clsx";

export function OutfitSummaryCard({
  outfit,
  index,
  onView,
}: {
  outfit: Outfit;
  index: number;
  onView: () => void;
}) {
  return (
    <div
      className="card animate-in flex flex-col overflow-hidden"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="grid grid-cols-2 gap-0.5 bg-ink/5 p-0.5">
        {outfit.items.slice(0, 4).map((item) => (
          <div key={`${item.slot}-${item.refId}`} className="relative aspect-square overflow-hidden">
            <ItemGraphic category={item.slot} color={item.color} imageDataUrl={item.imageDataUrl} />
            {item.source === "wardrobe" && (
              <span className="absolute left-1 top-1 rounded-full bg-moss px-1.5 py-0.5 text-[9px] font-semibold uppercase text-cream">
                Owned
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="font-display text-lg leading-tight text-ink">{outfit.lookName}</h3>
        </div>

        <span
          className={clsx(
            "mb-2 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            outfit.withinBudget ? "bg-moss/10 text-moss" : "bg-rust/10 text-rust"
          )}
        >
          {outfit.withinBudget
            ? `Within budget · ₹${outfit.totalCost.toLocaleString("en-IN")}`
            : `Over budget by ₹${(outfit.totalCost - outfit.request.budget).toLocaleString("en-IN")}`}
        </span>

        <p className="mb-3 line-clamp-3 flex-1 text-[13px] leading-relaxed text-ink/60">
          {outfit.whyExplanation}
        </p>

        <div className="mb-4 flex gap-4 text-xs text-ink/50">
          <span>{outfit.ownedItems.length} owned</span>
          <span>{outfit.toBuyItems.length} to buy</span>
        </div>

        <button onClick={onView} className="btn-primary mt-auto w-full">
          View This Look
        </button>
      </div>
    </div>
  );
}
