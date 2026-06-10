import React from "react";
import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import FeaturesGrid from "./FeaturesGrid";
import Benefits from "./Benefits";
import PharmacyPreview from "./PharmacyPreview";
import CtaSection from "./CtaSection";
import FeaturedArticles from "./FeaturedArticles";
import FlowSteps from "./FlowSteps";
import WeAreSection from "./WeAreSection";
import getHomePageData from "../../libs/main/getHomePageData";
import "./HomePage.module.css";
export default async function HomePage() {
  const {articleReadies} = await getHomePageData();
  return (
    <>
      <HeroSection />
      <WeAreSection />
      <FeaturesGrid />
      <HowItWorks />
      <FlowSteps />
      <PharmacyPreview />
      <Benefits />
      <FeaturedArticles articleReadies={articleReadies} />
      <CtaSection />
    </>
  );
}
