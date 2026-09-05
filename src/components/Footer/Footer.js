import { social, isRealLink } from "@/data/social";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionLink from "@/components/ui/SectionLink";
import EmailLink from "@/components/ui/EmailLink";

const quickLinksA = [
  { label: "Home", href: "#home" },
  { label: "Skills", href: "#skills" },
  { label: "Achievements", href: "#achievements" },
];

const quickLinksB = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <ScrollReveal
      as="footer"
      data-surface-dark
      className="mt-auto overflow-hidden bg-dark text-white"
      y={-28}
      clip
      stagger={0.12}
      duration={1.05}
    >
      <div className="container-px pt-16 lg:pt-20">
        <h2 data-reveal className="font-display text-3xl font-medium uppercase leading-[0.9] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          Building Digital
          <br />
          Experiences.
        </h2>

        <div data-reveal className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:mt-16 lg:grid-cols-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40">
              Quick Links
            </p>
            <div className="mt-5 grid grid-cols-2 gap-x-6 text-sm">
              <ul className="space-y-3">
                {quickLinksA.map((link) => (
                  <li key={link.href}>
                    <SectionLink href={link.href} className="inline-block py-1 text-white/80 hover:text-white">
                      {link.label}
                    </SectionLink>
                  </li>
                ))}
              </ul>
              <ul className="space-y-3">
                {quickLinksB.map((link) => (
                  <li key={link.href}>
                    <SectionLink href={link.href} className="inline-block py-1 text-white/80 hover:text-white">
                      {link.label}
                    </SectionLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40">
              Stack
            </p>
            <p className="mt-5 text-sm leading-relaxed text-white/80">
              <span className="text-white/40">MERN: </span>
              MongoDB, Express.js, React.js, Node.js
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              <span className="text-white/40">Additional: </span>
              JavaScript, Tailwind CSS, GSAP
            </p>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40">
              Contact
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <EmailLink email={social.email} className="break-all text-white/80 hover:text-white">
                  {social.email}
                </EmailLink>
              </li>
              {[
                { label: "GitHub", href: social.github },
                { label: "LinkedIn", href: social.linkedin },
              ].map(({ label, href }) => (
                <li key={label}>
                  {isRealLink(href) ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/80 hover:text-white"
                    >
                      {label} ↗
                    </a>
                  ) : (
                    <span className="text-white/40">{label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-reveal className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 py-6 text-[0.7rem] uppercase tracking-[0.14em] text-white/50 lg:mt-16">
          <span>© 2026 Saqib Ahmed</span>
          <SectionLink href="#home" className="inline-flex items-center gap-1.5 hover:text-white">
            Back to top ↑
          </SectionLink>
        </div>
      </div>

      <p
        aria-hidden
        className="select-none pl-5 font-display font-semibold uppercase leading-[0.8] text-white/[0.06] sm:pl-8 lg:pl-12 2xl:pl-14"
        style={{ fontSize: "clamp(1.75rem, 12vw, 13rem)" }}
      >
        Saqib Ahmed
      </p>
    </ScrollReveal>
  );
}
