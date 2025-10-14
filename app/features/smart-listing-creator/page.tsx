import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image as ImageIcon, Wand2, Check, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export default function SmartListingCreatorPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-blue-500/5 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Camera className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Smart Listing Creator</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              Create Stunning Listings
              <br />
              <span className="text-primary">With AI Enhancement</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-enhanced photos, automatic feature detection, and compelling descriptions that make your listings stand out.
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
            <h2 className="text-4xl font-bold mb-4">Smart Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional listings in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Wand2 className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold">AI Photo Enhancement</h3>
                <p className="text-muted-foreground">
                  Automatically enhance lighting, colors, and composition to make photos pop.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold">Feature Detection</h3>
                <p className="text-muted-foreground">
                  AI identifies key features like hardwood floors, granite counters, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold">Virtual Staging</h3>
                <p className="text-muted-foreground">
                  Add furniture and decor to empty rooms with AI virtual staging.
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
              <h2 className="text-4xl font-bold mb-4">Why Agents Choose This</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Professional Quality Photos</h3>
                  <p className="text-muted-foreground">
                    Make every listing look its best without expensive photography.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Faster Listings</h3>
                  <p className="text-muted-foreground">
                    Create complete listings in minutes, not hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Higher Engagement</h3>
                  <p className="text-muted-foreground">
                    Enhanced photos get 3x more views and inquiries.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">MLS Integration</h3>
                  <p className="text-muted-foreground">
                    Publish directly to MLS and major listing sites.
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
              Ready to Create Better Listings?
            </h2>
            <p className="text-xl opacity-90">
              Start your free trial and see the difference AI makes.
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
