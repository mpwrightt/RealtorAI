"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { Sparkles, Home, Users, Mail, TrendingUp, Brain, Zap, BarChart3, Building2 } from "lucide-react";

export default function AIEcosystemSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      <div className="container px-4 md:px-6">
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

        <div className="max-w-5xl mx-auto mt-16">
          {/* Visual Diagram */}
          <BlurFade delay={0.4}>
            <div className="relative mb-16">
              {/* Center AI Core */}
              <div className="flex items-center justify-center mb-12">
                <div className="relative">
                  <div className="absolute inset-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                  <div className="relative h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-2xl">
                    <Brain className="h-12 w-12 text-white animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Connected Icons Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="flex flex-col items-center gap-3 p-4 md:p-6 rounded-xl border bg-card hover:shadow-lg transition-all">
                  <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-center">Listings</p>
                </div>
                
                <div className="flex flex-col items-center gap-3 p-4 md:p-6 rounded-xl border bg-card hover:shadow-lg transition-all">
                  <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Users className="h-7 w-7 text-green-500" />
                  </div>
                  <p className="text-sm font-semibold text-center">Clients</p>
                </div>
                
                <div className="flex flex-col items-center gap-3 p-4 md:p-6 rounded-xl border bg-card hover:shadow-lg transition-all">
                  <div className="h-14 w-14 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-purple-500" />
                  </div>
                  <p className="text-sm font-semibold text-center">Marketing</p>
                </div>
                
                <div className="flex flex-col items-center gap-3 p-4 md:p-6 rounded-xl border bg-card hover:shadow-lg transition-all">
                  <div className="h-14 w-14 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <BarChart3 className="h-7 w-7 text-orange-500" />
                  </div>
                  <p className="text-sm font-semibold text-center">Analytics</p>
                </div>
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
