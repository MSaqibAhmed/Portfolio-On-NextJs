export const social = {
  email: "muhammadsaqibahmed.dev@gmail.com",
  github: "https://github.com/MSaqibAhmed",
  linkedin: "https://www.linkedin.com/in/m-saqib-ahmed/",
  location: "Based in Pakistan",
  status: "Open to opportunities",
};

// A bare "#" is a placeholder, not a destination — linking it would scroll the
// visitor back to the top of the page when they expected to leave the site.
// Consumers render those entries as plain text until a real URL is filled in.
export const isRealLink = (url) => Boolean(url) && url !== "#";
