import { Roboto } from "next/font/google";
import "./globals.css";
import { siteDescription, siteName, siteTitle, siteUrl } from "@/data/site";
import { social } from "@/data/social";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  keywords: [
    "Muhammad Saqib Ahmed",
    "Full-Stack Developer",
    "MERN Stack Developer",
    "React Developer",
    "Node.js Developer",
    "Web Developer Pakistan",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 1500,
        alt: "Portrait of Muhammad Saqib Ahmed, Full-Stack MERN Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/images/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Factual only — identity, links and skills that already exist in the site.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteName,
  alternateName: "Saqib Ahmed",
  url: siteUrl,
  email: `mailto:${social.email}`,
  jobTitle: "Full-Stack Developer",
  description: siteDescription,
  image: `${siteUrl}/images/hero.png`,
  sameAs: [social.github, social.linkedin],
  knowsAbout: [
    "MongoDB",
    "Express.js",
    "React",
    "Node.js",
    "JavaScript",
    "Tailwind CSS",
    "GSAP",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  inLanguage: "en",
  author: { "@type": "Person", name: siteName },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.variable} antialiased scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-mint text-ink font-sans">
        {children}
        <script
          type="application/ld+json"
          // Static, developer-authored objects — no user input reaches this.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personJsonLd, websiteJsonLd]),
          }}
        />
      </body>
    </html>
  );
}
