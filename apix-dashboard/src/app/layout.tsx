import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "UchitFare | SIH26056 Submission Demo",
  description: "BitSynq airfare price index prototype: 25 routes, five booking horizons, fare auditing and CPI sample exports.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="h-full antialiased"><body className="min-h-full flex flex-col">{children}</body></html>;
}
