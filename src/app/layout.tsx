import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/app/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://markdown-generator-seven.vercel.app/"),

  title: "AI README Generator for GitHub - Create Markdown Instantly",
  description:
    "Buat README.md profesional dengan AI hanya dengan memasukkan username GitHub atau nama repository. Markdown generator kami menyediakan live preview, dark mode, dan hasil siap pakai.",

  keywords:
    "github readme generator, ai readme generator, markdown readme github, create readme.md online, github markdown editor, ai markdown generator, github profile readme",

  icons: {
    icon: "/file.svg",
  },

  openGraph: {
    title: "AI README Generator for GitHub",
    description:
      "Cukup masukkan username GitHub atau nama repo, dan AI kami akan membuatkan README.md profesional untuk Anda.",
    type: "website",
    locale: "id_ID",
    url: "https://markdown-generator-seven.vercel.app/",
    siteName: "AI GitHub README Generator",
    images: [
      {
        url: "/file.svg",
        width: 1200,
        height: 630,
        alt: "AI GitHub README Generator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Generate README.md with AI from GitHub Username or Repo",
    description:
      "Buat README GitHub secara otomatis menggunakan AI. Masukkan username atau nama repo, dan lihat hasilnya.",
    images: ["/file.svg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  alternates: {
    canonical:
      "https://markdown-generator-git-main-rs-projects-7a5f8bd9.vercel.app/",
    languages: {
      "id-ID":
        "https://markdown-generator-jh1wtdt20-rs-projects-7a5f8bd9.vercel.app/",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. Tambahkan suppressHydrationWarning pada tag <html>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 3. Bungkus {children} dengan ThemeProvider */}
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
