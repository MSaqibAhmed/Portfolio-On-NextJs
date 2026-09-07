import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

/**
 * One card on the sliding rail.
 *
 * Always a link, unlike the old grid card: every project now has a detail
 * page at /projects/<slug>, so there is no longer such a thing as a card with
 * nowhere to go. Whether the project is *deployed* is a separate question,
 * answered on the detail page itself.
 *
 * `next/link` rather than an anchor so the detail page is prefetched and the
 * navigation is client-side — the card is moving under a scrubbed timeline
 * when it gets clicked, and a full document load there is very noticeable.
 */
export default function ProjectCard({ project, className = "", ...rest }) {
  return (
    <article className={`pstage-card ${className}`} {...rest}>
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`${project.title} — open case study`}
        className="group block outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-4 focus-visible:ring-offset-mint"
      >
        {/* Taller on a phone: the rail card is nearly the full width of a
            narrow screen but only a third of its height, and a 5:3 crop
            left the panel looking mostly empty. */}
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-white transition-colors duration-500 group-hover:border-ink/40 sm:aspect-[5/3]">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} — project preview`}
              fill
              sizes="(min-width: 1024px) 32vw, (min-width: 768px) 42vw, 80vw"
              className="object-cover object-center transition-transform duration-[700ms] ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <ImagePlaceholder
              label={`${project.title} — upload screenshot`}
              className="h-full w-full"
            />
          )}
        </div>

        <p className="mt-4 text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
          {project.index} / {project.category}
        </p>

        <h3 className="mt-1 flex items-center gap-2 text-xl font-bold lg:text-2xl">
          <span className="transition-transform duration-500 ease-out group-hover:translate-x-1">
            {project.title}
          </span>
          <ArrowUpRight
            aria-hidden
            className="h-5 w-5 shrink-0 -translate-x-1 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          />
        </h3>

        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.1em] text-ink-soft">
          {project.stack}
        </p>
      </Link>
    </article>
  );
}
