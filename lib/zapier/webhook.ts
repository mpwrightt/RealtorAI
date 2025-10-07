// Zapier webhook service - send events to Zapier

export interface ZapierWebhookPayload {
  event: string;
  timestamp: number;
  agentId: string;
  data: any;
}

export async function sendToZapier(
  webhookUrl: string,
  payload: ZapierWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Zapier] Webhook failed:', response.statusText);
      return {
        success: false,
        error: `Webhook failed: ${response.statusText}`,
      };
    }

    console.log('[Zapier] Event sent successfully:', payload.event);
    return { success: true };
  } catch (error: any) {
    console.error('[Zapier] Webhook error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send webhook',
    };
  }
}

// Validate Zapier webhook URL format
export function isValidZapierWebhook(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('zapier.com') || parsed.hostname.includes('hooks.zapier.com');
  } catch {
    return false;
  }
}

// Available event types
export const ZAPIER_EVENTS = {
  // Lead events
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  
  // Session events
  BUYER_SESSION_CREATED: 'buyer_session.created',
  SELLER_SESSION_CREATED: 'seller_session.created',
  
  // Tour events
  TOUR_REQUESTED: 'tour.requested',
  TOUR_CONFIRMED: 'tour.confirmed',
  TOUR_COMPLETED: 'tour.completed',
  
  // Offer events
  OFFER_CREATED: 'offer.created',
  OFFER_ACCEPTED: 'offer.accepted',
  OFFER_REJECTED: 'offer.rejected',
  
  // Listing events
  LISTING_CREATED: 'listing.created',
  LISTING_UPDATED: 'listing.updated',
  
  // Message events
  MESSAGE_RECEIVED: 'message.received',
  
  // Campaign events
  SMS_CAMPAIGN_SENT: 'sms_campaign.sent',
  EMAIL_CAMPAIGN_SENT: 'email_campaign.sent',
} as const;

export type ZapierEventType = typeof ZAPIER_EVENTS[keyof typeof ZAPIER_EVENTS];

// Human-readable event names for UI
export const ZAPIER_EVENT_LABELS: Record<string, string> = {
  'lead.created': 'New Lead Created',
  'lead.updated': 'Lead Updated',
  'buyer_session.created': 'New Buyer Session',
  'seller_session.created': 'New Seller Session',
  'tour.requested': 'Tour Requested',
  'tour.confirmed': 'Tour Confirmed',
  'tour.completed': 'Tour Completed',
  'offer.created': 'Offer Received',
  'offer.accepted': 'Offer Accepted',
  'offer.rejected': 'Offer Rejected',
  'listing.created': 'New Listing Created',
  'listing.updated': 'Listing Updated',
  'message.received': 'Message Received',
  'sms_campaign.sent': 'SMS Campaign Sent',
  'email_campaign.sent': 'Email Campaign Sent',
};
