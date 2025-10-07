# 🔌 Third-Party Integrations - Bring Your Own Accounts

**Agents can now connect their own email and SMS provider accounts!**

---

## ✅ What's New

Instead of sharing platform-wide credentials, each agent can connect their own:

### Email Providers (Choose One):
- **Resend** - 100 emails/day free
- **SendGrid** - 100 emails/day free  
- **Mailgun** - 100 emails/day trial

### SMS Provider:
- **Twilio** - ~$0.01/SMS, BYOA (Bring Your Own Account)

---

## 🎯 Why This Matters

### For Agents:
✓ **Better Deliverability** - Your verified domain, not shared IPs  
✓ **Your Brand** - Full control over sender identity  
✓ **Higher Limits** - Not constrained by platform quotas  
✓ **Direct Analytics** - See logs in your own dashboard  
✓ **Compliance** - Meet your own legal requirements  
✓ **No Surprises** - You control costs and limits

### For Platform Owners:
✓ **Scalability** - No shared rate limits  
✓ **Cost Management** - Agents pay their own API costs  
✓ **Better Reputation** - No shared IP penalties  
✓ **White-Label Ready** - Each agent fully branded  
✓ **Compliance** - Agents handle their own regulations

---

## 🚀 How It Works

### Setup (2 Minutes Per Agent):

1. **Go to Dashboard → Settings → Integrations Tab**

2. **Connect Email Provider:**
   - Click "Connect Email Provider"
   - Choose: Resend, SendGrid, or Mailgun
   - Paste your API key
   - (Optional) Set custom from-email
   - Click "Connect"

3. **Connect Twilio (Optional):**
   - Click "Connect Twilio"
   - Enter Account SID
   - Enter Auth Token
   - Enter Phone Number
   - Click "Connect"

4. **Done!** All campaigns now use your accounts.

---

## 🔧 Technical Implementation

### Schema Changes

Added `integrations` object to agents table:

```typescript
integrations: {
  email?: {
    provider: 'resend' | 'sendgrid' | 'mailgun',
    apiKey: string,           // Encrypted in production
    fromEmail?: string,
    verified: boolean,
    active: boolean
  },
  sms?: {
    provider: 'twilio',
    accountSid: string,
    authToken: string,         // Encrypted in production
    phoneNumber: string,
    verified: boolean,
    active: boolean
  }
}
```

### Service Updates

**Multi-Provider Email Service** (`lib/email/send.ts`):
```typescript
// Accepts integration parameter
interface SendEmailParams {
  integration?: {
    provider: 'resend' | 'sendgrid' | 'mailgun';
    apiKey: string;
    fromEmail?: string;
  };
  // ... other params
}

// Routes to correct provider
switch (provider) {
  case 'resend': return await sendViaResend(...);
  case 'sendgrid': return await sendViaSendGrid(...);
  case 'mailgun': return await sendViaMailgun(...);
}
```

**SMS Service** (`convex/smsCampaigns.ts`):
```typescript
// Uses agent's Twilio or platform default
const hasAgentTwilio = agent?.integrations?.sms?.active;

const twilioAccountSid = hasAgentTwilio 
  ? agent.integrations.sms.accountSid 
  : process.env.TWILIO_ACCOUNT_SID;
```

**Email Notifications** (`convex/emailNotifications.ts`):
```typescript
// Checks for agent integration
const emailIntegration = agent.integrations?.email?.active ? {
  provider: agent.integrations.email.provider,
  apiKey: agent.integrations.email.apiKey,
  fromEmail: agent.integrations.email.fromEmail,
} : undefined;

// Passes to email service
await sendEmail({
  to: session.buyerEmail,
  integration: emailIntegration,
  // ... other params
});
```

### New Convex Functions

**`convex/integrations.ts`:**
- `getIntegrations()` - Get agent's integrations (masked)
- `connectEmailProvider()` - Connect email account
- `connectTwilio()` - Connect Twilio account
- `disconnectEmailProvider()` - Remove email integration
- `disconnectSmsProvider()` - Remove SMS integration
- `toggleIntegration()` - Enable/disable temporarily
- `getRawIntegrations()` - Internal use for services

### UI Components

**`components/dashboard/integrations-manager.tsx`:**
- Email provider connection form
- Twilio connection form
- Active integrations display
- Disconnect buttons
- Status badges

**`app/dashboard/settings/page.tsx`:**
- Tabs for Branding vs Integrations
- Server-side agent fetch
- Client components for forms

---

## 📋 Provider Setup Guides

### Resend (Recommended - Easiest)

1. Go to [resend.com](https://resend.com)
2. Sign up (free)
3. Verify your domain (or use their test domain)
4. Go to API Keys → Create API Key
5. Copy key (starts with `re_`)
6. Paste in RealtorAI Settings → Integrations

**Free Tier:** 100 emails/day, 3000/month

### SendGrid

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up (free, no credit card)
3. Go to Settings → API Keys → Create API Key
4. Choose "Full Access" or "Mail Send"
5. Copy key (starts with `SG.`)
6. Paste in RealtorAI Settings → Integrations

**Free Tier:** 100 emails/day forever

### Mailgun

1. Go to [mailgun.com](https://mailgun.com)
2. Sign up (3-month trial)
3. Verify your domain
4. Go to Settings → API Keys
5. Copy Private API Key
6. Paste in RealtorAI Settings → Integrations

**Free Tier:** 100 emails/day for 3 months

### Twilio

1. Go to [twilio.com](https://twilio.com)
2. Sign up (trial credit available)
3. Buy a phone number ($1/month)
4. Go to Console → Account Info
5. Copy Account SID and Auth Token
6. Paste in RealtorAI Settings → Integrations
7. Enter your Twilio phone number

**Cost:** ~$0.0079/SMS + $1/month for number

---

## 🔒 Security Considerations

### Current Implementation

⚠️ **API keys stored in plaintext** (for now)

### Production Recommendations

```typescript
// TODO: Encrypt before storing
import { encrypt, decrypt } from '@/lib/crypto';

// When connecting
const encryptedKey = await encrypt(apiKey);
await ctx.db.insert('agents', {
  integrations: {
    email: {
      apiKey: encryptedKey, // Encrypted!
      // ...
    }
  }
});

// When using
const decryptedKey = await decrypt(agent.integrations.email.apiKey);
const result = await sendEmail({ 
  integration: { apiKey: decryptedKey }
});
```

**Use Environment Variables for Encryption:**
```bash
ENCRYPTION_KEY=your-32-char-encryption-key-here
```

**Libraries to Consider:**
- `@aws-crypto/client-node` (AWS KMS)
- `@vercel/kv` with encryption
- `crypto` (Node.js built-in)

---

## 🎨 Use Cases

### Solo Agent
```
Connect own Resend account (free 100/day)
Connect own Twilio number
Full branding control
```

### Small Team (5 agents)
```
Each agent connects own accounts
OR share one platform account
Flexibility for growth
```

### Large Agency (50+ agents)
```
Each agent brings their own Resend/SendGrid
Agency provides shared Twilio (optional)
White-label multiple brands
```

### Multi-Brand Agency
```
Agent 1: Luxury Homes → uses luxury@realty.com (Resend)
Agent 2: Budget Homes → uses budget@realty.com (SendGrid)
Agent 3: Commercial → uses info@commercial.com (Mailgun)
```

---

## 🔄 Fallback Strategy

System always works, even without integrations:

```typescript
// Priority order:
1. Agent's connected integration (if active)
2. Agent's branding settings (if set)
3. Platform environment variables (default)
4. Hardcoded defaults (last resort)
5. Simulation mode (development)
```

**Example Flow:**

```
Email sent from:
├─ Agent's Resend account (if connected)
├─ Platform's Resend account (env var)
└─ Simulation (logs only, dev mode)

SMS sent from:
├─ Agent's Twilio account (if connected)  
├─ Platform's Twilio account (env var)
└─ Simulation (logs only, dev mode)
```

**No errors, always graceful!**

---

## 📊 Analytics & Monitoring

### Agent-Side
Agents see logs in their own dashboards:
- Resend Dashboard → Emails sent
- SendGrid Dashboard → Email analytics
- Twilio Console → SMS logs

### Platform-Side
Track integration usage:
```sql
-- How many agents connected email?
SELECT COUNT(*) FROM agents 
WHERE integrations.email.active = true;

-- Which providers are popular?
SELECT 
  integrations.email.provider, 
  COUNT(*) 
FROM agents 
GROUP BY provider;
```

---

## 🚧 Future Enhancements

- [ ] **Encryption at Rest** - Secure API keys
- [ ] **Verification System** - Test sends before activating
- [ ] **Usage Tracking** - Show emails/SMS sent per agent
- [ ] **Quota Warnings** - Alert when approaching limits
- [ ] **Provider Auto-Detection** - Parse API keys to identify provider
- [ ] **Bulk Import** - CSV upload of agent integrations
- [ ] **Webhook Support** - Delivery status callbacks
- [ ] **More Providers** - Amazon SES, Postmark, etc.
- [ ] **Cost Calculator** - Estimate monthly costs
- [ ] **Team Sharing** - Share integrations within agency

---

## 🧪 Testing

### Without Integrations (Default Behavior)
```bash
# Uses platform environment variables
RESEND_API_KEY=re_platform_key
TWILIO_ACCOUNT_SID=platform_sid
```

### With Agent Integrations
```bash
# Agent A: Uses own Resend
# Agent B: Uses own SendGrid  
# Agent C: Uses platform default
# All work simultaneously!
```

### Test Flow
1. Create agent account
2. Send campaign (uses platform default)
3. Go to Settings → Integrations
4. Connect Resend account
5. Send another campaign (uses agent's Resend)
6. Verify in Resend dashboard
7. Disconnect integration
8. Send campaign (back to platform default)

---

## 💰 Cost Comparison

### Shared Platform Account
```
Platform pays:
- $X/month for Resend Pro (if exceeding free tier)
- $Y/month for Twilio (all agents combined)

Agent pays: $0
Platform bears all costs + risk
```

### Bring Your Own Account
```
Platform pays: $0 for email/SMS APIs
Agent pays:
- $0/month (Resend free tier: 3000 emails)
- ~$10/month (if exceeding free tier)
- ~$1/month + $0.01/SMS (Twilio)

Platform scales without API costs!
```

### Example: 100 Agents
```
Shared:
Platform: $500-1000/month (consolidated billing)
Agents: $0

BYOA:
Platform: $0 (just hosting)
Agents: $0-10/month each (most stay in free tier)
```

**BYOA = Better for scaling startups!**

---

## ✅ Migration Guide

### Existing Platform with Shared Accounts

**Phase 1: Add Integration Support (Non-Breaking)**
```typescript
// Code checks for agent integration first
const apiKey = agent.integrations?.email?.apiKey 
  || process.env.RESEND_API_KEY;  // ← Fallback!
```

**Phase 2: Invite Agents to Connect (Optional)**
```
Send email:
"Connect your own email provider for better deliverability!"
Link to: /dashboard/settings?tab=integrations
```

**Phase 3: Gradually Migrate (Over 6 months)**
```
Month 1-2: Encourage connections
Month 3-4: Offer incentives (free month if connected)
Month 5-6: Require for new agents (optional)
```

**Phase 4: Deprecate Platform Keys (Optional)**
```
After 80%+ adoption:
- Remove platform API keys from env
- Require integrations for new signups
- Grandfather existing agents
```

---

## 🎉 Summary

**Before:** One shared Resend account for all  
**After:** Each agent brings their own

**Setup Time:** 2 minutes per agent  
**Cost:** $0 (free tiers) to $10/month per agent  
**Benefits:** Infinite scalability, better deliverability, full control

**Go to `/dashboard/settings` → **Integrations** tab to connect! 🚀**

---

## 📞 Support

**For Agents:**
- Email provider issues → Check provider dashboard
- SMS issues → Check Twilio console
- Connection problems → Contact platform support

**For Developers:**
- Schema: `convex/schema.ts` (line 37-56)
- Email service: `lib/email/send.ts`
- SMS service: `convex/smsCampaigns.ts`
- UI: `components/dashboard/integrations-manager.tsx`
- Mutations: `convex/integrations.ts`
