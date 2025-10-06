"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShinyButton from "@/components/magicui/shiny-button";
import Particles from "@/components/magicui/particles";
import TypingAnimation from "@/components/magicui/typing-animation";
import BlurFade from "@/components/magicui/blur-fade";
import NumberTicker from "@/components/magicui/number-ticker";
import { Sparkles, Play } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Effects */}
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#6366f1"
        refresh={false}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      <div className="container relative z-10 py-32">
        <BlurFade delay={0.25}>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Stats Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
              <div className="flex flex-col items-center px-6 py-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 backdrop-blur">
                <div className="text-3xl font-bold text-primary">40+</div>
                <div className="text-xs text-muted-foreground">Hours Saved</div>
              </div>
              <div className="flex flex-col items-center px-6 py-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur">
                <div className="text-3xl font-bold text-green-500">15s</div>
                <div className="text-xs text-muted-foreground">Generation Time</div>
              </div>
              <div className="flex flex-col items-center px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur">
                <div className="text-3xl font-bold text-blue-500">500+</div>
                <div className="text-xs text-muted-foreground">Active Agents</div>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Real Estate Platform</span>
            </div>

            {/* Headline with Typing Animation */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-center">
              Empower Your Real Estate Business with
              <br />
              <span className="inline-block min-w-[280px] md:min-w-[500px]">
                <TypingAnimation
                  className="text-primary"
                  texts={["AI Marketing", "Smart CRM", "Automation", "Intelligence"]}
                  duration={100}
                />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Solo agents get enterprise-level tools. Generate marketing content in seconds,
              manage clients effortlessly, and close more deals with AI-powered insights.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/sign-up">
                <ShinyButton className="text-lg">
                  Start Free Trial
                </ShinyButton>
              </Link>
              <Link href="/dashboard/demo">
                <Button variant="outline" size="lg" className="text-lg px-8 h-14">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <NumberTicker value={40} className="text-4xl font-bold" />
                  <span className="text-4xl font-bold">+</span>
                </div>
                <p className="text-sm text-muted-foreground">Hours Saved/Year</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <NumberTicker value={95} className="text-4xl font-bold" />
                  <span className="text-4xl font-bold">%</span>
                </div>
                <p className="text-sm text-muted-foreground">Time Reduction</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <NumberTicker value={500} className="text-4xl font-bold" />
                  <span className="text-4xl font-bold">+</span>
                </div>
                <p className="text-sm text-muted-foreground">Agents Using</p>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Screenshot */}
        <BlurFade delay={0.5}>
          <div className="mt-24 max-w-6xl mx-auto">
            <div className="relative rounded-xl border bg-muted/50 p-2 shadow-2xl">
              <div className="aspect-[16/9] rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <p className="text-muted-foreground">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
