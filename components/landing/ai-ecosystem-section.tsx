"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { Sparkles, Home, Users, Mail, MessageSquare, TrendingUp, Calendar, Zap } from "lucide-react";

export default function AIEcosystemSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      <div className="container">
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

        <div className="grid lg:grid-cols-2 gap-12 items-center mt-16">
          {/* Left - Orbiting Circles */}
          <BlurFade delay={0.4}>
            <div className="relative h-[600px] w-full flex items-center justify-center">
              <div className="relative flex h-full w-full items-center justify-center">
                {/* Center AI Core */}
                <div className="relative">
                  <div className="absolute inset-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                  <div className="relative h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-2xl">
                    <Sparkles className="h-12 w-12 text-white animate-pulse" />
                  </div>
                  <div className="absolute -inset-4 rounded-full border border-primary/20 animate-ping" />
                </div>

                {/* First Orbit - Core Functions */}
                <OrbitingCircles radius={120} duration={20}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 shadow-lg">
                    <Home className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </OrbitingCircles>

                {/* Second Orbit - Communication */}
                <OrbitingCircles radius={200} duration={30} reverse>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 shadow-lg">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 shadow-lg">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 shadow-lg">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                </OrbitingCircles>
              </div>
            </div>
          </BlurFade>

          {/* Right - Content */}
          <BlurFade delay={0.6}>
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold mb-4">AI at the Center</h3>
                <p className="text-lg text-muted-foreground">
                  Our AI engine orchestrates your entire workflow, connecting listings, clients, marketing, and analytics in one intelligent system.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
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

                <div className="flex gap-4">
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

                <div className="flex gap-4">
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

                <div className="flex gap-4">
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
