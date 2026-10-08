import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dekan Admin",
  description: "Private dashboard for Dekan GitHub release analytics."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
