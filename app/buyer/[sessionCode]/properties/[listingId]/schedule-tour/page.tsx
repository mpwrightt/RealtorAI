import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import TourRequestForm from "@/components/buyer/tour-request-form";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ScheduleTourPage({
  params,
}: {
  params: Promise<{ sessionCode: string; listingId: string }>;
}) {
  const { sessionCode, listingId } = await params;
  
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode }
  );
  
  if (!session) {
    redirect('/');
  }
  
  const listing = await fetchQuery(api.listings.getListingById, {
    listingId: listingId as Id<"listings">,
  });
  
  if (!listing) {
    redirect(`/buyer/${sessionCode}`);
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/buyer/${sessionCode}/properties/${listingId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Schedule a Tour</h1>
          <p className="text-muted-foreground">
            Request a showing for this property
          </p>
        </div>
      </div>
      
      <TourRequestForm
        listingId={listing._id}
        buyerSessionId={session._id}
        sessionCode={sessionCode}
        listingAddress={`${listing.address}, ${listing.city}, ${listing.state}`}
      />
    </div>
  );
}
