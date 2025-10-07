"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Mail, MessageSquare, Globe } from "lucide-react";

interface BrandingSettingsProps {
  agentId: Id<"agents">;
}

export function BrandingSettings({ agentId }: BrandingSettingsProps) {
  const agent = useQuery(api.agents.getAgentById, { agentId });
  const updateBranding = useMutation(api.agents.updateBrandingSettings);
  
  const [companyName, setCompanyName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [emailSignature, setEmailSignature] = useState("");
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form with agent data
  useState(() => {
    if (agent?.brandingSettings) {
      setCompanyName(agent.brandingSettings.companyName || "");
      setReplyEmail(agent.brandingSettings.replyEmail || "");
      setSmsPhone(agent.brandingSettings.smsPhone || "");
      setEmailSignature(agent.brandingSettings.emailSignature || "");
      setWebsite(agent.brandingSettings.website || "");
    }
  });

  const handleSave = async () => {
    setIsLoading(true);
    setSaveSuccess(false);
    
    try {
      await updateBranding({
        agentId,
        companyName: companyName || undefined,
        replyEmail: replyEmail || undefined,
        smsPhone: smsPhone || undefined,
        emailSignature: emailSignature || undefined,
        website: website || undefined,
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update branding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!agent) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Branding Settings</CardTitle>
        <CardDescription>
          Customize how your company name and contact info appear in emails and SMS campaigns.
          Leave fields empty to use defaults from your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            placeholder={agent.agencyName}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Used as the sender name in emails. Default: {agent.agencyName}
          </p>
        </div>

        {/* Reply Email */}
        <div className="space-y-2">
          <Label htmlFor="replyEmail" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Reply-To Email
          </Label>
          <Input
            id="replyEmail"
            type="email"
            placeholder={agent.email}
            value={replyEmail}
            onChange={(e) => setReplyEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Email address where replies go. Default: {agent.email}
          </p>
        </div>

        {/* SMS Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="smsPhone" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS Sender Phone (Twilio)
          </Label>
          <Input
            id="smsPhone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={smsPhone}
            onChange={(e) => setSmsPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your Twilio phone number for SMS campaigns. Must be configured in Twilio first.
          </p>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Company Website
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://yourwebsite.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your company website (for email footers)
          </p>
        </div>

        {/* Email Signature */}
        <div className="space-y-2">
          <Label htmlFor="emailSignature">Email Signature</Label>
          <Textarea
            id="emailSignature"
            placeholder={`Best regards,\n${agent.agencyName}\n${agent.phone || ""}\n${agent.email}`}
            value={emailSignature}
            onChange={(e) => setEmailSignature(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Custom signature for email notifications
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
          {saveSuccess && (
            <span className="text-sm text-green-600">Settings saved successfully!</span>
          )}
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-muted p-4 text-sm">
          <h4 className="font-semibold mb-2">How This Works:</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Emails will show: <strong>{companyName || agent.agencyName}</strong></li>
            <li>• Replies go to: <strong>{replyEmail || agent.email}</strong></li>
            <li>• SMS sent from: <strong>{smsPhone || "Default Twilio number"}</strong></li>
            <li>• Leave blank to use your profile defaults</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
