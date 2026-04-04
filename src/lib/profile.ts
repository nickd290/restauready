import { RestaurantProfile } from "@/types";

const PROFILE_KEY = "restauready_profile";

export function getProfile(): RestaurantProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RestaurantProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: RestaurantProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export function hasProfile(): boolean {
  return getProfile() !== null;
}
