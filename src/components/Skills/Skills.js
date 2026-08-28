import { Database, Boxes, Code2, Terminal } from "lucide-react";
import { coreStack, skillGroups } from "@/data/skills";

const coreIcons = {
  Database,
  Boxes,
  Code2,
  Terminal,
};

function TaggedPill({ tag, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 text-sm">
      {tag ? (
        <span className="text-[0.65rem] font-semibold text-ink-soft">
          [{tag}]
        </span>
      ) : null}
      {label}
    </span>
  );
}

function SimplePill({ label, filled }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm ${
        filled
          ? "border-ink bg-ink text-white"
          : "border-line bg-white/60 text-ink"
      }`}
    >
      {label}
    </span>
  );
}

export default function Skills() {
  const [frontend, backend] = skillGroups;
  const [database, development] = skillGroups.slice(2, 4);
  const [tools, additional] = skillGroups.slice(4, 6);

  return (
    <section id="skills" className="container-px py-20 sm:py-28">
      <h2 className="font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight">
        Tech Stack
      </h2>
      <p className="mt-4 text-sm uppercase tracking-[0.14em] text-ink-soft">
        Tools &amp; technologies I use to build digital experiences
      </p>

      <div className="mt-10 border-t border-line" />

      <div className="py-8">
        <div className="mb-5 flex items-center gap-3">
          <p className="section-eyebrow text-ink-soft">01 / Core Stack</p>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[0.65rem] font-semibold text-white">
            MERN
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {coreStack.map((item) => {
            const Icon = coreIcons[item.icon];
            return (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-line py-8 md:grid-cols-2 md:gap-16">
        {[frontend, backend].map((group) => (
          <div key={group.title}>
            <p className="section-eyebrow mb-4 text-ink-soft">
              {group.index} / {group.title}
            </p>
            <div className="flex flex-wrap gap-3">
              {group.items.map((item) => (
                <TaggedPill key={item.label} tag={item.tag} label={item.label} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-line py-8 md:grid-cols-2 md:gap-16">
        {[database, development].map((group) => (
          <div key={group.title}>
            <p className="section-eyebrow mb-4 text-ink-soft">
              {group.index}/ {group.title}
            </p>
            <div className="flex flex-wrap gap-3">
              {group.items.map((item) => (
                <SimplePill key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-line py-8 md:grid-cols-2 md:gap-16">
        {[tools, additional].map((group) => (
          <div key={group.title}>
            <p className="section-eyebrow mb-4 text-ink-soft">
              {group.index}/ {group.title}
            </p>
            <div className="flex flex-wrap gap-3">
              {group.items.map((item) => (
                <SimplePill key={item.label} label={item.label} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
