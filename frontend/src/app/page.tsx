import { CTASection } from "@/components/LandingPage/CTAsection";
import { FeaturesSection } from "@/components/LandingPage/FeaturesSection";
import { HeroSection } from "@/components/LandingPage/HeroSection";
import { TestimonialsSection } from "@/components/LandingPage/TestimonialsSection";

export default function Home() {

  const foo = 123;

  return (
    <>
      <div className="container mx-auto">

        <HeroSection />
        <FeaturesSection />
        <CTASection />
        <TestimonialsSection />
      </div>
    </>
  );
}