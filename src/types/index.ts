export interface RestaurantProfile {
  name: string;
  cuisineType: string;
  seatingCapacity: "small" | "medium" | "large";
  style: string;
  budgetTier: "budget" | "midrange" | "premium";
  location: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  retailer: string;
  url: string;
  imageUrl: string;
  description: string;
  fitReason: string;
  specs: string[];
}

export interface SavedItem {
  product: Product;
  categorySlug: string;
  savedAt: string;
}

export interface CategoryProgress {
  [slug: string]: "not-started" | "in-progress" | "done";
}

export interface Category {
  name: string;
  slug: string;
  department: string;
  icon: string;
  description: string;
}

export interface StyleMemory {
  keywords: string[];
  materials: string[];
  colors: string[];
  vibes: string[];
  savedProductNames: string[];
}

export interface ConceptPreset {
  id: string;
  name: string;
  tagline: string;
  cuisineType: string;
  style: string;
  budgetTier: "budget" | "midrange" | "premium";
  styleKeywords: string[];
}
