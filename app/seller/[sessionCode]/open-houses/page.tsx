import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import OpenHouseManager from "@/components/seller/open-house-manager";

export const metadata = {
  title: 'Open Houses - Seller Portal',
  description: 'Manage open house events for your listing',
};

interface PageProps {
  params: Promise<{ sessionCode: string }>;
}

export default async function SellerOpenHousesPage({ params }: PageProps) {
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
        <h2 className="text-3xl font-bold">Open Houses</h2>
        <p className="text-muted-foreground">
          Schedule and track open house events for {listing.address}
        </p>
      </div>

      <OpenHouseManager 
        listingId={session.listingId}
        agentId={session.agentId}
      />
    </div>
  );
}
