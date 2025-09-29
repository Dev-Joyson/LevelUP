"use client"

import CTASection from "@/components/LandingPage/CTAsection";
import QuickActionSection from "@/components/LandingPage/QuickActionSection";
import DesiredDomain from "@/components/LandingPage/DesiredDomain";
import { FeaturesSection } from "@/components/LandingPage/FeaturesSection";
import { HeroSection } from "@/components/LandingPage/HeroSection";
import { TestimonialsSection } from "@/components/LandingPage/TestimonialsSection";

export default function Home() {

  const foo = 123;

  return (
    <>
      <div className="mx-auto">

        <HeroSection />
        <QuickActionSection />
        <FeaturesSection />
        <CTASection />
        <DesiredDomain />
        <TestimonialsSection />
      </div>
    </>
  );
}