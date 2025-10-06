import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-16">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">RealtorAI</span>
            </div>
            <p className="text-muted-foreground mb-6">
              AI-powered real estate platform built for solo agents
              who want to compete with big brokerages.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link href="/dashboard/demo" className="text-muted-foreground hover:text-foreground">Demo</Link></li>
              <li><Link href="/roadmap" className="text-muted-foreground hover:text-foreground">Roadmap</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
              <li><Link href="/security" className="text-muted-foreground hover:text-foreground">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 RealtorAI. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for real estate agents
          </p>
        </div>
      </div>
    </footer>
  );
}
