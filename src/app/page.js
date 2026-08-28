import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import Skills from "@/components/Skills/Skills";
import Projects from "@/components/Projects/Projects";
import WhatIDo from "@/components/WhatIDo/WhatIDo";
import HowIWork from "@/components/HowIWork/HowIWork";
import Achievements from "@/components/Achievements/Achievements";
import Contact from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";
import SurfaceObserver from "@/components/ui/SurfaceObserver";
import SmoothScroll from "@/components/ui/SmoothScroll";
import HeroAboutTransition from "@/components/HeroAboutTransition/HeroAboutTransition";

export default function Home() {
  return (
    <>
      <SurfaceObserver />
      <SmoothScroll />
      <Navbar />
      {/* Rendered outside #smooth-wrapper — its overlay is `position: fixed`
          and needs the true viewport, not ScrollSmoother's transformed
          content box. */}
      <HeroAboutTransition />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <WhatIDo />
            <HowIWork />
            <Achievements />
            <Contact />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
