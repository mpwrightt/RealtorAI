'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, AlertCircle, ThumbsUp } from "lucide-react";

interface AIInsightsCardProps {
  buyerName: string;
  viewHistory: any[];
  offers: any[];
  preferences: any;
}

export default function AIInsightsCard({
  buyerName,
  viewHistory,
  offers,
  preferences,
}: AIInsightsCardProps) {
  // Generate insights based on behavior
  const insights = [];

  // Property type preference
  if (viewHistory.length > 0) {
    const propertyTypes = viewHistory.map((v) => v.listing.propertyType);
    const mostCommon = propertyTypes.sort(
      (a, b) =>
        propertyTypes.filter((v) => v === a).length -
        propertyTypes.filter((v) => v === b).length
    ).pop();
    insights.push({
      type: "behavior",
      icon: ThumbsUp,
      text: `Highly interested in ${mostCommon} properties`,
      color: "text-blue-500",
    });
  }

  // Price sensitivity
  if (preferences.maxPrice && viewHistory.length > 3) {
    const avgViewed = viewHistory.reduce((sum, v) => sum + v.listing.price, 0) / viewHistory.length;
    const budgetAdherence = (avgViewed / preferences.maxPrice) * 100;
    
    if (budgetAdherence < 80) {
      insights.push({
        type: "price",
        icon: TrendingUp,
        text: `Budget-conscious - views properties below max budget`,
        color: "text-green-500",
      });
    } else if (budgetAdherence > 95) {
      insights.push({
        type: "price",
        icon: AlertCircle,
        text: `May need higher budget - viewing at price ceiling`,
        color: "text-yellow-500",
      });
    }
  }

  // Engagement level
  const highEngagement = viewHistory.filter((v) => v.engagementScore > 70).length;
  if (highEngagement > 0) {
    insights.push({
      type: "engagement",
      icon: Sparkles,
      text: `${highEngagement} properties with high engagement - ready to make offers`,
      color: "text-purple-500",
    });
  }

  // Offer likelihood
  if (viewHistory.length > 5 && offers.length === 0) {
    insights.push({
      type: "action",
      icon: AlertCircle,
      text: `High activity but no offers yet - may need encouragement`,
      color: "text-orange-500",
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <insight.icon className={`h-5 w-5 ${insight.color} mt-0.5`} />
              <p className="text-sm">{insight.text}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Not enough activity to generate insights yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
