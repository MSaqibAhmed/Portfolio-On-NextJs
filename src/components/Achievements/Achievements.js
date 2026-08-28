import { achievements } from "@/data/achievements";

function LargeItem({ item }) {
  return (
    <div className="border-b border-line py-10">
      <span className="text-xs text-ink-soft">{item.index}</span>
      <div className="mt-2 flex flex-wrap items-baseline gap-3 sm:gap-4">
        <h3 className="font-display text-4xl font-semibold uppercase leading-none sm:text-5xl">
          {item.title}
        </h3>
        <span className="font-display text-2xl font-medium text-ink-soft sm:text-3xl">
          {item.year}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {item.badge ? (
          <span className="rounded-full bg-ink px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-white">
            {item.badge}
          </span>
        ) : null}
        <p className="text-sm text-ink-soft sm:text-base">{item.description}</p>
      </div>
    </div>
  );
}

function CompactItem({ item }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex items-baseline gap-3">
        <span className="text-xs text-ink-soft">{item.index}</span>
        <h3 className="font-display text-2xl font-medium uppercase sm:text-3xl">
          {item.title}
        </h3>
        <span className="font-display text-xl font-medium text-ink-soft sm:text-2xl">
          {item.year}
        </span>
      </div>
      <p className="text-sm text-ink-soft sm:max-w-xs sm:text-right">
        {item.description}
      </p>
    </div>
  );
}

export default function Achievements() {
  return (
    <section id="achievements" className="container-px py-20 sm:py-28">
      <h2 className="font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight">
        Achievements
      </h2>
      <p className="mt-4 text-base text-ink-soft sm:text-lg">
        Milestones and achievements from my journey in software development.
      </p>

      <div className="mt-10 border-t border-line">
        {achievements.map((item) =>
          item.size === "large" ? (
            <LargeItem key={item.index} item={item} />
          ) : (
            <CompactItem key={item.index} item={item} />
          )
        )}
      </div>
    </section>
  );
}
