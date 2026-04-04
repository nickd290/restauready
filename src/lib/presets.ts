import { ConceptPreset } from "@/types";

export const conceptPresets: ConceptPreset[] = [
  {
    id: "speakeasy-steakhouse",
    name: "Speakeasy Steakhouse",
    tagline: "Prohibition-era elegance meets premium cuts",
    cuisineType: "Steakhouse",
    style: "Sleek & Dark",
    budgetTier: "premium",
    styleKeywords: [
      "speakeasy", "prohibition-era", "dark leather", "brass accents",
      "Edison bulbs", "tufted booths", "dark wood", "moody lighting",
      "cocktail-forward", "vintage barware", "art deco details",
      "exposed brick", "velvet", "cognac leather", "low lighting",
    ],
  },
  {
    id: "modern-italian",
    name: "Modern Italian Trattoria",
    tagline: "Contemporary takes on old-world charm",
    cuisineType: "Italian",
    style: "Classic / Traditional",
    budgetTier: "midrange",
    styleKeywords: [
      "rustic wood", "terracotta", "olive tones", "warm lighting",
      "open kitchen", "wine display", "handmade ceramics",
    ],
  },
  {
    id: "fast-casual-modern",
    name: "Fast Casual Modern",
    tagline: "Clean lines, quick service, Instagram-ready",
    cuisineType: "Fast Casual",
    style: "Modern / Minimalist",
    budgetTier: "midrange",
    styleKeywords: [
      "clean lines", "natural wood", "white walls", "pendant lights",
      "minimalist", "subway tile", "open concept",
    ],
  },
  {
    id: "rustic-bbq",
    name: "Rustic BBQ & Smokehouse",
    tagline: "Reclaimed wood, iron, and smoke",
    cuisineType: "BBQ / Smokehouse",
    style: "Rustic / Farmhouse",
    budgetTier: "midrange",
    styleKeywords: [
      "reclaimed wood", "galvanized metal", "mason jars",
      "picnic-style", "butcher block", "cast iron", "barn doors",
    ],
  },
  {
    id: "upscale-seafood",
    name: "Upscale Seafood House",
    tagline: "Coastal sophistication with nautical details",
    cuisineType: "Seafood",
    style: "Coastal / Nautical",
    budgetTier: "premium",
    styleKeywords: [
      "coastal blue", "driftwood", "rope accents", "whitewashed",
      "raw bar", "oyster plates", "maritime art", "linen",
    ],
  },
];

export function getPresetById(id: string): ConceptPreset | undefined {
  return conceptPresets.find((p) => p.id === id);
}
