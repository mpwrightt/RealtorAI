"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { IconCloud } from "@/components/ui/icon-cloud";
import { 
  UserPlus, 
  Link as LinkIcon, 
  Sparkles, 
  Check,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Sign Up & Connect",
    description: "Create your account and connect your real estate data in minutes",
    features: [
      "Free 14-day trial",
      "No credit card required",
      "Import existing listings"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "02",
    icon: LinkIcon,
    title: "Create Client Portals",
    description: "Generate personalized buyer and seller portals with one click",
    features: [
      "Session-based access",
      "No login required",
      "Branded for your agency"
    ],
    color: "from-purple-500 to-pink-500"
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Let AI Work for You",
    description: "Generate marketing, track clients, and close more deals",
    features: [
      "AI marketing generation",
      "Automated follow-ups",
      "Real-time analytics"
    ],
    color: "from-orange-500 to-red-500"
  }
];

const techStack = [
  "nextjs",
  "react",
  "typescript",
  "tailwindcss",
  "clerk",
  "openai",
  "vercel",
  "postgresql"
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="container">
        <BlurFade delay={0.2}>
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold">
              Get Started in
              <br />
              <span className="text-primary">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From signup to your first AI-generated listing in under 5 minutes
            </p>
          </div>
        </BlurFade>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {steps.map((step, idx) => (
            <BlurFade key={idx} delay={0.3 + idx * 0.1}>
              <Card className="p-8 h-full relative group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                {/* Step Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`mb-6 h-16 w-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-6">{step.description}</p>

                {/* Features */}
                <ul className="space-y-3">
                  {step.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Arrow for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-12 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-primary/30" />
                  </div>
                )}
              </Card>
            </BlurFade>
          ))}
        </div>

        {/* Technology Visualization */}
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <BlurFade delay={0.6}>
            <div className="space-y-6">
              <Badge className="mb-2">Powered By</Badge>
              <h3 className="text-3xl md:text-4xl font-bold">
                Built on Modern, Reliable Technology
              </h3>
              <p className="text-lg text-muted-foreground">
                We use cutting-edge tools and frameworks to ensure your platform is fast, secure, and always available.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">Next.js 15 for blazing-fast performance</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">AI-powered by Claude 3.5 Sonnet</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">Real-time sync with Convex database</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">Enterprise-grade security with Clerk</span>
                </li>
              </ul>
              <Link href="/sign-up">
                <Button size="lg" className="mt-4">
                  Start Building Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </BlurFade>

          <BlurFade delay={0.7}>
            <div className="relative flex h-[500px] w-full items-center justify-center">
              {/* IconCloud in center */}
              <IconCloud iconSlugs={techStack} />
              
              {/* Orbiting Icons */}
              <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                duration={20}
                delay={5}
                radius={120}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </OrbitingCircles>
              
              <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                duration={20}
                delay={10}
                radius={120}
                reverse
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-green-500/10 backdrop-blur-sm">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
              </OrbitingCircles>

              <OrbitingCircles
                className="size-[60px] border-none bg-transparent"
                duration={30}
                delay={15}
                radius={200}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500/10 backdrop-blur-sm">
                  <UserPlus className="h-7 w-7 text-blue-500" />
                </div>
              </OrbitingCircles>

              <OrbitingCircles
                className="size-[60px] border-none bg-transparent"
                duration={30}
                delay={0}
                radius={200}
                reverse
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-purple-500/10 backdrop-blur-sm">
                  <LinkIcon className="h-7 w-7 text-purple-500" />
                </div>
              </OrbitingCircles>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
