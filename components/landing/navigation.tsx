"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import RainbowButton from "@/components/magicui/rainbow-button";
import { Home } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">RealtorAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Testimonials
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
