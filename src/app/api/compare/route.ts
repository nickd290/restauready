import { NextRequest } from "next/server";
import { RestaurantProfile } from "@/types";

export async function POST(request: NextRequest) {
  const { productName, categoryName, profile } = (await request.json()) as {
    productName: string;
    categoryName: string;
    profile: RestaurantProfile;
  };

  const prompt = `Find this EXACT product or very similar alternatives across multiple retailers:
Product: "${productName}"
Category: ${categoryName}

Search these retailers specifically:
1. WebstaurantStore
2. Amazon (commercial/restaurant supply)
3. Katom Restaurant Supply
4. Restaurant Depot
5. Wayfair Commercial
6. Sam's Club / Restaurant Supply
7. Global Industrial

For each retailer that carries this product or a very close match, provide:
- Retailer name
- Exact product name at that retailer
- Price
- Direct URL
- Whether it's the exact same product or a close alternative
- Shipping info if available (free shipping, freight, etc.)

IMPORTANT: Return ONLY valid JSON:
{
  "comparisons": [
    {
      "retailer": "Retailer Name",
      "productName": "Exact name at this retailer",
      "price": "$XX",
      "url": "https://...",
      "isExactMatch": true,
      "shipping": "Free shipping" or "Freight" or "Varies",
      "inStock": true
    }
  ],
  "lowestPrice": "$XX",
  "savingsVsHighest": "$XX"
}`;

  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return Response.json({ comparisons: [], error: "No API key" });
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
              "You are a restaurant supply pricing expert. You find the same products across multiple retailers to help restaurant owners get the best price. Always return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json(parsed);
  } catch (error) {
    console.error("Compare error:", error);
    return Response.json({ comparisons: [], error: "Search failed" });
  }
}
