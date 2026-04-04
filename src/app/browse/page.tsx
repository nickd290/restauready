"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CategoryProgress } from "@/types";
import { getProfile } from "@/lib/profile";
import { getProgress, getSavedByCategory } from "@/lib/saved";
import { categories, departments } from "@/lib/categories";

export default function BrowsePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<CategoryProgress>({});
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!getProfile()) {
      router.push("/setup");
      return;
    }
    setProgress(getProgress());
  }, [router]);

  if (!mounted) return null;

  const query = search.toLowerCase().trim();
  const filtered = query
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.department.toLowerCase().includes(query)
      )
    : null;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-16 pb-28 md:pb-16">
      <div className="animate-fade-up mb-10">
        <div className="label-editorial mb-4">Browse Categories</div>
        <h1
          className="text-3xl md:text-5xl tracking-tight mb-2"
          style={{ fontFamily: "var(--font-dm-serif)" }}
        >
          <span className="text-ivory">Everything Your </span>
          <span className="text-copper">Restaurant Needs</span>
        </h1>
        <div className="rule-copper w-24 mb-4" />
        <p className="text-ivory/40 text-sm max-w-lg">
          Tap a category to get AI-powered product recommendations tailored to
          your restaurant.
        </p>
        <div className="mt-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories... (e.g. chairs, POS, lighting)"
            className="w-full md:w-[420px] bg-surface border border-ink-lighter/30 rounded-xl px-5 py-3 text-sm text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-copper/40 focus:ring-1 focus:ring-copper/20 transition-all"
          />
        </div>
      </div>

      {filtered !== null ? (
        <div className="mb-8">
          <p className="text-xs text-ivory/30 mb-4">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for
            &ldquo;{search}&rdquo;
          </p>
          {filtered.length === 0 ? (
            <p className="text-ivory/40">No categories match your search.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((cat) => (
                <CategoryCard
                  key={cat.slug}
                  cat={cat}
                  status={progress[cat.slug] || "not-started"}
                  savedCount={getSavedByCategory(cat.slug).length}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        departments.map((dept, di) => {
          const deptCategories = categories.filter((c) => c.department === dept);
          return (
            <div key={dept} className="mb-10">
              <div className="label-editorial mb-4">{dept}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {deptCategories.map((cat, ci) => (
                  <CategoryCard
                    key={cat.slug}
                    cat={cat}
                    status={progress[cat.slug] || "not-started"}
                    savedCount={getSavedByCategory(cat.slug).length}
                    delay={ci}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function CategoryCard({
  cat,
  status,
  savedCount,
  delay = 0,
}: {
  cat: (typeof categories)[number];
  status: string;
  savedCount: number;
  delay?: number;
}) {
  return (
    <Link
      href={`/browse/${cat.slug}`}
      className={`animate-scale-in delay-${Math.min(delay + 1, 8)} bg-surface border border-ink-lighter/20 hover:border-copper/30 rounded-2xl p-4 md:p-5 transition-all group hover-lift`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-ivory group-hover:text-copper transition-colors">
            {cat.name}
          </div>
          <div className="text-xs text-ivory/30 mt-1 line-clamp-1">
            {cat.description}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {status === "done" && (
              <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full">
                Done
              </span>
            )}
            {status === "in-progress" && (
              <span className="text-[10px] font-bold tracking-wider uppercase bg-copper/15 text-copper px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
            {savedCount > 0 && (
              <span className="text-[10px] text-ivory/25">
                {savedCount} saved
              </span>
            )}
          </div>
        </div>
        <svg
          className="w-4 h-4 text-ivory/10 group-hover:text-copper/60 transition-colors shrink-0 mt-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
          />
        </svg>
      </div>
    </Link>
  );
}
