# StyleEase — AI Occasion-Based Outfit Decision Assistant

> "Tell us where you're going, and we'll help you decide what to wear in minutes."

StyleEase is an MVP consumer app that turns an occasion ("Night party in Bangalore, ₹5,000,
minimal & elegant") into 2–3 complete, budget-aware outfits — prioritizing clothes the user
already owns and showing exactly what's left to buy.

## Try it in 60 seconds

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **✨ Try Demo** on the home
screen. It loads a sample night-party scenario with a 4-item demo wardrobe and generates
real recommendations — no sign-up, no uploads required.

## Product flow

1. **Home** (`/`) — occasion, location, date, budget, style, gender. Optional "Add My
   Wardrobe" step.
2. **Wardrobe Upload** (`/wardrobe`) — upload clothing photos; a mock/demo classifier
   guesses category + color, the user confirms or corrects every item before it counts.
3. **AI Recommendation Results** (`/recommendations`) — 2–3 generated outfits with a budget
   badge and a one-line "why" summary.
4. **Outfit Details** (`/recommendations/[id]`) — full breakdown (owned vs. to-buy), the
   "Why this recommendation?" explanation, and natural-language refinement.
5. **Product Recommendations** (`/recommendations/[id]/shop`) — dedicated shopping screen
   for the missing pieces, each with a real Buy Now deep link.
6. **Saved Looks** (`/saved`) — outfits saved for later.

## Architecture

Next.js 14 (App Router, TypeScript) + Tailwind. Client state (wardrobe, current request,
generated outfits, saved looks) lives in a Zustand store persisted to `localStorage`, so the
app works fully offline with no login. Two API routes (`/api/generate`, `/api/refine`) host
the recommendation engine server-side.

```
lib/
  types.ts              domain model shared by engine, store, and UI
  data/catalog.ts        mock product catalog (demo data — see below)
  data/demo.ts            the "Try Demo" scenario
  engine/parse.ts          occasion + free-text style -> structured tags (rule-based NLU)
  engine/compose.ts         slot-filling outfit composer + budget enforcement
  engine/refine.ts           natural-language refinement parser
  engine/outfitEngine.ts      generate 2-3 outfits / apply a refinement
  ai/explain.ts               "Why this recommendation?" copy generator
  ai/vision.ts                 mock/demo wardrobe image classifier
```

### AI vs. deterministic logic

This is the central AI-PM decision the project demonstrates: **the LLM/AI layer proposes,
deterministic code enforces.**

- **Deterministic (`lib/engine/`)**: budget math, which items are "owned" vs. "to buy",
  slot-filling, and the hard-budget guardrail. These must always be correct, so they're
  plain, testable TypeScript — never left to a model.
- **AI-shaped (`lib/ai/`)**: understanding free-text style/occasion input, generating the
  natural-language explanation, and interpreting refinement instructions. These are
  implemented as rule-based/template stand-ins today (deliberately, so the MVP runs with
  zero API keys and is fully deterministic to demo), but are isolated behind small
  functions specifically so a real LLM call can be swapped in later without touching the
  budget/inventory logic.

### Guardrails implemented

1. An outfit is never presented as fitting the budget when it doesn't — if no combination
   fits, the UI says so explicitly and suggests a next step (`budgetNote`).
2. Every item is visibly tagged "In your wardrobe" or shown as a priced product to buy.
3. A wardrobe item only counts once the user has confirmed it (`confirmed: true`) —
   nothing is assumed owned from an upload alone.
4. Detected category/color/pattern are always editable before confirmation.
5. Every AI suggestion (outfit, detected item) can be edited, corrected, or discarded.
6. The product catalog is explicitly labeled demo/sample data throughout the UI; no live
   price or availability is claimed.
7. If a look can't fit the stated budget, the app says so and suggests raising the budget
   or reusing more wardrobe items — it doesn't silently go over.
8. Refinement preserves occasion, location, and date unless the instruction explicitly
   changes them; only style, budget, colors, and item swaps are mutable.

### Mock product catalog & "Buy Now" links

`lib/data/catalog.ts` holds ~55 sample products across categories, genders, and price
points. Since there's no live retailer integration, `lib/data/urls.ts` builds each **Buy
Now** link as a real, working *search* deep-link on the retailer (e.g.
`myntra.com/search?q=...`, `amazon.in/s?k=...`) — not the bare homepage. Swapping in a real
product feed or affiliate API later only means replacing this one file.

Each catalog/wardrobe item without a real uploaded photo is shown as a colored tile with a
category icon (`components/ItemGraphic.tsx`) rather than a stock photo — a keyword-matched
real-photo service (tried during development) turned out to return essentially unrelated
photos for many fashion terms, which looked worse than a clean placeholder for a mock listing.

### Wardrobe image analysis

`lib/ai/vision.ts` runs client-side: it extracts the image's real dominant color via canvas
pixel averaging, and guesses category from the filename as a stand-in for a full vision
model. Confidence is always shown, and the item isn't added to the wardrobe until the user
confirms or corrects it — human-in-the-loop by design, not a shortcut.

## What's intentionally out of scope

Payments, authentication, seller onboarding, live inventory, and social features — per the
MVP brief. Persistence is client-side `localStorage`; no server database is required to run
or demo the app.
