export interface TimelinePhase {
  id: string;
  name: string;
  weeksBeforeOpen: number;
  description: string;
  categories: string[]; // category slugs
  tips: string[];
}

// Standard restaurant opening timeline
// Adapted for different restaurant types
export const baseTimeline: TimelinePhase[] = [
  {
    id: "phase-1",
    name: "Design & Planning",
    weeksBeforeOpen: 16,
    description: "Lock in your concept, floor plan, and design direction. Source large custom items first — they have the longest lead times.",
    categories: ["lighting", "booths-banquettes", "signage", "decor-art"],
    tips: [
      "Custom booths and banquettes can take 8-12 weeks to fabricate",
      "Custom signage (neon, LED, handpainted) needs 6-8 weeks",
      "Order light fixtures early — backorders are common",
      "Get your floor plan finalized before ordering ANY furniture",
    ],
  },
  {
    id: "phase-2",
    name: "Heavy Equipment",
    weeksBeforeOpen: 12,
    description: "Order commercial kitchen equipment, refrigeration, and plumbing-dependent items. These need installation coordination.",
    categories: ["ovens-ranges", "refrigeration", "sinks", "dishwashing", "bar-equipment"],
    tips: [
      "Walk-in coolers need 4-6 weeks lead time plus installation",
      "Commercial ovens ship freight — plan for dock delivery",
      "Coordinate with your plumber before ordering sinks",
      "Ice machines need water lines and drainage — plan placement early",
      "Get equipment specs to your electrician NOW for panel planning",
    ],
  },
  {
    id: "phase-3",
    name: "Furniture & Fixtures",
    weeksBeforeOpen: 8,
    description: "Tables, chairs, bar stools, host stand. Stock items ship fast; custom finishes add 4-6 weeks.",
    categories: ["tables-chairs", "bar-furniture", "host-stand", "storage-shelving", "prep-tables"],
    tips: [
      "Order 10-15% extra chairs — they break, get stolen, or wear out",
      "Bar stools take more abuse than any other furniture — buy commercial grade",
      "Stock finishes ship in 1-2 weeks; custom colors add 4-6 weeks",
      "Measure your doorways — commercial tables often don't fit through standard doors",
    ],
  },
  {
    id: "phase-4",
    name: "Tech & Systems",
    weeksBeforeOpen: 6,
    description: "POS, kitchen display, reservation system, security. Need time for setup, testing, and staff training.",
    categories: ["pos-systems", "kitchen-display", "reservation-systems", "security-cameras"],
    tips: [
      "POS systems need 2-3 weeks for menu programming and testing",
      "Train staff on POS at least 1 week before opening",
      "Kitchen display systems need network infrastructure — coordinate with your IT",
      "Security cameras: install before opening, not after the first incident",
      "Set up online ordering and delivery integrations during this phase",
    ],
  },
  {
    id: "phase-5",
    name: "Tabletop & Smallwares",
    weeksBeforeOpen: 4,
    description: "Plates, glasses, flatware, napkins, kitchen tools. High-volume items that ship quickly.",
    categories: ["tableware", "glassware", "flatware", "napkins-linens", "smallwares", "food-storage", "barware", "bar-glassware", "bar-mats-tools", "menu-displays"],
    tips: [
      "Buy 2x your seating count in glasses — breakage is constant",
      "Flatware: budget for 3x your seating count (some always in the dishwasher)",
      "Order backup plates — your first shipment WILL have chips",
      "Bar: buy more cocktail glasses than you think you need",
      "Cloth napkins need a laundry service contract — set that up now",
    ],
  },
  {
    id: "phase-6",
    name: "Operations & Final Details",
    weeksBeforeOpen: 2,
    description: "Cleaning supplies, safety equipment, uniforms, packaging. The stuff you forget until you need it.",
    categories: ["cleaning-supplies", "trash-recycling", "first-aid-safety", "uniforms-aprons", "togo-packaging"],
    tips: [
      "First aid kit is legally required — don't skip this",
      "Fire extinguisher placement has code requirements — check with your inspector",
      "Order staff uniforms 2 weeks early for sizing exchanges",
      "To-go packaging: start with small quantities until you know your mix",
      "Cleaning supplies: set up auto-delivery so you never run out",
      "Non-slip shoes for kitchen staff — require them, don't suggest them",
    ],
  },
];

// Speakeasy-specific additions
export const speakeasyTips: string[] = [
  "Speakeasy lighting is EVERYTHING — under-order brightness, over-order dimmers and Edison bulbs",
  "Tufted leather booths are your signature piece — don't cheap out, order 12+ weeks early",
  "Brass and copper fixtures need to match — order from one supplier to ensure consistency",
  "Hidden entrance or unique entry experience should be designed in Phase 1",
  "Cocktail program drives the bar build — consult your bartender before ordering barware",
  "Vintage-style glassware (coupe glasses, crystal-cut rocks glasses) ships slower than standard",
  "Art deco signage and custom neon take 6-8 weeks — design it in Phase 1",
];

export function getTimelineForProfile(cuisineType: string, style: string): TimelinePhase[] {
  const timeline = baseTimeline.map((phase) => ({ ...phase, tips: [...phase.tips] }));

  // Add speakeasy-specific tips
  if (style.toLowerCase().includes("dark") || style.toLowerCase().includes("speakeasy") || cuisineType.toLowerCase().includes("steakhouse")) {
    timeline[0].tips.push(...speakeasyTips.slice(0, 3));
    timeline[2].tips.push(speakeasyTips[1]);
    timeline[4].tips.push(speakeasyTips[5]);
  }

  // Add steakhouse-specific tips
  if (cuisineType.toLowerCase().includes("steakhouse")) {
    timeline[1].tips.push("Steakhouse grills/broilers need heavy-duty ventilation — coordinate with HVAC early");
    timeline[4].tips.push("Steak knives: buy premium — they're part of the dining experience");
    timeline[4].tips.push("Wine glasses: budget for stem and stemless varieties for red/white");
  }

  return timeline;
}
