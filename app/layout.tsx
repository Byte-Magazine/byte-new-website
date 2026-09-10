import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "نشریه‌ی علمی فرهنگی بایت",
  description: "دانشکده‌ی مهندسی کامپیوتر دانشگاه صنعتی شریف",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
