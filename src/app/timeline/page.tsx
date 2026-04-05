"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RestaurantProfile, CategoryProgress } from "@/types";
import { getProfile } from "@/lib/profile";
import { getProgress } from "@/lib/saved";
import { getTimelineForProfile, TimelinePhase } from "@/lib/timeline";
import { getCategoryBySlug } from "@/lib/categories";

export default function TimelinePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [progress, setProgress] = useState<CategoryProgress>({});
  const [timeline, setTimeline] = useState<TimelinePhase[]>([]);
  const [mounted, setMounted] = useState(false);
  const [openingDate, setOpeningDate] = useState("");
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const p = getProfile();
    if (!p) {
      router.push("/setup");
      return;
    }
    setProfile(p);
    setProgress(getProgress());
    setTimeline(getTimelineForProfile(p.cuisineType, p.style));
  }, [router]);

  if (!mounted || !profile) return null;

  function getPhaseStatus(phase: TimelinePhase): "done" | "partial" | "not-started" {
    const doneCount = phase.categories.filter((slug) => progress[slug] === "done").length;
    if (doneCount === phase.categories.length) return "done";
    if (doneCount > 0 || phase.categories.some((slug) => progress[slug] === "in-progress")) return "partial";
    return "not-started";
  }

  function getDateForPhase(weeksBeforeOpen: number): string {
    if (!openingDate) return `${weeksBeforeOpen} weeks before opening`;
    const open = new Date(openingDate);
    const phaseDate = new Date(open.getTime() - weeksBeforeOpen * 7 * 24 * 60 * 60 * 1000);
    return phaseDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function isOverdue(weeksBeforeOpen: number): boolean {
    if (!openingDate) return false;
    const open = new Date(openingDate);
    const phaseDate = new Date(open.getTime() - weeksBeforeOpen * 7 * 24 * 60 * 60 * 1000);
    return phaseDate < new Date();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-16 pb-28 md:pb-16">
      {/* Header */}
      <div className="animate-fade-up mb-10">
        <div className="label-editorial mb-4">Opening Timeline</div>
        <h1
          className="text-3xl md:text-5xl tracking-tight mb-2"
          style={{ fontFamily: "var(--font-dm-serif)" }}
        >
          <span className="text-ivory">Your Path to </span>
          <span className="text-copper">Opening Night</span>
        </h1>
        <div className="rule-copper w-24 mb-4" />
        <p className="text-ivory/40 text-sm max-w-lg">
          A phase-by-phase ordering guide for {profile.name}. Categories are grouped by lead time — order long-lead items first.
        </p>
      </div>

      {/* Opening date input */}
      <div className="animate-fade-up delay-1 bg-surface border border-ink-lighter/20 rounded-2xl p-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-ivory mb-1">
              When are you planning to open?
            </div>
            <p className="text-xs text-ivory/30">
              Set a target date and we&apos;ll calculate exact order-by dates for each phase.
            </p>
          </div>
          <input
            type="date"
            value={openingDate}
            onChange={(e) => setOpeningDate(e.target.value)}
            className="bg-ink border border-ink-lighter/30 rounded-xl px-4 py-3 text-ivory text-sm focus:outline-none focus:border-copper/50 transition-colors"
          />
        </div>
      </div>

      {/* Timeline phases */}
      <div className="space-y-6">
        {timeline.map((phase, i) => {
          const status = getPhaseStatus(phase);
          const overdue = isOverdue(phase.weeksBeforeOpen);
          const isExpanded = expandedPhase === phase.id;

          return (
            <div
              key={phase.id}
              className={`animate-scale-in delay-${Math.min(i + 1, 8)} relative`}
            >
              {/* Connector line */}
              {i < timeline.length - 1 && (
                <div className="absolute left-[19px] top-16 bottom-0 w-px bg-ink-lighter/20 -mb-6 hidden md:block" />
              )}

              <div
                className={`bg-surface border rounded-2xl overflow-hidden transition-all ${
                  overdue && status !== "done"
                    ? "border-red-500/30"
                    : status === "done"
                      ? "border-emerald-500/20"
                      : "border-ink-lighter/20"
                }`}
              >
                {/* Phase header */}
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  className="w-full text-left p-5 md:p-6 flex items-start gap-4"
                >
                  {/* Status indicator */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                      status === "done"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : status === "partial"
                          ? "bg-copper/20 text-copper"
                          : "bg-ink-lighter/30 text-ivory/30"
                    }`}
                  >
                    {status === "done" ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2
                        className="text-lg font-bold text-ivory"
                        style={{ fontFamily: "var(--font-dm-serif)" }}
                      >
                        {phase.name}
                      </h2>
                      {overdue && status !== "done" && (
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                          Overdue
                        </span>
                      )}
                      {status === "partial" && (
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-copper/15 text-copper px-2 py-0.5 rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span
                        className={`font-semibold ${
                          overdue && status !== "done" ? "text-red-400" : "text-copper"
                        }`}
                      >
                        {getDateForPhase(phase.weeksBeforeOpen)}
                      </span>
                      <span className="text-ivory/20">
                        {phase.categories.filter((s) => progress[s] === "done").length}/{phase.categories.length} categories done
                      </span>
                    </div>
                    <p className="text-xs text-ivory/35 mt-2 line-clamp-2">
                      {phase.description}
                    </p>
                  </div>

                  <svg
                    className={`w-5 h-5 text-ivory/20 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
                    <div className="rule-copper w-full mb-5" style={{ opacity: 0.2 }} />

                    {/* Categories in this phase */}
                    <div className="mb-5">
                      <div className="text-[10px] font-bold tracking-wider uppercase text-ivory/25 mb-3">
                        Categories to Source
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {phase.categories.map((slug) => {
                          const cat = getCategoryBySlug(slug);
                          if (!cat) return null;
                          const catStatus = progress[slug] || "not-started";
                          return (
                            <Link
                              key={slug}
                              href={`/browse/${slug}`}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover-lift ${
                                catStatus === "done"
                                  ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/20"
                                  : catStatus === "in-progress"
                                    ? "bg-copper/10 text-copper border border-copper/20"
                                    : "bg-ink-lighter/20 text-ivory/50 border border-ink-lighter/10 hover:border-copper/30"
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span className="truncate">{cat.name}</span>
                              {catStatus === "done" && (
                                <svg className="w-3.5 h-3.5 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tips */}
                    <div>
                      <div className="text-[10px] font-bold tracking-wider uppercase text-ivory/25 mb-3">
                        Pro Tips
                      </div>
                      <div className="space-y-2">
                        {phase.tips.map((tip, j) => (
                          <div
                            key={j}
                            className="flex items-start gap-2 text-xs text-ivory/40 leading-relaxed"
                          >
                            <span className="text-copper/50 mt-0.5 shrink-0">*</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
