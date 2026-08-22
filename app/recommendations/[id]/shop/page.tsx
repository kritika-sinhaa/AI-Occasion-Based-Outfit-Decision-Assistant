"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import { ProductCard } from "@/components/ProductCard";

export default function ShopMissingItemsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const outfits = useAppStore((s) => s.outfits);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const outfit = useMemo(() => outfits.find((o) => o.id === params.id), [outfits, params.id]);

  if (!hasHydrated) return null;

  if (!outfit) {
    return (
      <div className="container-app pt-16 text-center">
        <p className="text-ink/60">We couldn&rsquo;t find that look.</p>
        <button className="btn-primary mt-4" onClick={() => router.push("/recommendations")}>
          Back to recommendations
        </button>
      </div>
    );
  }

  return (
    <div className="container-app pt-8 sm:pt-12">
      <button onClick={() => router.push(`/recommendations/${outfit.id}`)} className="btn-ghost mb-4 -ml-3">
        ← {outfit.lookName}
      </button>

      <header className="animate-in mb-6">
        <h1 className="font-display text-3xl text-ink">Shop the missing pieces</h1>
        <p className="mt-1 text-sm text-ink/60">
          Sample listings for demo purposes — prices and availability are illustrative, not live inventory.
        </p>
      </header>

      {outfit.toBuyItems.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-ink/60">You already own every piece in this look — nothing to buy.</p>
        </div>
      ) : (
        <>
          <div className="animate-in grid grid-cols-2 gap-4 sm:grid-cols-3">
            {outfit.toBuyItems.map((item) => (
              <ProductCard key={`${item.slot}-${item.refId}`} item={item} />
            ))}
          </div>
          <div className="card animate-in mt-6 flex items-center justify-between p-4">
            <span className="text-sm text-ink/60">Estimated total</span>
            <span className="font-display text-2xl text-ink">₹{outfit.totalCost.toLocaleString("en-IN")}</span>
          </div>
        </>
      )}
    </div>
  );
}
