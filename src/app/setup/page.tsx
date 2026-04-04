"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RestaurantProfile } from "@/types";
import { getProfile, saveProfile } from "@/lib/profile";

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

export default function SetupPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<RestaurantProfile>({
    name: "", cuisineType: "", seatingCapacity: "medium",
    style: "", budgetTier: "midrange", location: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const existing = getProfile();
    if (existing) { setProfile(existing); setIsExisting(true); }
  }, []);

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
            {isExisting ? "Update your restaurant profile" : "Tell us about your restaurant"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Restaurant Name */}
          <div className="animate-fade-up delay-1">
            <label className="label-editorial block mb-3">Restaurant Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="e.g. The Golden Fork"
              className="w-full bg-surface border border-ink-lighter/30 rounded-xl px-5 py-4 text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-copper/50 focus:ring-1 focus:ring-copper/20 transition-all text-sm"
              onFocus={() => setStep(1)}
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
                  onClick={() => { setProfile({ ...profile, cuisineType: cuisine }); setStep(2); }}
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
                  onClick={() => { setProfile({ ...profile, seatingCapacity: opt.value }); setStep(3); }}
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
                  onClick={() => { setProfile({ ...profile, style }); setStep(4); }}
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
                  onClick={() => { setProfile({ ...profile, budgetTier: opt.value }); setStep(5); }}
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
              onFocus={() => setStep(6)}
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
      </div>
    </div>
  );
}
