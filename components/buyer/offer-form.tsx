'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { DollarSign, Calendar, FileText, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OfferFormProps {
  listingId: Id<"listings">;
  buyerSessionId: Id<"buyerSessions">;
  sessionCode: string;
  listingPrice: number;
  listingAddress: string;
}

export default function OfferForm({
  listingId,
  buyerSessionId,
  sessionCode,
  listingPrice,
  listingAddress,
}: OfferFormProps) {
  const router = useRouter();
  const createOffer = useMutation(api.offers.createOffer);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    offerAmount: listingPrice,
    earnestMoney: Math.round(listingPrice * 0.01), // 1% default
    downPayment: Math.round(listingPrice * 0.20), // 20% default
    financingType: 'conventional',
    contingencies: [] as string[],
    inspectionPeriod: 10,
    closingDate: '',
    additionalTerms: '',
  });
  
  const contingencyOptions = [
    { id: 'inspection', label: 'Home Inspection' },
    { id: 'financing', label: 'Financing Contingency' },
    { id: 'appraisal', label: 'Appraisal Contingency' },
    { id: 'sale', label: 'Sale of Current Home' },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createOffer({
        listingId,
        buyerSessionId,
        ...formData,
      });
      
      alert('Offer submitted successfully!');
      router.push(`/buyer/${sessionCode}/offers`);
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleContingency = (contingencyId: string) => {
    setFormData(prev => ({
      ...prev,
      contingencies: prev.contingencies.includes(contingencyId)
        ? prev.contingencies.filter(c => c !== contingencyId)
        : [...prev.contingencies, contingencyId],
    }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit an Offer</CardTitle>
          <CardDescription>
            {listingAddress} • List Price: ${listingPrice.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Offer Amount */}
          <div className="space-y-2">
            <Label htmlFor="offerAmount">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Offer Amount *
            </Label>
            <Input
              id="offerAmount"
              type="number"
              required
              value={formData.offerAmount}
              onChange={(e) => setFormData({ ...formData, offerAmount: Number(e.target.value) })}
              min={0}
              step={1000}
            />
            <p className="text-sm text-muted-foreground">
              {formData.offerAmount > listingPrice
                ? `${((formData.offerAmount / listingPrice - 1) * 100).toFixed(1)}% above asking`
                : formData.offerAmount < listingPrice
                ? `${((1 - formData.offerAmount / listingPrice) * 100).toFixed(1)}% below asking`
                : 'At asking price'}
            </p>
          </div>
          
          {/* Earnest Money */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="earnestMoney">Earnest Money Deposit *</Label>
              <Input
                id="earnestMoney"
                type="number"
                required
                value={formData.earnestMoney}
                onChange={(e) => setFormData({ ...formData, earnestMoney: Number(e.target.value) })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                {((formData.earnestMoney / formData.offerAmount) * 100).toFixed(1)}% of offer
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment *</Label>
              <Input
                id="downPayment"
                type="number"
                required
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                {((formData.downPayment / formData.offerAmount) * 100).toFixed(1)}% of offer
              </p>
            </div>
          </div>
          
          {/* Financing Type */}
          <div className="space-y-2">
            <Label htmlFor="financingType">Financing Type *</Label>
            <Select
              value={formData.financingType}
              onValueChange={(value) => setFormData({ ...formData, financingType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="conventional">Conventional</SelectItem>
                <SelectItem value="fha">FHA</SelectItem>
                <SelectItem value="va">VA</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Contingencies */}
          <div className="space-y-3">
            <Label>Contingencies</Label>
            {contingencyOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={formData.contingencies.includes(option.id)}
                  onCheckedChange={() => toggleContingency(option.id)}
                />
                <Label htmlFor={option.id} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          
          {/* Inspection Period */}
          <div className="space-y-2">
            <Label htmlFor="inspectionPeriod">
              <Calendar className="h-4 w-4 inline mr-1" />
              Inspection Period (days)
            </Label>
            <Input
              id="inspectionPeriod"
              type="number"
              value={formData.inspectionPeriod}
              onChange={(e) => setFormData({ ...formData, inspectionPeriod: Number(e.target.value) })}
              min={0}
              max={30}
            />
          </div>
          
          {/* Closing Date */}
          <div className="space-y-2">
            <Label htmlFor="closingDate">Proposed Closing Date</Label>
            <Input
              id="closingDate"
              type="date"
              value={formData.closingDate}
              onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          {/* Additional Terms */}
          <div className="space-y-2">
            <Label htmlFor="additionalTerms">
              <FileText className="h-4 w-4 inline mr-1" />
              Additional Terms
            </Label>
            <Textarea
              id="additionalTerms"
              value={formData.additionalTerms}
              onChange={(e) => setFormData({ ...formData, additionalTerms: e.target.value })}
              placeholder="Any additional terms or conditions..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Card */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-lg">Offer Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Offer Amount:</span>
            <span className="font-semibold">${formData.offerAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Earnest Money:</span>
            <span>${formData.earnestMoney.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Down Payment:</span>
            <span>${formData.downPayment.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Financing:</span>
            <span className="capitalize">{formData.financingType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contingencies:</span>
            <span>{formData.contingencies.length}</span>
          </div>
          <div className="pt-3 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>Loan Amount:</span>
              <span>${(formData.offerAmount - formData.downPayment).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Submit Offer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
