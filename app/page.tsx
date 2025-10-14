import Navigation from "@/components/landing/navigation";
import NewHeroSection from "@/components/landing/new-hero-section";
import NewFeaturesSection from "@/components/landing/new-features-section";
import AIEcosystemSection from "@/components/landing/ai-ecosystem-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import NewPricingSection from "@/components/landing/new-pricing-section";
import FinalCTASection from "@/components/landing/final-cta-section";
import Footer from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <NewHeroSection />
      <NewFeaturesSection />
      <AIEcosystemSection />
      <TestimonialsSection />
      <NewPricingSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
