"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BlurFade from "@/components/magicui/blur-fade";
import Particles from "@/components/magicui/particles";
import RainbowButton from "@/components/magicui/rainbow-button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function FinalCTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        className={cn(
          "absolute inset-0 z-0",
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
        )}
      />
      <Particles className="absolute inset-0 z-0" quantity={40} color="#6366f1" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 z-0" />

      <div className="container relative z-10">
        <BlurFade delay={0.25}>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="text-lg px-6 py-2">
              ⚡ Limited Time Offer
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold">
              Ready to Transform Your Real Estate Business?
            </h2>
            <p className="text-2xl text-muted-foreground">
              Join 500+ agents who are saving 40+ hours per year with AI
            </p>

            {/* Email capture */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-14 text-lg focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <Link href="/sign-up">
                <RainbowButton className="h-14 px-8 text-lg w-full sm:w-auto shadow-lg shadow-primary/50 hover:shadow-primary/70 transition-shadow">
                  Start Free Trial
                </RainbowButton>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              ✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 pt-8">
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-background">
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background">
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background">
                  <AvatarFallback>JM</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background">
                  <AvatarFallback>DK</AvatarFallback>
                </Avatar>
              </div>
              <p className="text-sm">
                <span className="font-bold">500+</span> agents already using RealtorAI
              </p>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
