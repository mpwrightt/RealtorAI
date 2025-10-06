"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BlurFade from "@/components/magicui/blur-fade";
import Marquee from "@/components/magicui/marquee";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "The AI Marketing Generator alone saved me 40 hours in my first month. This is a game-changer for solo agents.",
    author: "Sarah Johnson",
    role: "Independent Agent, Austin TX",
    initials: "SJ",
  },
  {
    quote: "My listings get 3x more engagement now. The social media posts are better than what I paid $500/month for before.",
    author: "Mike Chen",
    role: "Solo Agent, San Francisco",
    initials: "MC",
  },
  {
    quote: "Finally, a CRM that doesn't require a PhD to use. I can track all my leads in seconds.",
    author: "Jennifer Martinez",
    role: "Real Estate Agent, Miami",
    initials: "JM",
  },
  {
    quote: "Buyers love the personalized portals. I've closed 2 more deals this quarter because of it.",
    author: "David Kim",
    role: "Agent, Seattle",
    initials: "DK",
  },
];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <Card className="p-6 max-w-md mx-4">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
        ))}
      </div>
      <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.quote}&quot;</p>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{testimonial.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{testimonial.author}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </Card>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container relative z-10">
        <BlurFade delay={0.25}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">Loved by Agents</Badge>
            <h2 className="text-5xl font-bold mb-6">
              Join 500+ Agents Who Are Crushing It
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from solo agents who transformed their business
            </p>
          </div>
        </BlurFade>

        <Marquee pauseOnHover className="[--duration:40s]">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={idx} testimonial={testimonial} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
