'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface Deal {
  _id: string;
  type: 'listing' | 'buyer';
  address: string;
  status: 'listed' | 'showing' | 'under-contract' | 'closing';
  dealValue: number;
  expectedCloseDate?: string;
  daysActive: number;
}

interface MyDealsProps {
  deals: Deal[];
}

export default function MyDeals({ deals }: MyDealsProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      'listed': 'bg-blue-500',
      'showing': 'bg-yellow-500',
      'under-contract': 'bg-green-500',
      'closing': 'bg-purple-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };
  
  const getStatusLabel = (status: string) => {
    const labels = {
      'listed': 'Listed',
      'showing': 'Showing',
      'under-contract': 'Under Contract',
      'closing': 'Closing',
    };
    return labels[status as keyof typeof labels] || status;
  };
  
  const calculateCommission = (dealValue: number, rate = 0.03) => {
    return dealValue * rate;
  };
  
  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.dealValue, 0);
  const totalCommission = deals.reduce((sum, deal) => sum + calculateCommission(deal.dealValue), 0);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Deals ({deals.length})
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pipeline Value</p>
            <p className="text-lg font-bold">
              ${totalPipelineValue.toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {deals.length > 0 ? (
          <div className="space-y-3">
            {deals.map((deal) => (
              <div key={deal._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{deal.address}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {deal.type} • {deal.daysActive} days active
                    </p>
                  </div>
                  <Badge className={getStatusColor(deal.status)}>
                    {getStatusLabel(deal.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      Deal Value
                    </div>
                    <div className="font-semibold">
                      ${deal.dealValue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Est. Commission</div>
                    <div className="font-semibold text-green-600">
                      ${calculateCommission(deal.dealValue).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Close Date
                    </div>
                    <div className="font-semibold">
                      {deal.expectedCloseDate || 'TBD'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expected Commission</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalCommission.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No active deals</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
