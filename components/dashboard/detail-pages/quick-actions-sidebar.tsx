'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Mail, Ban, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsSidebarProps {
  type: "buyer" | "seller";
  portalUrl: string;
  sessionId: string;
  email: string;
  onDeactivate?: () => void;
}

export default function QuickActionsSidebar({
  type,
  portalUrl,
  sessionId,
  email,
  onDeactivate,
}: QuickActionsSidebarProps) {
  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalUrl);
    toast.success('Portal link copied to clipboard!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start" onClick={copyPortalLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Portal Link
        </Button>
        
        <Button variant="outline" className="w-full justify-start" asChild>
          <a href={portalUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Portal
          </a>
        </Button>

        <Button variant="outline" className="w-full justify-start">
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>

        {type === "buyer" && (
          <>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="h-4 w-4 mr-2" />
              Edit Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Showing
            </Button>
          </>
        )}

        {type === "seller" && (
          <Button variant="outline" className="w-full justify-start">
            <Edit className="h-4 w-4 mr-2" />
            Edit Listing
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full justify-start text-destructive"
          onClick={onDeactivate}
        >
          <Ban className="h-4 w-4 mr-2" />
          Deactivate Session
        </Button>
      </CardContent>
    </Card>
  );
}
