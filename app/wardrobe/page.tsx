"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { useAppStore } from "@/lib/store/useAppStore";
import { processUpload } from "@/lib/ai/processUpload";
import { ClothingCategory, StyleTag, WardrobeItem } from "@/lib/types";
import { ItemGraphic } from "@/components/ItemGraphic";
import { COLOR_HEX } from "@/lib/ui/colors";
import clsx from "clsx";

const CATEGORIES: ClothingCategory[] = ["top", "bottom", "dress", "footwear", "outerwear", "bag", "jewelry", "accessory"];
const STYLE_TAGS: StyleTag[] = ["minimal", "elegant", "classic", "casual", "formal", "boho", "edgy", "trendy", "chic"];
const COLORS = Object.keys(COLOR_HEX);

type PendingItem = WardrobeItem & { confidence: number };

export default function WardrobePage() {
  const router = useRouter();
  const request = useAppStore((s) => s.request);
  const wardrobe = useAppStore((s) => s.wardrobe);
  const addWardrobeItem = useAppStore((s) => s.addWardrobeItem);
  const updateWardrobeItem = useAppStore((s) => s.updateWardrobeItem);
  const removeWardrobeItem = useAppStore((s) => s.removeWardrobeItem);

  const [pending, setPending] = useState<PendingItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setProcessing(true);
    const newPending: PendingItem[] = [];
    for (const file of Array.from(files)) {
      try {
        const { detected, imageDataUrl } = await processUpload(file);
        newPending.push({
          id: uuid(),
          category: detected.category,
          subCategory: detected.subCategory,
          color: detected.color,
          pattern: detected.pattern,
          styleTags: detected.styleTags,
          name: `${detected.color} ${labelForCategory(detected.category)}`,
          imageDataUrl,
          confirmed: false,
          source: "upload",
          createdAt: new Date().toISOString(),
          confidence: detected.confidence,
          // Tags the item with the shopping context it was added under, so switching gender
          // on a later request doesn't pull in items confirmed for a different one.
          gender: request?.gender,
        });
      } catch {
        // Skip unreadable files silently — the user still sees the ones that worked.
      }
    }
    setPending((prev) => [...prev, ...newPending]);
    setProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updatePending(id: string, patch: Partial<PendingItem>) {
    setPending((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function confirmPending(id: string) {
    const item = pending.find((p) => p.id === id);
    if (!item) return;
    const { confidence, ...rest } = item;
    addWardrobeItem({ ...rest, confirmed: true });
    setPending((prev) => prev.filter((p) => p.id !== id));
  }

  function discardPending(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id));
  }

  const confirmedItems = wardrobe.filter((w) => w.confirmed);

  return (
    <div className="container-app pt-8 sm:pt-12">
      <header className="animate-in mb-6">
        <h1 className="font-display text-3xl text-ink">My Wardrobe</h1>
        <p className="mt-1 max-w-lg text-sm text-ink/60">
          Upload photos of clothes you own. We&rsquo;ll guess the category and color — you confirm or fix it before it
          counts toward your outfits.
        </p>
      </header>

      <section className="card animate-in mb-8 p-5 sm:p-6" style={{ animationDelay: "60ms" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          id="wardrobe-upload"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <label
          htmlFor="wardrobe-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 py-10 text-center transition hover:border-clay hover:bg-cream-dark/40"
        >
          <UploadIcon className="h-8 w-8 text-ink/40" />
          <span className="text-sm font-medium text-ink">Tap to upload photos</span>
          <span className="text-xs text-ink/40">JPG or PNG · multiple files supported</span>
        </label>
        {processing && <p className="mt-3 text-center text-sm text-ink/50">Analyzing images…</p>}
      </section>

      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
            Confirm what we detected
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pending.map((item) => (
              <PendingCard
                key={item.id}
                item={item}
                onChange={(patch) => updatePending(item.id, patch)}
                onConfirm={() => confirmPending(item.id)}
                onDiscard={() => discardPending(item.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            Confirmed items ({confirmedItems.length})
          </h2>
        </div>
        {confirmedItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink/15 p-6 text-center text-sm text-ink/40">
            No wardrobe items yet. Upload a few photos above, or skip this and we&rsquo;ll recommend full outfits to
            buy.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {confirmedItems.map((item) => (
              <ConfirmedCard key={item.id} item={item} onRemove={() => removeWardrobeItem(item.id)} />
            ))}
          </div>
        )}
      </section>

      <div className="animate-in mt-10 flex justify-center">
        <button className="btn-primary" onClick={() => router.push("/recommendations")}>
          Continue to Recommendations
        </button>
      </div>
    </div>
  );
}

function PendingCard({
  item,
  onChange,
  onConfirm,
  onDiscard,
}: {
  item: PendingItem;
  onChange: (patch: Partial<PendingItem>) => void;
  onConfirm: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
          <ItemGraphic category={item.category} subCategory={item.subCategory} color={item.color} imageDataUrl={item.imageDataUrl} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-clay">
              AI detected · {Math.round(item.confidence * 100)}% confidence
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="input-field !py-1.5 text-sm"
              value={item.category}
              onChange={(e) => onChange({ category: e.target.value as ClothingCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {labelForCategory(c)}
                </option>
              ))}
            </select>
            <select
              className="input-field !py-1.5 text-sm"
              value={item.color}
              onChange={(e) => onChange({ color: e.target.value })}
            >
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <input
            className="input-field !py-1.5 text-sm"
            value={item.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Item name"
          />
          <div className="flex flex-wrap gap-1">
            {STYLE_TAGS.map((tag) => {
              const active = item.styleTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    onChange({
                      styleTags: active
                        ? item.styleTags.filter((t) => t !== tag)
                        : [...item.styleTags, tag],
                    })
                  }
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize transition",
                    active ? "bg-ink text-cream" : "bg-cream-dark text-ink/50"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex border-t border-ink/8">
        <button onClick={onDiscard} className="flex-1 py-2.5 text-sm font-medium text-ink/50 hover:bg-ink/5">
          Discard
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 border-l border-ink/8 py-2.5 text-sm font-semibold text-moss hover:bg-moss/5"
        >
          Looks good — Confirm
        </button>
      </div>
    </div>
  );
}

function ConfirmedCard({ item, onRemove }: { item: WardrobeItem; onRemove: () => void }) {
  return (
    <div className="card group relative overflow-hidden">
      <div className="aspect-square">
        <ItemGraphic category={item.category} subCategory={item.subCategory} color={item.color} imageDataUrl={item.imageDataUrl} />
      </div>
      <div className="p-2.5">
        <p className="truncate text-xs font-medium text-ink">{item.name}</p>
        <p className="text-[11px] text-ink/40">{labelForCategory(item.category)}</p>
      </div>
      <button
        onClick={onRemove}
        aria-label="Remove item"
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-cream opacity-0 transition group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

function labelForCategory(c: ClothingCategory): string {
  const map: Record<ClothingCategory, string> = {
    top: "Top",
    bottom: "Bottom",
    dress: "Dress",
    footwear: "Footwear",
    outerwear: "Outerwear",
    bag: "Bag",
    jewelry: "Jewelry",
    accessory: "Accessory",
  };
  return map[c];
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16 V4 M12 4 L7 9 M12 4 L17 9" />
      <path d="M4 16 V19 Q4 20 5 20 H19 Q20 20 20 19 V16" />
    </svg>
  );
}
