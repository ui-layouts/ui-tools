import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { cn, siteConfig } from "@/lib/utils";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import schema from "./schema";
import ToolsHeader from "@/components/common/tools-header";
import { ArrowUpRight } from "lucide-react";
import { Banner } from "@/components/common/banner";

const poppins = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "box-shadow generator",
    "text-shadow generator",
    "shadow CSS generator",
    "SVG clip-path generator",
    "clip path maker",
    "CSS clip-path",
    "gradient generator",
    "mesh gradient",
    "mesh gradient generator",
    "r3f mesh gradient",
    "linear gradient generator",
    "background pattern generator",
    "linear pattern background",
    "CSS pattern background",
    "SVG background pattern",

    "color palette generator",
    "color palette",
    "color picker",
    "color converter",
    "hex to rgba converter",
    "hsl to hex",
    "color contrast checker",

    "GSAP animation examples",
    "lenis scroll react",
    "scroll animation react",
    "web animation tools",
    "react animation tools",
    "react three fiber UI",
    "r3f UI layouts",
    "react spotlight effect",
    "image mousetrail effect",
    "shadcn UI components",

    "Next.js UI tools",
    "frontend tools for developers",
    "creative UI tools",
    "developer design utilities",
    "modern UI generators",
    "web design engineer",
    "design system generator",

    "naymur rahman tools",
    "naymur dev",
  ],

  authors: [
    {
      name: "naymur rahman",
      url: "https://naymur.com/",
    },
  ],
  creator: "naymur",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.openGraphName,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@naymur_dev",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-5G7F4C09QB"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5G7F4C09QB');
        `}
      </Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schema() }}
      />
      <body suppressHydrationWarning className={`${poppins.className}`}>
        <NuqsAdapter>
          <ThemeProvider attribute="class">
            <TooltipProvider delayDuration={0}>
              <Toaster position="bottom-right" richColors />
              <div className="absolute top-0 w-full left-0 z-50 bg-background/20 backdrop-blur-md">
                <Banner
                  variant="rainbow"
                  className="h-11 md:text-base sm:text-sm text-xs"
                >
                  <p className="group-hover:underline underline-offset-4 flex flex-wrap gap-1 items-center">
                    <picture>
                      <source
                        srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.webp"
                        type="image/webp"
                      />
                      <img
                        src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.gif"
                        alt="🚀"
                        className="w-6 h-6"
                        width="32"
                        height="32"
                      />
                    </picture>
                    Ship faster with{" "}
                    <span className="font-semibold">UI-Layouts Pro</span>
                    <span className="md:inline-block hidden">
                      – 100+ production-ready blocks & Templates waiting for you
                    </span>
                  </p>
                  <ArrowUpRight
                    className="size-5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 ease-out shrink-0"
                    strokeWidth={2}
                  />
                </Banner>
                <ToolsHeader />
              </div>
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
