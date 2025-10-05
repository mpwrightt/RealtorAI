import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import FavoritesGrid from "@/components/buyer/favorites-grid";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode }
  );
  
  if (!session) {
    redirect('/');
  }
  
  const favorites = await fetchQuery(api.favorites.getFavorites, {
    buyerSessionId: session._id,
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Favorite Properties
          </h1>
          <p className="text-muted-foreground mt-2">
            {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
        <Link href={`/buyer/${sessionCode}`}>
          <Button>Browse More Properties</Button>
        </Link>
      </div>
      
      {favorites.length > 0 ? (
        <FavoritesGrid 
          favorites={favorites}
          sessionCode={sessionCode}
          sessionId={session._id}
        />
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6">
            Start saving properties you're interested in by clicking the heart icon
          </p>
          <Link href={`/buyer/${sessionCode}`}>
            <Button>Browse Properties</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
