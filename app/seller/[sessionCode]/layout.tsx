import { verifySellerSession } from "@/lib/buyer-auth";
import { redirect } from "next/navigation";
import SellerNav from "@/components/seller/seller-nav";

export default async function SellerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  const session = await verifySellerSession(sessionCode);
  
  if (!session) {
    redirect("/");
  }
  
  return (
    <div className="min-h-screen bg-background">
      <SellerNav session={session} />
      <main className="container py-6">{children}</main>
    </div>
  );
}
