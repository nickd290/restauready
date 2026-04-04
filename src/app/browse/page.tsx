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

  useEffect(() => {
    setMounted(true);
    if (!getProfile()) {
      router.push("/setup");
      return;
    }
    setProgress(getProgress());
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber mb-2">
          -- Browse Categories
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-cream">Everything Your </span>
          <span className="text-amber">Restaurant Needs</span>
        </h1>
        <p className="text-cream/50 mt-2">
          Tap a category to get AI-powered product recommendations tailored to
          your restaurant.
        </p>
      </div>

      {departments.map((dept) => {
        const deptCategories = categories.filter(
          (c) => c.department === dept
        );
        return (
          <div key={dept} className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-amber/70 mb-3">
              -- {dept}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {deptCategories.map((cat) => {
                const status = progress[cat.slug] || "not-started";
                const savedCount = getSavedByCategory(cat.slug).length;

                return (
                  <Link
                    key={cat.slug}
                    href={`/browse/${cat.slug}`}
                    className="bg-surface hover:bg-surface-hover border border-charcoal-lighter hover:border-amber/30 rounded-xl p-4 transition-all group relative"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-cream group-hover:text-amber transition-colors">
                          {cat.name}
                        </div>
                        <div className="text-xs text-cream/40 mt-1 line-clamp-1">
                          {cat.description}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          {status === "done" && (
                            <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">
                              Done
                            </span>
                          )}
                          {status === "in-progress" && (
                            <span className="text-xs bg-amber/20 text-amber px-2 py-0.5 rounded-full">
                              In Progress
                            </span>
                          )}
                          {savedCount > 0 && (
                            <span className="text-xs text-cream/30">
                              {savedCount} saved
                            </span>
                          )}
                        </div>
                      </div>
                      <svg
                        className="w-4 h-4 text-cream/20 group-hover:text-amber transition-colors shrink-0 mt-1"
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
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
