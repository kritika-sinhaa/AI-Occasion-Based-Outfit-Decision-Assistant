import { Outfit } from "@/lib/types";

/**
 * Produces the short, user-facing "Why this recommendation?" copy.
 *
 * This is deliberately template-based (deterministic), not a raw LLM call: the facts it
 * reports — style match, occasion fit, wardrobe reuse count, budget compliance — are all
 * already known with certainty from the engine's own state, so no generation step is
 * needed to get them right. Only wording varies. A real LLM integration (see
 * lib/ai/provider.ts) can replace the templating below with a generated sentence, but it
 * must still be constrained to state only these verified facts — never invent items,
 * prices, or availability. No chain-of-thought is ever surfaced to the user.
 */
export function explainOutfit(outfit: Outfit): string {
  const { request, matchedStyleTags, ownedItems, totalCost, withinBudget, budgetNote } = outfit;

  const styleLabel = matchedStyleTags.slice(0, 2).join(" and ");
  const occasionLabel = request.occasion || "your occasion";

  const parts: string[] = [];
  parts.push(`This look matches your ${styleLabel} style preference and fits ${occasionLabel.toLowerCase()}`);

  if (ownedItems.length > 0) {
    parts.push(
      `uses ${ownedItems.length} item${ownedItems.length > 1 ? "s" : ""} from your existing wardrobe`
    );
  }

  if (withinBudget) {
    parts.push(`stays within your ₹${request.budget.toLocaleString("en-IN")} budget`);
  } else {
    parts.push(`currently runs over your ₹${request.budget.toLocaleString("en-IN")} budget`);
  }

  let sentence = parts.join(", ") + ".";
  if (!withinBudget && budgetNote) {
    sentence += ` ${budgetNote}`;
  } else if (totalCost > 0) {
    sentence += ` Estimated ₹${totalCost.toLocaleString("en-IN")} to buy the missing pieces.`;
  } else {
    sentence += ` You already own everything for this look — nothing to buy.`;
  }

  return sentence;
}
