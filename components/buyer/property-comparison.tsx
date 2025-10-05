'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ComparisonChart from './comparison-chart';
import ComparisonTable from './comparison-table';

interface Listing {
  _id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  yearBuilt?: number;
  lotSize?: number;
  images: string[];
  features?: string[];
}

interface PropertyComparisonProps {
  listings: Listing[];
  sessionCode: string;
  sessionId: string;
}

export default function PropertyComparison({
  listings,
  sessionCode,
  sessionId,
}: PropertyComparisonProps) {
  const [showAIChat, setShowAIChat] = useState(false);
  
  const handleAIAnalysis = () => {
    setShowAIChat(true);
    // TODO: Integrate with AG-UI stream when ready
    // For now, just show placeholder
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const gridCols = listings.length === 2 ? 'grid-cols-2' :
                   listings.length === 3 ? 'grid-cols-3' :
                   'grid-cols-2 lg:grid-cols-4';
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Compare Properties ({listings.length})
        </h1>
        <Link href={`/buyer/${sessionCode}`}>
          <Button variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      {/* Property Cards Row */}
      <div className={`grid gap-4 ${gridCols}`}>
        {listings.map((listing, idx) => (
          <Card key={listing._id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={listing.images?.[0] || '/placeholder.jpg'}
                alt={listing.address}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-semibold">
                Property {idx + 1}
              </div>
            </div>
            <CardContent className="pt-4">
              <p className="font-bold text-lg">
                ${listing.price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {listing.address}
              </p>
              <p className="text-sm text-muted-foreground">
                {listing.city}, {listing.state} {listing.zipCode}
              </p>
              <p className="text-sm mt-2">
                {listing.bedrooms} bd • {listing.bathrooms} ba • {listing.sqft.toLocaleString()} sqft
              </p>
              <Link href={`/buyer/${sessionCode}/properties/${listing._id}`}>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Price Comparison Chart */}
      <ComparisonChart listings={listings} />
      
      {/* Feature Comparison Table */}
      <ComparisonTable listings={listings} />
      
      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showAIChat ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Get AI-powered insights comparing these properties
              </p>
              <Button onClick={handleAIAnalysis}>
                Get AI Comparison
              </Button>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="text-sm text-muted-foreground">
                AI comparison analysis will be integrated with your AI assistant...
              </p>
              <Link href={`/buyer/${sessionCode}`}>
                <Button variant="outline" className="mt-4">
                  Go to AI Chat
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Download className="h-4 w-4 mr-2" />
          Export Comparison
        </Button>
        <Link href={`/buyer/${sessionCode}`}>
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
