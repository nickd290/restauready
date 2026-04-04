"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RestaurantProfile, CategoryProgress } from "@/types";
import { getProfile } from "@/lib/profile";
import { getProgress, getSavedItems } from "@/lib/saved";
import { categories, departments } from "@/lib/categories";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [progress, setProgress] = useState<CategoryProgress>({});
  const [savedCount, setSavedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = getProfile();
    if (!p) {
      router.push("/setup");
      return;
    }
    setProfile(p);
    setProgress(getProgress());
    setSavedCount(getSavedItems().length);
  }, [router]);

  if (!mounted || !profile) return null;

  const totalCategories = categories.length;
  const doneCount = Object.values(progress).filter((s) => s === "done").length;
  const inProgressCount = Object.values(progress).filter(
    (s) => s === "in-progress"
  ).length;
  const percentage = Math.round((doneCount / totalCategories) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      {/* Hero */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber mb-2">
          -- Dashboard
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
          <span className="text-cream">{profile.name}</span>
        </h1>
        <p className="text-cream/50">
          {profile.cuisineType} &middot; {profile.style} &middot;{" "}
          {profile.seatingCapacity === "small"
            ? "Under 30 seats"
            : profile.seatingCapacity === "medium"
              ? "30-80 seats"
              : "80+ seats"}{" "}
          &middot;{" "}
          {profile.budgetTier === "budget"
            ? "Budget"
            : profile.budgetTier === "midrange"
              ? "Mid-Range"
              : "Premium"}
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Categories" value={totalCategories.toString()} />
        <StatCard label="Completed" value={doneCount.toString()} accent />
        <StatCard label="In Progress" value={inProgressCount.toString()} />
        <StatCard label="Items Saved" value={savedCount.toString()} />
      </div>

      {/* Progress Bar */}
      <div className="bg-surface rounded-xl p-6 mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-cream/60">
            Sourcing Progress
          </span>
          <span className="text-sm font-bold text-amber">{percentage}%</span>
        </div>
        <div className="h-3 bg-charcoal rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-dark to-amber rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-cream/40 mt-2">
          {doneCount} of {totalCategories} categories fully sourced
        </p>
      </div>

      {/* Department Quick Links */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber mb-4">
          -- Departments
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {departments.map((dept) => {
            const deptCategories = categories.filter(
              (c) => c.department === dept
            );
            const deptDone = deptCategories.filter(
              (c) => progress[c.slug] === "done"
            ).length;
            return (
              <Link
                key={dept}
                href="/browse"
                className="bg-surface hover:bg-surface-hover rounded-xl p-4 transition-all group"
              >
                <div className="text-sm font-semibold text-cream group-hover:text-amber transition-colors">
                  {dept}
                </div>
                <div className="text-xs text-cream/40 mt-1">
                  {deptDone}/{deptCategories.length} done
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/browse"
          className="bg-amber/10 border border-amber/20 rounded-xl p-5 hover:bg-amber/15 transition-all group"
        >
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-semibold text-amber group-hover:text-amber-light">
            Browse Categories
          </div>
          <div className="text-sm text-cream/40 mt-1">
            Find products by department
          </div>
        </Link>
        <Link
          href="/saved"
          className="bg-surface border border-charcoal-lighter rounded-xl p-5 hover:bg-surface-hover transition-all group"
        >
          <div className="text-2xl mb-2">💾</div>
          <div className="font-semibold text-cream group-hover:text-amber">
            Saved Items
          </div>
          <div className="text-sm text-cream/40 mt-1">
            {savedCount} items saved
          </div>
        </Link>
        <Link
          href="/budget"
          className="bg-surface border border-charcoal-lighter rounded-xl p-5 hover:bg-surface-hover transition-all group"
        >
          <div className="text-2xl mb-2">💰</div>
          <div className="font-semibold text-cream group-hover:text-amber">
            Budget Tracker
          </div>
          <div className="text-sm text-cream/40 mt-1">
            Track your total spend
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="text-xs text-cream/40 mb-1">{label}</div>
      <div
        className={`text-2xl font-bold ${accent ? "text-amber" : "text-cream"}`}
      >
        {value}
      </div>
    </div>
  );
}
