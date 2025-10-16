"use client";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { MagicCard } from "@/components/ui/magic-card";
import BlurFade from "@/components/magicui/blur-fade";
import { RetroGrid } from "@/components/ui/retro-grid";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  MessageSquare, 
  Camera, 
  TrendingUp, 
  Users, 
  Brain,
  Calendar,
  Mail,
  BarChart3
} from "lucide-react";

const features = [
  {
    Icon: Sparkles,
    name: "AI Content Generation",
    description: "Generate property descriptions, social media posts, and email campaigns in seconds.",
    href: "/features/ai-content-generation",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/10" />
    ),
  },
  {
    Icon: Camera,
    name: "Smart Listing Creator",
    description: "AI-enhanced photos, automatic feature detection, and compelling descriptions.",
    href: "/features/smart-listing-creator",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-primary/10 to-cyan-500/10" />
    ),
  },
  {
    Icon: Users,
    name: "Client Portals",
    description: "Branded buyer and seller portals with AI chat, property matching, and real-time updates.",
    href: "/features/client-portals",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/10 to-primary/10" />
    ),
  },
  {
    Icon: Brain,
    name: "AI Assistant",
    description: "24/7 AI that answers client questions about properties, neighborhoods, and more.",
    href: "/features/ai-assistant",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-primary/10 to-amber-500/10" />
    ),
  },
  {
    Icon: BarChart3,
    name: "Advanced Analytics",
    description: "Track listing views, buyer engagement, and conversion metrics in real-time.",
    href: "/features/advanced-analytics",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-indigo-500/10 to-purple-500/10" />
    ),
  },
  {
    Icon: Mail,
    name: "Automated Campaigns",
    description: "Smart email and SMS campaigns that nurture leads automatically.",
    href: "/features/automated-campaigns",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-primary/10 to-orange-500/10" />
    ),
  },
  {
    Icon: Calendar,
    name: "Tour Scheduling",
    description: "Automated scheduling with calendar sync and reminder notifications.",
    href: "/features/tour-scheduling",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-primary/10 to-rose-500/10" />
    ),
  },
];

export default function NewFeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-background relative overflow-hidden">
      <RetroGrid className="absolute inset-0 opacity-40" />
      <div className="container relative z-10">
        <BlurFade delay={0.2}>
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold">
              Everything You Need to
              <br />
              <span className="text-primary">Close More Deals</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From AI-powered marketing to client management, we've built the tools solo agents need to compete with big brokerages.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.4}>
          <BentoGrid>
            {features.map((feature, idx) => (
              <div key={idx} className="group">
                <BentoCard 
                  {...feature}
                  className={`${feature.className} hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20`}
                />
              </div>
            ))}
          </BentoGrid>
        </BlurFade>

        {/* Magic Cards Section */}
        <BlurFade delay={0.6}>
          <div className="mt-24">
            <div className="text-center mb-12">
              <Badge className="mb-4">Why Choose Us</Badge>
              <h3 className="text-3xl font-bold">
                Built for Real Estate Success
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MagicCard className="p-8 flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform duration-300">
                <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-blue-500" />
                </div>
                <h4 className="text-xl font-semibold">95% Faster</h4>
                <p className="text-muted-foreground">
                  Generate marketing content in seconds, not hours. Save 40+ hours per month.
                </p>
              </MagicCard>

              <MagicCard className="p-8 flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform duration-300">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-green-500" />
                </div>
                <h4 className="text-xl font-semibold">Better Client Experience</h4>
                <p className="text-muted-foreground">
                  Branded portals and 24/7 AI support make clients feel like VIPs.
                </p>
              </MagicCard>

              <MagicCard className="p-8 flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform duration-300">
                <div className="h-14 w-14 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Brain className="h-7 w-7 text-purple-500" />
                </div>
                <h4 className="text-xl font-semibold">AI-Powered Insights</h4>
                <p className="text-muted-foreground">
                  Smart recommendations and predictive analytics to close deals faster.
                </p>
              </MagicCard>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
