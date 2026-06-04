import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مدرسة غزتنا | المنصة التعليمية الرقمية",
  description:
    "الصفحة الرئيسية لمدرسة غزتنا — تعليم رقمي متميز، أخبار، برامج أكاديمية، وتسجيل إلكتروني.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
