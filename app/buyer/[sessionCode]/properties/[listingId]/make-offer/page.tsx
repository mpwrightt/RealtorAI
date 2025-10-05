import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import OfferForm from "@/components/buyer/offer-form";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function MakeOfferPage({
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
          <h1 className="text-3xl font-bold">Make an Offer</h1>
          <p className="text-muted-foreground">
            Complete the form below to submit your offer
          </p>
        </div>
      </div>
      
      <OfferForm
        listingId={listing._id}
        buyerSessionId={session._id}
        sessionCode={sessionCode}
        listingPrice={listing.price}
        listingAddress={listing.address}
      />
    </div>
  );
}
