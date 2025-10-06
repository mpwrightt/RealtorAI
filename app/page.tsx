import HeroSection from "@/components/landing/hero-section";
import StatsSection from "@/components/landing/stats-section";
import ProblemSolutionSection from "@/components/landing/problem-solution-section";
import FeaturesSection from "@/components/landing/features-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import PricingSection from "@/components/landing/pricing-section";
import FinalCTASection from "@/components/landing/final-cta-section";
import Footer from "@/components/landing/footer";
import Navigation from "@/components/landing/navigation";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <ProblemSolutionSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
