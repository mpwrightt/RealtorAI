import { Button } from "@/components/ui/button";
import { Brain, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-24 bg-gradient-to-b from-orange-500/5 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              Feature Details
              <br />
              <span className="text-primary">Coming Soon</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              This feature page is under construction. Check back soon!
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
    </div>
  );
}
