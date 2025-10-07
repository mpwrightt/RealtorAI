# ⚡ Zapier Integration - COMPLETE!

**Connect to 7,000+ apps with one integration!**

---

## 🎯 What Is This?

Zapier integration lets agents automate workflows by connecting RealtorAI to thousands of other apps.

**Instead of building 50 individual integrations, we built ONE that gives access to ALL of these:**
- CRMs (Salesforce, HubSpot, Pipedrive, Zoho)
- Communication (Slack, Microsoft Teams, Discord)
- Spreadsheets (Google Sheets, Airtable, Excel)
- Email (Gmail, Outlook, Mailchimp)
- Calendar (Google Calendar, Outlook Calendar)
- Documents (Google Drive, Dropbox, OneDrive)
- Social Media (Facebook, Instagram, LinkedIn, Twitter)
- And 7,000+ more!

---

## ✅ What Was Built

### Backend:
1. **Schema** - Added `zapierWebhooks` to agents table
2. **Webhook Service** - `lib/zapier/webhook.ts` with send function
3. **Convex Functions** - `convex/zapier.ts` with 4 functions:
   - `getZapierConfig()` - Get agent's config
   - `updateZapierConfig()` - Save webhook URL & events
   - `disconnectZapier()` - Remove integration
   - `triggerZapierWebhook()` - Send event to Zapier
   - `testZapierWebhook()` - Test connection
4. **Event Triggers** - `convex/lib/zapierTriggers.ts` with helper functions

### Frontend:
5. **UI Component** - `components/dashboard/zapier-integration.tsx`:
   - Setup instructions
   - Webhook URL input
   - Event selection checkboxes
   - Test button
   - Connected state display
6. **Settings Page** - Added "Zapier" tab

### Events Supported (15 total):
- ✅ `lead.created` - New lead created
- ✅ `lead.updated` - Lead updated
- ✅ `buyer_session.created` - New buyer session
- ✅ `seller_session.created` - New seller session
- ✅ `tour.requested` - Tour requested
- ✅ `tour.confirmed` - Tour confirmed
- ✅ `tour.completed` - Tour completed
- ✅ `offer.created` - Offer received
- ✅ `offer.accepted` - Offer accepted
- ✅ `offer.rejected` - Offer rejected
- ✅ `listing.created` - New listing created
- ✅ `listing.updated` - Listing updated
- ✅ `message.received` - Message received
- ✅ `sms_campaign.sent` - SMS campaign sent
- ✅ `email_campaign.sent` - Email campaign sent

---

## 🚀 How Agents Use It

### Step 1: Get Zapier Webhook URL

1. Go to [zapier.com](https://zapier.com) and sign in (free account works!)
2. Click "Create Zap"
3. Search for trigger: "Webhooks by Zapier"
4. Choose "Catch Hook"
5. Zapier shows you a webhook URL like:
   ```
   https://hooks.zapier.com/hooks/catch/12345/abcdef/
   ```
6. Copy this URL

### Step 2: Connect in RealtorAI

1. Go to Dashboard → Settings → Zapier tab
2. Paste the webhook URL
3. (Optional) Select specific events to forward
   - Leave all unchecked to send ALL events
4. Click "Connect Zapier"
5. Click "Send Test" to verify connection
6. Check Zapier dashboard for test event

### Step 3: Complete Your Zap in Zapier

1. Go back to Zapier
2. Click "Test Trigger" - should show your test event
3. Add an action (what to do with the data):
   - Add to Google Sheets
   - Send Slack message
   - Create CRM contact
   - Post to social media
   - Send email
   - etc.
4. Turn on your Zap!

**Done!** Now whenever events happen in RealtorAI, they automatically trigger your Zap.

---

## 💡 Example Use Cases

### 1. New Lead → Google Sheets
**When:** New lead created in RealtorAI  
**Then:** Add row to Google Sheet with lead details  
**Why:** Track all leads in one spreadsheet

### 2. Offer Received → Slack Notification
**When:** Offer created on listing  
**Then:** Send message to #deals Slack channel  
**Why:** Team knows immediately about new offers

### 3. Tour Scheduled → Google Calendar
**When:** Tour requested  
**Then:** Create calendar event  
**Why:** Never miss a showing

### 4. New Listing → Facebook Post
**When:** Listing created  
**Then:** Post to Facebook page  
**Why:** Automated social media marketing

### 5. New Buyer → HubSpot Contact
**When:** Buyer session created  
**Then:** Create/update contact in HubSpot  
**Why:** Sync CRM automatically

### 6. Message Received → SMS to Agent
**When:** Message received from client  
**Then:** Send SMS to agent's phone  
**Why:** Instant notifications

---

## 🔄 System Flow

```
Event happens in RealtorAI
(e.g., New lead created)
        │
        ▼
Check agent has Zapier configured
        │
        ▼
Check event is enabled
        │
        ▼
Build webhook payload:
{
  event: "lead.created",
  timestamp: 1234567890,
  agentId: "xxx",
  data: {
    leadId: "xxx",
    name: "John Doe",
    email: "john@example.com",
    ...
  }
}
        │
        ▼
Send POST to Zapier webhook URL
        │
        ▼
Zapier receives event
        │
        ▼
Zapier triggers configured actions:
├─ Add to Google Sheets
├─ Send Slack notification
├─ Create CRM contact
└─ Post to social media
```

---

## 📊 Event Payload Examples

### Lead Created
```json
{
  "event": "lead.created",
  "timestamp": 1703001234567,
  "agentId": "k1234567890",
  "data": {
    "leadId": "j9876543210",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "type": "buyer",
    "status": "new",
    "source": "website",
    "createdAt": 1703001234567
  }
}
```

### Offer Created
```json
{
  "event": "offer.created",
  "timestamp": 1703001234567,
  "agentId": "k1234567890",
  "data": {
    "offerId": "o1234567890",
    "listingId": "l0987654321",
    "propertyAddress": "123 Main St",
    "offerAmount": 450000,
    "earnestMoney": 5000,
    "financingType": "conventional",
    "status": "pending",
    "createdAt": 1703001234567
  }
}
```

### Tour Requested
```json
{
  "event": "tour.requested",
  "timestamp": 1703001234567,
  "agentId": "k1234567890",
  "data": {
    "tourId": "t1234567890",
    "listingId": "l0987654321",
    "propertyAddress": "123 Main St",
    "requestedDate": 1703088000000,
    "timeSlot": "2:00 PM - 3:00 PM",
    "status": "pending",
    "createdAt": 1703001234567
  }
}
```

---

## 🛠️ Technical Implementation

### Schema
```typescript
// agents table
zapierWebhooks: {
  enabled: boolean,
  webhookUrl?: string,
  events?: string[],        // Empty = all events
  lastTriggered?: number
}
```

### Trigger From Mutations
```typescript
// Example: In your lead creation mutation
import { triggerLeadCreated } from "./lib/zapierTriggers";

export const createLead = mutation({
  handler: async (ctx, args) => {
    // Create lead
    const leadId = await ctx.db.insert("leads", { ...args });
    const lead = await ctx.db.get(leadId);
    
    // Trigger Zapier webhook (async, non-blocking)
    await triggerLeadCreated(ctx, args.agentId, lead);
    
    return { leadId };
  },
});
```

### Manual Trigger
```typescript
// Trigger from anywhere
ctx.scheduler.runAfter(0, api.zapier.triggerZapierWebhook, {
  agentId: "xxx",
  event: "custom.event",
  data: { ... },
});
```

---

## 🔒 Security & Privacy

### What's Sent to Zapier:
- ✅ Event type (e.g., "lead.created")
- ✅ Timestamp
- ✅ Agent ID
- ✅ Event-specific data (lead details, offer info, etc.)

### What's NOT Sent:
- ❌ API keys or credentials
- ❌ User passwords
- ❌ Payment information
- ❌ Unnecessary sensitive data

### Agent Control:
- Agents can select which events to forward
- Agents can disconnect anytime
- Events are sent to agent's own Zapier account
- No cross-agent data sharing

---

## 💰 Cost

**Zapier Pricing:**
- **Free:** 100 tasks/month (perfect for testing)
- **Starter:** $19.99/month for 750 tasks
- **Professional:** $49/month for 2,000 tasks
- **Team:** $69/month for 50,000 tasks

**What's a "task"?**
Each event sent from RealtorAI = 1 task

**Example:**
- 10 new leads/month = 10 tasks
- 5 offers received = 5 tasks
- 20 tours scheduled = 20 tasks
- **Total: 35 tasks** = FREE tier

**Most agents stay under 100 tasks/month!**

---

## 🎨 Popular Zap Templates

### For Lead Management:
1. **RealtorAI → Google Sheets**
   - New lead → Add row to sheet
   - Track all leads in one place

2. **RealtorAI → Salesforce**
   - New lead → Create/update contact
   - Sync CRM automatically

3. **RealtorAI → Slack**
   - New lead → Post to #leads channel
   - Team visibility

### For Deal Flow:
1. **RealtorAI → Email**
   - Offer received → Email notification
   - Never miss an offer

2. **RealtorAI → Calendar**
   - Tour scheduled → Create calendar event
   - Auto-schedule

3. **RealtorAI → SMS**
   - Offer created → Send SMS to agent
   - Instant alerts

### For Marketing:
1. **RealtorAI → Facebook**
   - New listing → Post to page
   - Auto social media

2. **RealtorAI → Instagram**
   - New listing → Create post
   - Visual marketing

3. **RealtorAI → Mailchimp**
   - New listing → Send to email list
   - Email campaigns

---

## 🧪 Testing

### Test the Connection:
```bash
1. Go to Settings → Zapier
2. Enter webhook URL
3. Click "Send Test"
4. Check Zapier dashboard
5. Should see test event with:
   {
     "event": "test",
     "message": "Test webhook from RealtorAI",
     "agentId": "xxx"
   }
```

### Test Real Events:
```bash
1. Create a simple Zap: RealtorAI → Email
2. Turn on Zap
3. Create a new lead in RealtorAI
4. Check your email
5. Should receive email with lead details
```

---

## 📋 Troubleshooting

### Webhook Not Firing?
1. Check "Connected" badge shows in Settings
2. Verify webhook URL is correct (starts with https://hooks.zapier.com)
3. Check event is enabled (or leave all unchecked for all events)
4. Look for errors in browser console
5. Check Zapier dashboard for failures

### Events Not Showing in Zapier?
1. Click "Test Trigger" in Zapier
2. Wait 1-2 minutes for events to appear
3. Try "Send Test" button in RealtorAI
4. Check Zapier Task History for errors

### Zap Not Triggering?
1. Make sure Zap is turned ON
2. Check Zapier Task History
3. Verify action is configured correctly
4. Test action manually in Zapier

---

## 🔮 Future Enhancements

### Phase 1 (Next):
- [ ] Add more event types (20+ total)
- [ ] Event filtering (e.g., only high-value leads)
- [ ] Multiple webhooks per agent
- [ ] Webhook retry logic

### Phase 2 (Later):
- [ ] Two-way sync (Zapier → RealtorAI)
- [ ] Custom event builder
- [ ] Webhook analytics dashboard
- [ ] Pre-built Zap templates

### Phase 3 (Advanced):
- [ ] Official Zapier app listing
- [ ] OAuth integration
- [ ] Polling triggers (not just webhooks)
- [ ] Advanced field mapping

---

## ✅ Summary

**What:** Zapier integration via webhooks  
**Access To:** 7,000+ apps  
**Setup Time:** 5 minutes  
**Cost:** Free for most agents (under 100 tasks/month)  
**Events:** 15 trigger types  
**Benefit:** Automate anything!  

**Status: COMPLETE AND READY! ⚡**

---

## 🎯 Quick Start Checklist

- [ ] Agent signs up for Zapier (free)
- [ ] Agent creates new Zap
- [ ] Agent gets webhook URL from Zapier
- [ ] Agent goes to Settings → Zapier in RealtorAI
- [ ] Agent pastes webhook URL
- [ ] Agent clicks "Send Test"
- [ ] Agent verifies test received in Zapier
- [ ] Agent configures action in Zapier
- [ ] Agent turns on Zap
- [ ] ✅ Automation running!

**Now agents can automate ANYTHING! 🚀**

---

*Built: December 2024*  
*Version: 1.0.0*  
*Integration Method: Webhooks*  
*Zapier Plan: Free tier compatible*
