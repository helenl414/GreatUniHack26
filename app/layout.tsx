import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Steady · Make room for uneven income",
  description: "Plan for uneven income, explore what could change, and make your earnings easier to explain.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

