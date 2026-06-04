import { AboutSection } from "@/components/organisms/AboutSection";
import { Hero } from "@/components/organisms/Hero";
import { LatestNews } from "@/components/organisms/LatestNews";
import { StatsSection } from "@/components/organisms/StatsSection";
import { SiteLayout } from "@/layout/SiteLayout";

export default function Home() {
  return (
    <SiteLayout>
      <Hero />
      <AboutSection />
      <LatestNews />
      <StatsSection />
    </SiteLayout>
  );
}
