"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import { ItemGraphic } from "@/components/ItemGraphic";
import { OwnedItemRow } from "@/components/OwnedItemRow";
import { ProductCard } from "@/components/ProductCard";
import clsx from "clsx";

const QUICK_REFINEMENTS = [
  "Make it more casual",
  "Keep it under ₹3,000",
  "Replace the heels with flats",
  "I don't like black",
  "Use more of my wardrobe",
];

export default function OutfitDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const outfits = useAppStore((s) => s.outfits);
  const wardrobe = useAppStore((s) => s.wardrobe);
  const updateOutfit = useAppStore((s) => s.updateOutfit);
  const saveLook = useAppStore((s) => s.saveLook);
  const savedLooks = useAppStore((s) => s.savedLooks);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const outfit = useMemo(() => outfits.find((o) => o.id === params.id), [outfits, params.id]);
  const isSaved = useMemo(() => savedLooks.some((s) => s.outfit.id === params.id), [savedLooks, params.id]);

  const [instruction, setInstruction] = useState("");
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  async function handleRefine(text: string) {
    if (!outfit || !text.trim()) return;
    setRefining(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outfit, instruction: text, wardrobe }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not refine this look.");
      updateOutfit(data.outfit);
      setInstruction("");
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "Could not refine this look.");
    } finally {
      setRefining(false);
    }
  }

  function handleSave() {
    if (!outfit) return;
    saveLook(outfit);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  if (!hasHydrated) return null;

  if (!outfit) {
    return (
      <div className="container-app pt-16 text-center">
        <p className="text-ink/60">We couldn&rsquo;t find that look — it may have expired.</p>
        <button className="btn-primary mt-4" onClick={() => router.push("/recommendations")}>
          Back to recommendations
        </button>
      </div>
    );
  }

  return (
    <div className="container-app pt-8 sm:pt-12">
      <button onClick={() => router.push("/recommendations")} className="btn-ghost mb-4 -ml-3">
        ← All looks
      </button>

      <header className="animate-in mb-6">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{outfit.lookName}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="pill">{outfit.request.occasion}</span>
          <span className="pill">{outfit.request.location}</span>
          <span className="pill">{outfit.request.date}</span>
          <span className="pill">{outfit.request.style}</span>
        </div>
      </header>

      <section
        className={clsx(
          "animate-in mb-6 rounded-xl2 border p-4 sm:p-5",
          outfit.withinBudget ? "border-moss/25 bg-moss/5" : "border-rust/25 bg-rust/5"
        )}
        style={{ animationDelay: "60ms" }}
      >
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/45">
          Why this recommendation?
        </p>
        <p className="text-sm leading-relaxed text-ink/80">{outfit.whyExplanation}</p>
      </section>

      <div className="animate-in mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4" style={{ animationDelay: "100ms" }}>
        {outfit.items.map((item) => (
          <div key={`${item.slot}-${item.refId}`} className="aspect-square overflow-hidden rounded-xl2">
            <ItemGraphic category={item.slot} subCategory={item.subCategory} color={item.color} imageDataUrl={item.imageDataUrl} />
          </div>
        ))}
      </div>

      {outfit.ownedItems.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
            Already in your wardrobe
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {outfit.ownedItems.map((item) => (
              <OwnedItemRow key={`${item.slot}-${item.refId}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {outfit.toBuyItems.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Recommended to buy</h2>
            <span className="text-sm font-semibold text-ink">
              Est. ₹{outfit.totalCost.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {outfit.toBuyItems.map((item) => (
              <ProductCard key={`${item.slot}-${item.refId}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {!outfit.withinBudget && outfit.budgetNote && (
        <section className="mb-8 rounded-xl2 border border-rust/25 bg-rust/5 p-4">
          <p className="text-sm text-rust">{outfit.budgetNote}</p>
        </section>
      )}

      <section className="card animate-in mb-8 p-4 sm:p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink/50">Refine this look</h2>
        <p className="mb-3 text-xs text-ink/45">
          Tell us what to change — occasion, location, and date stay the same unless you say otherwise.
        </p>

        {outfit.refinementHistory.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {outfit.refinementHistory.map((h, i) => (
              <span key={i} className="pill bg-clay/10 text-accent">
                {h}
              </span>
            ))}
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-1.5">
          {QUICK_REFINEMENTS.map((q) => (
            <button
              key={q}
              onClick={() => handleRefine(q)}
              disabled={refining}
              className="pill transition hover:border-ink/30 hover:text-ink disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRefine(instruction);
          }}
          className="flex gap-2"
        >
          <input
            className="input-field"
            placeholder="e.g. Make it more minimal"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={refining}
          />
          <button type="submit" className="btn-primary shrink-0" disabled={refining || !instruction.trim()}>
            {refining ? "Refining…" : "Refine"}
          </button>
        </form>
        {refineError && <p className="mt-2 text-sm text-rust">{refineError}</p>}
      </section>

      <div className="animate-in flex flex-col gap-2 sm:flex-row">
        <button onClick={handleSave} className="btn-primary flex-1">
          {savedFlash ? "✓ Saved" : isSaved ? "Update Saved Look" : "Save Look"}
        </button>
        {outfit.toBuyItems.length > 0 && (
          <a href={`/recommendations/${outfit.id}/shop`} className="btn-secondary flex-1 text-center">
            Shop Missing Items
          </a>
        )}
        <button onClick={() => router.push("/recommendations")} className="btn-secondary flex-1">
          Try Another Look
        </button>
      </div>
    </div>
  );
}
