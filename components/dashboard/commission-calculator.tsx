'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function CommissionCalculator() {
  const [salePrice, setSalePrice] = useState(450000);
  const [commissionRate, setCommissionRate] = useState(6);
  const [splitPercent, setSplitPercent] = useState(50);
  const [brokerageSplit, setBrokerageSplit] = useState(70); // Agent gets 70%, brokerage gets 30%

  const totalCommission = salePrice * (commissionRate / 100);
  const yourSideCommission = totalCommission * (splitPercent / 100);
  const yourGrossCommission = yourSideCommission * (brokerageSplit / 100);
  const brokerageFee = yourSideCommission - yourGrossCommission;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const resetToDefaults = () => {
    setSalePrice(450000);
    setCommissionRate(6);
    setSplitPercent(50);
    setBrokerageSplit(70);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Commission Calculator
        </CardTitle>
        <CardDescription>
          Calculate your potential earnings on deals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sale Price */}
        <div className="space-y-2">
          <Label htmlFor="salePrice">Sale Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="salePrice"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
              className="pl-9"
              step="10000"
            />
          </div>
        </div>

        {/* Commission Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="commissionRate">Total Commission Rate</Label>
            <span className="text-sm font-medium">{commissionRate}%</span>
          </div>
          <Slider
            id="commissionRate"
            value={[commissionRate]}
            onValueChange={(value) => setCommissionRate(value[0])}
            min={3}
            max={10}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Total: {formatCurrency(totalCommission)}
          </p>
        </div>

        {/* Commission Split */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="splitPercent">Your Side of Split</Label>
            <span className="text-sm font-medium">{splitPercent}%</span>
          </div>
          <Slider
            id="splitPercent"
            value={[splitPercent]}
            onValueChange={(value) => setSplitPercent(value[0])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Your side: {formatCurrency(yourSideCommission)}
          </p>
        </div>

        {/* Brokerage Split */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="brokerageSplit">Your Brokerage Split</Label>
            <span className="text-sm font-medium">{brokerageSplit}%</span>
          </div>
          <Slider
            id="brokerageSplit"
            value={[brokerageSplit]}
            onValueChange={(value) => setBrokerageSplit(value[0])}
            min={50}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Results */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Brokerage Fee</span>
            <span className="text-sm font-medium">{formatCurrency(brokerageFee)}</span>
          </div>
          
          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Your Net Commission
            </span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(yourGrossCommission)}
            </span>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-semibold mb-3">Calculation Breakdown:</h4>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sale Price:</span>
            <span>{formatCurrency(salePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Commission ({commissionRate}%):</span>
            <span>{formatCurrency(totalCommission)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Side ({splitPercent}%):</span>
            <span>{formatCurrency(yourSideCommission)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Split ({brokerageSplit}%):</span>
            <span className="font-semibold">{formatCurrency(yourGrossCommission)}</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetToDefaults}
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  );
}
