import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, Users, Check, ArrowRight, Target } from "lucide-react";
import Link from "next/link";

export default function AdvancedAnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-indigo-500/5 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium">Advanced Analytics</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              Data-Driven Insights
              <br />
              <span className="text-primary">That Close More Deals</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track every listing view, buyer engagement, and conversion metric in real-time. Know exactly what's working.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What You Can Track</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get the insights you need to optimize your marketing and close more deals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold">Listing Performance</h3>
                <p className="text-muted-foreground">
                  Views, shares, saves, and time spent on each listing. See which properties are hot.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold">Buyer Engagement</h3>
                <p className="text-muted-foreground">
                  Track how leads interact with your content and identify ready-to-buy signals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold">Campaign ROI</h3>
                <p className="text-muted-foreground">
                  Measure the effectiveness of every email, social post, and ad campaign.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Automatic Tracking</h3>
                  <p className="text-muted-foreground">
                    Every listing, email, and social post is automatically tracked. No setup required.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-Time Dashboard</h3>
                  <p className="text-muted-foreground">
                    Beautiful, easy-to-read charts show your performance at a glance.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Actionable Insights</h3>
                  <p className="text-muted-foreground">
                    Get AI-powered recommendations on what to do next to maximize results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why It Matters</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Stop Guessing</h3>
                  <p className="text-muted-foreground">
                    Know exactly which marketing efforts are paying off.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Identify Hot Leads</h3>
                  <p className="text-muted-foreground">
                    See which buyers are actively engaged and ready to buy.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Optimize Pricing</h3>
                  <p className="text-muted-foreground">
                    Use engagement data to price listings competitively.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Prove Your Value</h3>
                  <p className="text-muted-foreground">
                    Show sellers detailed reports on your marketing efforts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">
              Start Making Data-Driven Decisions
            </h2>
            <p className="text-xl opacity-90">
              Get the insights you need to outperform the competition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="text-lg">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
