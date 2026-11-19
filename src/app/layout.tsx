import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "VelocitiRent - Hourly Bicycle Rental & Fleet Management",
  description:
    "Rent premium bicycles on an hourly basis. Dedicated owner platform for multi-angle bicycle image uploads, hourly booking calendar, and contactless dock check-ins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
