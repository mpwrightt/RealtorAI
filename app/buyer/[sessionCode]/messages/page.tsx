import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import BuyerMessagesClient from "@/components/buyer/messages-client";

export const metadata = {
  title: 'Messages - Buyer Portal',
  description: 'Communicate with your real estate agent',
};

interface PageProps {
  params: Promise<{ sessionCode: string }>;
}

export default async function BuyerMessagesPage({ params }: PageProps) {
  const { sessionCode } = await params;
  
  const session = await fetchQuery(api.buyerSessions.getBuyerSessionByCode, {
    sessionCode,
  });

  if (!session) {
    notFound();
  }

  if (!session.active) {
    redirect('/');
  }

  const agent = await fetchQuery(api.agents.getAgentById, {
    agentId: session.agentId,
  });

  if (!agent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Messages</h2>
        <p className="text-muted-foreground">
          Chat with your agent {agent.agencyName}
        </p>
      </div>

      <BuyerMessagesClient 
        sessionId={session._id}
        agentName={agent.agencyName}
      />
    </div>
  );
}
