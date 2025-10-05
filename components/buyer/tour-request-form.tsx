'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TourRequestFormProps {
  listingId: Id<"listings">;
  buyerSessionId: Id<"buyerSessions">;
  sessionCode: string;
  listingAddress: string;
}

export default function TourRequestForm({
  listingId,
  buyerSessionId,
  sessionCode,
  listingAddress,
}: TourRequestFormProps) {
  const router = useRouter();
  const requestTour = useMutation(api.tours.requestTour);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    requestedDate: '',
    timeSlot: '',
    notes: '',
  });
  
  const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await requestTour({
        buyerSessionId,
        listingId,
        requestedDate: new Date(formData.requestedDate).getTime(),
        timeSlot: formData.timeSlot,
        notes: formData.notes,
      });
      
      alert('Tour request submitted successfully!');
      router.push(`/buyer/${sessionCode}/tours`);
    } catch (error) {
      console.error('Error requesting tour:', error);
      alert('Failed to request tour. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule a Tour</CardTitle>
          <CardDescription>{listingAddress}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="requestedDate">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Preferred Date *
            </Label>
            <Input
              id="requestedDate"
              type="date"
              required
              value={formData.requestedDate}
              onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
              min={minDate}
            />
            <p className="text-xs text-muted-foreground">
              Select a date at least 24 hours in advance
            </p>
          </div>
          
          {/* Time Slot */}
          <div className="space-y-2">
            <Label htmlFor="timeSlot">
              <Clock className="h-4 w-4 inline mr-1" />
              Preferred Time *
            </Label>
            <Select
              value={formData.timeSlot}
              onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests or Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests or questions for the agent..."
              rows={4}
            />
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Your tour request will be sent to the listing agent. They will contact you to confirm the exact time.
            </p>
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
          disabled={isSubmitting || !formData.requestedDate || !formData.timeSlot}
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Request Tour
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
