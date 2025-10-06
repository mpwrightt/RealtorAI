'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  MessageSquare,
  Plus,
  Send,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SMSCampaignsProps {
  agentId: Id<"agents">;
}

export default function SMSCampaigns({ agentId }: SMSCampaignsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    template: 'new_listing' as string,
    message: '',
    recipientType: 'all' as 'all' | 'buyers' | 'leads' | 'custom',
  });
  
  const campaigns = useQuery(api.smsCampaigns.getCampaignsByAgent, { agentId });
  const stats = useQuery(api.smsCampaigns.getCampaignStats, { agentId });
  const listings = useQuery(api.listings.getListingsByAgent, { agentId });
  const leads = useQuery(api.leads.getLeadsByAgent, { agentId });
  const buyerSessions = useQuery(api.buyerSessions.getBuyerSessionsByAgent, { agentId });
  
  const templateMessage = useQuery(api.smsCampaigns.getTemplateMessage, {
    template: formData.template,
    listingId: selectedListing ? (selectedListing as Id<"listings">) : undefined,
  });
  
  const createCampaign = useMutation(api.smsCampaigns.createCampaign);
  const sendCampaign = useAction(api.smsCampaigns.sendCampaign);
  const deleteCampaign = useMutation(api.smsCampaigns.deleteCampaign);
  
  const { toast } = useToast();

  const handleTemplateChange = (template: string) => {
    setFormData({ ...formData, template });
  };

  const handleCreateCampaign = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a campaign name",
        variant: "destructive",
      });
      return;
    }

    const message = formData.template === 'custom' ? formData.message : (templateMessage || '');
    
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    // Build recipients list
    const recipients: any[] = [];
    
    if (formData.recipientType === 'all' || formData.recipientType === 'buyers') {
      buyerSessions?.forEach(session => {
        if (session.buyerPhone && session.active) {
          recipients.push({
            name: session.buyerName,
            phone: session.buyerPhone,
            clientType: 'buyer',
            clientId: session._id,
          });
        }
      });
    }
    
    if (formData.recipientType === 'all' || formData.recipientType === 'leads') {
      leads?.forEach(lead => {
        if (lead.phone && lead.status !== 'closed') {
          recipients.push({
            name: lead.name,
            phone: lead.phone,
            clientType: 'lead',
            clientId: lead._id,
          });
        }
      });
    }

    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "No contacts found with phone numbers",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCampaign({
        agentId,
        name: formData.name,
        template: formData.template,
        message,
        listingId: selectedListing ? (selectedListing as Id<"listings">) : undefined,
        recipients,
      });
      
      toast({
        title: "Campaign created",
        description: `Draft created with ${recipients.length} recipients`,
      });
      
      setShowCreateDialog(false);
      setFormData({
        name: '',
        template: 'new_listing',
        message: '',
        recipientType: 'all',
      });
      setSelectedListing("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  const handleSendCampaign = async (campaignId: Id<"smsCampaigns">) => {
    if (!confirm('Send this SMS campaign now? Recipients will receive the message immediately.')) return;
    
    setSendingCampaignId(campaignId);
    
    try {
      const result = await sendCampaign({ campaignId });
      
      toast({
        title: result.simulated ? "Campaign simulated" : "Campaign sent!",
        description: result.simulated 
          ? `Simulated: ${result.sent} messages (Twilio not configured)`
          : `Sent: ${result.sent}, Delivered: ${result.delivered}, Failed: ${result.failed}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send campaign",
        variant: "destructive",
      });
    } finally {
      setSendingCampaignId(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: Id<"smsCampaigns">) => {
    if (!confirm('Delete this campaign?')) return;
    
    try {
      await deleteCampaign({ campaignId });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'sending': return 'bg-blue-500';
      case 'sent': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'sending': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'sent': return <CheckCircle2 className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (!campaigns || !stats) {
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
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Campaigns</p>
              <p className="text-3xl font-bold">{stats.totalCampaigns}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Messages Sent</p>
              <p className="text-3xl font-bold">{stats.totalSent}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalDelivered}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
              <p className="text-3xl font-bold">{stats.deliveryRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SMS Campaigns</h3>
          <p className="text-sm text-muted-foreground">
            Send bulk SMS to your clients (~$0.01/message)
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create SMS Campaign</DialogTitle>
              <DialogDescription>
                Send a message to your clients about listings or updates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Open House Blast"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select value={formData.template} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_listing">🏡 New Listing</SelectItem>
                      <SelectItem value="price_drop">💰 Price Drop</SelectItem>
                      <SelectItem value="open_house">🏠 Open House</SelectItem>
                      <SelectItem value="custom">✏️ Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.template !== 'custom' && (
                  <div>
                    <Label htmlFor="listing">Property (optional)</Label>
                    <Select value={selectedListing} onValueChange={setSelectedListing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select listing..." />
                      </SelectTrigger>
                      <SelectContent>
                        {listings?.map(listing => (
                          <SelectItem key={listing._id} value={listing._id}>
                            {listing.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="recipientType">Recipients</Label>
                <Select 
                  value={formData.recipientType} 
                  onValueChange={(value: any) => setFormData({ ...formData, recipientType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="buyers">Active Buyers Only</SelectItem>
                    <SelectItem value="leads">Leads Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Only contacts with phone numbers will receive messages
                </p>
              </div>
              
              <div>
                <Label htmlFor="message">Message Preview</Label>
                {formData.template === 'custom' ? (
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Type your custom message here..."
                    className="min-h-[100px]"
                    maxLength={160}
                  />
                ) : (
                  <Textarea
                    id="message"
                    value={templateMessage || ''}
                    readOnly
                    className="min-h-[100px] bg-muted"
                  />
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.template === 'custom' 
                    ? `${formData.message.length}/160 characters`
                    : `${(templateMessage || '').length}/160 characters`
                  }
                </p>
              </div>
              
              <Button onClick={handleCreateCampaign} className="w-full">
                Create Draft Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No campaigns yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first SMS campaign to notify clients
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign._id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold">{campaign.name}</h4>
                      <Badge className={getStatusColor(campaign.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(campaign.status)}
                          {campaign.status}
                        </span>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {campaign.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.recipientCount} recipients</span>
                      </div>
                      {campaign.status === 'sent' && (
                        <>
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{campaign.deliveredCount} delivered</span>
                          </div>
                          {campaign.failedCount > 0 && (
                            <div className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>{campaign.failedCount} failed</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleSendCampaign(campaign._id)}
                        disabled={sendingCampaignId === campaign._id}
                      >
                        {sendingCampaignId === campaign._id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Now
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign._id)}
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
