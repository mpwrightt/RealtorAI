'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Mail,
  Megaphone,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type RecipientType = 'all' | 'buyers' | 'leads';
type TemplateType = 'new_listing' | 'price_drop' | 'open_house' | 'custom';

interface CampaignRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  type: 'buyer' | 'lead';
}

interface EmailCampaignsProps {
  agentId: Id<'agents'>;
  agentDetails: {
    _id: Id<'agents'>;
    agencyName: string;
    email: string;
    brandingSettings: {
      companyName?: string | null;
      replyEmail?: string | null;
      emailSignature?: string | null;
    } | null;
    integrations: {
      email?: {
        provider: 'resend' | 'sendgrid' | 'mailgun';
        apiKey: string;
        fromEmail?: string | null;
        active: boolean;
      } | null;
    } | null;
  };
}

interface TemplateContent {
  subject: string;
  body: string;
}

const TEMPLATES: Record<TemplateType, string> = {
  new_listing: '🏡 New Listing',
  price_drop: '💰 Price Drop',
  open_house: '🏠 Open House',
  custom: '✏️ Custom',
};

export default function EmailCampaigns({ agentId, agentDetails }: EmailCampaignsProps) {
  const [template, setTemplate] = useState<TemplateType>('new_listing');
  const [recipientType, setRecipientType] = useState<RecipientType>('all');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const listings = useQuery(api.listings.getListingsByAgent, { agentId });
  const leads = useQuery(api.leads.getLeadsByAgent, { agentId });
  const buyerSessions = useQuery(api.buyerSessions.getBuyerSessionsByAgent, { agentId });

  const sendMessage = useMutation(api.messages.sendMessage);
  const { toast } = useToast();

  const signature = useMemo(() => {
    if (agentDetails.brandingSettings?.emailSignature) {
      return agentDetails.brandingSettings.emailSignature;
    }

    const lines = [agentDetails.agencyName];
    if (agentDetails.email) lines.push(agentDetails.email);
    return lines.join('\n');
  }, [agentDetails]);

  const fromName = useMemo(() => {
    return (
      agentDetails.brandingSettings?.companyName || agentDetails.agencyName || 'Your Agent'
    );
  }, [agentDetails]);

  const replyToEmail = useMemo(() => {
    return agentDetails.brandingSettings?.replyEmail || agentDetails.email;
  }, [agentDetails]);

  const emailIntegration = agentDetails.integrations?.email?.active
    ? agentDetails.integrations.email
    : null;

  const selectedListing = useMemo(() => {
    if (!selectedListingId || !listings) return null;
    return listings.find((listing) => listing._id === selectedListingId) || null;
  }, [selectedListingId, listings]);

  const templateContent: TemplateContent = useMemo(() => {
    if (template === 'custom') {
      return {
        subject,
        body: message,
      };
    }

    const listingText = selectedListing
      ? `${selectedListing.address}, ${selectedListing.city}`
      : 'our latest property';

    const priceText = selectedListing
      ? `$${selectedListing.price.toLocaleString()}`
      : 'a great opportunity';

    const baseBody = {
      new_listing: `Hello!\n\nWe're excited to share a new listing: ${listingText}. Priced at ${priceText}.\n\nHighlights:\n• ${selectedListing?.bedrooms ?? 'Spacious'} bedrooms\n• ${selectedListing?.bathrooms ?? 'Well-appointed'} bathrooms\n• Thoughtfully designed living spaces\n\nReply to this email if you'd like more details or to schedule a showing.\n\n${signature}`,
      price_drop: `Great news!\n\nWe've just reduced the price on ${listingText} to ${priceText}.\n\nThis is a perfect moment to take another look. Let us know if you'd like to schedule a tour or request more information.\n\n${signature}`,
      open_house: `You're invited!\n\nWe're hosting an open house for ${listingText}${selectedListing ? '' : ' soon'}.\n\nDrop by to explore the property, ask questions, and picture yourself at home.\n\nReply to RSVP or to request a private tour.\n\n${signature}`,
    } satisfies Record<'new_listing' | 'price_drop' | 'open_house', string>;

    const baseSubject = {
      new_listing: selectedListing
        ? `New Listing: ${selectedListing.address}`
        : 'New Listing Alert',
      price_drop: selectedListing
        ? `Price Drop: ${selectedListing.address}`
        : 'Price Drop on a Featured Listing',
      open_house: selectedListing
        ? `Open House Invitation: ${selectedListing.address}`
        : 'Join Our Upcoming Open House',
    } as const;

    return {
      subject: baseSubject[template],
      body: baseBody[template],
    };
  }, [template, selectedListing, signature, subject, message]);

  useEffect(() => {
    if (template === 'custom') return;

    setSubject(templateContent.subject);
    setMessage(templateContent.body);
  }, [template, templateContent.subject, templateContent.body]);

  const recipients = useMemo(() => {
    const results: CampaignRecipient[] = [];
    const seen = new Set<string>();

    const includeBuyers = recipientType === 'all' || recipientType === 'buyers';
    const includeLeads = recipientType === 'all' || recipientType === 'leads';

    if (includeBuyers && buyerSessions) {
      buyerSessions.forEach((session) => {
        if (!session.buyerEmail || !session.active) return;
        const normalizedEmail = session.buyerEmail.toLowerCase();
        if (seen.has(normalizedEmail)) return;
        seen.add(normalizedEmail);
        results.push({
          id: session._id,
          name: session.buyerName,
          email: session.buyerEmail,
          phone: session.buyerPhone,
          type: 'buyer',
        });
      });
    }

    if (includeLeads && leads) {
      leads.forEach((lead) => {
        if (!lead.email || lead.status === 'closed') return;
        const normalizedEmail = lead.email.toLowerCase();
        if (seen.has(normalizedEmail)) return;
        seen.add(normalizedEmail);
        results.push({
          id: lead._id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          type: 'lead',
        });
      });
    }

    return results;
  }, [recipientType, buyerSessions, leads]);

  const previewSubject = (template === 'custom' ? subject : templateContent.subject).trim();
  const previewBody = (template === 'custom' ? message : templateContent.body).trim();
  const previewTemplateLabel = TEMPLATES[template];

  const handleSend = async () => {
    const trimmedSubject = (template === 'custom' ? subject : templateContent.subject).trim();
    const trimmedBody = (template === 'custom' ? message : templateContent.body).trim();

    if (!trimmedSubject || !trimmedBody) {
      toast({
        title: 'Subject and message are required.',
        description: 'Add a subject and email body before sending the campaign.',
        variant: 'destructive',
      });
      return;
    }

    if (recipients.length === 0) {
      toast({
        title: 'No recipients available.',
        description: 'Add contacts with email addresses to send this campaign.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    const htmlBody = convertTextToHtml(trimmedBody);

    const integrationPayload = emailIntegration
      ? {
          provider: emailIntegration.provider,
          apiKey: emailIntegration.apiKey,
          fromEmail: emailIntegration.fromEmail ?? undefined,
        }
      : undefined;

    const results = {
      success: 0,
      failed: 0,
    };

    for (const recipient of recipients) {
      try {
        const response = await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: recipient.email,
            subject: trimmedSubject,
            html: htmlBody,
            text: trimmedBody,
            replyTo: replyToEmail,
            from: emailIntegration?.fromEmail ?? undefined,
            fromName,
            integration: integrationPayload,
          }),
        });

        if (!response.ok) {
          results.failed += 1;
          const errorDetail = await response.json().catch(() => null);
          console.error('Email send failed:', errorDetail ?? response.statusText);
          continue;
        }

        results.success += 1;

        await sendMessage({
          agentId,
          clientType: recipient.type,
          clientId: recipient.id.toString(),
          clientName: recipient.name,
          clientEmail: recipient.email,
          clientPhone: recipient.phone ?? undefined,
          type: 'email',
          subject: trimmedSubject,
          body: trimmedBody,
        });
      } catch (error) {
        results.failed += 1;
        console.error('Unexpected email send error:', error);
      }
    }

    setIsSending(false);

    if (results.success > 0) {
      toast({
        title: 'Campaign sent',
        description: `Delivered to ${results.success} recipient${
          results.success === 1 ? '' : 's'
        }${results.failed ? ` (${results.failed} failed)` : ''}.`,
      });
    } else {
      toast({
        title: 'Campaign failed to send.',
        description: 'Please verify your email configuration and try again.',
        variant: 'destructive',
      });
    }
  };

  if (!leads || !buyerSessions || !listings) {
    return (
      <Card>
        <CardContent className="py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Campaigns
          </CardTitle>
          <CardDescription>
            Send branded announcements to buyers and leads using your configured provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-3">
            <InfoItem
              icon={<Megaphone className="h-4 w-4" />}
              label="Recipients"
              value={`${recipients.length} contact${recipients.length === 1 ? '' : 's'} selected`}
            />
            <InfoItem
              icon={emailIntegration ? <ShieldCheck className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              label="Provider"
              value={emailIntegration ? emailIntegration.provider.toUpperCase() : 'Platform Default (Resend)'}
              subtle={emailIntegration ? 'Using your connected integration' : 'Uses platform fallback if no integration set'}
            />
            <InfoItem
              icon={<Users className="h-4 w-4" />}
              label="Brand"
              value={fromName}
              subtle={replyToEmail ? `Replies go to ${replyToEmail}` : undefined}
            />
          </div>

          <Separator />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Email Template</Label>
                    <Select
                      value={template}
                      onValueChange={(value) => {
                        const nextTemplate = value as TemplateType;
                        setTemplate(nextTemplate);
                        if (nextTemplate === 'custom') {
                          setSubject('');
                          setMessage('');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TEMPLATES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {template !== 'custom' && (
                    <div>
                      <Label>Related Listing (optional)</Label>
                      <Select
                        value={selectedListingId ?? 'none'}
                        onValueChange={(value) => {
                          if (value === 'none') {
                            setSelectedListingId(null);
                            return;
                          }

                          setSelectedListingId(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select listing..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No listing</SelectItem>
                          {listings.map((listing) => (
                            <SelectItem key={listing._id} value={listing._id}>
                              {listing.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Recipients</Label>
                    <Select value={recipientType} onValueChange={(value) => setRecipientType(value as RecipientType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Contacts with Email</SelectItem>
                        <SelectItem value="buyers">Buyer Portals Only</SelectItem>
                        <SelectItem value="leads">Leads Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Automatically filters out contacts without email addresses or inactive sessions.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={template === 'custom' ? subject : templateContent.subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="Enter subject line"
                      readOnly={template !== 'custom'}
                    />
                    {template !== 'custom' && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Switch to “Custom” to edit the subject line.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={template === 'custom' ? message : templateContent.body}
                      onChange={(event) => setMessage(event.target.value)}
                      className={cn('min-h-[240px]', template !== 'custom' && 'bg-muted')}
                      readOnly={template !== 'custom'}
                      placeholder="Write your message..."
                    />
                    {template !== 'custom' && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Templates include your signature and can’t be edited. Choose “Custom” to write your own message.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Live Preview
                  </Badge>
                  Updates as you tailor the subject, message, recipients, and listing.
                </div>

                <Button onClick={handleSend} disabled={isSending || recipients.length === 0}>
                  {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  {isSending ? 'Sending...' : 'Send Email Campaign'}
                </Button>
              </div>
            </div>

            <EmailPreview
              subject={previewSubject || 'Subject preview will appear here'}
              body={previewBody}
              fromName={fromName}
              replyTo={replyToEmail}
              templateLabel={previewTemplateLabel}
              recipientCount={recipients.length}
              listing={selectedListing}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Enhancements</CardTitle>
          <CardDescription>
            Email campaign analytics and scheduled sends are planned for a future phase.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

interface EmailPreviewListing {
  address?: string;
  city?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
}

interface EmailPreviewProps {
  subject: string;
  body: string;
  fromName: string;
  replyTo?: string | null;
  templateLabel: string;
  recipientCount: number;
  listing: EmailPreviewListing | null;
}

function EmailPreview({ subject, body, fromName, replyTo, templateLabel, recipientCount, listing }: EmailPreviewProps) {
  const paragraphs = body
    ? body.split('\n\n').map((paragraph) => paragraph.split('\n'))
    : [];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,255,0.25),transparent_55%)]" />
      <div className="relative flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{fromName || 'Your Brand'}</p>
              <p className="text-xs text-slate-300">
                {replyTo ? `Replies go to ${replyTo}` : 'Replies use your default email'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            {templateLabel}
          </Badge>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 shadow-inner">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Subject</p>
          <p className="mt-2 text-base font-semibold text-white">{subject || 'Subject preview will appear here'}</p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
            {paragraphs.length ? (
              paragraphs.map((lines, index) => (
                <p key={index}>
                  {lines.map((line, lineIndex) => (
                    <span key={lineIndex}>
                      {line}
                      {lineIndex < lines.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              ))
            ) : (
              <p className="text-slate-400">Start writing your message to see the rendered preview.</p>
            )}
          </div>
        </div>

        {listing ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Featured Listing</p>
            {listing.address ? (
              <p className="mt-2 text-sm font-semibold text-white">{listing.address}</p>
            ) : null}
            {listing.city ? <p className="text-xs text-slate-300">{listing.city}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-200">
              {typeof listing.price === 'number' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-medium text-emerald-200">
                  ${listing.price.toLocaleString()}
                </span>
              ) : null}
              {typeof listing.bedrooms === 'number' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  {listing.bedrooms} bd
                </span>
              ) : null}
              {typeof listing.bathrooms === 'number' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  {listing.bathrooms} ba
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {recipientCount} recipient{recipientCount === 1 ? '' : 's'}
          </span>
          <span>Preview only</span>
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtle?: string;
}

function InfoItem({ icon, label, value, subtle }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="rounded-full bg-background p-1 text-muted-foreground">{icon}</span>
        {label}
      </div>
      <p className="text-sm font-semibold">{value}</p>
      {subtle ? <p className="text-xs text-muted-foreground">{subtle}</p> : null}
    </div>
  );
}

function convertTextToHtml(text: string) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .split('\n\n')
    .map((paragraph) => paragraph.split('\n').join('<br />'))
    .map((block) => `<p>${block}</p>`)
    .join('');
}
