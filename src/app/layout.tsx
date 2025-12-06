import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Property Listings Dashboard",
  description: "Browse and filter real estate listings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background min-h-screen">
        {children}
      </body>
    </html>
  );
}
