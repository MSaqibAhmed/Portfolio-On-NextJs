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
        <h2 className="font-sans text-[clamp(1.5rem,7.5vw,3.75rem)] font-extrabold uppercase tracking-tight">
          Featured Projects
        </h2>
        {/* One link, not a breakpoint-swapped pair: the wrapping flex row
            puts it beside the heading when there's room and underneath it
            when there isn't. */}
        <a
          href="#projects"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          View all work <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div data-reveal className="mt-8 border-t border-line" />

      {/* Its own reveal group so the cards drop in from above while the
          heading rises — nested roots don't steal each other's targets. */}
      <ScrollReveal
        className="auto-cols [--col:20rem] [--max-cols:2] [--col-gap:clamp(2.5rem,4vw,3.5rem)] mt-12"
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
