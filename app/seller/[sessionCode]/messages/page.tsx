import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import SellerMessagesClient from "@/components/seller/messages-client";

export const metadata = {
  title: 'Messages - Seller Portal',
  description: 'Communicate with your real estate agent',
};

interface PageProps {
  params: Promise<{ sessionCode: string }>;
}

export default async function SellerMessagesPage({ params }: PageProps) {
  const { sessionCode } = await params;
  
  const session = await fetchQuery(api.sellerSessions.getSellerSessionByCode, {
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

      <SellerMessagesClient 
        sessionId={session._id}
        agentName={agent.agencyName}
      />
    </div>
  );
}
