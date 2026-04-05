"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "D" },
  { href: "/browse", label: "Browse", icon: "B" },
  { href: "/timeline", label: "Timeline", icon: "T" },
  { href: "/saved", label: "Saved", icon: "S" },
  { href: "/budget", label: "Budget", icon: "$" },
];

export function Nav() {
  const pathname = usePathname();

  if (pathname === "/setup") return null;

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-between px-10 py-5 border-b border-ink-lighter/50 bg-ink/90 backdrop-blur-md sticky top-0 z-50">
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-copper flex items-center justify-center text-ink font-bold text-sm">
            R
          </div>
          <span
            className="text-lg tracking-tight"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            <span className="text-ivory">Restau</span>
            <span className="text-copper">Ready</span>
          </span>
        </Link>
        <div className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium tracking-wide transition-colors ${
                pathname === link.href
                  ? "text-copper"
                  : "text-ivory/50 hover:text-ivory"
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-5 left-0 right-0 h-px bg-copper" />
              )}
            </Link>
          ))}
          <div className="w-px h-4 bg-ink-lighter" />
          <Link
            href="/setup"
            className="text-sm text-ivory/30 hover:text-ivory/50 transition-colors"
          >
            Settings
          </Link>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-ink/95 backdrop-blur-md border-t border-ink-lighter/30">
        <div className="flex justify-around py-2 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl transition-all ${
                pathname === link.href
                  ? "text-copper bg-copper/8"
                  : "text-ivory/40 hover:text-ivory/60"
              }`}
            >
              <span
                className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  pathname === link.href
                    ? "bg-copper text-ink"
                    : "bg-ink-lighter/50"
                }`}
              >
                {link.icon}
              </span>
              <span className="text-[10px] font-semibold tracking-wide">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
