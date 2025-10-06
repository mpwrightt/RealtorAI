"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/magicui/blur-fade";
import { Sparkles, Users, Home, BarChart, MessageSquare, Calculator } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Marketing Generator",
    description: "Generate listing descriptions, social posts, and email campaigns in seconds",
  },
  {
    icon: Users,
    title: "Client CRM",
    description: "Track leads, pre-qualifications, and deal pipelines",
  },
  {
    icon: Home,
    title: "Buyer Portals",
    description: "Personalized property search with no login required",
  },
  {
    icon: BarChart,
    title: "Seller Analytics",
    description: "Real-time engagement metrics and insights",
  },
  {
    icon: MessageSquare,
    title: "Real-time Messaging",
    description: "Chat with buyers and sellers, get instant notifications",
  },
  {
    icon: Calculator,
    title: "Commission Calculator",
    description: "Calculate splits and track earnings",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="container">
        <BlurFade delay={0.25}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">Platform Features</Badge>
            <h2 className="text-5xl font-bold mb-6">
              Everything You Need to Dominate Your Market
            </h2>
            <p className="text-xl text-muted-foreground">
              Built specifically for solo agents who want to compete with big brokerages
            </p>
          </div>
        </BlurFade>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <BlurFade key={idx} delay={0.25 + idx * 0.1}>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
