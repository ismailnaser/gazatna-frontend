import { SiteLayout } from "@/layout/SiteLayout";

export const revalidate = 120;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
