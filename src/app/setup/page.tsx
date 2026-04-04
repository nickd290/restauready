"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RestaurantProfile } from "@/types";
import { getProfile, saveProfile } from "@/lib/profile";

const cuisineTypes = [
  "Italian",
  "Mexican",
  "Asian Fusion",
  "Japanese / Sushi",
  "Chinese",
  "Thai",
  "Indian",
  "American",
  "BBQ / Smokehouse",
  "Seafood",
  "Mediterranean",
  "French",
  "Farm-to-Table",
  "Pizza",
  "Diner / Comfort Food",
  "Steakhouse",
  "Cafe / Bakery",
  "Fast Casual",
  "Fine Dining",
  "Pub / Gastropub",
];

const styles = [
  "Modern / Minimalist",
  "Rustic / Farmhouse",
  "Industrial",
  "Classic / Traditional",
  "Mid-Century Modern",
  "Coastal / Nautical",
  "Bohemian / Eclectic",
  "Sleek & Dark",
  "Bright & Airy",
  "Vintage / Retro",
];

export default function SetupPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<RestaurantProfile>({
    name: "",
    cuisineType: "",
    seatingCapacity: "medium",
    style: "",
    budgetTier: "midrange",
    location: "",
  });
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    const existing = getProfile();
    if (existing) {
      setProfile(existing);
      setIsExisting(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveProfile(profile);
    router.push("/");
  }

  const isValid =
    profile.name && profile.cuisineType && profile.style && profile.location;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            <span className="text-cream">Restau</span>
            <span className="text-amber">Ready</span>
          </h1>
          <p className="text-cream/50 text-lg">
            {isExisting
              ? "Update your restaurant profile"
              : "Tell us about your restaurant"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-amber mb-2">
              -- Restaurant Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              placeholder="e.g. The Golden Fork"
              className="w-full bg-surface border border-charcoal-lighter rounded-lg px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:border-amber transition-colors"
            />
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-amber mb-2">
              -- Cuisine Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() =>
                    setProfile({ ...profile, cuisineType: cuisine })
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    profile.cuisineType === cuisine
                      ? "bg-amber text-charcoal"
                      : "bg-surface text-cream/60 hover:bg-surface-hover hover:text-cream"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Seating Capacity */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-amber mb-2">
              -- Seating Capacity
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "small" as const, label: "Small", sub: "Under 30" },
                { value: "medium" as const, label: "Medium", sub: "30 - 80" },
                { value: "large" as const, label: "Large", sub: "80+" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setProfile({ ...profile, seatingCapacity: opt.value })
                  }
                  className={`px-4 py-3 rounded-lg text-center transition-all ${
                    profile.seatingCapacity === opt.value
                      ? "bg-amber text-charcoal"
                      : "bg-surface text-cream/60 hover:bg-surface-hover hover:text-cream"
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-xs opacity-70">{opt.sub} seats</div>
                </button>
              ))}
            </div>
          </div>

          {/* Style / Aesthetic */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-amber mb-2">
              -- Style / Aesthetic
            </label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setProfile({ ...profile, style })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    profile.style === style
                      ? "bg-amber text-charcoal"
                      : "bg-surface text-cream/60 hover:bg-surface-hover hover:text-cream"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Tier */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-amber mb-2">
              -- Budget Tier
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "budget" as const, label: "Budget", sub: "Best value" },
                { value: "midrange" as const, label: "Mid-Range", sub: "Quality balance" },
                { value: "premium" as const, label: "Premium", sub: "Top of the line" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setProfile({ ...profile, budgetTier: opt.value })
                  }
                  className={`px-4 py-3 rounded-lg text-center transition-all ${
                    profile.budgetTier === opt.value
                      ? "bg-amber text-charcoal"
                      : "bg-surface text-cream/60 hover:bg-surface-hover hover:text-cream"
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-xs opacity-70">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-amber mb-2">
              -- Location
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
              placeholder="e.g. Chicago, IL"
              className="w-full bg-surface border border-charcoal-lighter rounded-lg px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:border-amber transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isValid
                ? "bg-amber text-charcoal hover:bg-amber-light cursor-pointer"
                : "bg-charcoal-lighter text-cream/30 cursor-not-allowed"
            }`}
          >
            {isExisting ? "Update Profile" : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}
