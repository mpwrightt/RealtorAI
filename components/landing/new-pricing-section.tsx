"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShineBorder } from "@/components/ui/shine-border";
import BlurFade from "@/components/magicui/blur-fade";
import ShinyButton from "@/components/magicui/shiny-button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for new agents getting started",
    icon: Sparkles,
    features: [
      "5 Active Listings",
      "AI Content Generation",
      "Basic Client Portals",
      "Email & SMS Campaigns",
      "Analytics Dashboard",
      "Email Support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    description: "Most popular for established agents",
    icon: Zap,
    features: [
      "Unlimited Listings",
      "Advanced AI Features",
      "Branded Client Portals",
      "Automated Campaigns",
      "Advanced Analytics",
      "Priority Support",
      "API Access",
      "White-Label Options",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$249",
    description: "For teams and brokerages",
    icon: Crown,
    features: [
      "Everything in Professional",
      "Multi-Agent Dashboard",
      "Team Management",
      "Custom Integrations",
      "Dedicated Account Manager",
      "Custom Training",
      "SLA Guarantee",
      "Custom Contract Terms",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function NewPricingSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container">
        <BlurFade delay={0.2}>
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold">
              Plans That Grow
              <br />
              <span className="text-primary">With Your Business</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
          </div>
        </BlurFade>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, idx) => (
            <BlurFade key={idx} delay={0.2 + idx * 0.1}>
              {plan.popular ? (
                <ShineBorder
                  className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background p-0"
                  color={["#6366f1", "#8b5cf6", "#d946ef"]}
                >
                  <Card className="w-full h-full border-0 shadow-none">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <plan.icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                          POPULAR
                        </div>
                      </div>
                      <CardTitle className="text-3xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-5xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIdx) => (
                          <li key={featureIdx} className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-primary shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href="/sign-up" className="w-full">
                        <ShinyButton className="w-full">
                          {plan.cta}
                        </ShinyButton>
                      </Link>
                    </CardFooter>
                  </Card>
                </ShineBorder>
              ) : (
                <Card className="relative flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <plan.icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-3xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href={plan.name === "Enterprise" ? "#" : "/sign-up"} className="w-full">
                      <Button variant="outline" size="lg" className="w-full">
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
            </BlurFade>
          ))}
        </div>

        {/* FAQ Section */}
        <BlurFade delay={0.6}>
          <div className="mt-24 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                <p className="text-muted-foreground text-sm">
                  Yes! All plans include a 14-day free trial with full access to features. No credit card required.
                </p>
              </div>
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-2">Can I change plans later?</h4>
                <p className="text-muted-foreground text-sm">
                  Absolutely. Upgrade or downgrade anytime. Changes take effect immediately with prorated billing.
                </p>
              </div>
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-muted-foreground text-sm">
                  We accept all major credit cards (Visa, Mastercard, Amex) and ACH transfers for annual plans.
                </p>
              </div>
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-2">Do you offer discounts for annual billing?</h4>
                <p className="text-muted-foreground text-sm">
                  Yes! Save 20% when you pay annually. Contact sales for custom enterprise agreements.
                </p>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
