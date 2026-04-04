"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RestaurantProfile, CategoryProgress } from "@/types";
import { getProfile } from "@/lib/profile";
import { getProgress, getSavedItems, exportAllData } from "@/lib/saved";
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
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-16 pb-28 md:pb-16">
      {/* Hero section */}
      <div className="animate-fade-up mb-14">
        <div className="label-editorial mb-4">Dashboard</div>
        <h1
          className="text-4xl md:text-6xl tracking-tight mb-3"
          style={{ fontFamily: "var(--font-dm-serif)" }}
        >
          {profile.name}
        </h1>
        <div className="rule-copper w-24 mb-4" />
        <p className="text-ivory/40 text-sm tracking-wide">
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

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-14">
        {[
          { label: "Categories", value: totalCategories, delay: "delay-1" },
          { label: "Completed", value: doneCount, accent: true, delay: "delay-2" },
          { label: "In Progress", value: inProgressCount, delay: "delay-3" },
          { label: "Items Saved", value: savedCount, delay: "delay-4" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`animate-scale-in ${stat.delay} bg-surface border border-ink-lighter/30 rounded-2xl p-5 md:p-6 hover-lift`}
          >
            <div className="text-[10px] font-bold tracking-widest uppercase text-ivory/30 mb-2">
              {stat.label}
            </div>
            <div
              className={`text-3xl md:text-4xl font-light tracking-tight ${
                stat.accent ? "text-copper" : "text-ivory"
              }`}
              style={{ fontFamily: "var(--font-dm-serif)" }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress section */}
      <div className="animate-fade-up delay-3 bg-surface border border-ink-lighter/30 rounded-2xl p-6 md:p-8 mb-14">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="label-editorial mb-2">Sourcing Progress</div>
            <p className="text-ivory/35 text-xs">
              {doneCount} of {totalCategories} categories fully sourced
            </p>
          </div>
          <div
            className="text-3xl font-light text-copper"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            {percentage}%
          </div>
        </div>
        <div className="h-2 bg-ink rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(percentage, 2)}%`,
              background:
                "linear-gradient(90deg, var(--color-copper-dark), var(--color-copper), var(--color-copper-light))",
            }}
          />
        </div>
      </div>

      {/* Departments */}
      <div className="mb-14">
        <div className="label-editorial mb-5">Departments</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {departments.map((dept, i) => {
            const deptCategories = categories.filter(
              (c) => c.department === dept
            );
            const deptDone = deptCategories.filter(
              (c) => progress[c.slug] === "done"
            ).length;
            const deptProgress = Math.round(
              (deptDone / deptCategories.length) * 100
            );
            return (
              <Link
                key={dept}
                href="/browse"
                className={`animate-scale-in delay-${i + 1} bg-surface border border-ink-lighter/20 rounded-2xl p-4 md:p-5 transition-all group hover-lift`}
              >
                <div className="text-sm font-semibold text-ivory group-hover:text-copper transition-colors mb-2">
                  {dept}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-ink rounded-full overflow-hidden">
                    <div
                      className="h-full bg-copper rounded-full"
                      style={{ width: `${deptProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-ivory/30 font-mono">
                    {deptDone}/{deptCategories.length}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link
          href="/browse"
          className="animate-fade-up delay-5 group relative overflow-hidden rounded-2xl border border-copper/20 p-6 md:p-8 hover-lift"
          style={{
            background:
              "linear-gradient(135deg, rgba(198,125,74,0.08) 0%, transparent 60%)",
          }}
        >
          <div
            className="text-2xl md:text-3xl text-copper mb-3"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Browse
          </div>
          <p className="text-sm text-ivory/40 leading-relaxed">
            Find products across {totalCategories} categories, tailored to your
            restaurant
          </p>
          <div className="absolute top-6 right-6 text-copper/20 group-hover:text-copper/40 transition-colors">
            <svg
              className="w-6 h-6"
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

        <Link
          href="/saved"
          className="animate-fade-up delay-6 group bg-surface border border-ink-lighter/20 rounded-2xl p-6 md:p-8 hover-lift"
        >
          <div
            className="text-2xl md:text-3xl text-ivory mb-3"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Saved
          </div>
          <p className="text-sm text-ivory/40 leading-relaxed">
            {savedCount} item{savedCount !== 1 ? "s" : ""} on your shortlist
          </p>
        </Link>

        <Link
          href="/budget"
          className="animate-fade-up delay-7 group bg-surface border border-ink-lighter/20 rounded-2xl p-6 md:p-8 hover-lift"
        >
          <div
            className="text-2xl md:text-3xl text-ivory mb-3"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Budget
          </div>
          <p className="text-sm text-ivory/40 leading-relaxed">
            Track your estimated spend across all categories
          </p>
        </Link>
      </div>

      {/* Backup */}
      <div className="animate-fade-in delay-8 flex items-center gap-3 pt-6 border-t border-ink-lighter/20">
        <button
          onClick={() => {
            const data = exportAllData();
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `restauready-backup-${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="text-xs text-ivory/25 hover:text-copper border border-ink-lighter/30 hover:border-copper/30 px-4 py-2 rounded-lg transition-all"
        >
          Download Backup
        </button>
        <span className="text-[10px] text-ivory/15 tracking-wide">
          Data is stored locally on this device
        </span>
      </div>
    </div>
  );
}
