"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Product, RestaurantProfile } from "@/types";
import { getProfile } from "@/lib/profile";
import {
  saveItem,
  removeSavedItem,
  setCategoryProgress,
  getCachedSearch,
  cacheSearchResults,
  getSavedByCategory,
  getStyleContext,
  getStyleMemory,
} from "@/lib/saved";
import {
  getCategoryBySlug,
  getNeighborCategories,
  getRelatedCategories,
} from "@/lib/categories";

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [cacheTime, setCacheTime] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [doneToast, setDoneToast] = useState(false);
  const [validatedUrls, setValidatedUrls] = useState<
    Record<string, boolean | null>
  >({});

  const category = getCategoryBySlug(slug);
  const neighbors = getNeighborCategories(slug);
  const related = getRelatedCategories(slug);

  useEffect(() => {
    setMounted(true);
    const p = getProfile();
    if (!p) {
      router.push("/setup");
      return;
    }
    setProfile(p);

    const saved = getSavedByCategory(slug);
    setSavedIds(new Set(saved.map((s) => s.product.id)));

    const cached = getCachedSearch(slug);
    if (cached) {
      setProducts(cached.products);
      setIsMock(cached.isMock);
      setCacheTime(cached.timestamp);
      setLoading(false);
      return;
    }

    if (category) {
      fetchProducts(p, category.name, category.description, 1);
    }
  }, [slug, router]);

  const fetchProducts = useCallback(
    async (
      p: RestaurantProfile,
      categoryName: string,
      categoryDescription: string,
      pageNum: number
    ) => {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryName,
            categoryDescription,
            profile: p,
            page: pageNum,
            styleContext: getStyleContext(),
          }),
        });

        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        const mock = data.isMock ?? false;

        if (pageNum === 1) {
          setProducts(data.products);
          cacheSearchResults(slug, data.products, mock);
        } else {
          setProducts((prev) => {
            const combined = [...prev, ...data.products];
            cacheSearchResults(slug, combined, mock);
            return combined;
          });
        }
        setIsMock(mock);
        setCacheTime(Date.now());
        setPage(pageNum);
        setCategoryProgress(slug, "in-progress");
      } catch (err) {
        setError("Failed to load products. Try refreshing.");
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug]
  );

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
    setDoneToast(true);
    setTimeout(() => setDoneToast(false), 3000);
  }

  function handleRefresh() {
    if (profile && category) {
      localStorage.removeItem(`restauready_cache_${slug}`);
      setPage(1);
      fetchProducts(profile, category.name, category.description, 1);
    }
  }

  function handleLoadMore() {
    if (profile && category) {
      fetchProducts(profile, category.name, category.description, page + 1);
    }
  }

  function validateUrl(url: string) {
    if (validatedUrls[url] !== undefined) return;
    setValidatedUrls((prev) => ({ ...prev, [url]: null }));
    fetch(`/api/validate-url?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) =>
        setValidatedUrls((prev) => ({ ...prev, [url]: data.valid }))
      )
      .catch(() =>
        setValidatedUrls((prev) => ({ ...prev, [url]: false }))
      );
  }

  if (!mounted || !category) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      {/* Done Toast (#8) */}
      {doneToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-900/90 text-green-300 px-6 py-3 rounded-2xl shadow-lg text-sm font-medium animate-[fadeIn_0.2s_ease-out]">
          {category.name} marked as complete
        </div>
      )}

      {/* Mock data banner (#1) */}
      {isMock && !loading && (
        <div className="bg-copper/10 border border-amber/30 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
          <span className="text-copper text-lg">!</span>
          <div className="flex-1">
            <p className="text-sm text-copper font-medium">
              Showing placeholder products
            </p>
            <p className="text-xs text-ivory/40">
              Live search unavailable. These are sample products, not real
              listings.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-xs text-copper hover:text-copper-light font-medium shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ivory/40 mb-6">
        <Link href="/browse" className="hover:text-ivory transition-colors">
          Browse
        </Link>
        <span>/</span>
        <span className="text-ivory/60">{category.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{category.icon}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-ivory">
              {category.name}
            </h1>
          </div>
          <p className="text-ivory/50">{category.description}</p>
          {profile && (
            <p className="text-xs text-ivory/30 mt-2">
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
            className="text-sm text-ivory/40 hover:text-ivory border border-ink-lighter/20 hover:border-cream/30 rounded-lg px-3 py-2 transition-all"
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

      {/* Last updated (#13) */}
      {/* Style Memory indicator */}
      {!loading && (() => {
        const mem = getStyleMemory();
        const hasMemory = mem.materials.length > 0 || mem.vibes.length > 0 || mem.colors.length > 0;
        if (!hasMemory) return null;
        const tags = [...mem.vibes.slice(0, 3), ...mem.materials.slice(0, 3), ...mem.colors.slice(0, 2)];
        return (
          <div className="bg-copper/5 border border-copper/10 rounded-2xl px-4 py-3 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-copper/60">Style Memory Active</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="text-[10px] bg-copper/10 text-copper/70 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
            <p className="text-[10px] text-ivory/25 mt-1.5">
              Results are influenced by your saved items across other categories
            </p>
          </div>
        );
      })()}

      {cacheTime && !loading && (
        <p className="text-xs text-ivory/25 mb-6">
          Results from {timeAgo(cacheTime)}
          {Date.now() - cacheTime > 1800000 && (
            <button
              onClick={handleRefresh}
              className="text-copper/50 hover:text-copper ml-2"
            >
              Refresh for latest
            </button>
          )}
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl p-5">
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
        <div className="bg-red-900/20 border border-red-900/40 rounded-2xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 text-sm text-copper hover:text-copper-light"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Products Grid (#11 visual hierarchy + #12 mobile save) */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-surface border border-ink-lighter/20 rounded-2xl p-5 hover:border-ink-lighter/20/80 transition-all"
              >
                {/* Save button row — mobile friendly (#12) */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-copper">
                      {product.price}
                    </span>
                    <span className="text-xs text-ivory/30">
                      via {product.retailer}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleSave(product)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      savedIds.has(product.id)
                        ? "bg-copper/20 text-copper"
                        : "bg-ink-lighter/50 text-ivory/40 hover:bg-ink-lighter hover:text-ivory"
                    }`}
                  >
                    {savedIds.has(product.id) ? "Saved" : "Save"}
                  </button>
                </div>

                {/* Product name — larger (#11) */}
                <h3 className="text-base font-bold text-ivory leading-snug mb-2">
                  {product.name}
                </h3>

                <p className="text-sm text-ivory/45 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {product.fitReason && (
                  <div className="bg-copper/5 border border-amber/10 rounded-lg p-3 mb-3">
                    <p className="text-xs text-copper/80">
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
                        className="text-xs bg-ink-lighter/50 text-ivory/50 px-2 py-1 rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Link with validation (#4) */}
                {product.url && product.url !== "#" && (
                  <div className="flex items-center gap-2">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-copper hover:text-copper-light transition-colors"
                      onMouseEnter={() => validateUrl(product.url)}
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
                    {validatedUrls[product.url] === true && (
                      <span className="text-xs text-green-400">Verified</span>
                    )}
                    {validatedUrls[product.url] === false && (
                      <span className="text-xs text-red-400">
                        Link may be broken
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load More (#3) */}
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-surface hover:bg-surface-hover border border-ink-lighter/20 hover:border-amber/30 text-ivory/60 hover:text-ivory px-6 py-3 rounded-2xl text-sm font-medium transition-all disabled:opacity-50"
            >
              {loadingMore ? "Loading more..." : `Load More Products (Page ${page + 1})`}
            </button>
            <p className="text-xs text-ivory/25 mt-2">
              Showing {products.length} products
            </p>
          </div>
        </>
      )}

      {/* Saved count footer */}
      {savedIds.size > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-ivory/40">
            {savedIds.size} item{savedIds.size !== 1 ? "s" : ""} saved in this
            category
          </p>
        </div>
      )}

      {/* Category Navigation (#7) */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink-lighter/20">
        {neighbors.prev ? (
          <Link
            href={`/browse/${neighbors.prev.slug}`}
            className="flex items-center gap-2 text-sm text-ivory/40 hover:text-ivory transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {neighbors.prev.icon} {neighbors.prev.name}
          </Link>
        ) : (
          <div />
        )}
        {neighbors.next ? (
          <Link
            href={`/browse/${neighbors.next.slug}`}
            className="flex items-center gap-2 text-sm text-ivory/40 hover:text-ivory transition-colors"
          >
            {neighbors.next.name} {neighbors.next.icon}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Related categories (#14) */}
      {related.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-ivory/25 mb-2">Also in {category.department}:</p>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/browse/${r.slug}`}
                className="text-xs bg-surface hover:bg-surface-hover text-ivory/50 hover:text-ivory px-3 py-1.5 rounded-full transition-all"
              >
                {r.icon} {r.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
