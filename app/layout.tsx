import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "American Raffle | Win a Car, Support Veterans",
  description:
    "Enter our patriotic car raffle for just $10 per ticket. 100% of proceeds support veteran charities. Tax included. Legal nationwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
