import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAppSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "CampusRide | RGPV Bhopal Campus Mobility",
  description:
    "Official micro-mobility platform for RGPV Bhopal. Affordable, eco-friendly hourly bicycle rentals across campus stands.",
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
      <body className="min-h-full flex flex-col bg-[#F8F9FF] text-[#0B1C30]">
        <Navbar initialPhone={whatsappPhone} />
        <main className="flex-1">{children}</main>
        <Footer initialPhone={whatsappPhone} />
      </body>
    </html>
  );
}
