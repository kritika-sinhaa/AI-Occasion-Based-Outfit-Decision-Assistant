"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import { ItemGraphic } from "@/components/ItemGraphic";
import clsx from "clsx";

export default function SavedLooksPage() {
  const router = useRouter();
  const savedLooks = useAppStore((s) => s.savedLooks);
  const removeSavedLook = useAppStore((s) => s.removeSavedLook);
  const setOutfits = useAppStore((s) => s.setOutfits);
  const outfits = useAppStore((s) => s.outfits);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  if (!hasHydrated) return null;

  function openLook(id: string) {
    const look = savedLooks.find((s) => s.id === id);
    if (!look) return;
    if (!outfits.some((o) => o.id === look.outfit.id)) {
      setOutfits([look.outfit, ...outfits]);
    }
    router.push(`/recommendations/${look.outfit.id}`);
  }

  return (
    <div className="container-app pt-8 sm:pt-12">
      <header className="animate-in mb-6">
        <h1 className="font-display text-3xl text-ink">Saved Looks</h1>
        <p className="mt-1 text-sm text-ink/60">Outfits you&rsquo;ve saved for later.</p>
      </header>

      {savedLooks.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-ink/60">No saved looks yet.</p>
          <button className="btn-primary mt-4" onClick={() => router.push("/")}>
            Find an outfit
          </button>
        </div>
      ) : (
        <div className="animate-in grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedLooks.map((look) => (
            <div key={look.id} className="card overflow-hidden">
              <div className="grid grid-cols-2 gap-0.5 bg-ink/5 p-0.5">
                {look.outfit.items.slice(0, 4).map((item) => (
                  <div key={`${item.slot}-${item.refId}`} className="aspect-square overflow-hidden">
                    <ItemGraphic
                      category={item.slot}
                      color={item.color}
                      imageDataUrl={item.imageDataUrl}
                      imageUrl={item.imageUrl}
                    />
                  </div>
                ))}
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg text-ink">{look.outfit.lookName}</h3>
                <p className="mt-0.5 text-xs text-ink/45">
                  {look.outfit.request.occasion} · Saved {new Date(look.savedAt).toLocaleDateString()}
                </p>
                <span
                  className={clsx(
                    "mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    look.outfit.withinBudget ? "bg-moss/10 text-moss" : "bg-rust/10 text-rust"
                  )}
                >
                  ₹{look.outfit.totalCost.toLocaleString("en-IN")}
                  {look.outfit.withinBudget ? " · within budget" : " · over budget"}
                </span>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openLook(look.id)} className="btn-primary flex-1 !py-2 text-sm">
                    View
                  </button>
                  <button
                    onClick={() => removeSavedLook(look.id)}
                    className="btn-secondary flex-1 !py-2 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
