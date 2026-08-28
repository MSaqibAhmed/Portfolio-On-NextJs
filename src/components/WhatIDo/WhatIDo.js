import { capabilities } from "@/data/whatIDo";

export default function WhatIDo() {
  return (
    <section id="what-i-do" className="container-px py-20 sm:py-28">
      <p className="section-eyebrow text-ink-soft">03 / Capabilities</p>
      <h2 className="mt-4 font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight">
        What I Do
      </h2>
      <p className="mt-4 text-base text-ink-soft sm:text-lg">
        I build modern web applications from interface to backend.
      </p>

      <div className="mt-10 border-t border-line">
        {capabilities.map((item) => (
          <div
            key={item.index}
            className="grid grid-cols-1 gap-4 border-b border-line py-8 md:grid-cols-[1fr_1fr]"
          >
            <div>
              <p className="text-xs text-ink-soft">{item.index}</p>
              <h3 className="mt-2 font-display text-2xl font-medium uppercase leading-tight sm:text-3xl">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.08em] text-ink-soft">
                {item.stack}
              </p>
            </div>
            <p className="text-base leading-relaxed text-ink-soft md:pt-8">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
