import { SavedItem, Product, CategoryProgress, StyleMemory } from "@/types";

const SAVED_KEY = "restauready_saved";
const PROGRESS_KEY = "restauready_progress";
const SEARCH_CACHE_PREFIX = "restauready_cache_";

// Saved items
export function getSavedItems(): SavedItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SAVED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedItem[];
  } catch {
    return [];
  }
}

export function saveItem(product: Product, categorySlug: string): void {
  const items = getSavedItems();
  const exists = items.some((i) => i.product.id === product.id);
  if (exists) return;
  items.push({ product, categorySlug, savedAt: new Date().toISOString() });
  localStorage.setItem(SAVED_KEY, JSON.stringify(items));
  // Update style memory when saving
  updateStyleMemory(product);
}

export function removeSavedItem(productId: string): void {
  const items = getSavedItems().filter((i) => i.product.id !== productId);
  localStorage.setItem(SAVED_KEY, JSON.stringify(items));
}

export function isItemSaved(productId: string): boolean {
  return getSavedItems().some((i) => i.product.id === productId);
}

export function getSavedByCategory(slug: string): SavedItem[] {
  return getSavedItems().filter((i) => i.categorySlug === slug);
}

// Category progress
export function getProgress(): CategoryProgress {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CategoryProgress;
  } catch {
    return {};
  }
}

export function setCategoryProgress(
  slug: string,
  status: "not-started" | "in-progress" | "done"
): void {
  const progress = getProgress();
  progress[slug] = status;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// Search cache
export interface CachedSearchResult {
  products: Product[];
  timestamp: number;
  isMock: boolean;
}

export function getCachedSearch(
  categorySlug: string
): CachedSearchResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SEARCH_CACHE_PREFIX + categorySlug);
  if (!raw) return null;
  try {
    const { products, timestamp, isMock } = JSON.parse(raw);
    // Cache for 1 hour
    if (Date.now() - timestamp > 3600000) {
      localStorage.removeItem(SEARCH_CACHE_PREFIX + categorySlug);
      return null;
    }
    return { products: products as Product[], timestamp, isMock: !!isMock };
  } catch {
    return null;
  }
}

export function cacheSearchResults(
  categorySlug: string,
  products: Product[],
  isMock: boolean = false
): void {
  localStorage.setItem(
    SEARCH_CACHE_PREFIX + categorySlug,
    JSON.stringify({ products, timestamp: Date.now(), isMock })
  );
}

// Style Memory — learns from saved products to maintain theme consistency
const STYLE_MEMORY_KEY = "restauready_style_memory";

export function getStyleMemory(): StyleMemory {
  if (typeof window === "undefined")
    return { keywords: [], materials: [], colors: [], vibes: [], savedProductNames: [] };
  const raw = localStorage.getItem(STYLE_MEMORY_KEY);
  if (!raw)
    return { keywords: [], materials: [], colors: [], vibes: [], savedProductNames: [] };
  try {
    return JSON.parse(raw) as StyleMemory;
  } catch {
    return { keywords: [], materials: [], colors: [], vibes: [], savedProductNames: [] };
  }
}

export function updateStyleMemory(product: Product): void {
  const mem = getStyleMemory();
  // Extract style signals from the product
  const text = `${product.name} ${product.description} ${product.fitReason} ${product.specs.join(" ")}`.toLowerCase();

  // Materials
  const materialWords = ["leather", "brass", "copper", "wood", "oak", "walnut", "marble", "velvet", "steel", "iron", "glass", "concrete", "reclaimed", "tufted", "upholstered", "linen", "wicker", "rattan", "chrome", "gold", "bronze", "ceramic", "porcelain", "stone", "slate", "terrazzo", "bamboo", "mahogany", "cherry", "pine", "metal", "wrought iron", "stainless"];
  materialWords.forEach((m) => {
    if (text.includes(m) && !mem.materials.includes(m)) mem.materials.push(m);
  });

  // Colors
  const colorWords = ["black", "dark", "brown", "tan", "cognac", "burgundy", "navy", "forest green", "charcoal", "espresso", "mocha", "cream", "ivory", "white", "natural", "gray", "grey", "amber", "rust", "olive", "sage", "terracotta", "wine", "deep red", "midnight", "gold"];
  colorWords.forEach((c) => {
    if (text.includes(c) && !mem.colors.includes(c)) mem.colors.push(c);
  });

  // Vibe/aesthetic keywords
  const vibeWords = ["speakeasy", "vintage", "retro", "industrial", "rustic", "modern", "minimalist", "art deco", "mid-century", "edison", "prohibition", "classic", "elegant", "upscale", "cozy", "intimate", "moody", "dim", "ambient", "warm", "sophisticated", "traditional", "contemporary", "luxurious", "handcrafted", "artisan"];
  vibeWords.forEach((v) => {
    if (text.includes(v) && !mem.vibes.includes(v)) mem.vibes.push(v);
  });

  // Track product names for context
  if (!mem.savedProductNames.includes(product.name)) {
    mem.savedProductNames.push(product.name);
    // Keep only last 20
    if (mem.savedProductNames.length > 20) {
      mem.savedProductNames = mem.savedProductNames.slice(-20);
    }
  }

  localStorage.setItem(STYLE_MEMORY_KEY, JSON.stringify(mem));
}

export function getStyleContext(): string {
  const mem = getStyleMemory();
  const parts: string[] = [];
  if (mem.materials.length > 0) parts.push(`Materials they gravitate toward: ${mem.materials.join(", ")}`);
  if (mem.colors.length > 0) parts.push(`Color palette preferences: ${mem.colors.join(", ")}`);
  if (mem.vibes.length > 0) parts.push(`Aesthetic vibes: ${mem.vibes.join(", ")}`);
  if (mem.savedProductNames.length > 0) parts.push(`Previously saved products include: ${mem.savedProductNames.slice(-8).join(", ")}`);
  if (parts.length === 0) return "";
  return `\n\nSTYLE MEMORY — This owner has already saved items in other categories. Based on their choices, maintain consistency with these preferences:\n${parts.join("\n")}`;
}

// Data export
export function exportAllData(): string {
  const profile = localStorage.getItem("restauready_profile");
  const saved = localStorage.getItem(SAVED_KEY);
  const progress = localStorage.getItem(PROGRESS_KEY);
  return JSON.stringify(
    {
      profile: profile ? JSON.parse(profile) : null,
      saved: saved ? JSON.parse(saved) : [],
      progress: progress ? JSON.parse(progress) : {},
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}
