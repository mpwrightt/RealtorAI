import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Home as HomeIcon, Send } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  agentId: string;
}

export default function QuickActions({ agentId }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/listings/new" className="block">
            <Button className="w-full h-auto py-4 flex flex-col gap-2" variant="outline">
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add Listing</span>
            </Button>
          </Link>

          <Link href="/dashboard/buyers/new" className="block">
            <Button className="w-full h-auto py-4 flex flex-col gap-2" variant="outline">
              <UserPlus className="h-6 w-6" />
              <span className="text-sm">Create Buyer Session</span>
            </Button>
          </Link>

          <Link href="/dashboard/sellers/new" className="block">
            <Button className="w-full h-auto py-4 flex flex-col gap-2" variant="outline">
              <HomeIcon className="h-6 w-6" />
              <span className="text-sm">Create Seller Session</span>
            </Button>
          </Link>

          <Link href="/dashboard/invites" className="block">
            <Button className="w-full h-auto py-4 flex flex-col gap-2" variant="outline">
              <Send className="h-6 w-6" />
              <span className="text-sm">Send Invites</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
