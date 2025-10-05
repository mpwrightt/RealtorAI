'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  sessionId: Id<"buyerSessions">;
}

export default function BuyerNotificationSettings({ sessionId }: NotificationSettingsProps) {
  const session = useQuery(api.buyerSessions.getBuyerSessionById, { sessionId });
  const updatePreferences = useMutation(api.buyerSessions.updateNotificationPreferences);
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(
    session?.notificationPreferences?.emailNotifications ?? true
  );
  const [smsNotifications, setSmsNotifications] = useState(
    session?.notificationPreferences?.smsNotifications ?? false
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences({
        sessionId,
        emailNotifications,
        smsNotifications,
      });
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified about new messages from your agent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications at {session.buyerEmail}
              </p>
            </div>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        {session.buyerPhone && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text messages at {session.buyerPhone}
                </p>
              </div>
            </div>
            <Switch
              id="sms-notifications"
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        )}

        <div className="pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            Save Notification Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
