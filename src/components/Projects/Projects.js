import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Projects() {
  return (
    <ScrollReveal
      as="section"
      id="projects"
      className="container-px"
      y={30}
      clip
      stagger={0.1}
    >
      <div data-reveal className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 className="font-sans text-3xl font-extrabold uppercase tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          Featured Projects
        </h2>
        {/* One link, not a duplicated pair: the wrapping flex row puts it
            beside the heading when there's room and underneath it when there
            isn't, so no breakpoint has to guess which. */}
        <a
          href="#projects"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          View all work <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div data-reveal className="mt-6 border-t border-line sm:mt-8" />

      {/* Its own reveal group so the cards drop in from above while the
          heading rises — nested roots don't steal each other's targets. */}
      <ScrollReveal
        className="mt-8 grid grid-cols-1 gap-10 sm:mt-10 md:grid-cols-2 md:gap-12 lg:mt-12 lg:gap-14"
        y={-56}
        clip
        stagger={0.12}
        duration={1}
        ease="power4.out"
      >
        {projects.map((project) => (
          <ProjectCard
            data-reveal
            key={project.title}
            project={project}
            className={project.featured ? "col-span-full" : undefined}
          />
        ))}
      </ScrollReveal>
    </ScrollReveal>
  );
}
