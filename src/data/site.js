/**
 * Canonical origin for metadata, sitemap and robots.
 *
 * No production domain is committed to this repo, so this falls back to a
 * Vercel-style default. Set NEXT_PUBLIC_SITE_URL in the deployment
 * environment (no trailing slash) before going live — canonical, Open Graph
 * and sitemap URLs are all derived from it.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://saqib-ahmed-portfolio.vercel.app"
).replace(/\/$/, "");

export const siteName = "Muhammad Saqib Ahmed";

export const siteTitle = "Muhammad Saqib Ahmed - Full-Stack MERN Developer";

export const siteDescription =
  "Full-Stack Developer based in Pakistan specializing in the MERN stack — building clean, responsive and scalable web applications with MongoDB, Express.js, React and Node.js.";
