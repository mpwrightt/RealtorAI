"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, MessageSquare, Check, X, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IntegrationsManagerProps {
  agentId: Id<"agents">;
}

export function IntegrationsManager({ agentId }: IntegrationsManagerProps) {
  const integrations = useQuery(api.integrations.getIntegrations, { agentId });
  const connectEmail = useMutation(api.integrations.connectEmailProvider);
  const connectTwilio = useMutation(api.integrations.connectTwilio);
  const connectMessageBird = useMutation(api.integrations.connectMessageBird);
  const connectVonage = useMutation(api.integrations.connectVonage);
  const connectAwsSns = useMutation(api.integrations.connectAwsSns);
  const disconnectEmail = useMutation(api.integrations.disconnectEmailProvider);
  const disconnectSms = useMutation(api.integrations.disconnectSmsProvider);
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showSmsForm, setShowSmsForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Email form state
  const [emailProvider, setEmailProvider] = useState<"resend" | "sendgrid" | "mailgun">("resend");
  const [emailApiKey, setEmailApiKey] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  
  // SMS form state
  const [smsProvider, setSmsProvider] = useState<"twilio" | "messagebird" | "vonage" | "aws-sns">("twilio");
  const [smsPhoneNumber, setSmsPhoneNumber] = useState("");
  // Twilio
  const [smsAccountSid, setSmsAccountSid] = useState("");
  const [smsAuthToken, setSmsAuthToken] = useState("");
  // MessageBird
  const [smsAccessKey, setSmsAccessKey] = useState("");
  // Vonage
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsApiSecret, setSmsApiSecret] = useState("");
  // AWS SNS
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("us-east-1");

  const handleConnectEmail = async () => {
    if (!emailApiKey) return;
    
    setIsLoading(true);
    try {
      await connectEmail({
        agentId,
        provider: emailProvider,
        apiKey: emailApiKey,
        fromEmail: emailFrom || undefined,
      });
      
      // Reset form
      setEmailApiKey("");
      setEmailFrom("");
      setShowEmailForm(false);
    } catch (error) {
      console.error("Failed to connect email provider:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectSms = async () => {
    if (!smsPhoneNumber) return;
    
    setIsLoading(true);
    try {
      switch (smsProvider) {
        case "twilio":
          if (!smsAccountSid || !smsAuthToken) return;
          await connectTwilio({
            agentId,
            accountSid: smsAccountSid,
            authToken: smsAuthToken,
            phoneNumber: smsPhoneNumber,
          });
          break;
        
        case "messagebird":
          if (!smsAccessKey) return;
          await connectMessageBird({
            agentId,
            accessKey: smsAccessKey,
            phoneNumber: smsPhoneNumber,
          });
          break;
        
        case "vonage":
          if (!smsApiKey || !smsApiSecret) return;
          await connectVonage({
            agentId,
            apiKey: smsApiKey,
            apiSecret: smsApiSecret,
            phoneNumber: smsPhoneNumber,
          });
          break;
        
        case "aws-sns":
          if (!awsAccessKeyId || !awsSecretAccessKey) return;
          await connectAwsSns({
            agentId,
            awsAccessKeyId,
            awsSecretAccessKey,
            awsRegion,
            phoneNumber: smsPhoneNumber,
          });
          break;
      }
      
      // Reset form
      setSmsAccountSid("");
      setSmsAuthToken("");
      setSmsAccessKey("");
      setSmsApiKey("");
      setSmsApiSecret("");
      setAwsAccessKeyId("");
      setAwsSecretAccessKey("");
      setSmsPhoneNumber("");
      setShowSmsForm(false);
    } catch (error) {
      console.error("Failed to connect SMS provider:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectEmail = async () => {
    if (!confirm("Are you sure you want to disconnect your email provider?")) return;
    
    setIsLoading(true);
    try {
      await disconnectEmail({ agentId });
    } catch (error) {
      console.error("Failed to disconnect email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectSms = async () => {
    if (!confirm("Are you sure you want to disconnect Twilio?")) return;
    
    setIsLoading(true);
    try {
      await disconnectSms({ agentId });
    } catch (error) {
      console.error("Failed to disconnect SMS:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!integrations) {
    return <div>Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Email Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Email Provider</CardTitle>
                <CardDescription>Connect your own email service</CardDescription>
              </div>
            </div>
            {integrations.email?.active && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" /> Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.email ? (
            // Show connected provider
            <div className="space-y-3">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Provider</span>
                  <Badge variant="outline" className="capitalize">
                    {integrations.email.provider}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">From Email</span>
                  <span className="text-sm text-muted-foreground">
                    {integrations.email.fromEmail || "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Key</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {integrations.email.apiKey}
                  </span>
                </div>
              </div>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnectEmail}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          ) : showEmailForm ? (
            // Show connection form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailProvider">Provider</Label>
                <Select value={emailProvider} onValueChange={(v: any) => setEmailProvider(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resend">Resend (100 free/day)</SelectItem>
                    <SelectItem value="sendgrid">SendGrid (100 free/day)</SelectItem>
                    <SelectItem value="mailgun">Mailgun (100 free/day trial)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailApiKey">API Key</Label>
                <Input
                  id="emailApiKey"
                  type="password"
                  placeholder="re_xxxxx... or SG.xxxxx..."
                  value={emailApiKey}
                  onChange={(e) => setEmailApiKey(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailFrom">From Email (Optional)</Label>
                <Input
                  id="emailFrom"
                  type="email"
                  placeholder="you@yourdomain.com"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleConnectEmail} disabled={isLoading || !emailApiKey}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Connect
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailForm(false)}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Show connect button
            <div>
              <Button onClick={() => setShowEmailForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Connect Email Provider
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Use your own Resend, SendGrid, or Mailgun account instead of the platform default
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>SMS Provider</CardTitle>
                <CardDescription>Connect your own SMS service</CardDescription>
              </div>
            </div>
            {integrations.sms?.active && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" /> Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.sms ? (
            // Show connected SMS provider
            <div className="space-y-3">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Provider</span>
                  <Badge variant="outline" className="capitalize">
                    {integrations.sms.provider}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phone Number</span>
                  <span className="text-sm text-muted-foreground">
                    {integrations.sms.phoneNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Credentials</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {(integrations.sms as any).accountSid || (integrations.sms as any).accessKey || (integrations.sms as any).apiKey || (integrations.sms as any).awsAccessKeyId || "•".repeat(32)}
                  </span>
                </div>
              </div>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnectSms}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          ) : showSmsForm ? (
            // Show connection form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smsProvider">Provider</Label>
                <Select value={smsProvider} onValueChange={(v: any) => setSmsProvider(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio (~$0.01/SMS)</SelectItem>
                    <SelectItem value="messagebird">MessageBird (~$0.015/SMS)</SelectItem>
                    <SelectItem value="vonage">Vonage/Nexmo (~$0.011/SMS)</SelectItem>
                    <SelectItem value="aws-sns">AWS SNS (~$0.006/SMS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Twilio Fields */}
              {smsProvider === "twilio" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="smsAccountSid">Account SID</Label>
                    <Input
                      id="smsAccountSid"
                      placeholder="ACxxxxxxxxxxxxx"
                      value={smsAccountSid}
                      onChange={(e) => setSmsAccountSid(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsAuthToken">Auth Token</Label>
                    <Input
                      id="smsAuthToken"
                      type="password"
                      placeholder="Your Twilio auth token"
                      value={smsAuthToken}
                      onChange={(e) => setSmsAuthToken(e.target.value)}
                    />
                  </div>
                </>
              )}
              
              {/* MessageBird Fields */}
              {smsProvider === "messagebird" && (
                <div className="space-y-2">
                  <Label htmlFor="smsAccessKey">Access Key</Label>
                  <Input
                    id="smsAccessKey"
                    type="password"
                    placeholder="Your MessageBird access key"
                    value={smsAccessKey}
                    onChange={(e) => setSmsAccessKey(e.target.value)}
                  />
                </div>
              )}
              
              {/* Vonage Fields */}
              {smsProvider === "vonage" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="smsApiKey">API Key</Label>
                    <Input
                      id="smsApiKey"
                      placeholder="Your Vonage API key"
                      value={smsApiKey}
                      onChange={(e) => setSmsApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsApiSecret">API Secret</Label>
                    <Input
                      id="smsApiSecret"
                      type="password"
                      placeholder="Your Vonage API secret"
                      value={smsApiSecret}
                      onChange={(e) => setSmsApiSecret(e.target.value)}
                    />
                  </div>
                </>
              )}
              
              {/* AWS SNS Fields */}
              {smsProvider === "aws-sns" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="awsAccessKeyId">AWS Access Key ID</Label>
                    <Input
                      id="awsAccessKeyId"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={awsAccessKeyId}
                      onChange={(e) => setAwsAccessKeyId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awsSecretAccessKey">AWS Secret Access Key</Label>
                    <Input
                      id="awsSecretAccessKey"
                      type="password"
                      placeholder="Your AWS secret access key"
                      value={awsSecretAccessKey}
                      onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awsRegion">AWS Region</Label>
                    <Input
                      id="awsRegion"
                      placeholder="us-east-1"
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                    />
                  </div>
                </>
              )}
              
              {/* Common Phone Number Field */}
              <div className="space-y-2">
                <Label htmlFor="smsPhoneNumber">Phone Number</Label>
                <Input
                  id="smsPhoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={smsPhoneNumber}
                  onChange={(e) => setSmsPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  E.164 format required: +[country code][number]
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleConnectSms}
                  disabled={isLoading || !smsPhoneNumber}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Connect
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSmsForm(false)}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Show connect button
            <div>
              <Button onClick={() => setShowSmsForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Connect SMS Provider
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Choose from Twilio, MessageBird, Vonage, or AWS SNS
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2 text-blue-900">Why Connect Your Own Accounts?</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✓ Better deliverability with verified sender domains</li>
            <li>✓ Your brand identity on all communications</li>
            <li>✓ No shared IP reputation issues</li>
            <li>✓ Higher sending limits on your own accounts</li>
            <li>✓ Direct access to analytics and logs</li>
            <li>✓ Compliance with your own legal requirements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
