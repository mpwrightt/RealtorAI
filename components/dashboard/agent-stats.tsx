import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Award } from "lucide-react";

interface AgentStatsProps {
  agent: any;
  listings: any[];
  buyerSessions: any[];
}

export default function AgentStats({ agent, listings, buyerSessions }: AgentStatsProps) {
  const activeListings = listings.filter(l => l.status === 'active').length;
  const pendingListings = listings.filter(l => l.status === 'pending').length;
  const soldListings = listings.filter(l => l.status === 'sold').length;
  
  const totalListings = listings.length;
  const soldPercentage = totalListings > 0 ? (soldListings / totalListings) * 100 : 0;
  
  const activeBuyers = buyerSessions.filter(s => s.active).length;
  const engagementRate = buyerSessions.length > 0 
    ? Math.round((activeBuyers / buyerSessions.length) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Listings Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              Listings Status
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <span className="font-medium">{activeListings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">{pendingListings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sold</span>
                <span className="font-medium text-green-600">{soldListings}</span>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4" />
              Success Rate
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{Math.round(soldPercentage)}%</div>
              <Progress value={soldPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {soldListings} of {totalListings} properties sold
              </p>
            </div>
          </div>

          {/* Buyer Engagement */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              Buyer Engagement
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{engagementRate}%</div>
              <Progress value={engagementRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {activeBuyers} active of {buyerSessions.length} total buyers
              </p>
            </div>
          </div>
        </div>

        {/* Agent Info */}
        <div className="pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Agency</div>
              <div className="font-medium">{agent.agencyName}</div>
            </div>
            <div>
              <div className="text-muted-foreground">License</div>
              <div className="font-medium">{agent.licenseNumber}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Invite Code</div>
              <div className="font-medium font-mono">{agent.inviteCode}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium text-green-600">
                {agent.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
