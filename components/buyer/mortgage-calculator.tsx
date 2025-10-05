'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface MortgageCalculatorProps {
  listingPrice: number;
}

export default function MortgageCalculator({ listingPrice }: MortgageCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(7.0);
  const [loanTerm, setLoanTerm] = useState(30);
  
  const downPayment = (listingPrice * downPaymentPercent) / 100;
  const principal = listingPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - principal;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
    
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Mortgage Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Home Price */}
        <div>
          <Label className="text-xs text-muted-foreground">Home Price</Label>
          <div className="text-2xl font-bold">{formatCurrency(listingPrice)}</div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Down Payment</Label>
            <span className="text-sm font-medium">{downPaymentPercent}%</span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={(value) => setDownPaymentPercent(value[0])}
            min={5}
            max={50}
            step={5}
          />
          <div className="text-sm text-muted-foreground">
            {formatCurrency(downPayment)}
          </div>
        </div>
        
        {/* Interest Rate */}
        <div className="space-y-2">
          <Label>Interest Rate (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
          />
        </div>
        
        {/* Loan Term */}
        <div className="space-y-2">
          <Label>Loan Term (years)</Label>
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 px-4 rounded border ${loanTerm === 15 ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setLoanTerm(15)}
            >
              15
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded border ${loanTerm === 30 ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setLoanTerm(30)}
            >
              30
            </button>
          </div>
        </div>
        
        {/* Monthly Payment Result */}
        <div className="pt-4 border-t space-y-1">
          <div className="text-sm text-muted-foreground">Estimated Monthly Payment</div>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(monthlyPayment)}/mo
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Principal & Interest</span>
            <span className="font-medium">{formatCurrency(monthlyPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Interest</span>
            <span className="font-medium">{formatCurrency(totalInterest)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Paid</span>
            <span className="font-medium">{formatCurrency(totalPaid + downPayment)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
