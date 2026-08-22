"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import { Outfit } from "@/lib/types";
import { OutfitSummaryCard } from "@/components/OutfitSummaryCard";
import { LoadingLooks } from "@/components/LoadingLooks";

export default function RecommendationsPage() {
  const router = useRouter();
  const request = useAppStore((s) => s.request);
  const wardrobe = useAppStore((s) => s.wardrobe);
  const outfits = useAppStore((s) => s.outfits);
  const setOutfits = useAppStore((s) => s.setOutfits);
  const setActiveOutfitId = useAppStore((s) => s.setActiveOutfitId);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!request) return;
    setLoading(true);
    setError(null);
    // On "Regenerate looks" (outfits already populated), steer away from items already shown
    // so a second click surfaces different picks instead of the same deterministic result.
    const excludeRefIds = outfits.flatMap((o) => o.items.map((i) => i.refId));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request, wardrobe, excludeRefIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setOutfits(data.outfits as Outfit[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasHydrated) return;
    if (!request) {
      router.replace("/");
      return;
    }
    if (outfits.length === 0) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, request]);

  if (!hasHydrated || !request) return null;

  function viewOutfit(outfit: Outfit) {
    setActiveOutfitId(outfit.id);
    router.push(`/recommendations/${outfit.id}`);
  }

  return (
    <div className="container-app pt-8 sm:pt-12">
      <header className="animate-in mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="pill mb-2">{request.occasion}</p>
          <h1 className="font-display text-3xl text-ink">Your outfit picks</h1>
          <p className="mt-1 text-sm text-ink/60">
            {request.location} · ₹{request.budget.toLocaleString("en-IN")} budget · {request.style}
          </p>
        </div>
        <button onClick={() => router.push("/")} className="btn-ghost hidden shrink-0 sm:inline-flex">
          Edit details
        </button>
      </header>

      {loading && <LoadingLooks />}

      {error && !loading && (
        <div className="card p-6 text-center">
          <p className="text-sm text-rust">{error}</p>
          <button onClick={generate} className="btn-secondary mt-4">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && outfits.length > 0 && (
        <>
          <div className="animate-in grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {outfits.map((outfit, i) => (
              <OutfitSummaryCard key={outfit.id} outfit={outfit} index={i} onView={() => viewOutfit(outfit)} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button onClick={generate} className="btn-ghost border border-ink/10">
              ↻ Regenerate looks
            </button>
          </div>
        </>
      )}
    </div>
  );
}
