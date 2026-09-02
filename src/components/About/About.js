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
      <div className="auto-cols [--col:17rem] [--max-cols:3]">
        <div>
          <p data-reveal className="section-eyebrow text-ink-soft">About Muhammad Saqib Ahmed</p>
          <h2 data-reveal className="mt-4 font-sans text-[clamp(1.5rem,7.5vw,3.75rem)] font-extrabold uppercase tracking-tight">
            Hey!
          </h2>
          <p data-reveal className="mt-6 text-[clamp(1.125rem,1.9vw,1.5rem)] font-semibold leading-snug">
            I&rsquo;m Saqib, a Full-Stack Developer based in Pakistan, focused
            on building modern web applications and digital experiences with
            the MERN stack.
          </p>
        </div>

        {/* The portrait takes a column of its own whenever the grid can spare
            one, and stacks with everything else when it can't. It is always in
            the layout, which is also what lets the Hero-to-About portrait
            hand-off measure it at any window size. */}
        <div data-reveal>
          <div
            data-about-photo
            className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden border border-black/10 bg-black/5"
          >
            <Image
              src="/images/about.png"
              alt="Portrait of Muhammad Saqib Ahmed"
              fill
              sizes="min(100vw, 340px)"
              className="object-cover object-center grayscale"
            />
          </div>
        </div>

        <div>
          <div data-reveal className="space-y-5 text-[clamp(1rem,1.3vw,1.125rem)] leading-relaxed text-ink-soft">
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

      <div data-reveal className="auto-cols [--col:13rem] [--max-cols:3] [--col-gap:0.75rem] mt-16 border-t border-line pt-6 text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft">
        <span>Based in Pakistan</span>
        <span>Specialization: Full-Stack / MERN</span>
        <span>Status: Open to opportunities</span>
      </div>
    </ScrollReveal>
  );
}
