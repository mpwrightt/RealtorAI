'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Flame,
  Wind,
  Snowflake,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  _id: Id<"leads">;
  name: string;
  phone?: string;
  email?: string;
  status: string;
  type: string;
  source: string;
  priority: string;
  notes?: string;
  followUpDate?: number;
  sessionId?: string;
  createdAt: number;
  updatedAt: number;
}

interface ClientTrackerProps {
  agentId: Id<"agents">;
  leads: Lead[];
  stats: {
    total: number;
    new: number;
    active: number;
    closed: number;
    hot: number;
    warm: number;
    cold: number;
  };
}

export default function ClientTracker({ agentId, leads, stats }: ClientTrackerProps) {
  const [filter, setFilter] = useState<'all' | 'new' | 'active' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  const createLead = useMutation(api.leads.createLead);
  const updateLead = useMutation(api.leads.updateLead);
  const deleteLead = useMutation(api.leads.deleteLead);
  
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'buyer' as 'buyer' | 'seller',
    source: 'website',
    priority: 'warm' as 'hot' | 'warm' | 'cold',
    notes: '',
  });

  const handleAddLead = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a client name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createLead({
        agentId,
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        type: formData.type,
        source: formData.source,
        priority: formData.priority,
        notes: formData.notes || undefined,
      });
      
      toast({
        title: "Lead added",
        description: "New client has been added to your tracker",
      });
      
      setShowAddDialog(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        type: 'buyer',
        source: 'website',
        priority: 'warm',
        notes: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (leadId: Id<"leads">, status: string) => {
    try {
      await updateLead({ leadId, status });
      toast({
        title: "Status updated",
        description: "Lead status has been changed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePriority = async (leadId: Id<"leads">, priority: string) => {
    try {
      await updateLead({ leadId, priority });
      toast({
        title: "Priority updated",
        description: "Lead priority has been changed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async (leadId: Id<"leads">) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await deleteLead({ leadId });
      toast({
        title: "Lead deleted",
        description: "Client has been removed from your tracker",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'hot': return <Flame className="h-4 w-4 text-red-500" />;
      case 'warm': return <Wind className="h-4 w-4 text-orange-500" />;
      case 'cold': return <Snowflake className="h-4 w-4 text-blue-400" />;
      default: return null;
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filter !== 'all' && lead.status !== filter) return false;
    if (priorityFilter !== 'all' && lead.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">New</p>
              <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Closed</p>
              <p className="text-3xl font-bold text-gray-600">{stats.closed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clients & Leads
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                  <DialogDescription>
                    Add a new client or lead to your tracker
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: 'buyer' | 'seller') => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="seller">Seller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="source">Source</Label>
                      <Select 
                        value={formData.source} 
                        onValueChange={(value) => setFormData({ ...formData, source: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="zillow">Zillow</SelectItem>
                          <SelectItem value="realtor.com">Realtor.com</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: 'hot' | 'warm' | 'cold') => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot">🔥 Hot - Ready to buy/sell</SelectItem>
                        <SelectItem value="warm">💨 Warm - Interested</SelectItem>
                        <SelectItem value="cold">❄️ Cold - Just looking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this client..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button onClick={handleAddLead} className="w-full">
                    Add Lead
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads List */}
          <div className="space-y-3">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No leads found</p>
                <p className="text-sm mt-1">Add your first lead to get started</p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <Card key={lead._id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPriorityIcon(lead.priority)}
                          <h3 className="font-semibold">{lead.name}</h3>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {lead.type}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Source: {lead.source}
                          </div>
                        </div>
                        
                        {lead.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {lead.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Select 
                          value={lead.status} 
                          onValueChange={(v) => handleUpdateStatus(lead._id, v)}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
