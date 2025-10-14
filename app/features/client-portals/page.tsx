import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ClientPortalsPage() {
  return (
    <div className="min-h-screen bg-background">
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
              Give buyers and sellers their own branded portal with AI chat, property matching, and real-time updates.
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
      
      <section className="py-24">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Coming Soon</h2>
          <p className="text-xl text-muted-foreground">
            This feature page is being built. Check back soon for more details!
          </p>
        </div>
      </section>
    </div>
  );
}
