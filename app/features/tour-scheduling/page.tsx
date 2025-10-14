import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Bell, Link as LinkIcon, Check, ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";

export default function TourSchedulingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-pink-500/5 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20">
              <Calendar className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium">Tour Scheduling</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              Automated Scheduling
              <br />
              <span className="text-primary">That Books More Showings</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Let buyers book showings instantly with automatic calendar sync, reminders, and confirmations.
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
            <h2 className="text-4xl font-bold mb-4">Scheduling Made Simple</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage showings without the back-and-forth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold">Real-Time Availability</h3>
                <p className="text-muted-foreground">
                  Syncs with your Google, Outlook, or Apple calendar. Only show available time slots.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold">Smart Reminders</h3>
                <p className="text-muted-foreground">
                  Automatic email and SMS reminders reduce no-shows by 80%.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <LinkIcon className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold">Easy Booking Links</h3>
                <p className="text-muted-foreground">
                  Share your scheduling link anywhere: email, text, social media, or website.
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
                  <h3 className="text-xl font-semibold mb-2">Connect Your Calendar</h3>
                  <p className="text-muted-foreground">
                    One-click integration with Google Calendar, Outlook, or Apple Calendar.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Set Your Availability</h3>
                  <p className="text-muted-foreground">
                    Define your showing hours, buffer times, and blackout dates.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Share Your Link</h3>
                  <p className="text-muted-foreground">
                    Buyers book instantly. You get automatic notifications and calendar updates.
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
                  <h3 className="font-semibold text-lg mb-2">No More Phone Tag</h3>
                  <p className="text-muted-foreground">
                    Eliminate the back-and-forth of scheduling calls and texts.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Book More Showings</h3>
                  <p className="text-muted-foreground">
                    Instant booking means more showings and faster sales.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Reduce No-Shows</h3>
                  <p className="text-muted-foreground">
                    Automated reminders keep appointments top-of-mind.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Professional Experience</h3>
                  <p className="text-muted-foreground">
                    Branded scheduling pages make you look like a pro.
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
              Start Booking More Showings Today
            </h2>
            <p className="text-xl opacity-90">
              Make it easy for buyers to see your properties.
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
