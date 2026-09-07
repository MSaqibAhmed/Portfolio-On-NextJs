import { siteUrl } from "@/data/site";
import { projects } from "@/data/projects";

// The home page is still one page — its section anchors are not separate URLs
// and listing them would be padding the sitemap with fakes. The project detail
// pages are real routes with their own titles and descriptions, so they are
// listed individually.
export default function sitemap() {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.7,
    })),
  ];
}
