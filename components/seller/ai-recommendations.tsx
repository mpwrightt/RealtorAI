'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface AIRecommendationsProps {
  listing: {
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    address: string;
    city: string;
  };
  analytics: {
    views: { total: number; unique: number };
    offers: { total: number; highest: number; average: number };
    daysOnMarket: number;
  };
}

export default function AIRecommendations({ listing, analytics }: AIRecommendationsProps) {
  // Simple AI logic (can be enhanced with real AI later)
  const pricePerSqft = listing.price / listing.sqft;
  const avgPricePerSqft = 200; // Could fetch from API
  const pricingDiff = ((pricePerSqft - avgPricePerSqft) / avgPricePerSqft) * 100;
  
  const viewsPerDay = analytics.daysOnMarket > 0 ? analytics.views.total / analytics.daysOnMarket : 0;
  const offersPerView = analytics.views.total > 0 ? (analytics.offers.total / analytics.views.total) * 100 : 0;
  
  // Determine status and recommendation
  let status: 'hot' | 'warm' | 'cold' = 'warm';
  let recommendation = '';
  let actionable = '';
  let icon = <CheckCircle className="h-5 w-5 text-green-600" />;
  
  if (analytics.daysOnMarket < 14 && analytics.offers.total > 0) {
    status = 'hot';
    recommendation = 'Your listing is performing excellently!';
    actionable = 'Consider accepting the best offer soon to capitalize on interest.';
    icon = <TrendingUp className="h-5 w-5 text-green-600" />;
  } else if (analytics.daysOnMarket > 30 && analytics.offers.total === 0) {
    status = 'cold';
    if (pricingDiff > 10) {
      recommendation = 'Your home is priced above market average';
      actionable = `Consider reducing price by $${Math.round(listing.price * 0.05).toLocaleString()} (5%) to attract more buyers.`;
    } else if (viewsPerDay < 2) {
      recommendation = 'Your listing is getting low visibility';
      actionable = 'Consider updating photos, improving description, or hosting an open house.';
    } else {
      recommendation = 'Good traffic but no offers yet';
      actionable = 'Price may be slightly high. Consider a small reduction of 3-5%.';
    }
    icon = <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  } else if (analytics.offers.total > 0 && analytics.offers.highest < listing.price * 0.95) {
    status = 'warm';
    recommendation = 'Offers are coming in below asking price';
    actionable = `Current best offer: $${analytics.offers.highest.toLocaleString()}. Consider if this reflects market value.`;
    icon = <TrendingDown className="h-5 w-5 text-yellow-600" />;
  } else {
    status = 'warm';
    recommendation = 'Your listing is performing as expected';
    actionable = 'Continue monitoring interest. Market conditions are normal.';
    icon = <CheckCircle className="h-5 w-5 text-blue-600" />;
  }
  
  const getStatusBadge = () => {
    const colors = {
      hot: 'bg-green-500',
      warm: 'bg-yellow-500',
      cold: 'bg-red-500',
    };
    
    return (
      <Badge className={`${colors[status]} text-white capitalize`}>
        {status} Market
      </Badge>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Market Analysis
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Recommendation */}
        <div className="flex items-start gap-3">
          {icon}
          <div className="flex-1">
            <p className="font-semibold">{recommendation}</p>
            <p className="text-sm text-muted-foreground mt-1">{actionable}</p>
          </div>
        </div>
        
        {/* Key Insights */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Price vs Market</p>
            <p className="text-lg font-semibold">
              {pricingDiff > 0 ? '+' : ''}{pricingDiff.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Views per Day</p>
            <p className="text-lg font-semibold">{viewsPerDay.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
            <p className="text-lg font-semibold">{offersPerView.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Days on Market</p>
            <p className="text-lg font-semibold">{analytics.daysOnMarket}</p>
          </div>
        </div>
        
        {/* Comparison */}
        <div className="bg-muted p-4 rounded-lg text-sm">
          <p className="font-medium mb-2">Market Comparison:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Your price/sqft: ${pricePerSqft.toFixed(0)}</li>
            <li>• Market avg: ${avgPricePerSqft}</li>
            <li>• Similar homes sell in: 28-35 days</li>
          </ul>
        </div>
        
        {status === 'cold' && (
          <Button className="w-full" variant="outline">
            Schedule Price Strategy Call
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
