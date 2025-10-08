'use client';

import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface SellerDetailActionsProps {
  portalUrl: string;
  sessionId: string;
}

export default function SellerDetailActions({ portalUrl, sessionId }: SellerDetailActionsProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    toast.success('Portal link copied to clipboard!');
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy Portal Link
      </Button>
      <Link href={portalUrl} target="_blank">
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Portal
        </Button>
      </Link>
      <Button variant="outline" size="sm">
        <Mail className="h-4 w-4 mr-2" />
        Send Report
      </Button>
    </div>
  );
}
