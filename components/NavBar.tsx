"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/wardrobe", label: "Wardrobe", icon: WardrobeIcon },
  { href: "/recommendations", label: "Looks", icon: LooksIcon },
  { href: "/saved", label: "Saved", icon: SavedIcon },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-ink/8 bg-cream/90 backdrop-blur sm:block">
        <div className="container-app flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-tight text-ink">
            StyleEase
          </Link>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    active ? "bg-ink text-cream" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-center border-b border-ink/8 bg-cream/90 backdrop-blur sm:hidden">
        <Link href="/" className="font-display text-lg tracking-tight text-ink">
          StyleEase
        </Link>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-ink/8 bg-cream/95 backdrop-blur sm:hidden">
        {LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                active ? "text-ink" : "text-ink/45"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11 L12 4 L20 11" />
      <path d="M6 10 V20 H18 V10" />
    </svg>
  );
}
function WardrobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M12 3 V21" />
    </svg>
  );
}
function LooksIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4 L4 17 Q4 20 8 20 L20 20" />
      <circle cx="8" cy="4" r="2.2" />
      <path d="M12 8 L20 8 M12 12 L20 12" />
    </svg>
  );
}
function SavedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3 H18 V21 L12 17 L6 21 Z" />
    </svg>
  );
}
