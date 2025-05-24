// zittyzoom/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google"; // Import Caveat
import "./globals.css";
import Script from 'next/script'; // Import Script from next/script
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define Caveat
const caveat = Caveat({
  variable: "--font-caveat", // Choose a CSS variable name for Caveat
  subsets: ["latin"],
  weight: "variable", // Caveat is a variable font, use 'variable' for all weights
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
    const googleMapsSrc = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_Maps_API_KEY}&libraries=places,marker`; 
  return (
    <html lang="en">
      <head>
        <Script
            src={googleMapsSrc}
            strategy="beforeInteractive"
            nonce={process.env.NEXT_PUBLIC_CSP_NONCE}
        />
        
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`} // Add caveat.variable here
      >
        {children}
      </body>
    </html>
  );
}