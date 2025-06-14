

import type { Metadata } from "next";
import { Outfit, Ovo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

import { Navbar } from "@/components/InterviewComponents/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const ovo = Ovo({
  subsets: ["latin"],
  weight: ["400"]
});

export const metadata: Metadata = {
  title: "LevelUP",
  description: "LevelUP - Your Career Growth Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.className} ${ovo.className} antialiased`}>
        <Providers>
          <Navbar />
          <div className="container mx-auto">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
