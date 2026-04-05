// Category hero images from Unsplash (free, no API key)
// These are search-based URLs that return relevant photos

const categoryImages: Record<string, string> = {
  // Front of House
  "tables-chairs": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop",
  "bar-furniture": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop",
  "booths-banquettes": "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=400&fit=crop",
  "host-stand": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=400&fit=crop",
  "tableware": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop",
  "glassware": "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=800&h=400&fit=crop",
  "flatware": "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=800&h=400&fit=crop",
  "napkins-linens": "https://images.unsplash.com/photo-1507914997065-4bce4d0c62df?w=800&h=400&fit=crop",
  "menu-displays": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop",
  "lighting": "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=400&fit=crop",
  "decor-art": "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&h=400&fit=crop",
  "signage": "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&h=400&fit=crop",

  // Back of House
  "ovens-ranges": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=400&fit=crop",
  "refrigeration": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&h=400&fit=crop",
  "prep-tables": "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=400&fit=crop",
  "sinks": "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=400&fit=crop",
  "dishwashing": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop",
  "smallwares": "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=400&fit=crop",
  "storage-shelving": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop",
  "food-storage": "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=800&h=400&fit=crop",

  // Bar
  "bar-equipment": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=400&fit=crop",
  "barware": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=400&fit=crop",
  "bar-glassware": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=400&fit=crop",
  "bar-mats-tools": "https://images.unsplash.com/photo-1574006852726-75a1f4f2e29f?w=800&h=400&fit=crop",

  // Tech & POS
  "pos-systems": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
  "kitchen-display": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop",
  "reservation-systems": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop",
  "security-cameras": "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=400&fit=crop",

  // Operations
  "cleaning-supplies": "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=400&fit=crop",
  "trash-recycling": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=400&fit=crop",
  "first-aid-safety": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&h=400&fit=crop",
  "uniforms-aprons": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=400&fit=crop",
  "togo-packaging": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=400&fit=crop",
};

const departmentImages: Record<string, string> = {
  "Front of House": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=300&fit=crop",
  "Back of House": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=300&fit=crop",
  "Bar": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=300&fit=crop",
  "Tech & POS": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop",
  "Operations": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=300&fit=crop",
};

export function getCategoryImage(slug: string): string {
  return categoryImages[slug] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop";
}

export function getDepartmentImage(department: string): string {
  return departmentImages[department] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=300&fit=crop";
}

// Generate a fallback product image search URL when Perplexity doesn't return one
export function getProductImageFallback(productName: string): string {
  const query = encodeURIComponent(productName.split(" ").slice(0, 4).join(" "));
  return `https://source.unsplash.com/400x300/?${query},restaurant`;
}
