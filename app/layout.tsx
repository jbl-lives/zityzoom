import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZittyZoom",
  description: "ZittyZoom - Your Ultimate Travel Companion",
  keywords: ["travel", "companion", "ZittyZoom"],
  authors: [
    {
      name: "ZittyZoom",
      url: "https://zittyzoom.com",
    },
  ],
  creator: "Javency22",
  publisher: "Javency22",
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 // const googleMapsSrc = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_KEY}&libraries=places`;

  return (
    <html lang="en">
      <head>
        {/* <Script src={googleMapsSrc} strategy="afterInteractive" /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
