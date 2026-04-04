"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SavedItem } from "@/types";
import { getProfile } from "@/lib/profile";
import { getSavedItems, removeSavedItem } from "@/lib/saved";
import { getCategoryBySlug } from "@/lib/categories";

export default function SavedPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
    if (!getProfile()) {
      router.push("/setup");
      return;
    }
    setItems(getSavedItems());
  }, [router]);

  function handleRemove(productId: string) {
    removeSavedItem(productId);
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  if (!mounted) return null;

  // Group by category
  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.categorySlug]) acc[item.categorySlug] = [];
      acc[item.categorySlug].push(item);
      return acc;
    },
    {} as Record<string, SavedItem[]>
  );

  const categoryKeys = Object.keys(grouped);
  const filteredKeys =
    filter === "all" ? categoryKeys : categoryKeys.filter((k) => k === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-2">
          -- Saved Items
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-ivory">Your </span>
          <span className="text-copper">Shortlist</span>
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-ivory/50">
            {items.length} item{items.length !== 1 ? "s" : ""} across{" "}
            {categoryKeys.length} categor
            {categoryKeys.length !== 1 ? "ies" : "y"}
          </p>
          {items.length > 0 && (() => {
            let low = 0;
            let high = 0;
            items.forEach((item) => {
              const nums = item.product.price.match(/[\d,]+\.?\d*/g);
              if (nums) {
                const parsed = nums.map((n) => parseFloat(n.replace(/,/g, "")));
                const valid = parsed.filter((n) => !isNaN(n) && n > 0);
                if (valid.length > 0) {
                  low += Math.min(...valid);
                  high += Math.max(...valid);
                }
              }
            });
            if (low === 0 && high === 0) return null;
            const fmt = (n: number) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(n);
            return (
              <span className="text-sm text-copper font-medium">
                Est. {fmt(low)}
                {low !== high && <span className="text-ivory/30"> &ndash; {fmt(high)}</span>}
              </span>
            );
          })()}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🔖</div>
          <h2 className="text-xl font-semibold text-ivory mb-2">
            Nothing saved yet
          </h2>
          <p className="text-ivory/40 mb-6">
            Browse categories and save products you like.
          </p>
          <Link
            href="/browse"
            className="inline-block bg-copper text-ink font-semibold px-6 py-3 rounded-lg hover:bg-copper-light transition-colors"
          >
            Start Browsing
          </Link>
        </div>
      ) : (
        <>
          {/* Category filter */}
          {categoryKeys.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter("all")}
                className={`text-sm px-3 py-1.5 rounded-full transition-all ${
                  filter === "all"
                    ? "bg-copper text-ink"
                    : "bg-surface text-ivory/50 hover:text-ivory"
                }`}
              >
                All ({items.length})
              </button>
              {categoryKeys.map((slug) => {
                const cat = getCategoryBySlug(slug);
                return (
                  <button
                    key={slug}
                    onClick={() => setFilter(slug)}
                    className={`text-sm px-3 py-1.5 rounded-full transition-all ${
                      filter === slug
                        ? "bg-copper text-ink"
                        : "bg-surface text-ivory/50 hover:text-ivory"
                    }`}
                  >
                    {cat?.icon} {cat?.name} ({grouped[slug].length})
                  </button>
                );
              })}
            </div>
          )}

          {/* Grouped items */}
          {filteredKeys.map((slug) => {
            const cat = getCategoryBySlug(slug);
            const categoryItems = grouped[slug];
            return (
              <div key={slug} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{cat?.icon}</span>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-ivory/60">
                    {cat?.name}
                  </h2>
                  <span className="text-xs text-ivory/30">
                    ({categoryItems.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-surface border border-ink-lighter/20 rounded-2xl p-4 flex items-start gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-ivory text-sm">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-copper font-bold text-sm">
                            {item.product.price}
                          </span>
                          <span className="text-xs text-ivory/30">
                            {item.product.retailer}
                          </span>
                        </div>
                        {item.product.url && item.product.url !== "#" && (
                          <a
                            href={item.product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-copper/60 hover:text-copper mt-1 inline-block"
                          >
                            View product
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        className="text-ivory/20 hover:text-red-400 transition-colors shrink-0"
                        title="Remove"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
