import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Home, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ActiveSessionsProps {
  buyerSessions: any[];
  sellerSessions: any[];
}

export default function ActiveSessions({ buyerSessions, sellerSessions }: ActiveSessionsProps) {
  const recentBuyers = buyerSessions
    .sort((a, b) => b.lastActive - a.lastActive)
    .slice(0, 5);

  const recentSellers = sellerSessions
    .sort((a, b) => b.lastActive - a.lastActive)
    .slice(0, 3);

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Buyer Sessions */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            Buyer Sessions
            <Badge variant="secondary">{buyerSessions.filter(s => s.active).length}</Badge>
          </h4>
          <div className="space-y-2">
            {recentBuyers.length > 0 ? (
              recentBuyers.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1">
                    <div className="font-medium">{session.buyerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.buyerEmail}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Active {formatRelativeTime(session.lastActive)}
                    </div>
                  </div>
                  <Link href={`/buyer/${session.sessionCode}`} target="_blank">
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No active buyer sessions
              </p>
            )}
          </div>
        </div>

        {/* Seller Sessions */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            Seller Sessions
            <Badge variant="secondary">{sellerSessions.filter(s => s.active).length}</Badge>
          </h4>
          <div className="space-y-2">
            {recentSellers.length > 0 ? (
              recentSellers.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1">
                    <div className="font-medium">{session.sellerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.sellerEmail}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Active {formatRelativeTime(session.lastActive)}
                    </div>
                  </div>
                  <Link href={`/seller/${session.sessionCode}`} target="_blank">
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No active seller sessions
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Link href="/dashboard/buyers">
            <Button variant="outline" className="w-full">
              View All Sessions
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
