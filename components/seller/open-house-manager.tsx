'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface OpenHouseManagerProps {
  listingId: Id<"listings">;
  agentId: Id<"agents">;
}

export default function OpenHouseManager({ listingId, agentId }: OpenHouseManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOpenHouse, setSelectedOpenHouse] = useState<any>(null);
  
  const openHouses = useQuery(api.openHouses.getOpenHousesByListing, { listingId });
  const createOpenHouse = useMutation(api.openHouses.createOpenHouse);
  const updateOpenHouse = useMutation(api.openHouses.updateOpenHouse);
  const deleteOpenHouse = useMutation(api.openHouses.deleteOpenHouse);
  
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  const handleCreate = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const startTime = new Date(`${formData.date}T${formData.startTime}`).getTime();
      const endTime = new Date(`${formData.date}T${formData.endTime}`).getTime();
      
      if (endTime <= startTime) {
        toast({
          title: "Invalid time range",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }

      await createOpenHouse({
        listingId,
        agentId,
        startTime,
        endTime,
        notes: formData.notes || undefined,
      });
      
      toast({
        title: "Open house created",
        description: "Your open house has been scheduled",
      });
      
      setShowCreateDialog(false);
      setFormData({ date: '', startTime: '', endTime: '', notes: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create open house",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (openHouseId: Id<"openHouses">) => {
    if (!confirm('Are you sure you want to delete this open house?')) return;
    
    try {
      await deleteOpenHouse({ openHouseId });
      toast({
        title: "Open house deleted",
        description: "The open house has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete open house",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (openHouseId: Id<"openHouses">, status: string) => {
    try {
      await updateOpenHouse({ openHouseId, status });
      toast({
        title: "Status updated",
        description: `Open house marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTotalAttendees = (openHouse: any) => {
    // This would need to be calculated on the backend
    return 0; // Placeholder
  };

  if (!openHouses) {
    return (
      <Card>
        <CardContent className="py-12">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Open Houses</h3>
          <p className="text-sm text-muted-foreground">
            Schedule and manage open house events
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Open House
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Open House</DialogTitle>
              <DialogDescription>
                Create a new open house event for this property
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions or notes..."
                  className="min-h-[80px]"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Open House
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {openHouses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No open houses scheduled</p>
            <p className="text-sm text-muted-foreground mt-1">
              Schedule your first open house to attract buyers
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {openHouses.map((oh) => (
            <Card key={oh._id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getStatusColor(oh.status)}>
                        {oh.status}
                      </Badge>
                      {Date.now() > oh.endTime && oh.status === 'scheduled' && (
                        <Badge variant="outline" className="text-orange-600">Past Due</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(oh.startTime), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(oh.startTime), 'h:mm a')} - {format(new Date(oh.endTime), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    
                    {oh.notes && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {oh.notes}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{getTotalAttendees(oh)} attendees</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {oh.status === 'scheduled' && Date.now() < oh.endTime && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(oh._id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(oh._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
