import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

function CardBody({ project, live }) {
  return (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-white transition-colors duration-500 group-hover:border-ink/40">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} — project preview`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center transition-transform duration-[700ms] ease-out group-hover:scale-[1.035]"
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

      <h3 className="mt-1 flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <span className="transition-transform duration-500 ease-out group-hover:translate-x-1">
          {project.title}
        </span>
        {live ? (
          <ArrowUpRight
            aria-hidden
            className="h-5 w-5 shrink-0 -translate-x-1 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          />
        ) : null}
      </h3>

      <p className="mt-1 text-[0.7rem] uppercase tracking-[0.1em] text-ink-soft">
        {project.stack}
      </p>
    </>
  );
}

export default function ProjectCard({ project, className = "", ...rest }) {
  const live = Boolean(project.url);

  // Only a deployed project becomes a link — otherwise the card keeps no
  // pointer/hover affordance, so it never implies a click that does nothing.
  if (!live) {
    return (
      <article className={className} {...rest}>
        <CardBody project={project} live={false} />
      </article>
    );
  }

  return (
    <article className={className} {...rest}>
      <a
        href={project.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`${project.title} — open live site in a new tab`}
        className="group block outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-4 focus-visible:ring-offset-mint"
      >
        <CardBody project={project} live />
      </a>
    </article>
  );
}
