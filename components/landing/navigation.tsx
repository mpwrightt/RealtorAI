"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import RainbowButton from "@/components/magicui/rainbow-button";
import { Home, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        scrolled ? "bg-background/95 shadow-lg border-b-primary/20" : "bg-background/80"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">RealtorAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => scrollToSection("features")} 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection("pricing")} 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Pricing
          </button>
          <button 
            onClick={() => scrollToSection("testimonials")} 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Testimonials
          </button>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Demo
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <RainbowButton>Get Started</RainbowButton>
          </Link>
        </div>
      </div>
    </nav>
  );
}
