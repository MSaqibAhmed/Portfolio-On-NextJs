"use client";

import scrollToSection from "@/lib/scrollToSection";

/**
 * In-page link that keeps a real `href` (middle-click, copy address,
 * keyboard) but takes over the click to smooth-scroll and sync the URL
 * without the browser's own instant hash-jump.
 */
export default function SectionLink({ href, className, children, ...rest }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        scrollToSection(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
