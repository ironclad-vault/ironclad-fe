import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, IBM_Plex_Mono, Oswald } from "next/font/google";
import "./globals.css";
import AnimatedRouter from "@/components/navigation/AnimatedRouter";
import AppWrapper from "./wrapper";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
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
        className={`${inter.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable}`}
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
              background: "#18181B",
              color: "#FFFFFF",
              border: "1px solid #F7931A",
              padding: "16px",
              fontFamily: "var(--font-ibm-plex-mono)",
              borderRadius: "7px",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#18181B",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#18181B",
              },
            },
            loading: {
              iconTheme: {
                primary: "#F7931A",
                secondary: "#18181B",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
