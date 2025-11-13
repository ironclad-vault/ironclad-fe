import type { Metadata } from "next";
import { Inter, Anton, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AnimatedRouter from "@/components/navigation/AnimatedRouter";
import AppWrapper from "./wrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: "400",
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IRONCLAD",
  description: "Brutalist Bitcoin Vault",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${anton.variable} ${ibmPlexMono.variable}`}>
        <AppWrapper>
          <AnimatedRouter>
            {children}
          </AnimatedRouter>
        </AppWrapper>
      </body>
    </html>
  );
}
