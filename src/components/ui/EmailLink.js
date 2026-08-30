"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Email link that always does something visible.
 *
 * `mailto:` is the correct, accessible destination and it works wherever a
 * mail handler exists (every phone, desktops with a mail client). But on a
 * desktop with no handler registered the browser silently does nothing at
 * all, which reads as a dead link. So the click also copies the address and
 * says so — the visitor always leaves with the address either way.
 */
export default function EmailLink({ email, className, children, ...rest }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = () => {
    // Not preventDefault: the mailto still fires and opens the mail client
    // when one exists. This only adds the fallback.
    if (!navigator.clipboard?.writeText) return;
    navigator.clipboard
      .writeText(email)
      .then(() => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        /* clipboard blocked — the mailto is still the primary path */
      });
  };

  return (
    <a href={`mailto:${email}`} className={className} onClick={onClick} {...rest}>
      {children}
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
      {copied ? (
        <span aria-hidden className="ml-2 text-[0.65rem] tracking-[0.14em] opacity-60">
          Copied
        </span>
      ) : null}
    </a>
  );
}
