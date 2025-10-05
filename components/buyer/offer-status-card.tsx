'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';

interface Offer {
  _id: string;
  listingId: string;
  offerAmount: number;
  earnestMoney: number;
  downPayment: number;
  financingType: string;
  contingencies: string[];
  inspectionPeriod?: number;
  closingDate?: string;
  additionalTerms?: string;
  status: string;
  createdAt: number;
  updatedAt: number;
}

interface Listing {
  _id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  images: string[];
}

interface OfferStatusCardProps {
  offer: Offer;
  listing: Listing;
  sessionCode: string;
}

export default function OfferStatusCard({
  offer,
  listing,
  sessionCode,
}: OfferStatusCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'countered':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'withdrawn':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'default',
      accepted: 'default',
      rejected: 'destructive',
      countered: 'secondary',
      withdrawn: 'outline',
    };
    
    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status}
      </Badge>
    );
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon(offer.status)}
            <div>
              <CardTitle className="text-lg">{listing.address}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {listing.city}, {listing.state} {listing.zipCode}
              </p>
            </div>
          </div>
          {getStatusBadge(offer.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Offer Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Your Offer</p>
            <p className="text-lg font-bold">
              <DollarSign className="h-4 w-4 inline" />
              {offer.offerAmount.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">List Price</p>
            <p className="text-lg font-semibold">${listing.price.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Earnest Money</p>
            <p className="font-medium">${offer.earnestMoney.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Down Payment</p>
            <p className="font-medium">${offer.downPayment.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Financing</p>
            <p className="font-medium capitalize">{offer.financingType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contingencies</p>
            <p className="font-medium">{offer.contingencies.length}</p>
          </div>
        </div>
        
        {offer.closingDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Proposed Closing:</span>
            <span className="font-medium">
              {new Date(offer.closingDate).toLocaleDateString()}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          Submitted {formatDate(offer.createdAt)}
          {offer.updatedAt !== offer.createdAt && (
            <span>• Updated {formatDate(offer.updatedAt)}</span>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/buyer/${sessionCode}/properties/${listing._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Property
            </Button>
          </Link>
          {offer.status === 'pending' && (
            <Button variant="outline" size="sm" className="flex-1">
              Withdraw Offer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
