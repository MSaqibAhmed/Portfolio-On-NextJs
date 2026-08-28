import { ArrowUpRight } from "lucide-react";
import { social } from "@/data/social";

const links = [
  { label: "GitHub", href: social.github },
  { label: "LinkedIn", href: social.linkedin },
  { label: "Email", href: `mailto:${social.email}` },
];

export default function Contact() {
  return (
    <section id="contact" className="container-px py-20 sm:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col">
          <p className="section-eyebrow text-ink-soft">04 / Connect</p>
          <h2 className="mt-4 font-sans text-[clamp(2.25rem,11vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
            Let&rsquo;s
            <br />
            Talk.
          </h2>
          <p className="mt-6 max-w-sm text-base text-ink-soft sm:text-lg">
            Have a project, opportunity, or idea? Let&rsquo;s build something
            meaningful together.
          </p>

          <ul className="mt-10 space-y-4">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.14em]"
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-12 text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              {social.status}
            </p>
            <p className="mt-1">{social.location}</p>
          </div>
        </div>

        <form className="rounded-2xl bg-dark p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:p-10">
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
    </section>
  );
}
