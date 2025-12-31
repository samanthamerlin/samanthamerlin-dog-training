import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Magic Paws | Dog Training & Care in Mill Valley",
    template: "%s | Magic Paws",
  },
  description: "Professional dog training, walking, and care services by Samantha Merlin. Over 10 years of experience in Mill Valley and Marin County, California.",
  keywords: ["dog training", "puppy training", "dog walking", "pet sitting", "Mill Valley", "Marin County", "California"],
  authors: [{ name: "Samantha Merlin" }],
  openGraph: {
    title: "Magic Paws | Dog Training & Care in Mill Valley",
    description: "Professional dog training, walking, and care services by Samantha Merlin.",
    url: "https://samanthamerlin.com",
    siteName: "Magic Paws",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magic Paws | Dog Training & Care",
    description: "Professional dog training services in Mill Valley, CA",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
