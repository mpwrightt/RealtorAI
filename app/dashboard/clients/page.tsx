import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import ClientTracker from "@/components/dashboard/client-tracker";

export const metadata = {
  title: 'Client Tracker - Agent Dashboard',
  description: 'Manage your leads and client relationships',
};

export default async function ClientsPage() {
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

  const leads = await fetchQuery(api.leads.getLeadsByAgent, {
    agentId: agent._id,
  });

  const stats = await fetchQuery(api.leads.getLeadStats, {
    agentId: agent._id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Client Tracker</h2>
        <p className="text-muted-foreground">
          Manage your leads and track client relationships
        </p>
      </div>

      <ClientTracker 
        agentId={agent._id}
        leads={leads}
        stats={stats}
      />
    </div>
  );
}
