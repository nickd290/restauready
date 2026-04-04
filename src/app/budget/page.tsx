"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SavedItem } from "@/types";
import { getProfile } from "@/lib/profile";
import { getSavedItems } from "@/lib/saved";
import { getCategoryBySlug } from "@/lib/categories";

function parsePriceRange(price: string): {
  low: number;
  high: number;
  parseable: boolean;
} {
  if (!price) return { low: 0, high: 0, parseable: false };
  const cleaned = price.toLowerCase();
  if (
    cleaned.includes("call") ||
    cleaned.includes("quote") ||
    cleaned.includes("contact") ||
    cleaned.includes("n/a")
  ) {
    return { low: 0, high: 0, parseable: false };
  }
  const numbers = price.match(/[\d,]+\.?\d*/g);
  if (!numbers || numbers.length === 0) return { low: 0, high: 0, parseable: false };
  const parsed = numbers.map((n) => parseFloat(n.replace(/,/g, "")));
  const valid = parsed.filter((n) => !isNaN(n) && n > 0);
  if (valid.length === 0) return { low: 0, high: 0, parseable: false };
  if (valid.length === 1) return { low: valid[0], high: valid[0], parseable: true };
  return { low: Math.min(...valid), high: Math.max(...valid), parseable: true };
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function exportCSV(
  categoryBreakdown: { name: string; itemCount: number; low: number; high: number }[],
  totalLow: number,
  totalHigh: number,
  totalItems: number
) {
  const rows = [
    ["Category", "Items", "Low Estimate", "High Estimate"],
    ...categoryBreakdown.map((cat) => [
      cat.name,
      cat.itemCount.toString(),
      `$${cat.low}`,
      `$${cat.high}`,
    ]),
    ["", "", "", ""],
    ["TOTAL", totalItems.toString(), `$${totalLow}`, `$${totalHigh}`],
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `restauready-budget-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BudgetPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getProfile()) {
      router.push("/setup");
      return;
    }
    setItems(getSavedItems());
  }, [router]);

  if (!mounted) return null;

  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.categorySlug]) acc[item.categorySlug] = [];
      acc[item.categorySlug].push(item);
      return acc;
    },
    {} as Record<string, SavedItem[]>
  );

  let totalLow = 0;
  let totalHigh = 0;
  let unparseableCount = 0;

  const categoryBreakdown = Object.entries(grouped).map(([slug, catItems]) => {
    let catLow = 0;
    let catHigh = 0;
    let catUnparseable = 0;
    catItems.forEach((item) => {
      const { low, high, parseable } = parsePriceRange(item.product.price);
      if (parseable) {
        catLow += low;
        catHigh += high;
      } else {
        catUnparseable++;
      }
    });
    totalLow += catLow;
    totalHigh += catHigh;
    unparseableCount += catUnparseable;

    const cat = getCategoryBySlug(slug);
    return {
      slug,
      name: cat?.name || slug,
      icon: cat?.icon || "box",
      itemCount: catItems.length,
      low: catLow,
      high: catHigh,
      unparseable: catUnparseable,
    };
  });

  categoryBreakdown.sort((a, b) => b.high - a.high);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-2">
          -- Budget Tracker
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-ivory">Estimated </span>
          <span className="text-copper">Budget</span>
        </h1>
        <p className="text-ivory/50 mt-2">
          Based on {items.length} saved item{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">money</div>
          <h2 className="text-xl font-semibold text-ivory mb-2">
            No items saved yet
          </h2>
          <p className="text-ivory/40 mb-6">
            Save products to start tracking your budget.
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
          {/* Total Summary */}
          <div className="bg-surface rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-ivory/40">Estimated Total</span>
              {/* Export CSV (#10) */}
              <button
                onClick={() =>
                  exportCSV(categoryBreakdown, totalLow, totalHigh, items.length)
                }
                className="text-xs text-ivory/30 hover:text-copper border border-ink-lighter/20 hover:border-amber/30 px-3 py-1.5 rounded-lg transition-all"
              >
                Export CSV
              </button>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-copper">
              {formatCurrency(totalLow)}{" "}
              {totalLow !== totalHigh && (
                <span className="text-ivory/30 text-xl">
                  &ndash; {formatCurrency(totalHigh)}
                </span>
              )}
            </div>
            <div className="text-xs text-ivory/30 mt-2">
              Based on listed prices. Actual costs may vary with shipping, tax,
              and bulk discounts.
            </div>
          </div>

          {/* Unparseable warning (#2) */}
          {unparseableCount > 0 && (
            <div className="bg-copper/5 border border-amber/20 rounded-2xl px-4 py-3 mb-6">
              <p className="text-sm text-copper/70">
                {unparseableCount} item{unparseableCount !== 1 ? "s" : ""}{" "}
                {unparseableCount !== 1 ? "don't have" : "doesn't have"}{" "}
                parseable prices (marked &ldquo;Call for quote&rdquo; or
                missing). These are excluded from the totals above.
              </p>
            </div>
          )}

          {/* Category Breakdown */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-copper/70 mb-4">
              -- By Category
            </h2>
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => {
                const widthPercent =
                  totalHigh > 0
                    ? Math.max(5, Math.round((cat.high / totalHigh) * 100))
                    : 0;
                return (
                  <Link
                    key={cat.slug}
                    href={`/browse/${cat.slug}`}
                    className="block bg-surface border border-ink-lighter/20 rounded-2xl p-4 hover:border-amber/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="text-sm font-medium text-ivory">
                          {cat.name}
                        </span>
                        <span className="text-xs text-ivory/30">
                          ({cat.itemCount} item
                          {cat.itemCount !== 1 ? "s" : ""})
                        </span>
                        {cat.unparseable > 0 && (
                          <span className="text-xs text-copper/50">
                            ({cat.unparseable} no price)
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-copper">
                        {formatCurrency(cat.low)}
                        {cat.low !== cat.high && (
                          <span className="text-ivory/30 font-normal">
                            {" "}
                            &ndash; {formatCurrency(cat.high)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 bg-ink rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-copper-dark to-copper rounded-full"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
