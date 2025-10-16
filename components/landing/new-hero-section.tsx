"use client";

import { Button } from "@/components/ui/button";
import ShinyButton from "@/components/magicui/shiny-button";
import Particles from "@/components/magicui/particles";
import TypingAnimation from "@/components/magicui/typing-animation";
import BlurFade from "@/components/magicui/blur-fade";
import NumberTicker from "@/components/magicui/number-ticker";
import { Meteors } from "@/components/ui/meteors";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { Sparkles, Play, TrendingUp, Zap, Users } from "lucide-react";
import Link from "next/link";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { forwardRef, useRef } from "react";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function NewHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      {/* Layered Background Effects */}
      <DotPattern
        className={cn(
          "absolute inset-0 z-0",
          "[mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
        )}
        width={32}
        height={32}
        cx={1}
        cy={1}
        cr={1}
      />
      <Particles
        className="absolute inset-0 z-0"
        quantity={60}
        ease={80}
        color="#6366f1"
        refresh={false}
      />
      <Meteors number={15} />
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 z-0" />

      <div className="container relative z-10 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <BlurFade delay={0.25}>
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">AI-Powered Real Estate Platform</span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Your AI-Powered
                  <br />
                  Real Estate
                  <br />
                  <span className="text-primary">
                    <TypingAnimation
                      texts={["Assistant", "CRM", "Marketing Hub", "Growth Engine"]}
                      duration={100}
                    />
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Solo agents get enterprise-level tools. Generate marketing content in seconds,
                  manage clients effortlessly, and close more deals with AI-powered insights.
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 py-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div className="flex items-baseline">
                      <NumberTicker value={40} className="text-3xl font-bold" />
                      <span className="text-3xl font-bold">h+</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Saved Per Month</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <div className="flex items-baseline">
                      <NumberTicker value={95} className="text-3xl font-bold" />
                      <span className="text-3xl font-bold">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Faster Marketing</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div className="flex items-baseline">
                      <NumberTicker value={500} className="text-3xl font-bold" />
                      <span className="text-3xl font-bold">+</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Active Agents</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/sign-up" className="relative group">
                  <ShinyButton className="text-lg w-full sm:w-auto shadow-lg shadow-primary/50 hover:shadow-primary/70 transition-shadow">
                    Start Free Trial
                  </ShinyButton>
                  <BorderBeam size={250} duration={12} delay={9} />
                </Link>
                <Link href="/dashboard/demo">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 h-14 w-full sm:w-auto hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background" />
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-background" />
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-background" />
                  </div>
                  <span>Trusted by 500+ agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {"★★★★★"}
                  </div>
                  <span>4.9/5 rating</span>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Right - Animated AI Flow Diagram */}
          <BlurFade delay={0.5}>
            <div
              className="relative flex h-[600px] w-full items-center justify-center rounded-2xl border bg-background/50 backdrop-blur-sm p-8"
              ref={containerRef}
            >
              {/* Center - AI Core */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/20 animate-pulse absolute -inset-4" />
                  <Circle className="size-16 bg-primary border-primary">
                    <Sparkles className="h-8 w-8 text-white" />
                  </Circle>
                </div>
              </div>

              {/* Top - Agent */}
              <div className="absolute left-1/2 top-20 -translate-x-1/2">
                <Circle ref={div1Ref} className="bg-blue-500 border-blue-500">
                  <Users className="h-6 w-6 text-white" />
                </Circle>
                <p className="text-xs text-center mt-2 font-medium">Agent</p>
              </div>

              {/* Right - Marketing */}
              <div className="absolute right-20 top-1/2 -translate-y-1/2">
                <Circle ref={div2Ref} className="bg-green-500 border-green-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </Circle>
                <p className="text-xs text-center mt-2 font-medium">Marketing</p>
              </div>

              {/* Bottom - Clients */}
              <div className="absolute left-1/2 bottom-20 -translate-x-1/2">
                <Circle ref={div3Ref} className="bg-purple-500 border-purple-500">
                  <Users className="h-6 w-6 text-white" />
                </Circle>
                <p className="text-xs text-center mt-2 font-medium">Clients</p>
              </div>

              {/* Left - Analytics */}
              <div className="absolute left-20 top-1/2 -translate-y-1/2">
                <Circle ref={div4Ref} className="bg-orange-500 border-orange-500">
                  <Zap className="h-6 w-6 text-white" />
                </Circle>
                <p className="text-xs text-center mt-2 font-medium">Analytics</p>
              </div>

              {/* Animated Beams */}
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div2Ref}
                curvature={-75}
                endYOffset={-10}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={div3Ref}
                curvature={75}
                endYOffset={10}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={div4Ref}
                curvature={-75}
                endYOffset={-10}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div4Ref}
                toRef={div1Ref}
                curvature={75}
                endYOffset={10}
              />
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
