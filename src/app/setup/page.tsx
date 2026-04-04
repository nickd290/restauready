"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RestaurantProfile } from "@/types";
import { getProfile, saveProfile } from "@/lib/profile";
import { conceptPresets } from "@/lib/presets";

const cuisineTypes = [
  "Italian", "Mexican", "Asian Fusion", "Japanese / Sushi", "Chinese",
  "Thai", "Indian", "American", "BBQ / Smokehouse", "Seafood",
  "Mediterranean", "French", "Farm-to-Table", "Pizza",
  "Diner / Comfort Food", "Steakhouse", "Cafe / Bakery", "Fast Casual",
  "Fine Dining", "Pub / Gastropub",
];

const styles = [
  "Modern / Minimalist", "Rustic / Farmhouse", "Industrial",
  "Classic / Traditional", "Mid-Century Modern", "Coastal / Nautical",
  "Bohemian / Eclectic", "Sleek & Dark", "Bright & Airy", "Vintage / Retro",
];

const STYLE_MEMORY_KEY = "restauready_style_memory";

export default function SetupPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<RestaurantProfile>({
    name: "", cuisineType: "", seatingCapacity: "medium",
    style: "", budgetTier: "midrange", location: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const existing = getProfile();
    if (existing) { setProfile(existing); setIsExisting(true); setShowCustom(true); }
  }, []);

  function applyPreset(presetId: string) {
    const preset = conceptPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setProfile({
      ...profile,
      cuisineType: preset.cuisineType,
      style: preset.style,
      budgetTier: preset.budgetTier,
    });
    // Seed style memory with preset keywords
    const mem = {
      keywords: preset.styleKeywords,
      materials: preset.styleKeywords.filter((k) =>
        ["leather", "brass", "copper", "wood", "oak", "walnut", "marble", "velvet", "steel", "iron", "glass", "concrete", "reclaimed", "tufted", "linen", "chrome", "gold", "bronze", "ceramic", "porcelain", "stone", "terrazzo", "cast iron", "galvanized metal", "driftwood", "rope"].some((m) => k.includes(m))
      ),
      colors: preset.styleKeywords.filter((k) =>
        ["dark", "black", "brown", "cognac", "blue", "white", "natural", "olive", "terracotta"].some((c) => k.includes(c))
      ),
      vibes: preset.styleKeywords.filter((k) =>
        ["speakeasy", "vintage", "retro", "industrial", "rustic", "modern", "minimalist", "art deco", "prohibition", "classic", "elegant", "upscale", "cozy", "intimate", "moody", "sophisticated", "contemporary", "coastal", "nautical"].some((v) => k.includes(v))
      ),
      savedProductNames: [],
    };
    localStorage.setItem(STYLE_MEMORY_KEY, JSON.stringify(mem));
    setShowCustom(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveProfile(profile);
    router.push("/");
  }

  const isValid = profile.name && profile.cuisineType && profile.style && profile.location;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 md:py-20">
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-copper) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-copper/10 border border-copper/20 mb-6">
            <span className="text-copper text-xl" style={{ fontFamily: "var(--font-dm-serif)" }}>R</span>
          </div>
          <h1
            className="text-4xl md:text-5xl tracking-tight mb-3"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            <span className="text-ivory">Restau</span>
            <span className="text-copper">Ready</span>
          </h1>
          <div className="rule-copper w-16 mx-auto mb-4" />
          <p className="text-ivory/40 text-sm tracking-wide">
            {isExisting ? "Update your restaurant profile" : "What kind of restaurant are you opening?"}
          </p>
        </div>

        {/* Concept Presets */}
        {!isExisting && !showCustom && (
          <div className="animate-fade-up delay-1 mb-10">
            <div className="label-editorial mb-4">Start with a concept</div>
            <div className="space-y-3">
              {conceptPresets.map((preset, i) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={`animate-scale-in delay-${i + 1} w-full text-left bg-surface border rounded-2xl p-5 transition-all group hover-lift ${
                    preset.id === "speakeasy-steakhouse"
                      ? "border-copper/40 bg-copper/5"
                      : "border-ink-lighter/20 hover:border-copper/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-ivory group-hover:text-copper transition-colors">
                        {preset.name}
                        {preset.id === "speakeasy-steakhouse" && (
                          <span className="ml-2 text-[10px] font-bold tracking-wider uppercase bg-copper/20 text-copper px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ivory/35 mt-1">{preset.tagline}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {preset.styleKeywords.slice(0, 5).map((kw) => (
                          <span key={kw} className="text-[10px] bg-ink-lighter/50 text-ivory/30 px-2 py-0.5 rounded-full">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-ivory/15 group-hover:text-copper/50 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="mt-4 text-xs text-ivory/25 hover:text-copper transition-colors"
            >
              Or build a custom profile from scratch
            </button>
          </div>
        )}

        {/* Custom form */}
        {showCustom && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Restaurant Name */}
            <div className="animate-fade-up delay-1">
              <label className="label-editorial block mb-3">Restaurant Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="e.g. The Velvet Cut"
                className="w-full bg-surface border border-ink-lighter/30 rounded-xl px-5 py-4 text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-copper/50 focus:ring-1 focus:ring-copper/20 transition-all text-sm"
              />
            </div>

            {/* Cuisine Type */}
            <div className="animate-fade-up delay-2">
              <label className="label-editorial block mb-3">Cuisine Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cuisineTypes.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => setProfile({ ...profile, cuisineType: cuisine })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      profile.cuisineType === cuisine
                        ? "bg-copper text-ink shadow-lg shadow-copper/20"
                        : "bg-surface border border-ink-lighter/20 text-ivory/50 hover:border-copper/30 hover:text-ivory"
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Seating Capacity */}
            <div className="animate-fade-up delay-3">
              <label className="label-editorial block mb-3">Seating Capacity</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "small" as const, label: "Small", sub: "Under 30 seats" },
                  { value: "medium" as const, label: "Medium", sub: "30 - 80 seats" },
                  { value: "large" as const, label: "Large", sub: "80+ seats" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setProfile({ ...profile, seatingCapacity: opt.value })}
                    className={`px-4 py-4 rounded-xl text-center transition-all ${
                      profile.seatingCapacity === opt.value
                        ? "bg-copper text-ink shadow-lg shadow-copper/20"
                        : "bg-surface border border-ink-lighter/20 text-ivory/50 hover:border-copper/30 hover:text-ivory"
                    }`}
                  >
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style / Aesthetic */}
            <div className="animate-fade-up delay-4">
              <label className="label-editorial block mb-3">Style / Aesthetic</label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setProfile({ ...profile, style })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      profile.style === style
                        ? "bg-copper text-ink shadow-lg shadow-copper/20"
                        : "bg-surface border border-ink-lighter/20 text-ivory/50 hover:border-copper/30 hover:text-ivory"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Tier */}
            <div className="animate-fade-up delay-5">
              <label className="label-editorial block mb-3">Budget Tier</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "budget" as const, label: "Budget", sub: "Best value" },
                  { value: "midrange" as const, label: "Mid-Range", sub: "Quality balance" },
                  { value: "premium" as const, label: "Premium", sub: "Top of the line" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setProfile({ ...profile, budgetTier: opt.value })}
                    className={`px-4 py-4 rounded-xl text-center transition-all ${
                      profile.budgetTier === opt.value
                        ? "bg-copper text-ink shadow-lg shadow-copper/20"
                        : "bg-surface border border-ink-lighter/20 text-ivory/50 hover:border-copper/30 hover:text-ivory"
                    }`}
                  >
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="animate-fade-up delay-6">
              <label className="label-editorial block mb-3">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. Chicago, IL"
                className="w-full bg-surface border border-ink-lighter/30 rounded-xl px-5 py-4 text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-copper/50 focus:ring-1 focus:ring-copper/20 transition-all text-sm"
              />
            </div>

            {/* Submit */}
            <div className="animate-fade-up delay-7 pt-2">
              <button
                type="submit"
                disabled={!isValid}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all ${
                  isValid
                    ? "bg-copper text-ink hover:bg-copper-light shadow-lg shadow-copper/25 cursor-pointer"
                    : "bg-ink-lighter text-ivory/20 cursor-not-allowed"
                }`}
              >
                {isExisting ? "Update Profile" : "Get Started"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
