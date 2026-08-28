import { MoreHorizontal } from "lucide-react";
import { navLinks } from "@/data/nav";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center pt-4 sm:pt-5">
      {/* Closed / static state. The circular ref for the future radial menu
          lives on this same element so it can expand in place later. */}
      <nav
        aria-label="Primary"
        className="flex items-center gap-3 rounded-full bg-dark px-5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:px-6 sm:py-3"
      >
        <a
          href="#home"
          className="font-display text-[0.65rem] font-medium uppercase tracking-[0.3em] text-white sm:text-xs"
        >
          Saqib Ahmed
        </a>
        <span className="h-4 w-px bg-white/15" />
        {/* Menu trigger placeholder — will expand into the radial nav */}
        <button
          type="button"
          aria-label="Open navigation menu"
          className="flex h-5 w-5 items-center justify-center text-white/70"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
        </button>
      </nav>

      {/* Anchor links kept in the DOM (visually hidden) so every section is
          reachable now; the radial menu will surface these visually later. */}
      <ul className="sr-only-focusable">
        {navLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </header>
  );
}
