import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

const stack = ["MongoDB", "Express.js", "React", "Node.js"];

export default function About() {
  return (
    <ScrollReveal
      as="section"
      id="about"
      className="container-px py-20 sm:py-28"
      x={-34}
      y={0}
      clip
      stagger={0.09}
      duration={1}
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
        <div>
          <p data-reveal className="section-eyebrow text-ink-soft">About Muhammad Saqib Ahmed</p>
          <h2 data-reveal className="mt-4 font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight">
            Hey!
          </h2>
          <p data-reveal className="mt-6 text-xl font-semibold leading-snug sm:text-2xl">
            I&rsquo;m Saqib, a Full-Stack Developer based in Pakistan, focused
            on building modern web applications and digital experiences with
            the MERN stack.
          </p>
        </div>

        {/* About personal image — hidden on mobile so only the Hero photo shows there */}
        <div data-reveal className="hidden md:block">
          <div
            data-about-photo
            className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden border border-black/10 bg-black/5"
          >
            <Image
              src="/images/about.png"
              alt="Saqib Ahmed"
              fill
              sizes="(min-width: 768px) 340px, 100vw"
              className="object-cover object-center grayscale"
            />
          </div>
        </div>

        <div>
          <div data-reveal className="space-y-5 text-base leading-relaxed text-ink-soft sm:text-lg">
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
            <ol className="mt-4 space-y-2 text-sm font-medium">
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

      <div data-reveal className="mt-16 grid grid-cols-1 gap-3 border-t border-line pt-6 text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft sm:grid-cols-3 sm:text-center">
        <span className="sm:text-left">Based in Pakistan</span>
        <span>Specialization: Full-Stack / MERN</span>
        <span className="sm:text-right">Status: Open to opportunities</span>
      </div>
    </ScrollReveal>
  );
}
