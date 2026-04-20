import type { Metadata } from "next";
import { Inter, Space_Grotesk, Space_Mono, Plus_Jakarta_Sans, Outfit, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "Godwin Austen Labs",
  description: "Nova Framework. Deploying Autonomy with Agentic infrastructures.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Godwin Austen Labs",
    description: "Constructing the digital central nervous systems of the modern enterprise.",
    images: ["/logo.png"],
    url: "https://godwinausten.org",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/logo.png"],
  },
};

import Navbar from "@/components/Navbar";
import Background from "@/components/Background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${plusJakarta.variable} ${outfit.variable} ${bricolage.variable}`}>
      <body>
        <Background />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
