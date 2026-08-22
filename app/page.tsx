"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import { Gender, OutfitRequest } from "@/lib/types";
import clsx from "clsx";

const STYLE_SUGGESTIONS = ["Minimal & Elegant", "Classic & Formal", "Boho & Casual", "Chic & Trendy", "Edgy"];

export default function HomePage() {
  const router = useRouter();
  const setRequest = useAppStore((s) => s.setRequest);
  const loadDemoScenario = useAppStore((s) => s.loadDemoScenario);
  const wardrobeCount = useAppStore((s) => s.wardrobe.length);

  const [occasion, setOccasion] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");
  const [style, setStyle] = useState("");
  const [gender, setGender] = useState<Gender>("women");
  const [error, setError] = useState<string | null>(null);

  function buildRequest(): OutfitRequest | null {
    if (!occasion.trim()) {
      setError("Tell us the occasion — e.g. “Night party”.");
      return null;
    }
    const budgetNum = Number(budget);
    if (!budget || Number.isNaN(budgetNum) || budgetNum <= 0) {
      setError("Enter a budget greater than ₹0.");
      return null;
    }
    setError(null);
    return {
      occasion: occasion.trim(),
      location: location.trim() || "Not specified",
      date: date || new Date().toISOString().slice(0, 10),
      budget: budgetNum,
      style: style.trim() || "Classic",
      gender,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const request = buildRequest();
    if (!request) return;
    setRequest(request);
    router.push("/recommendations");
  }

  function handleAddWardrobe() {
    const request = buildRequest();
    if (!request) return;
    setRequest(request);
    router.push("/wardrobe");
  }

  function handleDemo() {
    loadDemoScenario();
    router.push("/recommendations");
  }

  return (
    <div className="container-app pt-10 sm:pt-16">
      <section className="animate-in mb-10 text-center sm:mb-14">
        <p className="pill mx-auto mb-4 w-fit">AI Occasion-Based Outfit Decision Assistant</p>
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          What are you
          <br className="sm:hidden" /> dressing for?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-ink/60">
          Tell us where you&rsquo;re going, and we&rsquo;ll help you decide what to wear in minutes.
        </p>
      </section>

      <section className="card animate-in mx-auto max-w-xl p-5 sm:p-8" style={{ animationDelay: "80ms" }}>
        <div className="mb-6 flex justify-center gap-2">
          {(["women", "men", "unisex"] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={clsx(
                "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition",
                gender === g ? "bg-ink text-cream" : "bg-cream-dark text-ink/60 hover:text-ink"
              )}
            >
              {g}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text" htmlFor="occasion">
              Occasion
            </label>
            <input
              id="occasion"
              className="input-field"
              placeholder="e.g. Night party, Wedding, Office meeting"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className="input-field"
                placeholder="Bangalore"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-text" htmlFor="budget">
              Budget (₹)
            </label>
            <input
              id="budget"
              type="number"
              min={1}
              inputMode="numeric"
              className="input-field"
              placeholder="5000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div>
            <label className="label-text" htmlFor="style">
              Preferred style
            </label>
            <input
              id="style"
              className="input-field"
              placeholder="Minimal / Elegant"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STYLE_SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStyle(s)}
                  className="pill hover:border-ink/30 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-rust">{error}</p>}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Get My Outfit
            </button>
            <button type="button" onClick={handleAddWardrobe} className="btn-secondary w-full sm:w-auto">
              Add My Wardrobe {wardrobeCount > 0 ? `(${wardrobeCount})` : "(optional)"}
            </button>
          </div>
        </form>
      </section>

      <section className="animate-in mx-auto mt-8 max-w-xl text-center" style={{ animationDelay: "160ms" }}>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink/35">
          <span className="h-px flex-1 bg-ink/10" />
          or
          <span className="h-px flex-1 bg-ink/10" />
        </div>
        <button onClick={handleDemo} className="btn-ghost mt-4 border border-ink/10">
          ✨ Try Demo — see the full experience instantly
        </button>
        <p className="mt-2 text-xs text-ink/40">
          Loads a sample night-party scenario with a demo wardrobe. No sign-up needed.
        </p>
      </section>
    </div>
  );
}
