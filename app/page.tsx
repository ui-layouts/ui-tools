import HomeIndex from "@/components/view/home";
import { siteConfig } from "@/lib/utils";
import type { Metadata } from "next";

const PAGE_TITLE = "UI Tools for Designers and Developers";
const PAGE_DESCRIPTION =
  "Free open-source UI tools for developers and designers: generate shadows, clip-paths, mesh gradients, color palettes, backgrounds, and SVG line drawings.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
};

export default function Home() {
  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: PAGE_TITLE,
    url: siteConfig.url,
    description: PAGE_DESCRIPTION,

    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />
      <HomeIndex />
    </>
  );
}
