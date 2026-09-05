import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

const stack = ["MongoDB", "Express.js", "React", "Node.js"];

export default function About() {
  return (
    <ScrollReveal
      as="section"
      id="about"
      className="container-px"
      x={-34}
      y={0}
      clip
      stagger={0.09}
      duration={1}
    >
      {/* One column on a phone, intro + portrait side by side from `md`, and
          the full three-column reading order from `lg`. The body copy spans
          both columns at `md` so it keeps a comfortable measure instead of
          being squeezed into half a tablet. */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-12">
        <div>
          <p data-reveal className="section-eyebrow text-ink-soft">About Muhammad Saqib Ahmed</p>
          <h2 data-reveal className="mt-4 font-sans text-3xl font-extrabold uppercase tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Hey!
          </h2>
          <p data-reveal className="mt-6 text-lg font-semibold leading-snug sm:text-xl lg:text-2xl">
            I&rsquo;m Saqib, a Full-Stack Developer based in Pakistan, focused
            on building modern web applications and digital experiences with
            the MERN stack.
          </p>
        </div>

        {/* The portrait keeps a column of its own from `md` up and stacks
            below that. It is always in the layout, which is also what lets
            the Hero-to-About portrait hand-off measure it on wide screens. */}
        <div data-reveal>
          <div
            data-about-photo
            className="relative mx-auto aspect-[4/5] w-full max-w-[16rem] overflow-hidden border border-black/10 bg-black/5 sm:max-w-[19rem] lg:max-w-[21.25rem]"
          >
            <Image
              src="/images/about.png"
              alt="Portrait of Muhammad Saqib Ahmed"
              fill
              sizes="(min-width: 1024px) 340px, (min-width: 640px) 304px, 256px"
              className="object-cover object-center grayscale"
            />
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <div data-reveal className="space-y-5 text-base leading-relaxed text-ink-soft lg:text-lg">
            <p>
              I&rsquo;m a Full-Stack Developer specializing in the MERN
              stack, with a strong focus on building clean, responsive, and
              scalable web applications.
            </p>
            <p>
              From designing intuitive React interfaces to developing
              reliable Node.js and Express backends, I enjoy turning ideas
              into complete digital products.
            </p>
            <p>
              I work with MongoDB, Express.js, React.js, and Node.js, while
              also using modern tools and technologies to create fast,
              interactive, and maintainable experiences.
            </p>
          </div>

          <div data-reveal className="mt-8 border-t border-line pt-6">
            <p className="section-eyebrow text-ink-soft">My Stack</p>
            <ol className="mt-4 grid grid-cols-2 gap-y-2 text-sm font-medium sm:grid-cols-4 lg:grid-cols-2">
              {stack.map((item, i) => (
                <li key={item}>
                  <span className="text-ink-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  {item.toUpperCase()}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div
        data-reveal
        className="mt-12 grid grid-cols-1 gap-y-2 border-t border-line pt-6 text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft sm:grid-cols-2 sm:gap-x-6 lg:mt-16 lg:grid-cols-3"
      >
        <span>Based in Pakistan</span>
        <span>Specialization: Full-Stack / MERN</span>
        <span className="sm:col-span-2 lg:col-span-1">Status: Open to opportunities</span>
      </div>
    </ScrollReveal>
  );
}
