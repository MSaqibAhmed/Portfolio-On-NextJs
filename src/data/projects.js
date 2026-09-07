// `url` is the live deployment. Leave it null for anything that isn't
// deployed yet — the detail page only renders a "Visit live site" button when
// there is a real URL, so an unset one never promises a link that goes
// nowhere.
//
// `slug` is the detail route: /projects/<slug>. It is part of the public URL,
// so treat it as permanent — renaming one breaks any link already shared.
//
// EDIT ME: `summary`, `overview` and `features` are the body copy of each
// detail page. They describe what each project does based on its stack and
// purpose; rewrite them in your own words before the site goes live.
export const projects = [
  {
    slug: "fitness-tracker",
    index: "01",
    category: "Web Application",
    title: "Fitness Tracker",
    stack: "React • Node.js • Express.js • MongoDB",
    tech: ["React", "Node.js", "Express.js", "MongoDB", "REST API"],
    image: "/images/Mockup-4.3.png",
    url: "https://fitness-tracker-react-seven.vercel.app/",
    featured: false,
    summary:
      "A full-stack workout log that turns day-to-day training into something you can actually read back.",
    overview: [
      "Fitness Tracker is a MERN application for logging workouts and following them over time. Sessions, exercises, sets and reps are stored per user, so the history belongs to the account rather than to the browser it was entered on.",
      "The React front end talks to an Express API backed by MongoDB. State is kept deliberately thin on the client — the server owns the data and the interface reads from it, which keeps the log consistent across devices.",
    ],
    features: [
      "Account-scoped workout history stored in MongoDB",
      "Create, edit and delete sessions with exercises, sets and reps",
      "Express REST API with validation on every write",
      "Responsive layout built for one-handed use mid-workout",
    ],
  },
  {
    slug: "hotel-management-system",
    index: "02",
    category: "Web Application",
    title: "Hotel Management System",
    stack: "React • Node.js • Express.js • MongoDB",
    tech: ["React", "Node.js", "Express.js", "MongoDB", "REST API"],
    image: "/images/Mockup-1.3.png",
    url: "https://hotelmanagement-steel.vercel.app/",
    featured: false,
    summary:
      "Rooms, guests and bookings in one place — the back office of a small hotel, on the web.",
    overview: [
      "A MERN back-office tool covering the parts of a hotel that a spreadsheet stops being able to hold: the room inventory, the guest records attached to it, and the bookings that connect the two.",
      "Availability is derived from the bookings themselves rather than stored separately, so a room can never read as free and booked at the same time. The React interface is organised around that single source of truth.",
    ],
    features: [
      "Room inventory with per-room type, rate and status",
      "Guest records linked to their booking history",
      "Booking flow with date-range availability checks",
      "Express + MongoDB API shared by every view",
    ],
  },
  {
    slug: "infinityhub",
    index: "03",
    category: "Landing Page",
    title: "InfinityHub",
    stack: "React • JavaScript • CSS",
    tech: ["React", "JavaScript", "CSS"],
    image: "/images/Mockup-3.3.png",
    url: null,
    featured: false,
    summary:
      "A product landing page built as composable React sections rather than one long file.",
    overview: [
      "InfinityHub is a marketing front page for a digital product: hero, feature grid, social proof and a closing call to action, each one its own React component with its own data.",
      "The layout is hand-written CSS rather than a framework, which kept the page light and made the responsive behaviour explicit at every breakpoint instead of inherited from utility defaults.",
    ],
    features: [
      "Section-per-component structure, content passed in as data",
      "Hand-written responsive CSS, no UI framework",
      "Accessible landmarks and keyboard-reachable navigation",
    ],
  },
  {
    slug: "nestora",
    index: "04",
    category: "Landing Page",
    title: "Nestora",
    stack: "React • JavaScript • CSS",
    tech: ["React", "JavaScript", "CSS"],
    image: "/images/Mockup-5.3.png",
    url: null,
    featured: false,
    summary:
      "A property-listing front page where the imagery carries the layout and the type stays out of its way.",
    overview: [
      "Nestora is a real-estate landing page: a full-bleed hero, a listings grid, and a contact section. The visual weight sits in the photography, so the type is kept quiet and the spacing does the structuring.",
      "Built in React with plain CSS. Listing cards are rendered from a data array, so adding a property is a data change rather than a markup change.",
    ],
    features: [
      "Data-driven listing grid",
      "Full-bleed responsive hero imagery",
      "Plain-CSS layout tuned per breakpoint",
    ],
  },
];

/** The detail page for a slug, or `undefined` if nothing matches it. */
export const findProject = (slug) => projects.find((p) => p.slug === slug);
