import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cairo } from "next/font/google";
import { AppBootstrap } from "@/components/AppBootstrap";
import { ClearStaleServiceWorkers } from "@/components/dev/ClearStaleServiceWorkers";
import { AssignmentsProvider } from "@/context/AssignmentsContext";
import { AuthProvider } from "@/context/AuthContext";
import { SchoolProvider } from "@/context/SchoolContext";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مدرسة غزتنا الخاصة | Ghazzatuna Private School",
  description:
    "منصة تعليمية رقمية لمدرسة غزتنا — تعليم متميز، أخبار، برامج أكاديمية، وتسجيل إلكتروني.",
  applicationName: "غزتنا",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "غزتنا",
  },
  icons: {
    icon: [
      { url: "/images/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#424cf3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full antialiased">
        {process.env.NODE_ENV === "production" && (
          <Script src="/pwa-bootstrap.js" strategy="beforeInteractive" />
        )}
        <ClearStaleServiceWorkers />
        <AuthProvider>
          <SchoolProvider>
            <AssignmentsProvider>
              <AppBootstrap>{children}</AppBootstrap>
            </AssignmentsProvider>
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
