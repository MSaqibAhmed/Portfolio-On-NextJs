import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="container-px py-20 sm:py-28">
      <div className="flex items-end justify-between gap-6">
        <h2 className="font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight">
          Featured Projects
        </h2>
        <a
          href="#projects"
          className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] sm:inline-flex"
        >
          View all work <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-8 border-t border-line" />

      <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.title}
            project={project}
            className={project.featured ? "md:col-span-2" : undefined}
          />
        ))}
      </div>

      <a
        href="#projects"
        className="mt-10 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] sm:hidden"
      >
        View all work <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </section>
  );
}
