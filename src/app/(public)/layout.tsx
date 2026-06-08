import { SiteLayout } from "@/layout/SiteLayout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
