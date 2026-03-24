import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Nonprofit Category Benchmarks",
  description: "Skilly AI - Nonprofit financial benchmarking using IRS Form 990 data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        {children}
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
