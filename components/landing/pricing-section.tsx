"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import BlurFade from "@/components/magicui/blur-fade";
import RainbowButton from "@/components/magicui/rainbow-button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    description: "Perfect for getting started",
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      "5 Active Listings",
      "AI Marketing Generator",
      "Basic CRM",
      "10 Buyer Portals",
      "Email Support",
    ],
  },
  {
    name: "Pro",
    description: "For serious agents",
    monthlyPrice: 99,
    annualPrice: 79,
    popular: true,
    features: [
      "Unlimited Listings",
      "AI Marketing Generator",
      "Full CRM",
      "Unlimited Portals",
      "Priority Support",
      "Custom Branding",
      "Advanced Analytics",
    ],
  },
  {
    name: "Enterprise",
    description: "For teams and brokerages",
    monthlyPrice: null,
    annualPrice: null,
    features: [
      "Everything in Pro",
      "Multiple Agents",
      "API Access",
      "White Label",
      "Dedicated Support",
      "Custom Integrations",
    ],
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <BlurFade delay={0.25}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">Simple Pricing</Badge>
            <h2 className="text-5xl font-bold mb-6">
              Pricing That Makes Sense for Solo Agents
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              No hidden fees. Cancel anytime. 14-day money-back guarantee.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={!annual ? "font-bold" : "text-muted-foreground"}>
                Monthly
              </span>
              <Switch checked={annual} onCheckedChange={setAnnual} />
              <span className={annual ? "font-bold" : "text-muted-foreground"}>
                Annual
              </span>
              <Badge variant="secondary">Save 20%</Badge>
            </div>
          </div>
        </BlurFade>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <BlurFade key={idx} delay={0.3 + idx * 0.1}>
              <Card className={`p-8 relative ${plan.popular ? "border-2 border-primary shadow-xl" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-6">
                  {plan.monthlyPrice ? (
                    <>
                      <span className="text-5xl font-bold">
                        ${annual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  ) : (
                    <span className="text-5xl font-bold">Custom</span>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  {plan.popular ? (
                    <RainbowButton className="w-full">
                      Start Free Trial
                    </RainbowButton>
                  ) : plan.monthlyPrice ? (
                    <Button variant="outline" className="w-full">
                      Start Free Trial
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  )}
                </Link>
              </Card>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
