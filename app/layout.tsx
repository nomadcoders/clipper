import type { Metadata, Viewport } from "next";
import "./globals.css";

import { themeInitScript } from "@/lib/clipper/theme";

export const metadata: Metadata = {
  title: "Clipper — At-home grooming in Seoul",
  description:
    "Book a thoughtful, at-home grooming visit for your favorite pet.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#080c14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
