import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clipper — At-home grooming in Seoul",
  description: "Book a thoughtful, at-home grooming visit for your favorite pet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f0e6] text-[#202321] antialiased">
        {children}
      </body>
    </html>
  );
}
