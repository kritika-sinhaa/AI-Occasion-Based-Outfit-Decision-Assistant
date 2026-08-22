import { NextRequest, NextResponse } from "next/server";
import { generateOutfits } from "@/lib/engine/outfitEngine";
import { OutfitRequest, WardrobeItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const request: OutfitRequest = body.request;
    const wardrobe: WardrobeItem[] = body.wardrobe ?? [];

    if (!request || !request.occasion || !request.budget) {
      return NextResponse.json({ error: "Occasion and budget are required." }, { status: 400 });
    }
    if (request.budget <= 0) {
      return NextResponse.json({ error: "Budget must be a positive number." }, { status: 400 });
    }

    const outfits = generateOutfits(request, wardrobe.filter((w) => w.confirmed));
    return NextResponse.json({ outfits });
  } catch (err) {
    return NextResponse.json({ error: "Could not generate outfits. Please try again." }, { status: 500 });
  }
}
