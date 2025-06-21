import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/app/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

const productionUrl = "https://readme-ai-generator.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),

  title: "AI README Generator for GitHub | Create README.md Instantly",
  description:
    "Generate professional GitHub README.md files in seconds with our AI-powered markdown editor. Simply provide a repository URL to get a well-structured, ready-to-use README.",

  keywords:
    "ai readme generator, github readme generator, markdown generator, create readme.md, automatic readme, github profile readme, professional readme",

  icons: {
    icon: "/file.svg",
  },

  openGraph: {
    title: "AI README Generator for GitHub",
    description:
      "Instantly create professional README.md files for your GitHub repositories using AI.",
    url: productionUrl,
    siteName: "AI README Generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI README Generator for GitHub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI README Generator for GitHub",
    description:
      "Instantly create professional README.md files for your GitHub repositories using AI.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
