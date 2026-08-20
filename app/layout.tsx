import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clipper — At-home grooming in Seoul",
  description: "Book a thoughtful, at-home grooming visit for your favorite pet.",
};

export const viewport: Viewport = {
  themeColor: "#f7f9fc",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f9fc] text-[#202321] antialiased">
        {children}
      </body>
    </html>
  );
}
