import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const cairo = Cairo({ variable: "--font-cairo", subsets: ["latin", "arabic"] });

export const metadata: Metadata = {
  title: "Chouf — On-demand delivery, done right",
  description: "Chouf delivery platform demo — customer, driver, merchant and admin portals in one app.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${jakarta.variable} ${cairo.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
