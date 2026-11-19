import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAppSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "RGPV Pedal - Campus Bicycle Rental",
  description:
    "Affordable hourly bicycle rentals for students, faculty, and visitors at RGPV Bhopal campus.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getAppSettings();
  const whatsappPhone = settings?.whatsappPhone || "919876543210";

  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 font-sans">
        <Navbar initialPhone={whatsappPhone} />
        <main className="flex-1">{children}</main>
        <Footer initialPhone={whatsappPhone} />
      </body>
    </html>
  );
}
