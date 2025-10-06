"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/magicui/blur-fade";
import { AlertCircle, CheckCircle, Clock, Users, TrendingDown, Sparkles, Target, TrendingUp } from "lucide-react";

export default function ProblemSolutionSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Problem Side */}
          <BlurFade delay={0.25}>
            <div className="space-y-6">
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                <AlertCircle className="h-4 w-4 mr-2" />
                The Problem
              </Badge>
              <h2 className="text-4xl font-bold">
                Solo Agents Are Drowning in Manual Work
              </h2>
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-destructive mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">2+ Hours Per Listing</h3>
                      <p className="text-muted-foreground">
                        Writing descriptions, creating social posts, formatting emails
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <Users className="h-6 w-6 text-destructive mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Lost Leads</h3>
                      <p className="text-muted-foreground">
                        No time to follow up with every potential client
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <TrendingDown className="h-6 w-6 text-destructive mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Inconsistent Marketing</h3>
                      <p className="text-muted-foreground">
                        Some listings get great exposure, others get ignored
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </BlurFade>

          {/* Solution Side */}
          <BlurFade delay={0.5}>
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
                <CheckCircle className="h-4 w-4 mr-2" />
                The Solution
              </Badge>
              <h3 className="text-3xl font-bold mb-6">
                AI Does the Heavy Lifting
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">15 Seconds Per Listing</h4>
                    <p className="text-muted-foreground">
                      AI generates professional marketing content instantly
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Target className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Never Miss a Lead</h4>
                    <p className="text-muted-foreground">
                      Automated CRM tracks every client interaction
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Consistent Quality</h4>
                    <p className="text-muted-foreground">
                      Every listing gets professional-grade marketing
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
