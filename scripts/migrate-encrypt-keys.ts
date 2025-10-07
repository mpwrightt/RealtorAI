import { ConvexHttpClient } from "convex/browser";
import type { Id } from "../convex/_generated/dataModel";
import { api } from "../convex/_generated/api";
import { isEncrypted } from "../lib/crypto/encryption";

function getConvexUrl(): string {
  const url = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL must be set to run this script");
  }
  return url;
}

async function migrateAgent(client: ConvexHttpClient, agentId: Id<"agents">) {
  const integrations = await client.query(api.integrations.getRawIntegrations, { agentId });
  const updates: string[] = [];

  if (integrations?.email?.apiKey && !isEncrypted(integrations.email.apiKey)) {
    await client.mutation(api.integrations.connectEmailProvider, {
      agentId,
      provider: integrations.email.provider,
      apiKey: integrations.email.apiKey,
      fromEmail: integrations.email.fromEmail ?? undefined,
    });
    updates.push("email integration encrypted");
  }

  const sms = integrations?.sms;
  if (sms?.provider && sms?.active) {
    switch (sms.provider) {
      case "twilio":
        if (
          sms.accountSid &&
          sms.authToken &&
          !isEncrypted(sms.accountSid) &&
          !isEncrypted(sms.authToken)
        ) {
          await client.mutation(api.integrations.connectTwilio, {
            agentId,
            accountSid: sms.accountSid,
            authToken: sms.authToken,
            phoneNumber: sms.phoneNumber,
          });
          updates.push("twilio credentials encrypted");
        }
        break;
      case "messagebird":
        if (sms.accessKey && !isEncrypted(sms.accessKey)) {
          await client.mutation(api.integrations.connectMessageBird, {
            agentId,
            accessKey: sms.accessKey,
            phoneNumber: sms.phoneNumber,
          });
          updates.push("messagebird credentials encrypted");
        }
        break;
      case "vonage":
        if (sms.apiKey && sms.apiSecret && !isEncrypted(sms.apiKey) && !isEncrypted(sms.apiSecret)) {
          await client.mutation(api.integrations.connectVonage, {
            agentId,
            apiKey: sms.apiKey,
            apiSecret: sms.apiSecret,
            phoneNumber: sms.phoneNumber,
          });
          updates.push("vonage credentials encrypted");
        }
        break;
      case "aws-sns":
        if (
          sms.awsAccessKeyId &&
          sms.awsSecretAccessKey &&
          !isEncrypted(sms.awsAccessKeyId) &&
          !isEncrypted(sms.awsSecretAccessKey)
        ) {
          await client.mutation(api.integrations.connectAwsSns, {
            agentId,
            awsAccessKeyId: sms.awsAccessKeyId,
            awsSecretAccessKey: sms.awsSecretAccessKey,
            awsRegion: sms.awsRegion ?? "us-east-1",
            phoneNumber: sms.phoneNumber,
          });
          updates.push("aws sns credentials encrypted");
        }
        break;
      default:
        break;
    }
  }

  const agent = await client.query(api.agents.getAgentById, { agentId });
  const webhookUrl = agent?.zapierWebhooks?.webhookUrl;
  if (webhookUrl && !isEncrypted(webhookUrl)) {
    await client.mutation(api.zapier.updateZapierConfig, {
      agentId,
      enabled: agent.zapierWebhooks?.enabled ?? true,
      webhookUrl,
      events: agent.zapierWebhooks?.events ?? [],
    });
    updates.push("zapier webhook encrypted");
  }

  if (updates.length > 0) {
    console.log(`✓ Migrated ${agentId}: ${updates.join(", ")}`);
  } else {
    console.log(`- No changes needed for ${agentId}`);
  }
}

async function run() {
  const convexUrl = getConvexUrl();
  const client = new ConvexHttpClient(convexUrl);

  console.log("🔐 Starting credential encryption migration...");

  const agents = await client.query(api.agents.listActiveAgents, {});
  if (!agents || agents.length === 0) {
    console.log("No agents found");
    return;
  }

  for (const agent of agents) {
    await migrateAgent(client, agent._id);
  }

  console.log("✅ Migration complete");
}

run().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
