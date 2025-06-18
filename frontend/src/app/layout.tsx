import type { Metadata } from "next";
import { Outfit, Ovo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

import { ConditionalNavbar } from "@/components/common/ConditionalNavbar";
import { ConditionalFooter } from "@/components/common/ConditionalFooter";

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
          <ConditionalNavbar />
          <div className="mx-auto">
            {children}
          </div>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
