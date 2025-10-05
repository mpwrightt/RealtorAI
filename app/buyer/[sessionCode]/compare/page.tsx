import { redirect } from 'next/navigation';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import PropertyComparison from '@/components/buyer/property-comparison';

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionCode: string }>;
  searchParams: Promise<{ ids?: string }>;
}) {
  const { sessionCode } = await params;
  const { ids } = await searchParams;
  
  // Validate session
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode }
  );
  
  if (!session) {
    redirect('/');
  }
  
  // Validate listing IDs
  if (!ids) {
    redirect(`/buyer/${sessionCode}`);
  }
  
  const listingIds = ids.split(',').filter(id => id.trim());
  
  if (listingIds.length < 2) {
    redirect(`/buyer/${sessionCode}`);
  }
  
  if (listingIds.length > 4) {
    // Limit to first 4 properties
    const limitedIds = listingIds.slice(0, 4);
    redirect(`/buyer/${sessionCode}/compare?ids=${limitedIds.join(',')}`);
  }
  
  // Fetch listings
  try {
    const listings = await fetchQuery(api.listings.getMultipleListings, {
      listingIds: listingIds as Id<"listings">[],
    });
    
    // Filter out null listings and validate we have at least 2
    const validListings = listings.filter((l: any) => l !== null);
    
    if (validListings.length < 2) {
      redirect(`/buyer/${sessionCode}`);
    }
    
    return (
      <PropertyComparison 
        listings={validListings}
        sessionCode={sessionCode}
        sessionId={session._id}
      />
    );
  } catch (error) {
    console.error('Error fetching listings for comparison:', error);
    redirect(`/buyer/${sessionCode}`);
  }
}
