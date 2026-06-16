import { Hero } from "@/components/organisms/Hero";
import { LatestNews } from "@/components/organisms/LatestNews";
import { ProgramsSection } from "@/components/organisms/ProgramsSection";
import { StatsSection } from "@/components/organisms/StatsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ProgramsSection />
      <LatestNews />
      <StatsSection />
    </>
  );
}
