"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Zap, Check, X, Plus, Trash2, ExternalLink, TestTube } from "lucide-react";
import { ZAPIER_EVENT_LABELS } from "@/lib/zapier/webhook";

interface ZapierIntegrationProps {
  agentId: Id<"agents">;
}

export function ZapierIntegration({ agentId }: ZapierIntegrationProps) {
  const config = useQuery(api.zapier.getZapierConfig, { agentId });
  const updateConfig = useMutation(api.zapier.updateZapierConfig);
  const disconnect = useMutation(api.zapier.disconnectZapier);
  const testWebhook = useMutation(api.zapier.testZapierWebhook);
  
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Initialize form with existing config
  useEffect(() => {
    if (config) {
      setSelectedEvents(config.events || []);
    }
  }, [config]);

  const availableEvents = Object.entries(ZAPIER_EVENT_LABELS);

  const handleConnect = async () => {
    if (!webhookUrl) return;
    
    setIsLoading(true);
    try {
      await updateConfig({
        agentId,
        enabled: true,
        webhookUrl,
        events: selectedEvents,
      });
      
      setShowForm(false);
    } catch (error) {
      console.error("Failed to connect Zapier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!webhookUrl && !config?.webhookUrl) return;
    
    setIsTesting(true);
    try {
      const testUrl = webhookUrl || config?.webhookUrl || "";
      await testWebhook({ agentId, webhookUrl: testUrl });
      alert("Test event sent! Check your Zapier dashboard.");
    } catch (error) {
      console.error("Failed to test webhook:", error);
      alert("Failed to send test. Check console for errors.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Zapier?")) return;
    
    setIsLoading(true);
    try {
      await disconnect({ agentId });
    } catch (error) {
      console.error("Failed to disconnect Zapier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEvent = (eventKey: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventKey)
        ? prev.filter(e => e !== eventKey)
        : [...prev, eventKey]
    );
  };

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-orange-500" />
            <div>
              <CardTitle>Zapier Integration</CardTitle>
              <CardDescription>Connect to 7,000+ apps via Zapier</CardDescription>
            </div>
          </div>
          {config.enabled && (
            <Badge variant="default" className="gap-1">
              <Check className="h-3 w-3" /> Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {config.enabled && !showForm ? (
          // Show connected state
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Webhook URL</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {config.webhookUrl}
                </span>
              </div>
              
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Active Events</span>
                  <div className="flex flex-wrap gap-1">
                    {(config.events && config.events.length > 0) ? (
                      config.events.map((event: string) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {ZAPIER_EVENT_LABELS[event] || event}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">All Events</Badge>
                    )}
                  </div>
                </div>
              </div>

              {config.lastTriggered && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last triggered:</span>
                  <span>{new Date(config.lastTriggered).toLocaleString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
              >
                Update Events
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Send Test
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : showForm || !config.enabled ? (
          // Show connection form
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border-blue-200 border p-4 space-y-2">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                How to get your Zapier Webhook URL:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
                <li>Go to <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="underline">Zapier.com</a> and sign in</li>
                <li>Click "Create Zap"</li>
                <li>For trigger, search "Webhooks by Zapier"</li>
                <li>Choose "Catch Hook"</li>
                <li>Copy the webhook URL provided</li>
                <li>Paste it below</li>
              </ol>
              <a 
                href="https://zapier.com/app/editor" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-700 hover:text-blue-900 font-medium"
              >
                Open Zapier Dashboard <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Zapier Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Which events should trigger this webhook?</Label>
              <p className="text-xs text-muted-foreground">
                Leave all unchecked to send ALL events
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded">
                {availableEvents.map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={selectedEvents.includes(key)}
                      onCheckedChange={() => toggleEvent(key)}
                    />
                    <label
                      htmlFor={key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConnect}
                disabled={isLoading || !webhookUrl}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Connect Zapier
                  </>
                )}
              </Button>
              {config.enabled && (
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Show connect button
          <div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Connect Zapier
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Automate workflows with 7,000+ apps like Google Sheets, Slack, HubSpot, and more
            </p>
          </div>
        )}

        {/* Info Box */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-2 text-orange-900 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              What you can do with Zapier:
            </h4>
            <ul className="space-y-1 text-sm text-orange-800">
              <li>✓ Add new leads to Google Sheets or your CRM</li>
              <li>✓ Send Slack notifications when offers come in</li>
              <li>✓ Create calendar events for scheduled tours</li>
              <li>✓ Post new listings to social media automatically</li>
              <li>✓ Send custom emails or SMS via other services</li>
              <li>✓ Connect to Salesforce, HubSpot, Mailchimp, and 7,000+ more apps</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
