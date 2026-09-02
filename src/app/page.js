import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import Skills from "@/components/Skills/Skills";
import Projects from "@/components/Projects/Projects";
import Achievements from "@/components/Achievements/Achievements";
import Contact from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";
import SurfaceObserver from "@/components/ui/SurfaceObserver";
import MotionSync from "@/components/ui/MotionSync";
import HeroAboutTransition from "@/components/HeroAboutTransition/HeroAboutTransition";
import PortalLoader from "@/components/PortalLoader/PortalLoader";

export default function Home() {
  return (
    <>
      <PortalLoader />
      <MotionSync />
      <SurfaceObserver />
      <Navbar />
      <HeroAboutTransition />

      {/* Kept as one element (not the Navbar/overlay above) so the radial
          menu can scale just the page content down as it opens, without
          fighting the fixed-position pieces that must stay put. */}
      <div id="page-content">
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Achievements />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
