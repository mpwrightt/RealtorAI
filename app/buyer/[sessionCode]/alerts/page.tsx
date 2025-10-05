import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import AlertList from "@/components/buyer/alert-list";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode }
  );
  
  if (!session) {
    redirect('/');
  }
  
  const alerts = await fetchQuery(api.alerts.getAllAlerts, {
    buyerSessionId: session._id,
  });
  
  const unreadCount = alerts.filter((a: any) => !a.notified).length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Property Alerts
          </h1>
          <p className="text-muted-foreground mt-2">
            {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </p>
        </div>
        <Link href={`/buyer/${sessionCode}/saved`}>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Manage Saved Searches
          </Button>
        </Link>
      </div>
      
      {alerts.length > 0 ? (
        <AlertList alerts={alerts} sessionCode={sessionCode} />
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No alerts yet</h2>
            <p className="text-muted-foreground mb-6">
              When new properties match your saved searches, you'll see them here
            </p>
            <Link href={`/buyer/${sessionCode}`}>
              <Button>Search for Properties</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
