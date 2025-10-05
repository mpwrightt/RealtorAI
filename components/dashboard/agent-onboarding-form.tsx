'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';

interface AgentOnboardingFormProps {
  userId: string;
  userEmail?: string;
  userName?: string;
}

export default function AgentOnboardingForm({ 
  userId, 
  userEmail,
  userName 
}: AgentOnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    agencyName: '',
    licenseNumber: '',
    email: userEmail || '',
    phone: '',
  });

  const createAgent = useMutation(api.setup.createTestAgent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agencyName || !formData.licenseNumber || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await createAgent({
        externalId: userId,
        agencyName: formData.agencyName,
        email: formData.email,
        licenseNumber: formData.licenseNumber,
        phone: formData.phone || undefined,
      });

      toast.success('Agent profile created successfully! Redirecting...');
      
      // Wait a moment for the data to sync, then refresh
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error(error.message || 'Failed to create agent profile');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Your Agent Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="agencyName">Agency Name *</Label>
            <Input
              id="agencyName"
              placeholder="Premier Real Estate Group"
              value={formData.agencyName}
              onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number *</Label>
            <Input
              id="licenseNumber"
              placeholder="CA-DRE-01234567"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="agent@agency.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Agent Profile'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This will create your agent profile and give you access to the full dashboard
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
