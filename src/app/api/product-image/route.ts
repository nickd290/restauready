import { NextRequest } from "next/server";

// Extracts the actual product image from a retailer page's OpenGraph/meta tags
// This is the most reliable way to get real product images without a paid API
export async function GET(request: NextRequest) {
  const productUrl = request.nextUrl.searchParams.get("url");
  const productName = request.nextUrl.searchParams.get("name") || "";

  if (!productUrl || productUrl === "#") {
    // If no product URL, use Perplexity to find an image
    if (productName) {
      return await searchForImage(productName);
    }
    return Response.json({ imageUrl: "" });
  }

  try {
    // Fetch the product page and extract og:image
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(productUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      // Fallback to search
      if (productName) return await searchForImage(productName);
      return Response.json({ imageUrl: "" });
    }

    const html = await res.text();

    // Try multiple image extraction strategies
    let imageUrl = "";

    // 1. og:image (most common, highest quality)
    const ogMatch = html.match(
      /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i
    ) || html.match(
      /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i
    );
    if (ogMatch) imageUrl = ogMatch[1];

    // 2. twitter:image
    if (!imageUrl) {
      const twitterMatch = html.match(
        /<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i
      ) || html.match(
        /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']twitter:image["']/i
      );
      if (twitterMatch) imageUrl = twitterMatch[1];
    }

    // 3. First large image in product area (common patterns)
    if (!imageUrl) {
      const imgMatch = html.match(
        /<img[^>]+(?:class|id)=["'][^"']*(?:product|main|hero|primary|gallery)[^"']*["'][^>]+src=["']([^"']+)["']/i
      ) || html.match(
        /<img[^>]+src=["']([^"']+(?:\/products?\/|\/images?\/products?\/|\/media\/)[^"']+)["']/i
      );
      if (imgMatch) imageUrl = imgMatch[1];
    }

    // 4. JSON-LD product image
    if (!imageUrl) {
      const jsonLdMatch = html.match(
        /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      );
      if (jsonLdMatch) {
        for (const block of jsonLdMatch) {
          try {
            const jsonContent = block.replace(/<\/?script[^>]*>/gi, "");
            const parsed = JSON.parse(jsonContent);
            if (parsed.image) {
              imageUrl = Array.isArray(parsed.image)
                ? parsed.image[0]
                : typeof parsed.image === "string"
                  ? parsed.image
                  : parsed.image.url || "";
              if (imageUrl) break;
            }
          } catch {
            // skip invalid JSON-LD
          }
        }
      }
    }

    // Make relative URLs absolute
    if (imageUrl && !imageUrl.startsWith("http")) {
      try {
        const base = new URL(productUrl);
        imageUrl = new URL(imageUrl, base.origin).href;
      } catch {
        imageUrl = "";
      }
    }

    return Response.json({ imageUrl });
  } catch {
    // Fallback to search
    if (productName) return await searchForImage(productName);
    return Response.json({ imageUrl: "" });
  }
}

// Use Perplexity to find an actual product image when we can't scrape the page
async function searchForImage(productName: string) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return Response.json({ imageUrl: "" });

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: `Find ONE direct image URL (.jpg, .png, or .webp) of this commercial restaurant product: "${productName}". Return ONLY the image URL, nothing else. The URL must be a direct link to an image file hosted on a retailer's CDN (like amazon images, webstaurantstore images, etc). Do not return a page URL.`,
          },
        ],
        temperature: 0,
      }),
    });

    if (!res.ok) return Response.json({ imageUrl: "" });

    const data = await res.json();
    const content = data.choices[0].message.content.trim();
    const urlMatch = content.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i);
    return Response.json({ imageUrl: urlMatch ? urlMatch[0] : "" });
  } catch {
    return Response.json({ imageUrl: "" });
  }
}
