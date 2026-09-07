import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { projects, findProject } from "@/data/projects";
import { siteName, siteUrl } from "@/data/site";
import { social, isRealLink } from "@/data/social";
import EmailLink from "@/components/ui/EmailLink";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import ScrollTop from "@/components/ui/ScrollTop";

// Every project is known at build time, so all four detail pages are static.
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      url: `${siteUrl}/projects/${project.slug}`,
      title: `${project.title} — ${siteName}`,
      description: project.summary,
      images: project.image ? [{ url: project.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — ${siteName}`,
      description: project.summary,
      images: project.image ? [project.image] : undefined,
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const live = Boolean(project.url);

  return (
    <>
      <ScrollTop />

      {/* A plain bar rather than the site's radial menu: every destination in
          that menu is an in-page anchor, and none of them exist on this
          route. One honest way back is worth more than six dead links. */}
      <header className="border-b border-line bg-mint">
        <div className="container-px flex items-center justify-between gap-4 py-5">
          <Link
            href="/#projects"
            className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-x-1" />
            All projects
          </Link>
          <Link
            href="/"
            className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
          >
            {siteName}
          </Link>
        </div>
      </header>

      <main>
        <section className="container-px">
          <p className="section-eyebrow text-ink-soft">
            {project.index} / {project.category}
          </p>

          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            {project.title}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {project.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            {live ? (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-mint transition-colors duration-300 hover:bg-transparent hover:text-ink"
              >
                Visit live site
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              // Not deployed yet — said plainly, rather than dressed up as a
              // button that goes nowhere.
              <span className="inline-flex items-center gap-2 border border-dashed border-line px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Not deployed yet
              </span>
            )}

            <EmailLink
              email={social.email}
              className="inline-flex items-center gap-2 border border-line px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:border-ink"
            >
              Ask about this build
            </EmailLink>
          </div>

          {/* Kept inside the same section as the title: the global rhythm puts
              up to 7rem of padding between sections, which is a canyon
              between a headline and the screenshot it introduces. */}
          <div className="relative mt-12 aspect-[5/3] w-full overflow-hidden border border-line bg-white lg:mt-16">
            {project.image ? (
              <Image
                src={project.image}
                alt={`${project.title} — full project preview`}
                fill
                priority
                sizes="(min-width: 1024px) 76rem, 100vw"
                className="object-cover object-top"
              />
            ) : (
              <ImagePlaceholder
                label={`${project.title} — upload screenshot`}
                className="h-full w-full"
              />
            )}
          </div>
        </section>

        <section className="container-px">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            <div className="md:col-span-2">
              <h2 className="section-eyebrow text-ink-soft">Overview</h2>
              <div className="mt-5 space-y-5 text-base leading-relaxed sm:text-lg">
                {project.overview.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <h2 className="section-eyebrow mt-12 text-ink-soft">
                What it does
              </h2>
              <ul className="mt-5 space-y-3">
                {project.features.map((feature) => (
                  <li key={feature} className="flex gap-3 leading-relaxed">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-ink"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="md:border-l md:border-line md:pl-10">
              <h2 className="section-eyebrow text-ink-soft">Built with</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.tech.map((item) => (
                  <li
                    key={item}
                    className="border border-line px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.1em]"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <h2 className="section-eyebrow mt-10 text-ink-soft">Type</h2>
              <p className="mt-4 text-sm">{project.category}</p>

              <h2 className="section-eyebrow mt-10 text-ink-soft">Status</h2>
              <p className="mt-4 text-sm">
                {live ? "Live" : "Built — not deployed"}
              </p>

              {isRealLink(social.github) ? (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-10 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
                >
                  Source on GitHub
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </aside>
          </div>
        </section>
      </main>

      <footer className="mt-auto bg-dark text-white" data-surface-dark>
        <div className="container-px py-14 lg:py-20">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40">
            Next project
          </p>

          <Link
            href={`/projects/${next.slug}`}
            className="group mt-4 inline-flex items-center gap-4"
          >
            <span className="font-display text-3xl font-black uppercase leading-none tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-1 sm:text-5xl md:text-6xl lg:text-7xl">
              {next.title}
            </span>
            <ArrowRight className="h-6 w-6 shrink-0 transition-transform duration-500 ease-out group-hover:translate-x-1 lg:h-8 lg:w-8" />
          </Link>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-[0.7rem] uppercase tracking-[0.14em] text-white/50">
            <Link href="/#projects" className="hover:text-white">
              ← All projects
            </Link>
            <span>© 2026 Saqib Ahmed</span>
          </div>
        </div>
      </footer>
    </>
  );
}
