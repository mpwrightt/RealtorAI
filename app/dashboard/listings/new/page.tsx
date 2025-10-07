import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { CreateListingForm } from "@/components/dashboard/create-listing-form";

export const metadata = {
  title: "Add Listing - Agent Dashboard",
  description: "Create a new property listing for your clients.",
};

export default async function NewListingPage() {
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

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Add New Listing</h1>
        <p className="text-muted-foreground">
          Provide detailed property information to generate a buyer-ready listing page.
        </p>
      </div>

      <CreateListingForm agentId={agent._id} />
    </div>
  );
}
