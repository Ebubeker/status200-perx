import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Perx — by Status 200",
  description: "The perks employees actually want. Built for Albania, ready for the world.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#15604a",
          borderRadius: "0.8rem",
          fontFamily: "var(--font-hanken), system-ui, sans-serif",
        },
      }}
    >
      <html lang="en" className={`${fraunces.variable} ${hanken.variable}`}>
        <body className="min-h-dvh">{children}</body>
      </html>
    </ClerkProvider>
  );
}
