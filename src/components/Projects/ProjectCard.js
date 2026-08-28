import Image from "next/image";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function ProjectCard({ project, className = "" }) {
  return (
    <article className={className}>
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-white">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} — project preview`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center"
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
      <h3 className="mt-1 text-xl font-bold sm:text-2xl">{project.title}</h3>
      <p className="mt-1 text-[0.7rem] uppercase tracking-[0.1em] text-ink-soft">
        {project.stack}
      </p>
    </article>
  );
}
