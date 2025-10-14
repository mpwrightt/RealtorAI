import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { fetchQuery } from 'convex/nextjs';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SMSCampaigns from '@/components/dashboard/sms-campaigns';
import EmailCampaigns from '@/components/dashboard/email-campaigns';
import { api } from '@/convex/_generated/api';

export const metadata = {
  title: 'Campaigns - Agent Dashboard',
  description: 'Manage SMS and email campaigns in one place.',
};

interface CampaignsPageProps {
  searchParams?: {
    tab?: string;
  };
}

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
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

  const defaultTab = searchParams?.tab === 'email' ? 'email' : 'sms';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Campaigns</h2>
        <p className="text-muted-foreground">
          Launch coordinated SMS and email outreach from a single workspace.
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="sms">SMS Campaigns</TabsTrigger>
          <TabsTrigger value="email">Email Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="space-y-6">
          <SMSCampaigns agentId={agent._id} />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailCampaigns
            agentId={agent._id}
            agentDetails={{
              _id: agent._id,
              agencyName: agent.agencyName,
              email: agent.email,
              brandingSettings: agent.brandingSettings ?? null,
              integrations: agent.integrations ?? null,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
