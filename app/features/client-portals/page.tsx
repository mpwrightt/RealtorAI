import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, Bell, Heart, Check, ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";

export default function ClientPortalsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-green-500/5 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Client Portals</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              Branded Client Portals
              <br />
              <span className="text-primary">That Wow Your Clients</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Give buyers and sellers their own branded portal with AI chat, property matching, and real-time updates. Make every client feel like a VIP.
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
            <h2 className="text-4xl font-bold mb-4">Portal Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything your clients need in one beautiful, branded experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">AI Chat Support</h3>
                <p className="text-muted-foreground">
                  24/7 AI assistant answers questions about properties, neighborhoods, and the buying process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">Property Matching</h3>
                <p className="text-muted-foreground">
                  AI automatically suggests properties based on preferences and browsing behavior.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">Real-Time Updates</h3>
                <p className="text-muted-foreground">
                  Instant notifications for new listings, price changes, and showing confirmations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Clients Love It</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Always Connected</h3>
                  <p className="text-muted-foreground">
                    Clients can access their portal 24/7 from any device.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Fully Branded</h3>
                  <p className="text-muted-foreground">
                    Your logo, colors, and branding throughout the experience.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Document Sharing</h3>
                  <p className="text-muted-foreground">
                    Securely share contracts, disclosures, and inspection reports.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Mobile Optimized</h3>
                  <p className="text-muted-foreground">
                    Perfect experience on phones, tablets, and desktops.
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
              Give Your Clients a VIP Experience
            </h2>
            <p className="text-xl opacity-90">
              Stand out from other agents with branded client portals.
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
