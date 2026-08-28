import { processSteps } from "@/data/howIWork";

export default function HowIWork() {
  return (
    <section id="how-i-work" className="container-px py-20 sm:py-28">
      <h2 className="font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight">
        How I Work
      </h2>
      <p className="mt-4 text-base text-ink-soft sm:text-lg">
        I turn ideas into complete digital products through a simple,
        structured development process.
      </p>

      <div className="mt-10 border-t border-line">
        {processSteps.map((step) => (
          <div
            key={step.index}
            className="grid grid-cols-1 gap-3 border-b border-line py-7 md:grid-cols-[3rem_1fr_2fr] md:items-center md:gap-6"
          >
            <span className="text-xs text-ink-soft">{step.index}</span>
            <h3 className="font-display text-2xl font-medium uppercase sm:text-3xl">
              {step.title}
            </h3>
            <p className="text-base text-ink-soft">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
