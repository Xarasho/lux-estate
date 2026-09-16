import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "LuxeEstate — Premium Real Estate",
  description: "Discover curated luxury properties with LuxeEstate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background-light text-nordic-dark selection:bg-mosque selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
