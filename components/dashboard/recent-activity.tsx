import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Eye, FileText, Heart, MessageSquare } from "lucide-react";

interface RecentActivityProps {
  agentId: string;
}

export default function RecentActivity({ agentId }: RecentActivityProps) {
  // Mock recent activity - in production, fetch from database
  const activities = [
    {
      id: 1,
      type: 'view',
      icon: Eye,
      message: 'New property view on 123 Main St',
      time: '5 minutes ago',
    },
    {
      id: 2,
      type: 'offer',
      icon: FileText,
      message: 'New offer received for $850,000',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'save',
      icon: Heart,
      message: 'Property saved by buyer: John D.',
      time: '2 hours ago',
    },
    {
      id: 4,
      type: 'message',
      icon: MessageSquare,
      message: 'AI chat session started',
      time: '3 hours ago',
    },
    {
      id: 5,
      type: 'view',
      icon: Eye,
      message: 'New property view on 456 Oak Ave',
      time: '4 hours ago',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex gap-3 items-start">
                <div className="mt-0.5 p-2 rounded-full bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
