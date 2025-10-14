import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Send, UserPlus, Repeat, Check, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function AutomatedCampaignsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-yellow-500/5 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Mail className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Automated Campaigns</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              Smart Email & SMS
              <br />
              <span className="text-primary">That Nurture Leads Automatically</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Set up once, run forever. AI-powered campaigns that send the right message at the right time to every lead.
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
            <h2 className="text-4xl font-bold mb-4">Campaign Types</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automated sequences for every stage of the buyer journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">New Lead Welcome</h3>
                <p className="text-muted-foreground">
                  Automatically introduce yourself and share your best listings when someone signs up.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Repeat className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">Drip Campaigns</h3>
                <p className="text-muted-foreground">
                  Stay top-of-mind with regular updates, market insights, and new listings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">Trigger-Based</h3>
                <p className="text-muted-foreground">
                  Send messages based on actions: property views, price drops, or saved searches.
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
                  <h3 className="text-xl font-semibold mb-2">Choose a Template</h3>
                  <p className="text-muted-foreground">
                    Start with proven email and SMS templates designed for real estate, or create your own.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Set Your Triggers</h3>
                  <p className="text-muted-foreground">
                    Define when messages should send: new lead, property view, price change, or time-based.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Let AI Personalize</h3>
                  <p className="text-muted-foreground">
                    AI customizes each message based on the lead's preferences, behavior, and location.
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
              <h2 className="text-4xl font-bold mb-4">Why It's Effective</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Set It and Forget It</h3>
                  <p className="text-muted-foreground">
                    Campaigns run automatically. No manual sending required.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Perfect Timing</h3>
                  <p className="text-muted-foreground">
                    AI determines the best time to send for maximum open rates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Personalized Content</h3>
                  <p className="text-muted-foreground">
                    Every message is tailored to the recipient's interests.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Track Performance</h3>
                  <p className="text-muted-foreground">
                    See open rates, click rates, and conversions for every campaign.
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
              Start Nurturing Leads on Autopilot
            </h2>
            <p className="text-xl opacity-90">
              Build relationships that convert—without lifting a finger.
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
