import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Permanent_Marker, Space_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "700", "800"] });
const mono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400", "700"] });
const marker = Permanent_Marker({ variable: "--font-permanent-marker", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "The Waterloo Effect",
  description: "How Not to Go Bald: a live audience game.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#fed34c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${marker.variable} antialiased`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
