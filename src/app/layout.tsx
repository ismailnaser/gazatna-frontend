import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Baloo_Bhaijaan_2, Cairo } from "next/font/google";
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

const kids = Baloo_Bhaijaan_2({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-kids",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "مدرسة غزتنا الخاصة | Ghazzatuna Private School",
    template: "%s | مدرسة غزتنا الخاصة",
  },
  description:
    "مدرسة غزتنا الخاصة — منصة تعليمية رقمية متكاملة. تعليم متميز، أخبار، برامج أكاديمية، وتسجيل إلكتروني. غزتنا، فلسطين.",
  keywords: [
    "مدرسة غزتنا الخاصة",
    "غزتنا",
    "Ghazzatuna",
    "Ghazatna",
    "مدرسة خاصة",
    "تعليم فلسطين",
    "تسجيل إلكتروني",
    "منصة تعليمية",
  ],
  applicationName: "غزتنا",
  metadataBase: new URL("https://gzs.edu.ps"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_PS",
    url: "https://gzs.edu.ps",
    siteName: "مدرسة غزتنا الخاصة",
    title: "مدرسة غزتنا الخاصة | Ghazzatuna Private School",
    description:
      "مدرسة غزتنا الخاصة — منصة تعليمية رقمية متكاملة. تعليم متميز، أخبار، برامج أكاديمية، وتسجيل إلكتروني.",
    images: [{ url: "/images/pwa-icon-512.png", width: 512, height: 512, alt: "مدرسة غزتنا" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "غزتنا",
  },
  icons: {
    icon: [
      { url: "/images/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/images/logo-icon.png", type: "image/png" },
      { url: "/images/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/images/favicon-32.png",
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
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${kids.variable} h-full`}>
      <head>
        <link
          rel="preload"
          as="image"
          type="image/webp"
          href="/images/hero-illustration.webp"
          imageSrcSet="/images/hero-illustration-828.webp 828w, /images/hero-illustration.webp 1920w"
          imageSizes="100vw"
          fetchPriority="high"
        />
      </head>
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
