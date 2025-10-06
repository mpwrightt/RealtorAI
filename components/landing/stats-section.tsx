"use client";

import { Card } from "@/components/ui/card";
import BlurFade from "@/components/magicui/blur-fade";
import NumberTicker from "@/components/magicui/number-ticker";
import { Clock, Zap, TrendingUp, Users } from "lucide-react";

export default function StatsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <BlurFade delay={0.2}>
            <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
              <Clock className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-4xl font-bold mb-1">
                <NumberTicker value={40} />+
              </div>
              <div className="text-sm text-muted-foreground">Hours Saved Per Year</div>
            </Card>
          </BlurFade>

          <BlurFade delay={0.3}>
            <Card className="p-6 text-center bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/10">
              <Zap className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <div className="text-4xl font-bold mb-1">
                <NumberTicker value={15} />s
              </div>
              <div className="text-sm text-muted-foreground">AI Generation Time</div>
            </Card>
          </BlurFade>

          <BlurFade delay={0.4}>
            <Card className="p-6 text-center bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/10">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <div className="text-4xl font-bold mb-1">
                <NumberTicker value={95} />%
              </div>
              <div className="text-sm text-muted-foreground">Time Reduction</div>
            </Card>
          </BlurFade>

          <BlurFade delay={0.5}>
            <Card className="p-6 text-center bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/10">
              <Users className="h-8 w-8 mx-auto mb-3 text-purple-500" />
              <div className="text-4xl font-bold mb-1">
                <NumberTicker value={500} />+
              </div>
              <div className="text-sm text-muted-foreground">Active Agents</div>
            </Card>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
