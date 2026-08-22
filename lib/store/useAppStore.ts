"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { Outfit, OutfitRequest, SavedLook, WardrobeItem } from "@/lib/types";
import { DEMO_REQUEST, DEMO_WARDROBE } from "@/lib/data/demo";

interface AppState {
  request: OutfitRequest | null;
  wardrobe: WardrobeItem[];
  outfits: Outfit[];
  activeOutfitId: string | null;
  savedLooks: SavedLook[];
  isDemo: boolean;
  hasHydrated: boolean;

  setRequest: (request: OutfitRequest) => void;
  loadDemoScenario: () => void;

  addWardrobeItem: (item: WardrobeItem) => void;
  updateWardrobeItem: (id: string, patch: Partial<WardrobeItem>) => void;
  removeWardrobeItem: (id: string) => void;

  setOutfits: (outfits: Outfit[]) => void;
  updateOutfit: (outfit: Outfit) => void;
  setActiveOutfitId: (id: string | null) => void;

  saveLook: (outfit: Outfit) => void;
  removeSavedLook: (id: string) => void;

  reset: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      request: null,
      wardrobe: [],
      outfits: [],
      activeOutfitId: null,
      savedLooks: [],
      isDemo: false,
      hasHydrated: false,

      setRequest: (request) => set({ request, isDemo: false }),

      loadDemoScenario: () =>
        set({
          request: DEMO_REQUEST,
          wardrobe: DEMO_WARDROBE.map((w) => ({ ...w, id: uuid() })),
          isDemo: true,
          outfits: [],
          activeOutfitId: null,
        }),

      addWardrobeItem: (item) => set({ wardrobe: [...get().wardrobe, item] }),
      updateWardrobeItem: (id, patch) =>
        set({
          wardrobe: get().wardrobe.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        }),
      removeWardrobeItem: (id) => set({ wardrobe: get().wardrobe.filter((w) => w.id !== id) }),

      setOutfits: (outfits) =>
        set({ outfits, activeOutfitId: outfits.length > 0 ? outfits[0].id : null }),
      updateOutfit: (outfit) =>
        set({ outfits: get().outfits.map((o) => (o.id === outfit.id ? outfit : o)) }),
      setActiveOutfitId: (id) => set({ activeOutfitId: id }),

      saveLook: (outfit) => {
        const existing = get().savedLooks.find((s) => s.outfit.id === outfit.id);
        if (existing) {
          set({
            savedLooks: get().savedLooks.map((s) =>
              s.outfit.id === outfit.id ? { ...s, outfit, savedAt: new Date().toISOString() } : s
            ),
          });
          return;
        }
        const savedLook: SavedLook = { id: uuid(), outfit, savedAt: new Date().toISOString() };
        set({ savedLooks: [savedLook, ...get().savedLooks] });
      },
      removeSavedLook: (id) => set({ savedLooks: get().savedLooks.filter((s) => s.id !== id) }),

      reset: () =>
        set({ request: null, wardrobe: [], outfits: [], activeOutfitId: null, isDemo: false }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "styleease-store",
      partialize: (state) => ({
        request: state.request,
        wardrobe: state.wardrobe,
        outfits: state.outfits,
        activeOutfitId: state.activeOutfitId,
        savedLooks: state.savedLooks,
        isDemo: state.isDemo,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
