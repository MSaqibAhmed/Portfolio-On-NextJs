import { ArrowUpRight } from "lucide-react";
import { social, isRealLink } from "@/data/social";
import ScrollReveal from "@/components/ui/ScrollReveal";
import EmailLink from "@/components/ui/EmailLink";

const links = [
  { label: "GitHub", href: social.github },
  { label: "LinkedIn", href: social.linkedin },
];

export default function Contact() {
  return (
    <ScrollReveal
      as="section"
      id="contact"
      className="container-px"
      y={38}
      clip
      stagger={0.11}
      duration={1}
    >
      <div className="auto-cols [--col:22rem] [--max-cols:2] [--col-gap:clamp(3rem,4vw,4rem)]">
        <div className="flex flex-col">
          <p data-reveal className="section-eyebrow text-ink-soft">04 / Connect</p>
          <h2 data-reveal className="mt-4 font-sans text-[clamp(1.875rem,9vw,4.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight">
            Let&rsquo;s
            <br />
            Talk.
          </h2>
          <p data-reveal className="mt-6 max-w-sm text-[clamp(1rem,1.3vw,1.125rem)] text-ink-soft">
            Have a project, opportunity, or idea? Let&rsquo;s build something
            meaningful together.
          </p>

          <ul data-reveal className="mt-10 space-y-4">
            {links.map((link) =>
              isRealLink(link.href) ? (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.14em]"
                  >
                    {link.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </li>
              ) : (
                <li key={link.label}>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {link.label}
                  </span>
                </li>
              )
            )}
            <li>
              <EmailLink
                email={social.email}
                className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.14em]"
              >
                Email
                <ArrowUpRight className="h-4 w-4" />
              </EmailLink>
            </li>
          </ul>

          <div data-reveal className="mt-auto pt-12 text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
            <p className="flex items-center gap-2">
              {/* bg-accent is white, which is also this section's background — the
                  dot was invisible and left a gap in front of the label. */}
              <span className="h-2 w-2 shrink-0 rounded-full bg-ink" />
              {social.status}
            </p>
            <p className="mt-1">{social.location}</p>
          </div>
        </div>

        <form data-reveal className="rounded-2xl bg-dark p-[clamp(1.5rem,3vw,2.5rem)] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <div>
            <label
              htmlFor="name"
              className="text-[0.65rem] uppercase tracking-[0.14em] text-white/50"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              className="mt-2 w-full border-b border-white/15 bg-transparent pb-3 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="mt-8">
            <label
              htmlFor="email"
              className="text-[0.65rem] uppercase tracking-[0.14em] text-white/50"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your email"
              className="mt-2 w-full border-b border-white/15 bg-transparent pb-3 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="mt-8">
            <label
              htmlFor="message"
              className="text-[0.65rem] uppercase tracking-[0.14em] text-white/50"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Your message"
              className="mt-2 w-full resize-none border-b border-white/15 bg-transparent pb-3 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-accent-ink transition-opacity hover:opacity-90"
          >
            Get in touch <ArrowUpRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </ScrollReveal>
  );
}
