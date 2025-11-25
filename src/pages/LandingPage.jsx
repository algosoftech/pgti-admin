import React from "react";
import HeroSection from "./LandingPageComponent/HeroSection";
import SearchPreview from "./LandingPageComponent/SearchPreview";
import Benefits from "./LandingPageComponent/Benefits";
import HowItWorks from "./LandingPageComponent/HowItWorks";
import SocialProof from "./LandingPageComponent/SocialProof";
import PricingPlans from "./LandingPageComponent/PricingPlans";
import SampleProfiles from "./LandingPageComponent/SampleProfiles";
import LeadCapture from "./LandingPageComponent/LeadCapture";
import FAQ from "./LandingPageComponent/FAQ";
import FinalCTAAndFooter from "./LandingPageComponent/FinalCTAAndFooter";

const LandingPage = () => (
  <>
    <HeroSection />
    <SearchPreview />
    <Benefits />
    <HowItWorks />
    <SocialProof />
    <PricingPlans />
    <SampleProfiles />
    <LeadCapture />
    <FAQ />
    <FinalCTAAndFooter />
  </>
);

export default LandingPage;
