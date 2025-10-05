import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import SellerSessionsTable from "@/components/dashboard/seller-sessions-table";

export const metadata = {
  title: 'Seller Sessions - Agent Dashboard',
  description: 'Manage your seller portal sessions',
};

export default async function SellersPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const agent = await fetchQuery(api.agents.getAgentByUserId, {
    externalId: userId,
  });

  if (!agent) {
    redirect('/dashboard');
  }

  const sellerSessions = await fetchQuery(api.sellerSessions.getSellerSessionsByAgent, {
    agentId: agent._id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Seller Sessions</h2>
          <p className="text-muted-foreground">
            Manage seller portal access and analytics
          </p>
        </div>
        <Link href="/dashboard/sellers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Seller Session
          </Button>
        </Link>
      </div>

      <SellerSessionsTable sessions={sellerSessions} />
    </div>
  );
}
