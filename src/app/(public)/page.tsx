import { Hero } from "@/components/organisms/Hero";
import { LatestNews } from "@/components/organisms/LatestNews";
import { StatsSection } from "@/components/organisms/StatsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <LatestNews />
      <StatsSection />
    </>
  );
}
