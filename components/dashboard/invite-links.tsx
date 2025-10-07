'use client';

import { useState } from 'react';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';

interface BuyerSessionSummary {
  _id: Id<'buyerSessions'>;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  sessionCode: string;
  active: boolean;
}

interface SellerSessionSummary {
  _id: Id<'sellerSessions'>;
  sellerName: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sessionCode: string;
  active: boolean;
}

interface InviteLinksProps {
  appUrl: string;
  buyerSessions: BuyerSessionSummary[];
  sellerSessions: SellerSessionSummary[];
}

function buildUrl(baseUrl: string, path: string) {
  const trimmed = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmed}${path}`;
}

interface SessionRowProps {
  name: string;
  email?: string;
  phone?: string;
  sessionCode: string;
  portalUrl: string;
  active: boolean;
}

function SessionRow({ name, email, phone, sessionCode, portalUrl, active }: SessionRowProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">{name}</h4>
          <div className="text-xs text-muted-foreground space-x-3">
            {email && <span>{email}</span>}
            {phone && <span>{phone}</span>}
          </div>
        </div>
        <Badge variant={active ? 'default' : 'outline'}>{active ? 'Active' : 'Inactive'}</Badge>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Portal Link</Label>
        <div className="flex gap-2">
          <Input readOnly value={portalUrl} className="font-mono text-xs" />
          <Button type="button" variant="outline" size="icon" onClick={copyLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Session Code</Label>
        <Input readOnly value={sessionCode} className="font-mono text-xs" />
      </div>
    </div>
  );
}

export function InviteLinks({ appUrl, buyerSessions, sellerSessions }: InviteLinksProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Buyer Portal Invites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share these links with buyers for instant portal access. Links never expire and require no login.
          </p>
          {buyerSessions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No buyer sessions yet. Create one from the Buyers page to see invites here.
            </div>
          ) : (
            <ScrollArea className="h-[420px] pr-4">
              <div className="space-y-4">
                {buyerSessions.map((session) => (
                  <SessionRow
                    key={session._id}
                    name={session.buyerName}
                    email={session.buyerEmail}
                    phone={session.buyerPhone}
                    sessionCode={session.sessionCode}
                    portalUrl={buildUrl(appUrl, `/buyer/${session.sessionCode}`)}
                    active={session.active}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seller Portal Invites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Provide sellers with a live analytics portal for their listing. Inactive sessions can be reactivated at any time.
          </p>
          {sellerSessions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No seller sessions yet. Create one from the Sellers page to see invites here.
            </div>
          ) : (
            <ScrollArea className="h-[420px] pr-4">
              <div className="space-y-4">
                {sellerSessions.map((session) => (
                  <SessionRow
                    key={session._id}
                    name={session.sellerName}
                    email={session.sellerEmail}
                    phone={session.sellerPhone}
                    sessionCode={session.sessionCode}
                    portalUrl={buildUrl(appUrl, `/seller/${session.sessionCode}`)}
                    active={session.active}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
