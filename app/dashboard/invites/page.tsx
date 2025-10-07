import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { InviteLinks } from "@/components/dashboard/invite-links";

const DEFAULT_APP_URL = "http://localhost:3000";

export const metadata = {
  title: "Portal Invites - Agent Dashboard",
  description: "Share buyer and seller portal links with clients.",
};

export default async function InvitesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const agent = await fetchQuery(api.agents.getAgentByUserId, {
    externalId: userId,
  });

  if (!agent) {
    redirect("/dashboard");
  }

  const [buyerSessions, sellerSessions] = await Promise.all([
    fetchQuery(api.buyerSessions.getBuyerSessionsByAgent, { agentId: agent._id }),
    fetchQuery(api.sellerSessions.getSellerSessionsByAgent, { agentId: agent._id }),
  ]);

  const headerList = await headers();
  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  const resolvedOrigin = host ? `${protocol}://${host}` : DEFAULT_APP_URL;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? resolvedOrigin;

  const buyerSummaries = buyerSessions.map((session) => ({
    _id: session._id,
    buyerName: session.buyerName,
    buyerEmail: session.buyerEmail,
    buyerPhone: session.buyerPhone,
    sessionCode: session.sessionCode,
    active: session.active,
  }));

  const sellerSummaries = sellerSessions.map((session) => ({
    _id: session._id,
    sellerName: session.sellerName,
    sellerEmail: session.sellerEmail,
    sellerPhone: session.sellerPhone,
    sessionCode: session.sessionCode,
    active: session.active,
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Portal Invites</h1>
        <p className="text-muted-foreground">
          Copy shareable links for your buyer and seller clients. Each portal is branded with your agent profile settings.
        </p>
      </div>

      <InviteLinks
        appUrl={appUrl}
        buyerSessions={buyerSummaries}
        sellerSessions={sellerSummaries}
      />
    </div>
  );
}
