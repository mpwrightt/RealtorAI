import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditListingForm from "@/components/dashboard/edit-listing-form";

export const metadata = {
  title: "Edit Listing - Dashboard",
  description: "Edit listing details and information",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { listingId } = await params;

  // Get listing data
  const listing = await fetchQuery(api.listings.getListingById, {
    listingId: listingId as Id<'listings'>,
  });

  if (!listing) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/listings/${listingId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Listing</h1>
          <p className="text-sm text-muted-foreground">
            {listing.address}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <EditListingForm listing={listing} />
    </div>
  );
}
