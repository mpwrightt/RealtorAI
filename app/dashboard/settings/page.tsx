import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { BrandingSettings } from "@/components/dashboard/branding-settings";
import { IntegrationsManager } from "@/components/dashboard/integrations-manager";
import { ZapierIntegration } from "@/components/dashboard/zapier-integration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Get agent profile
  const agent = await fetchQuery(api.agents.getAgentByUserId, {
    externalId: userId,
  });

  if (!agent) {
    redirect("/dashboard");
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, branding, and integrations
        </p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding">
          <BrandingSettings agentId={agent._id} />
        </TabsContent>
        
        <TabsContent value="integrations">
          <IntegrationsManager agentId={agent._id} />
        </TabsContent>
        
        <TabsContent value="zapier">
          <ZapierIntegration agentId={agent._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
