import { Footer } from "@/components/organisms/Footer";
import { Navbar } from "@/components/organisms/Navbar";

type SiteLayoutProps = {
  children: React.ReactNode;
};

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
