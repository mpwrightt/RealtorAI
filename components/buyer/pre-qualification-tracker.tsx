'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { 
  DollarSign, 
  Calendar, 
  Building2, 
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PreQualificationTrackerProps {
  sessionId: Id<"buyerSessions">;
  preQualification?: {
    amount: number;
    lender: string;
    expirationDate: number;
    verified: boolean;
  };
}

export default function PreQualificationTracker({ sessionId, preQualification }: PreQualificationTrackerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const updatePreQualification = useMutation(api.buyerSessions.updatePreQualification);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    amount: preQualification?.amount || 0,
    lender: preQualification?.lender || '',
    expirationDate: preQualification?.expirationDate 
      ? new Date(preQualification.expirationDate).toISOString().split('T')[0]
      : '',
    verified: preQualification?.verified || false,
  });

  const handleSave = async () => {
    if (!formData.amount || !formData.lender || !formData.expirationDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePreQualification({
        sessionId,
        amount: formData.amount,
        lender: formData.lender,
        expirationDate: new Date(formData.expirationDate).getTime(),
        verified: formData.verified,
      });
      
      toast({
        title: "Pre-qualification saved",
        description: "Your pre-qualification information has been updated",
      });
      
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pre-qualification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpiringSoon = (expirationDate: number) => {
    const daysUntilExpiration = Math.floor((expirationDate - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30 && daysUntilExpiration >= 0;
  };

  const isExpired = (expirationDate: number) => {
    return expirationDate < Date.now();
  };

  if (!preQualification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pre-Qualification
          </CardTitle>
          <CardDescription>
            Add your pre-qualification letter to strengthen your offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No pre-qualification on file
            </p>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pre-Qualification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Pre-Qualification</DialogTitle>
                  <DialogDescription>
                    Enter your mortgage pre-qualification details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="amount">Pre-Qualified Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                        className="pl-9"
                        placeholder="500000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="lender">Lender Name</Label>
                    <Input
                      id="lender"
                      value={formData.lender}
                      onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                      placeholder="Chase Bank"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="verified" className="cursor-pointer">
                      Agent has verified this pre-qualification
                    </Label>
                  </div>
                  
                  <Button onClick={handleSave} className="w-full">
                    Save Pre-Qualification
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  const expired = isExpired(preQualification.expirationDate);
  const expiringSoon = isExpiringSoon(preQualification.expirationDate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pre-Qualification
          </CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Pre-Qualification</DialogTitle>
                <DialogDescription>
                  Update your mortgage pre-qualification details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="amount">Pre-Qualified Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="lender">Lender Name</Label>
                  <Input
                    id="lender"
                    value={formData.lender}
                    onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="verified" className="cursor-pointer">
                    Agent has verified this pre-qualification
                  </Label>
                </div>
                
                <Button onClick={handleSave} className="w-full">
                  Update Pre-Qualification
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pre-Qualified Amount</span>
            <span className="text-xl font-bold">{formatCurrency(preQualification.amount)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Lender
            </span>
            <span className="font-medium">{preQualification.lender}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expires
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatDate(preQualification.expirationDate)}</span>
              {expired && (
                <Badge variant="destructive">Expired</Badge>
              )}
              {!expired && expiringSoon && (
                <Badge variant="outline" className="text-yellow-600">
                  Expires Soon
                </Badge>
              )}
            </div>
          </div>
          
          {preQualification.verified && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Verified by agent</span>
            </div>
          )}
        </div>
        
        {(expired || expiringSoon) && (
          <div className="bg-muted rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">
              {expired 
                ? "⚠️ Your pre-qualification has expired. Contact your lender to renew."
                : "📅 Your pre-qualification expires soon. Consider renewing to keep your offers strong."
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
