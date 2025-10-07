import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconBook, IconFileText, IconMap, IconRocket, IconLayoutDashboard } from "@tabler/icons-react";

const docs = [
  {
    title: "Project Overview",
    description: "Understand the platform architecture, tech stack, and implementation phases.",
    icon: IconLayoutDashboard,
    href: "https://github.com/mpwrightt/RealtorAI/blob/main/plan/PROJECT-OVERVIEW.md",
  },
  {
    title: "Quick Start Guide",
    description: "Set up your environment, configure keys, and launch the app quickly.",
    icon: IconRocket,
    href: "https://github.com/mpwrightt/RealtorAI/blob/main/plan/QUICK-START.md",
  },
  {
    title: "API & Integrations",
    description: "Review integrations for OpenRouter, RentCast, RapidAPI, and more.",
    icon: IconBook,
    href: "https://github.com/mpwrightt/RealtorAI/tree/main/docs/active-guides",
  },
  {
    title: "Implementation Roadmap",
    description: "Track completed phases and upcoming work across the project roadmap.",
    icon: IconFileText,
    href: "https://github.com/mpwrightt/RealtorAI/tree/main/plan",
  },
  {
    title: "Deployment Guide",
    description: "View instructions for deploying to Vercel and managing production environments.",
    icon: IconMap,
    href: "https://github.com/mpwrightt/RealtorAI/blob/main/docs/active-guides/DEPLOYMENT_GUIDE.md",
  },
];

export const metadata = {
  title: "Documentation",
  description: "Centralized access to RealtorAI project documentation and guides.",
};

export default function DocumentationPage() {
  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Documentation Hub</h1>
        <p className="text-muted-foreground">
          Access implementation plans, setup guides, and integration references for the Neighborhood Deal Finder platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.title} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5" />
                  {doc.title}
                </CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={doc.href} target="_blank" rel="noreferrer">
                    View Documentation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need more help?</CardTitle>
          <CardDescription>
            Visit the Help & Support page in your dashboard for contact options, FAQs, and troubleshooting tips.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
