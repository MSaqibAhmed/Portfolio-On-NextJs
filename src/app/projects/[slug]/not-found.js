import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Project not found",
  robots: { index: false, follow: true },
};

export default function ProjectNotFound() {
  return (
    <main className="container-px flex min-h-screen flex-col items-start justify-center">
      <p className="section-eyebrow text-ink-soft">404</p>

      <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl md:text-7xl">
        No such project
      </h1>

      <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
        That link doesn&apos;t match anything in the work. It may have been
        renamed since it was shared.
      </p>

      <Link
        href="/#projects"
        className="group mt-10 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-mint transition-colors duration-300 hover:bg-transparent hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-x-1" />
        Back to all projects
      </Link>
    </main>
  );
}
