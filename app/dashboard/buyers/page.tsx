import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import BuyerSessionsTable from "@/components/dashboard/buyer-sessions-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Buyer Sessions - Agent Dashboard',
  description: 'Manage your buyer client sessions',
};

export default async function BuyersPage() {
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

  const buyerSessions = await fetchQuery(api.buyerSessions.getBuyerSessionsByAgent, {
    agentId: agent._id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Buyer Sessions</h2>
          <p className="text-muted-foreground">
            {buyerSessions.length} total buyers • {buyerSessions.filter((s: any) => s.active).length} active
          </p>
        </div>
        <Link href="/dashboard/buyers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </Link>
      </div>

      <BuyerSessionsTable sessions={buyerSessions} />
    </div>
  );
}
