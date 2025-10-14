import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, Clock, Zap, Check, ArrowRight, Globe } from "lucide-react";
import Link from "next/link";

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-orange-500/5 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Brain className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              Your 24/7 AI Assistant
              <br />
              <span className="text-primary">Never Miss a Lead</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI that answers client questions instantly, qualifies leads, and schedules showings—even while you sleep.
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

      {/* What It Does Section */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Your AI Assistant Can Do</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handle routine conversations so you can focus on closing deals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold">Answer Questions</h3>
                <p className="text-muted-foreground">
                  Responds to inquiries about properties, neighborhoods, schools, and the buying process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold">Qualify Leads</h3>
                <p className="text-muted-foreground">
                  Asks the right questions to understand buyer needs and budget before you get involved.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold">Schedule Showings</h3>
                <p className="text-muted-foreground">
                  Books appointments directly into your calendar based on availability.
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
                  <h3 className="text-xl font-semibold mb-2">Train Your Assistant</h3>
                  <p className="text-muted-foreground">
                    Add your listings, preferred neighborhoods, and common FAQs. The AI learns your style and expertise.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Connect Your Channels</h3>
                  <p className="text-muted-foreground">
                    Integrate with your website, Facebook, Instagram, and SMS. The AI responds everywhere.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Let It Work</h3>
                  <p className="text-muted-foreground">
                    The AI handles routine questions 24/7 and notifies you when a lead is ready to talk.
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
              <h2 className="text-4xl font-bold mb-4">Why Agents Love It</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Never Miss a Lead</h3>
                  <p className="text-muted-foreground">
                    Respond instantly to every inquiry, even at 2 AM.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Save 10+ Hours/Week</h3>
                  <p className="text-muted-foreground">
                    Stop answering the same questions over and over.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Better Lead Quality</h3>
                  <p className="text-muted-foreground">
                    Only talk to qualified, ready-to-buy prospects.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Multilingual Support</h3>
                  <p className="text-muted-foreground">
                    Communicate with clients in their preferred language.
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
              Get Your AI Assistant Today
            </h2>
            <p className="text-xl opacity-90">
              Start capturing and qualifying leads 24/7.
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
