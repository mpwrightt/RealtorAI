'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';

interface CreateBuyerSessionFormProps {
  agentId: Id<"agents">;
}

export default function CreateBuyerSessionForm({ agentId }: CreateBuyerSessionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    cities: '',
    propertyTypes: [] as string[],
    mustHaveFeatures: '',
  });

  const createSession = useMutation(api.buyerSessions.createBuyerSession);

  const propertyTypes = ['single-family', 'condo', 'townhouse', 'multi-family'];

  const togglePropertyType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.buyerName || !formData.buyerEmail) {
      toast.error('Please fill in buyer name and email');
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await createSession({
        agentId,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone || undefined,
        preferences: {
          minPrice: formData.minPrice ? Number(formData.minPrice) : undefined,
          maxPrice: formData.maxPrice ? Number(formData.maxPrice) : undefined,
          bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
          propertyTypes: formData.propertyTypes.length > 0 ? formData.propertyTypes : ['single-family'],
          cities: formData.cities ? formData.cities.split(',').map(c => c.trim()) : [],
          mustHaveFeatures: formData.mustHaveFeatures 
            ? formData.mustHaveFeatures.split(',').map(f => f.trim())
            : [],
        },
      });

      setSessionCode(result.sessionCode);
      toast.success('Buyer session created successfully!');
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(error.message || 'Failed to create buyer session');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/buyer/${sessionCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (sessionCode) {
    const portalUrl = `${window.location.origin}/buyer/${sessionCode}`;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>✅ Buyer Session Created!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Session created for {formData.buyerName}</p>
            <p className="text-xs text-muted-foreground">
              Share this link with your buyer - no login required!
            </p>
          </div>

          <div className="space-y-2">
            <Label>Buyer Portal URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={portalUrl}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyLink}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Link href={portalUrl} target="_blank">
                <Button variant="outline" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Session Code</Label>
            <Input
              readOnly
              value={sessionCode}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This code can also be used to access the portal
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/buyers')} className="flex-1">
              View All Buyers
            </Button>
            <Button 
              onClick={() => {
                setSessionCode('');
                setFormData({
                  buyerName: '',
                  buyerEmail: '',
                  buyerPhone: '',
                  minPrice: '',
                  maxPrice: '',
                  bedrooms: '',
                  bathrooms: '',
                  cities: '',
                  propertyTypes: [],
                  mustHaveFeatures: '',
                });
              }} 
              variant="outline"
              className="flex-1"
            >
              Create Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Buyer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerName">Buyer Name *</Label>
              <Input
                id="buyerName"
                placeholder="John Smith"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Email *</Label>
              <Input
                id="buyerEmail"
                type="email"
                placeholder="john@example.com"
                value={formData.buyerEmail}
                onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerPhone">Phone Number (optional)</Label>
            <Input
              id="buyerPhone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.buyerPhone}
              onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Buyer Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="500000"
                value={formData.minPrice}
                onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000000"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Min Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="3"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Min Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                step="0.5"
                placeholder="2"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cities">Preferred Cities (comma-separated)</Label>
            <Input
              id="cities"
              placeholder="San Francisco, Oakland, Berkeley"
              value={formData.cities}
              onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <Label>Property Types</Label>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={formData.propertyTypes.includes(type)}
                    onCheckedChange={() => togglePropertyType(type)}
                  />
                  <label
                    htmlFor={type}
                    className="text-sm font-medium leading-none capitalize cursor-pointer"
                  >
                    {type.replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Must-Have Features (comma-separated)</Label>
            <Input
              id="features"
              placeholder="Parking, Hardwood Floors, Backyard"
              value={formData.mustHaveFeatures}
              onChange={(e) => setFormData({ ...formData, mustHaveFeatures: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Session...
              </>
            ) : (
              'Create Buyer Session'
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
