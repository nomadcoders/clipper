import type { Metadata } from "next";
import { themeInitScript } from "@/components/clipper/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clipper — At-home grooming in Seoul",
  description: "Book a thoughtful, at-home grooming visit for your favorite pet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The theme script adds the "dark" class before hydration, so React must not flag the mismatch.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-(--bg-f7f0e6) text-(--fg-202321) antialiased">
        {children}
      </body>
    </html>
  );
}
