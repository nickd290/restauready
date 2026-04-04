"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Product, RestaurantProfile } from "@/types";
import { getProfile } from "@/lib/profile";
import {
  saveItem,
  removeSavedItem,
  isItemSaved,
  setCategoryProgress,
  getCachedSearch,
  cacheSearchResults,
  getSavedByCategory,
} from "@/lib/saved";
import { getCategoryBySlug } from "@/lib/categories";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  const category = getCategoryBySlug(slug);

  useEffect(() => {
    setMounted(true);
    const p = getProfile();
    if (!p) {
      router.push("/setup");
      return;
    }
    setProfile(p);

    // Update saved state
    const saved = getSavedByCategory(slug);
    setSavedIds(new Set(saved.map((s) => s.product.id)));

    // Check cache first
    const cached = getCachedSearch(slug);
    if (cached) {
      setProducts(cached);
      setLoading(false);
      return;
    }

    // Fetch from API
    if (category) {
      fetchProducts(p, category.name, category.description);
    }
  }, [slug, router]);

  async function fetchProducts(
    p: RestaurantProfile,
    categoryName: string,
    categoryDescription: string
  ) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName,
          categoryDescription,
          profile: p,
        }),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setProducts(data.products);
      cacheSearchResults(slug, data.products);
      setCategoryProgress(slug, "in-progress");
    } catch (err) {
      setError("Failed to load products. Try refreshing.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggleSave(product: Product) {
    if (savedIds.has(product.id)) {
      removeSavedItem(product.id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    } else {
      saveItem(product, slug);
      setSavedIds((prev) => new Set(prev).add(product.id));
    }
  }

  function markDone() {
    setCategoryProgress(slug, "done");
    router.push("/browse");
  }

  function handleRefresh() {
    if (profile && category) {
      localStorage.removeItem(`restauready_cache_${slug}`);
      fetchProducts(profile, category.name, category.description);
    }
  }

  if (!mounted || !category) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-cream/40 mb-6">
        <Link href="/browse" className="hover:text-cream transition-colors">
          Browse
        </Link>
        <span>/</span>
        <span className="text-cream/60">{category.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{category.icon}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-cream">
              {category.name}
            </h1>
          </div>
          <p className="text-cream/50">{category.description}</p>
          {profile && (
            <p className="text-xs text-cream/30 mt-2">
              Showing results for: {profile.cuisineType} &middot;{" "}
              {profile.style} &middot;{" "}
              {profile.budgetTier === "budget"
                ? "Budget"
                : profile.budgetTier === "midrange"
                  ? "Mid-Range"
                  : "Premium"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="text-sm text-cream/40 hover:text-cream border border-charcoal-lighter hover:border-cream/30 rounded-lg px-3 py-2 transition-all"
          >
            Refresh
          </button>
          <button
            onClick={markDone}
            className="text-sm bg-green-900/40 text-green-400 hover:bg-green-900/60 rounded-lg px-3 py-2 transition-all"
          >
            Mark Done
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl p-5">
              <div className="skeleton h-5 w-3/4 rounded mb-3" />
              <div className="skeleton h-4 w-full rounded mb-2" />
              <div className="skeleton h-4 w-2/3 rounded mb-4" />
              <div className="flex gap-2">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-900/40 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 text-sm text-amber hover:text-amber-light"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-surface border border-charcoal-lighter rounded-xl p-5 hover:border-charcoal-lighter/80 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-cream leading-tight">
                  {product.name}
                </h3>
                <button
                  onClick={() => toggleSave(product)}
                  className={`shrink-0 text-lg transition-transform hover:scale-110 ${
                    savedIds.has(product.id) ? "" : "opacity-40 hover:opacity-70"
                  }`}
                  title={
                    savedIds.has(product.id)
                      ? "Remove from saved"
                      : "Save item"
                  }
                >
                  {savedIds.has(product.id) ? "💾" : "🔖"}
                </button>
              </div>

              <p className="text-sm text-cream/50 mb-3">
                {product.description}
              </p>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-amber font-bold">{product.price}</span>
                <span className="text-xs text-cream/30">
                  via {product.retailer}
                </span>
              </div>

              {product.fitReason && (
                <div className="bg-amber/5 border border-amber/10 rounded-lg p-3 mb-3">
                  <p className="text-xs text-amber/80">
                    <span className="font-semibold">Why this fits:</span>{" "}
                    {product.fitReason}
                  </p>
                </div>
              )}

              {product.specs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {product.specs.map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs bg-charcoal-lighter/50 text-cream/50 px-2 py-1 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              {product.url && product.url !== "#" && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-amber hover:text-amber-light transition-colors"
                >
                  View on {product.retailer}
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Saved count footer */}
      {savedIds.size > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-cream/40">
            {savedIds.size} item{savedIds.size !== 1 ? "s" : ""} saved in this
            category
          </p>
        </div>
      )}
    </div>
  );
}
