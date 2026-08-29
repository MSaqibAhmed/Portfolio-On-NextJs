import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Projects() {
  return (
    <ScrollReveal
      as="section"
      id="projects"
      className="container-px py-20 sm:py-28"
      y={30}
      clip
      stagger={0.1}
    >
      <div data-reveal className="flex items-end justify-between gap-6">
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

      <div data-reveal className="mt-8 border-t border-line" />

      {/* Its own reveal group so the cards drop in from above while the
          heading rises — nested roots don't steal each other's targets. */}
      <ScrollReveal
        className="mt-12 grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2"
        y={-56}
        clip
        stagger={0.12}
        duration={1}
        ease="power4.out"
        start="top 85%"
      >
        {projects.map((project) => (
          <ProjectCard
            data-reveal
            key={project.title}
            project={project}
            className={project.featured ? "md:col-span-2" : undefined}
          />
        ))}
      </ScrollReveal>

      <a
        href="#projects"
        className="mt-10 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] sm:hidden"
      >
        View all work <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </ScrollReveal>
  );
}
