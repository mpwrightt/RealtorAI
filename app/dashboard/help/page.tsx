import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  IconBook, 
  IconMail, 
  IconBrandGithub, 
  IconMessageCircle,
  IconHelp,
  IconExternalLink 
} from "@tabler/icons-react";

export default async function HelpPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const resources = [
    {
      title: "Documentation",
      description: "Learn how to use all features of the platform",
      icon: IconBook,
      href: "/docs", // Update with actual docs URL
      color: "text-blue-600",
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: IconMail,
      href: "mailto:support@yourdomain.com", // Update with actual email
      color: "text-green-600",
    },
    {
      title: "Feature Requests",
      description: "Suggest new features or improvements",
      icon: IconMessageCircle,
      href: "https://github.com/mpwrightt/RealtorAI/issues", // Update if needed
      color: "text-purple-600",
    },
    {
      title: "GitHub",
      description: "View the source code and report issues",
      icon: IconBrandGithub,
      href: "https://github.com/mpwrightt/RealtorAI",
      color: "text-gray-600",
    },
  ];

  const faqs = [
    {
      question: "How do I create a buyer portal?",
      answer: "Go to Dashboard → Buyers → Create Buyer Portal. Fill in the buyer's details and preferences, then share the generated link with them.",
    },
    {
      question: "How do I enable AI features?",
      answer: "AI features require an OpenRouter API key. Add it to your environment variables or contact support for setup assistance.",
    },
    {
      question: "Can buyers see all my listings?",
      answer: "Buyers only see listings that match their preferences and the ones you specifically share with them through their portal.",
    },
    {
      question: "How do I customize my branding?",
      answer: "Go to Settings → Branding to customize your company name, logo, colors, and contact information that appears in buyer/seller portals.",
    },
    {
      question: "What integrations are available?",
      answer: "The platform supports Zapier, RentCast (property data), Google Places (amenities), and OpenRouter (AI features). More integrations coming soon!",
    },
  ];

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <IconHelp className="h-8 w-8" />
          Help & Support
        </h1>
        <p className="text-muted-foreground">
          Find answers, get support, and learn about the platform
        </p>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {resources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className={`h-5 w-5 ${resource.color}`} />
                  {resource.title}
                </CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <a href={resource.href} target="_blank" rel="noopener noreferrer">
                    Open
                    <IconExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                <h3 className="font-semibold text-sm mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <a href="/dashboard" className="text-primary hover:underline">Dashboard</a>
          <a href="/dashboard/settings" className="text-primary hover:underline">Settings</a>
          <a href="/dashboard/listings" className="text-primary hover:underline">My Listings</a>
          <a href="/dashboard/buyers" className="text-primary hover:underline">Buyers</a>
          <a href="/dashboard/sellers" className="text-primary hover:underline">Sellers</a>
          <a href="/dashboard/messages" className="text-primary hover:underline">Messages</a>
        </div>
      </div>
    </div>
  );
}
