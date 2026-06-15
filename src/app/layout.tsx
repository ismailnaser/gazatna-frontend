import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { ClearStaleServiceWorkers } from "@/components/dev/ClearStaleServiceWorkers";
import { AssignmentsProvider } from "@/context/AssignmentsContext";
import { AuthProvider } from "@/context/AuthContext";
import { SchoolProvider } from "@/context/SchoolContext";
import "./globals.css";

const devServiceWorkerCleanup =
  process.env.NODE_ENV === "development"
    ? `if("serviceWorker"in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})})}if("caches"in window){caches.keys().then(function(k){k.forEach(function(x){caches.delete(x)})})}`
    : null;

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مدرسة غزتنا النموذجية الخاصة | Ghazatna Private Model School",
  description:
    "منصة تعليمية رقمية لمدرسة غزتنا — تعليم متميز، أخبار، برامج أكاديمية، وتسجيل إلكتروني.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <head>
        {devServiceWorkerCleanup ? (
          <script dangerouslySetInnerHTML={{ __html: devServiceWorkerCleanup }} />
        ) : null}
      </head>
      <body className="min-h-full antialiased">
        <ClearStaleServiceWorkers />
        <AuthProvider>
          <SchoolProvider>
            <AssignmentsProvider>{children}</AssignmentsProvider>
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
