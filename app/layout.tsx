import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forecast // 15-Day",
  description: "15-day weather forecast powered by Open-Meteo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} font-sans antialiased scanline`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
