import { NextRequest, NextResponse } from "next/server";
import { refineOutfit } from "@/lib/engine/outfitEngine";
import { Outfit, WardrobeItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const outfit: Outfit = body.outfit;
    const instruction: string = body.instruction;
    const wardrobe: WardrobeItem[] = body.wardrobe ?? [];

    if (!outfit || !instruction || !instruction.trim()) {
      return NextResponse.json({ error: "Missing outfit or instruction." }, { status: 400 });
    }

    const result = refineOutfit(outfit, instruction, wardrobe.filter((w) => w.confirmed));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Could not refine this look. Please try again." }, { status: 500 });
  }
}
