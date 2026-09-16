import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { DM_Sans, Fraunces } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { BUILDER, SITE, siteUrl } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Azərbaycanda günlük kirayə üçün sahib brendli səhifə — şəhər və rayon üzrə, foto, qiymət, WhatsApp. İndilik pulsuz.",
  authors: [{ name: BUILDER.name, url: BUILDER.portfolioOrigin }],
  creator: BUILDER.name,
  publisher: SITE.name,
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="az"
      className={`${fraunces.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
