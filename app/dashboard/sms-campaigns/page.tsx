import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import SMSCampaigns from "@/components/dashboard/sms-campaigns";

export const metadata = {
  title: 'SMS Campaigns - Agent Dashboard',
  description: 'Send bulk SMS messages to your clients',
};

export default async function SMSCampaignsPage() {
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
        <h2 className="text-3xl font-bold">SMS Campaigns</h2>
        <p className="text-muted-foreground">
          Send mass SMS messages to your clients about new listings and updates
        </p>
      </div>

      <SMSCampaigns agentId={agent._id} />
    </div>
  );
}
