import { projects } from "./projects";
import { achievements } from "./achievements";
import { social } from "./social";

// The radial menu's six destinations. Each maps to a section that already
// exists on the page; `meta` is derived from the real data files where a
// count applies, so it can't drift out of sync with the content.
export const navMenu = [
  {
    index: "01",
    label: "Home",
    href: "#home",
    meta: "Full-Stack Developer",
  },
  {
    index: "02",
    label: "About",
    href: "#about",
    meta: "Full-Stack / MERN",
  },
  {
    index: "03",
    label: "Skills",
    href: "#skills",
    meta: "MERN + Tooling",
  },
  {
    index: "04",
    label: "Featured Works",
    href: "#projects",
    meta: `${String(projects.length).padStart(2, "0")} Projects`,
  },
  {
    index: "05",
    label: "Achievements",
    href: "#achievements",
    meta: `${String(achievements.length).padStart(2, "0")} Milestones`,
  },
  {
    index: "06",
    label: "Contact",
    href: "#contact",
    meta: social.status,
  },
];

// Hexagon, read clockwise from the top: Home sits at 12 o'clock and the
// rest follow in order around the ring.
export const NAV_ANGLES = [270, 330, 30, 90, 150, 210];
