import { Category } from "@/types";

export const departments = [
  "Front of House",
  "Back of House",
  "Bar",
  "Tech & POS",
  "Operations",
] as const;

export const categories: Category[] = [
  // Front of House
  { name: "Tables & Chairs", slug: "tables-chairs", department: "Front of House", icon: "🪑", description: "Dining tables, chairs, and seating for your dining room" },
  { name: "Bar Furniture & Stools", slug: "bar-furniture", department: "Front of House", icon: "🍺", description: "Bar tops, stools, and high-top seating" },
  { name: "Booths & Banquettes", slug: "booths-banquettes", department: "Front of House", icon: "🛋️", description: "Built-in booth seating and upholstered banquettes" },
  { name: "Host Stand & Waiting Area", slug: "host-stand", department: "Front of House", icon: "📋", description: "Host podiums, waiting benches, and entryway furniture" },
  { name: "Tableware", slug: "tableware", department: "Front of House", icon: "🍽️", description: "Plates, bowls, platters, and serving dishes" },
  { name: "Glassware", slug: "glassware", department: "Front of House", icon: "🥂", description: "Water glasses, wine glasses, beer glasses, tumblers" },
  { name: "Flatware", slug: "flatware", department: "Front of House", icon: "🍴", description: "Forks, knives, spoons, and specialty utensils" },
  { name: "Napkins & Linens", slug: "napkins-linens", department: "Front of House", icon: "🧵", description: "Table linens, cloth napkins, runners, and napkin holders" },
  { name: "Menu Holders & Displays", slug: "menu-displays", department: "Front of House", icon: "📖", description: "Menu boards, table tents, check presenters" },
  { name: "Lighting & Fixtures", slug: "lighting", department: "Front of House", icon: "💡", description: "Pendant lights, sconces, ambient lighting, and dimmers" },
  { name: "Decor & Wall Art", slug: "decor-art", department: "Front of House", icon: "🎨", description: "Wall art, plants, decorative accents, and sculptures" },
  { name: "Signage", slug: "signage", department: "Front of House", icon: "🪧", description: "Indoor and outdoor signs, neon, LED, and custom lettering" },

  // Back of House
  { name: "Commercial Ovens & Ranges", slug: "ovens-ranges", department: "Back of House", icon: "🔥", description: "Gas ranges, convection ovens, pizza ovens, and combi ovens" },
  { name: "Refrigeration", slug: "refrigeration", department: "Back of House", icon: "❄️", description: "Walk-in coolers, reach-in fridges, prep refrigerators" },
  { name: "Prep Tables & Work Stations", slug: "prep-tables", department: "Back of House", icon: "🔪", description: "Stainless steel prep tables, cutting stations, and work surfaces" },
  { name: "Sinks", slug: "sinks", department: "Back of House", icon: "🚰", description: "3-compartment sinks, hand wash stations, and mop sinks" },
  { name: "Dishwashing Equipment", slug: "dishwashing", department: "Back of House", icon: "🫧", description: "Commercial dishwashers, drying racks, and sanitizing systems" },
  { name: "Smallwares", slug: "smallwares", department: "Back of House", icon: "🍳", description: "Pots, pans, utensils, cutting boards, mixing bowls" },
  { name: "Storage & Shelving", slug: "storage-shelving", department: "Back of House", icon: "🗄️", description: "Wire shelving, dry storage, sheet pan racks" },
  { name: "Food Storage Containers", slug: "food-storage", department: "Back of House", icon: "📦", description: "Cambro containers, deli containers, label systems" },

  // Bar
  { name: "Bar Equipment", slug: "bar-equipment", department: "Bar", icon: "🧊", description: "Ice machines, blenders, draft systems, glass washers" },
  { name: "Barware", slug: "barware", department: "Bar", icon: "🍸", description: "Shakers, jiggers, strainers, muddlers, bar spoons" },
  { name: "Bar Glassware", slug: "bar-glassware", department: "Bar", icon: "🍷", description: "Cocktail glasses, pint glasses, snifters, flutes" },
  { name: "Bar Mats & Tools", slug: "bar-mats-tools", department: "Bar", icon: "🧰", description: "Bar mats, speed rails, bottle openers, pourers" },

  // Tech & POS
  { name: "POS Systems", slug: "pos-systems", department: "Tech & POS", icon: "💳", description: "Point of sale terminals, tablets, and payment processors" },
  { name: "Kitchen Display Systems", slug: "kitchen-display", department: "Tech & POS", icon: "📺", description: "KDS screens, ticket printers, and order management" },
  { name: "Reservation Systems", slug: "reservation-systems", department: "Tech & POS", icon: "📱", description: "Online booking, waitlist management, and table management" },
  { name: "Security Cameras", slug: "security-cameras", department: "Tech & POS", icon: "📹", description: "CCTV systems, IP cameras, and monitoring solutions" },

  // Operations
  { name: "Cleaning Supplies", slug: "cleaning-supplies", department: "Operations", icon: "🧹", description: "Commercial cleaners, sanitizers, mops, brooms" },
  { name: "Trash & Recycling", slug: "trash-recycling", department: "Operations", icon: "♻️", description: "Commercial trash cans, recycling bins, and waste management" },
  { name: "First Aid & Safety", slug: "first-aid-safety", department: "Operations", icon: "🩹", description: "First aid kits, fire extinguishers, wet floor signs" },
  { name: "Uniforms & Aprons", slug: "uniforms-aprons", department: "Operations", icon: "👨‍🍳", description: "Chef coats, server uniforms, aprons, and non-slip shoes" },
  { name: "To-Go Packaging", slug: "togo-packaging", department: "Operations", icon: "🥡", description: "Takeout containers, bags, utensils, and branded packaging" },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoriesByDepartment(department: string): Category[] {
  return categories.filter((c) => c.department === department);
}

export function getNeighborCategories(
  slug: string
): { prev: Category | null; next: Category | null } {
  const idx = categories.findIndex((c) => c.slug === slug);
  return {
    prev: idx > 0 ? categories[idx - 1] : null,
    next: idx < categories.length - 1 ? categories[idx + 1] : null,
  };
}

export function getRelatedCategories(slug: string, limit = 3): Category[] {
  const cat = getCategoryBySlug(slug);
  if (!cat) return [];
  return categories
    .filter((c) => c.slug !== slug && c.department === cat.department)
    .slice(0, limit);
}
