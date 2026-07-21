import type { Metadata } from "next";
import localFont from "next/font/local";
import { DayNightProvider } from "@/components/theme/day-night-provider";
import "../../globals.css";

const vazirmatn = localFont({
  src: "../../../fonts/vazirmatn/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "پنل مدیریت NewSushi",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-accent="akane" suppressHydrationWarning>
      <body className={vazirmatn.variable}>
        <DayNightProvider>{children}</DayNightProvider>
      </body>
    </html>
  );
}
