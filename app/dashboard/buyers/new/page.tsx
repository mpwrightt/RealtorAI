import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import CreateBuyerSessionForm from "@/components/dashboard/create-buyer-session-form";

export const metadata = {
  title: 'Create Buyer Session - Agent Dashboard',
  description: 'Create a new buyer portal session',
};

export default async function NewBuyerSessionPage() {
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
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create Buyer Session</h2>
        <p className="text-muted-foreground">
          Generate a personalized property portal for your buyer client
        </p>
      </div>

      <CreateBuyerSessionForm agentId={agent._id} />
    </div>
  );
}
