import { social } from "@/data/social";

const quickLinksA = [
  { label: "Home", href: "#home" },
  { label: "Skills", href: "#skills" },
  { label: "What I Do", href: "#what-i-do" },
  { label: "Achievements", href: "#achievements" },
];

const quickLinksB = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "How I Work", href: "#how-i-work" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer data-surface-dark className="mt-auto overflow-hidden bg-dark text-white">
      <div className="container-px pt-20">
        <h2 className="font-display text-[clamp(1.75rem,9vw,6rem)] font-medium uppercase leading-[0.9] tracking-tight">
          Building Digital
          <br />
          Experiences.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-8 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-10">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40">
              Quick Links
            </p>
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 text-sm min-[420px]:grid-cols-2">
              <ul className="space-y-3">
                {quickLinksA.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-white/80 hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="space-y-3">
                {quickLinksB.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-white/80 hover:text-white">
                      {link.label}
                    </a>
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

          <div className="min-[420px]:col-span-2 sm:col-span-1">
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40">
              Contact
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href={`mailto:${social.email}`} className="break-all text-white/80 hover:text-white">
                  {social.email}
                </a>
              </li>
              <li>
                <a href={social.github} className="text-white/80 hover:text-white">
                  GitHub ↗
                </a>
              </li>
              <li>
                <a href={social.linkedin} className="text-white/80 hover:text-white">
                  LinkedIn ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-white/10 py-6 text-[0.7rem] uppercase tracking-[0.14em] text-white/50">
          <span>© 2026 Saqib Ahmed</span>
          <a href="#home" className="inline-flex items-center gap-1.5 hover:text-white">
            Back to top ↑
          </a>
        </div>
      </div>

      <p
        aria-hidden
        className="select-none pl-[clamp(1.25rem,4vw,3.5rem)] font-display font-semibold uppercase leading-[0.8] text-white/[0.06]"
        style={{ fontSize: "clamp(2rem, 14vw, 13rem)" }}
      >
        Saqib Ahmed
      </p>
    </footer>
  );
}
