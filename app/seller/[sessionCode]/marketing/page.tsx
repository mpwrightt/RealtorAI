import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import AIMarketingGenerator from "@/components/seller/ai-marketing-generator";

export const metadata = {
  title: 'Marketing - Seller Portal',
  description: 'AI-powered marketing content for your listing',
};

interface PageProps {
  params: Promise<{ sessionCode: string }>;
}

export default async function SellerMarketingPage({ params }: PageProps) {
  const { sessionCode } = await params;
  
  const session = await fetchQuery(api.sellerSessions.getSellerSessionByCode, {
    sessionCode,
  });

  if (!session) {
    notFound();
  }

  if (!session.active) {
    redirect('/');
  }

  const listing = await fetchQuery(api.listings.getListingById, {
    listingId: session.listingId,
  });

  if (!listing) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">AI Marketing</h2>
        <p className="text-muted-foreground">
          Generate professional marketing content for {listing.address}
        </p>
      </div>

      <AIMarketingGenerator 
        listingId={session.listingId}
        agentId={session.agentId}
      />
    </div>
  );
}
