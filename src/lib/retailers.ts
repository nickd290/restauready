export interface RetailerInfo {
  name: string;
  shortName: string;
  color: string;
  searchUrl: (query: string) => string;
  favicon: string;
}

const retailers: Record<string, RetailerInfo> = {
  webstaurantstore: {
    name: "WebstaurantStore",
    shortName: "WebstaurantStore",
    color: "#1a6b3c",
    searchUrl: (q) => `https://www.webstaurantstore.com/search/${encodeURIComponent(q)}.html`,
    favicon: "https://www.google.com/s2/favicons?domain=webstaurantstore.com&sz=32",
  },
  amazon: {
    name: "Amazon",
    shortName: "Amazon",
    color: "#ff9900",
    searchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    favicon: "https://www.google.com/s2/favicons?domain=amazon.com&sz=32",
  },
  katom: {
    name: "Katom Restaurant Supply",
    shortName: "Katom",
    color: "#cc0000",
    searchUrl: (q) => `https://www.katom.com/search.html?w=${encodeURIComponent(q)}`,
    favicon: "https://www.google.com/s2/favicons?domain=katom.com&sz=32",
  },
  "restaurant depot": {
    name: "Restaurant Depot",
    shortName: "RD",
    color: "#003366",
    searchUrl: (q) => `https://www.restaurantdepot.com/search?q=${encodeURIComponent(q)}`,
    favicon: "https://www.google.com/s2/favicons?domain=restaurantdepot.com&sz=32",
  },
  wayfair: {
    name: "Wayfair Commercial",
    shortName: "Wayfair",
    color: "#7b2d8e",
    searchUrl: (q) => `https://www.wayfair.com/keyword.php?keyword=${encodeURIComponent(q)}`,
    favicon: "https://www.google.com/s2/favicons?domain=wayfair.com&sz=32",
  },
  "global industrial": {
    name: "Global Industrial",
    shortName: "Global",
    color: "#0066cc",
    searchUrl: (q) => `https://www.globalindustrial.com/g/search?q=${encodeURIComponent(q)}`,
    favicon: "https://www.google.com/s2/favicons?domain=globalindustrial.com&sz=32",
  },
  "superior seating": {
    name: "Superior Seating",
    shortName: "Sup. Seating",
    color: "#8b4513",
    searchUrl: (q) => `https://www.superiorseating.com/search?q=${encodeURIComponent(q)}`,
    favicon: "https://www.google.com/s2/favicons?domain=superiorseating.com&sz=32",
  },
  "sam's club": {
    name: "Sam's Club",
    shortName: "Sam's",
    color: "#0060a9",
    searchUrl: (q) => `https://www.samsclub.com/s/${encodeURIComponent(q)}`,
    favicon: "https://www.google.com/s2/favicons?domain=samsclub.com&sz=32",
  },
};

export function getRetailerInfo(retailerName: string): RetailerInfo | null {
  const key = retailerName.toLowerCase();
  // Exact match
  if (retailers[key]) return retailers[key];
  // Partial match
  for (const [k, v] of Object.entries(retailers)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

export function getRetailerSearchUrl(retailerName: string, productName: string): string {
  const info = getRetailerInfo(retailerName);
  if (info) return info.searchUrl(productName);
  return `https://www.google.com/search?q=${encodeURIComponent(productName + " " + retailerName + " buy")}`;
}

// Generate a product image search URL as fallback
export function getProductSearchImageUrl(productName: string): string {
  const query = encodeURIComponent(productName.replace(/[^\w\s]/g, "").trim());
  return `https://serpapi.com/search.json?q=${query}&tbm=isch`; // won't work without API key, but the concept is right
}
