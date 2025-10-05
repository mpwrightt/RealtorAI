import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Image as ImageIcon, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VisitorInsightsProps {
  analytics: {
    views: {
      total: number;
      unique: number;
      avgDuration: number;
    };
  };
}

export default function VisitorInsights({ analytics }: VisitorInsightsProps) {
  // Mock data for sections - in production, this would come from telemetry
  const topSections = [
    { name: 'Photos', views: Math.floor(analytics.views.total * 0.95), percentage: 95 },
    { name: 'Property Details', views: Math.floor(analytics.views.total * 0.78), percentage: 78 },
    { name: 'Neighborhood', views: Math.floor(analytics.views.total * 0.62), percentage: 62 },
    { name: 'School Information', views: Math.floor(analytics.views.total * 0.45), percentage: 45 },
  ];

  const engagementRate = analytics.views.unique > 0 
    ? Math.round((analytics.views.avgDuration / 300) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Visitor Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Engagement Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Engagement Score</span>
            <span className="text-sm font-bold">{Math.min(engagementRate, 100)}%</span>
          </div>
          <Progress value={Math.min(engagementRate, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Based on average time spent and interactions
          </p>
        </div>

        {/* Most Viewed Sections */}
        <div>
          <div className="text-sm font-medium mb-3">Most Viewed Sections</div>
          <div className="space-y-3">
            {topSections.map((section) => (
              <div key={section.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{section.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {section.views} ({section.percentage}%)
                  </span>
                </div>
                <Progress value={section.percentage} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              <span className="text-xs">Photo Engagement</span>
            </div>
            <div className="text-lg font-bold">87%</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Play className="h-3 w-3" />
              <span className="text-xs">Video Views</span>
            </div>
            <div className="text-lg font-bold">42%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
