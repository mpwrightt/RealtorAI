import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import MessagesInbox from "@/components/dashboard/messages-inbox";

export const metadata = {
  title: 'Messages - Agent Dashboard',
  description: 'Unified inbox for all client communications',
};

export default async function MessagesPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Messages</h2>
        <p className="text-muted-foreground">
          Unified inbox for all client communications
        </p>
      </div>

      <MessagesInbox agentId={agent._id} />
    </div>
  );
}
