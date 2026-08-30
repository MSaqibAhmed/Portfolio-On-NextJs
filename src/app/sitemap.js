import { siteUrl } from "@/data/site";

// Single-page portfolio: the one real route is "/". Section anchors are not
// separate URLs, so listing them would be padding the sitemap with fakes.
export default function sitemap() {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
