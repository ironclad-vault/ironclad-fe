import type { Metadata } from "next";
import { Inter, Anton, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AnimatedRouter from "@/components/navigation/AnimatedRouter";
import AppWrapper from "./wrapper";
import { Toaster } from "react-hot-toast";

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
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${anton.variable} ${ibmPlexMono.variable}`}
      >
        <AppWrapper>
          <AnimatedRouter>{children}</AnimatedRouter>
        </AppWrapper>
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "16px",
              fontFamily: "var(--font-ibm-plex-mono)",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#0f0",
                secondary: "#000",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#f00",
                secondary: "#000",
              },
            },
            loading: {
              iconTheme: {
                primary: "#fff",
                secondary: "#000",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
