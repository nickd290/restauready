import { NextRequest } from "next/server";
import { Product, RestaurantProfile } from "@/types";

export async function POST(request: NextRequest) {
  const { categoryName, categoryDescription, profile, page = 1, styleContext = "" } =
    (await request.json()) as {
      categoryName: string;
      categoryDescription: string;
      profile: RestaurantProfile;
      page?: number;
      styleContext?: string;
    };

  const capacityLabel =
    profile.seatingCapacity === "small"
      ? "small (under 30 seats)"
      : profile.seatingCapacity === "medium"
        ? "medium (30-80 seats)"
        : "large (80+ seats)";

  const budgetLabel =
    profile.budgetTier === "budget"
      ? "budget-friendly"
      : profile.budgetTier === "midrange"
        ? "mid-range"
        : "premium/high-end";

  const offset = (page - 1) * 10;
  const pageContext =
    page > 1
      ? `\nThis is page ${page}. Return products ${offset + 1}-${offset + 10} — different from the first ${offset} products. Show NEW options not previously listed.`
      : "";

  const prompt = `Find 10 specific commercial restaurant ${categoryName} products available for purchase online.
Context: This is for "${profile.name}", a ${profile.cuisineType} restaurant with ${capacityLabel} capacity, ${profile.style} aesthetic, and a ${budgetLabel} budget.
Category details: ${categoryDescription}${pageContext}${styleContext}

For each product, provide:
1. Product name (specific brand and model)
2. Approximate price or price range
3. Retailer name (WebstaurantStore, Amazon, Katom, Restaurant Depot, Wayfair, etc.)
4. Direct URL to purchase (must be a real, working product page URL)
5. A brief description (1-2 sentences)
6. Why it fits this restaurant's profile
7. Key specs (2-3 bullet points: dimensions, material, capacity, etc.)

Focus on products that match the ${profile.style} aesthetic and ${budgetLabel} price point.
Return products from multiple retailers for price comparison.

IMPORTANT: Return ONLY valid JSON in this exact format, no other text:
{
  "products": [
    {
      "name": "Product Name",
      "price": "$XX - $XX",
      "retailer": "Retailer Name",
      "url": "https://...",
      "description": "Brief description",
      "fitReason": "Why it fits this restaurant",
      "specs": ["Spec 1", "Spec 2", "Spec 3"]
    }
  ]
}`;

  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      return Response.json({
        products: generateMockProducts(categoryName, profile),
        isMock: true,
      });
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a restaurant supply expert. You help new restaurant owners find the best products for their specific restaurant type, style, and budget. Always return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const products: Product[] = parsed.products.map(
      (p: Record<string, unknown>, i: number) => ({
        id: `${categoryName.toLowerCase().replace(/\s+/g, "-")}-${i}-${Date.now()}-p${page}`,
        name: p.name as string,
        price: p.price as string,
        retailer: p.retailer as string,
        url: p.url as string,
        imageUrl: "",
        description: p.description as string,
        fitReason: p.fitReason as string,
        specs: (p.specs as string[]) || [],
      })
    );

    return Response.json({ products, isMock: false });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json({
      products: generateMockProducts(categoryName, profile),
      isMock: true,
    });
  }
}

function generateMockProducts(
  categoryName: string,
  profile: RestaurantProfile
): Product[] {
  const retailers = [
    "WebstaurantStore",
    "Amazon",
    "Katom Restaurant Supply",
    "Restaurant Depot",
    "Wayfair Commercial",
  ];

  return Array.from({ length: 8 }, (_, i) => ({
    id: `mock-${categoryName.toLowerCase().replace(/\s+/g, "-")}-${i}`,
    name: `${profile.style} ${categoryName} Option ${i + 1}`,
    price:
      profile.budgetTier === "budget"
        ? `$${50 + i * 30} - $${80 + i * 30}`
        : profile.budgetTier === "midrange"
          ? `$${100 + i * 50} - $${200 + i * 50}`
          : `$${200 + i * 100} - $${400 + i * 100}`,
    retailer: retailers[i % retailers.length],
    url: "#",
    imageUrl: "",
    description: `Commercial-grade ${categoryName.toLowerCase()} designed for ${profile.cuisineType} restaurants with a ${profile.style.toLowerCase()} aesthetic.`,
    fitReason: `Selected for your ${profile.style.toLowerCase()} style and ${profile.budgetTier} budget. Great fit for a ${profile.seatingCapacity}-sized ${profile.cuisineType} restaurant.`,
    specs: [
      "Commercial grade construction",
      `${profile.style} design aesthetic`,
      "NSF certified where applicable",
    ],
  }));
}
