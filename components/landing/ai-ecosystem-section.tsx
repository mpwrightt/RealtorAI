"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { Sparkles, Home, Users, Mail, TrendingUp, Brain, Zap, BarChart3, Building2 } from "lucide-react";

export default function AIEcosystemSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      <GridPattern
        className={cn(
          "absolute inset-0 z-0 opacity-30",
          "[mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
        )}
        width={40}
        height={40}
        strokeDasharray="4 4"
      />
      <div className="container relative z-10">
        <BlurFade delay={0.2}>
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Ecosystem</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold">
              One Platform,
              <br />
              <span className="text-primary">Infinite Possibilities</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI connects every part of your business, from initial contact to closed deal.
            </p>
          </div>
        </BlurFade>

        <div className="max-w-6xl mx-auto mt-16">
          {/* Visual Diagram with Orbiting Circles */}
          <BlurFade delay={0.4}>
            <div className="relative mb-16 flex justify-center">
              <div className="relative flex h-[600px] w-full max-w-[600px] items-center justify-center">
                {/* Center AI Core */}
                <div className="relative z-10">
                  <div className="absolute inset-0 h-32 w-32 rounded-full bg-primary/30 blur-3xl animate-pulse" />
                  <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl border-4 border-background">
                    <Brain className="h-14 w-14 text-white" />
                  </div>
                </div>

                {/* Orbiting Feature Icons */}
                <OrbitingCircles
                  className="size-[70px] border-none bg-transparent"
                  duration={20}
                  delay={0}
                  radius={150}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500/50 shadow-lg">
                    <Building2 className="h-8 w-8 text-blue-500" />
                  </div>
                </OrbitingCircles>

                <OrbitingCircles
                  className="size-[70px] border-none bg-transparent"
                  duration={20}
                  delay={5}
                  radius={150}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-green-500/20 backdrop-blur-sm border-2 border-green-500/50 shadow-lg">
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </OrbitingCircles>

                <OrbitingCircles
                  className="size-[70px] border-none bg-transparent"
                  duration={20}
                  delay={10}
                  radius={150}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-purple-500/20 backdrop-blur-sm border-2 border-purple-500/50 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </OrbitingCircles>

                <OrbitingCircles
                  className="size-[70px] border-none bg-transparent"
                  duration={20}
                  delay={15}
                  radius={150}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-orange-500/20 backdrop-blur-sm border-2 border-orange-500/50 shadow-lg">
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                  </div>
                </OrbitingCircles>

                {/* Outer orbit */}
                <OrbitingCircles
                  className="size-[60px] border-none bg-transparent"
                  duration={30}
                  delay={0}
                  radius={250}
                  reverse
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm border-2 border-primary/50 shadow-lg">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                </OrbitingCircles>

                <OrbitingCircles
                  className="size-[60px] border-none bg-transparent"
                  duration={30}
                  delay={15}
                  radius={250}
                  reverse
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-pink-500/20 backdrop-blur-sm border-2 border-pink-500/50 shadow-lg">
                    <Mail className="h-7 w-7 text-pink-500" />
                  </div>
                </OrbitingCircles>
              </div>
            </div>
          </BlurFade>

          {/* Content */}
          <BlurFade delay={0.6}>
            <div className="space-y-12">
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-4">AI at the Center</h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our AI engine orchestrates your entire workflow, connecting listings, clients, marketing, and analytics in one intelligent system.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4 p-6 rounded-xl border bg-card">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Home className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Smart Listings</h4>
                    <p className="text-sm text-muted-foreground">
                      AI enhances property photos, generates descriptions, and optimizes for search
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl border bg-card">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Client Matching</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically matches properties to buyers based on preferences and behavior
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl border bg-card">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Marketing Automation</h4>
                    <p className="text-sm text-muted-foreground">
                      Creates and sends personalized campaigns at the perfect time
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl border bg-card">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Smart Communication</h4>
                    <p className="text-sm text-muted-foreground">
                      AI responds to client inquiries 24/7 and schedules follow-ups
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
