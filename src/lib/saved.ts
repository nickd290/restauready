import { SavedItem, Product, CategoryProgress } from "@/types";

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
