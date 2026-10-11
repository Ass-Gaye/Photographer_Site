import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "ADU99 Photography | Premium Editorial & Portrait Studio, The Gambia",
    template: "%s | ADU99 Photography",
  },
  description:
    "ADU99 Photography is an editorial, portrait, and wedding photography studio based in The Gambia. Natural light, cinematic composition, and timeless storytelling.",
  keywords: [
    "ADU99 Photography",
    "Gambia photographer",
    "Banjul photography studio",
    "portrait photographer Gambia",
    "wedding photography Gambia",
    "editorial fashion photographer",
  ],
  authors: [{ name: "ADU99 Photography" }],
  openGraph: {
    title: "ADU99 Photography | Cinematic Visuals & Timeless Stories",
    description: "Premium editorial, wedding, and portrait photography in The Gambia.",
    url: "https://adu99photography.com",
    siteName: "ADU99 Photography",
    locale: "en_GB",
    type: "website",
    images: ["/logo.jpg", "/instagram/carousel-2a.jpg"],
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable} dark`}>
      <body className="bg-[#0A0A0A] text-[#F4F4F5] antialiased selection:bg-[#C5A880] selection:text-black min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
