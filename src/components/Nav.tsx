"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/browse", label: "Browse" },
  { href: "/saved", label: "Saved" },
  { href: "/budget", label: "Budget" },
];

export function Nav() {
  const pathname = usePathname();

  if (pathname === "/setup") return null;

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-between px-8 py-4 border-b border-charcoal-light bg-charcoal/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-cream">Restau</span>
          <span className="text-amber">Ready</span>
        </Link>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-amber"
                  : "text-cream/60 hover:text-cream"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/setup"
            className="text-sm text-cream/40 hover:text-cream/60 transition-colors"
          >
            Settings
          </Link>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-charcoal/95 backdrop-blur-sm border-t border-charcoal-light">
        <div className="flex justify-around py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ${
                pathname === link.href
                  ? "text-amber"
                  : "text-cream/50 hover:text-cream"
              }`}
            >
              <span className="text-lg">
                {link.label === "Dashboard" && "📊"}
                {link.label === "Browse" && "🔍"}
                {link.label === "Saved" && "💾"}
                {link.label === "Budget" && "💰"}
              </span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
