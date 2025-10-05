'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Check, ExternalLink, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateSellerSessionFormProps {
  agentId: Id<"agents">;
  listings: any[];
}

export default function CreateSellerSessionForm({ agentId, listings }: CreateSellerSessionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    listingId: '',
  });

  const createSession = useMutation(api.sellerSessions.createSellerSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sellerName || !formData.sellerEmail || !formData.listingId) {
      toast.error('Please fill in seller name, email, and select a listing');
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await createSession({
        agentId,
        listingId: formData.listingId as Id<"listings">,
        sellerName: formData.sellerName,
        sellerEmail: formData.sellerEmail,
        sellerPhone: formData.sellerPhone || undefined,
      });

      setSessionCode(result.sessionCode);
      toast.success('Seller session created successfully!');
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(error.message || 'Failed to create seller session');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/seller/${sessionCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (sessionCode) {
    const portalUrl = `${window.location.origin}/seller/${sessionCode}`;
    const selectedListing = listings.find(l => l._id === formData.listingId);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>✅ Seller Session Created!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Session created for {formData.sellerName}</p>
            <p className="text-xs text-muted-foreground mb-2">
              Property: {selectedListing?.address}, {selectedListing?.city}
            </p>
            <p className="text-xs text-muted-foreground">
              Share this link with your seller - no login required!
            </p>
          </div>

          <div className="space-y-2">
            <Label>Seller Portal URL</Label>
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
            <Button onClick={() => router.push('/dashboard/sellers')} className="flex-1">
              View All Sellers
            </Button>
            <Button 
              onClick={() => {
                setSessionCode('');
                setFormData({
                  sellerName: '',
                  sellerEmail: '',
                  sellerPhone: '',
                  listingId: '',
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

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <Home className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You need to create a property listing before you can create a seller session.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push('/dashboard/listings')}>
              Go to Listings
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
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
          <CardTitle>Seller Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sellerName">Seller Name *</Label>
              <Input
                id="sellerName"
                placeholder="Jane Doe"
                value={formData.sellerName}
                onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellerEmail">Email *</Label>
              <Input
                id="sellerEmail"
                type="email"
                placeholder="jane@example.com"
                value={formData.sellerEmail}
                onChange={(e) => setFormData({ ...formData, sellerEmail: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerPhone">Phone Number (optional)</Label>
            <Input
              id="sellerPhone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.sellerPhone}
              onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="listingId">Select Property *</Label>
            <Select
              value={formData.listingId}
              onValueChange={(value) => setFormData({ ...formData, listingId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a property listing..." />
              </SelectTrigger>
              <SelectContent>
                {listings.map((listing) => (
                  <SelectItem key={listing._id} value={listing._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {listing.address}, {listing.city}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ${listing.price.toLocaleString()} • {listing.bedrooms} bed • {listing.bathrooms} bath
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The seller will see analytics and offers for this property
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Session...
              </>
            ) : (
              'Create Seller Session'
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
