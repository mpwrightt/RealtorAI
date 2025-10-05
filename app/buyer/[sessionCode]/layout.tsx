import { verifyBuyerSession } from "@/lib/buyer-auth";
import { redirect } from "next/navigation";
import BuyerNav from "@/components/buyer/buyer-nav";

export default async function BuyerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  const session = await verifyBuyerSession(sessionCode);
  
  if (!session) {
    redirect("/");
  }
  
  return (
    <div className="min-h-screen bg-background">
      <BuyerNav session={session} />
      <main className="container py-6">{children}</main>
    </div>
  );
}
