import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: 'Saved Properties - Property Portal',
  description: 'Your saved and favorited properties',
};

export default async function SavedPage({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  
  // TODO: Implement saved properties functionality
  // For now, showing placeholder
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Saved Properties</h2>
        <p className="text-muted-foreground">
          Properties you've favorited for later
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No saved properties yet</h3>
          <p className="text-muted-foreground mb-4">
            Click the heart icon on properties you'd like to save for later.
          </p>
          <Link href={`/buyer/${sessionCode}`}>
            <Button>Browse Properties</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
