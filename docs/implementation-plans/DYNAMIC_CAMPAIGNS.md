# 🎯 Dynamic Email & SMS Campaigns - Per-Agent Branding

**Each agent can customize their campaign sender information!**

---

## ✅ What's New

Agents can now personalize how their campaigns appear to clients:

### Email Campaigns
- **Custom Company Name** - How your business appears as the sender
- **Custom Reply-To Email** - Where client replies should go
- **Email Signature** - Personalized sign-off for notifications
- **Company Website** - Link in email footers

### SMS Campaigns  
- **Custom Phone Number** - Use your own Twilio number per agent
- Each agent can have their own SMS sender identity

---

## 🚀 How It Works

### For Agents:
1. Go to **Dashboard → Settings**
2. Configure **Campaign Branding Settings**:
   - Company Name (defaults to agency name)
   - Reply-To Email (defaults to your email)
   - SMS Phone Number (your Twilio number)
   - Email Signature
   - Website URL

3. Leave fields empty to use defaults from your profile

### Technical Flow:

**Before (Static):**
```
All emails from: RealtorAI <noreply@yourdomain.com>
All SMS from: +1-555-COMPANY
```

**After (Dynamic):**
```
Agent 1 emails from: Wright Realty <matthew@wrightrealty.com>
Agent 1 SMS from: +1-555-WRIGHT-1

Agent 2 emails from: Sunset Properties <lisa@sunsetprops.com>  
Agent 2 SMS from: +1-555-SUNSET-2
```

---

## 🔧 Implementation Details

### Schema Changes
Added `brandingSettings` to agents table:
```typescript
brandingSettings: {
  companyName?: string,      // For email/SMS sender name
  replyEmail?: string,        // Reply-to address
  smsPhone?: string,          // Twilio phone for SMS
  emailSignature?: string,    // Custom signature
  website?: string            // Company URL
}
```

### Service Updates

**Email Service (`lib/email/send.ts`):**
- Accepts `fromName` parameter
- Uses agent's branding or falls back to env defaults

**Email Notifications (`convex/emailNotifications.ts`):**
- Fetches agent's branding settings
- Passes custom values to email service
- Updates:
  - `sendBuyerWelcomeEmail`
  - `sendSellerWelcomeEmail`
  - `sendNewOfferEmail`

**SMS Campaigns (`convex/smsCampaigns.ts`):**
- Fetches agent's SMS phone from branding settings
- Uses custom phone or env default
- Updates: `sendCampaign` action

### New Components

**Settings Page:** `app/dashboard/settings/page.tsx`
- New settings section in dashboard
- Server-side fetches agent data

**Branding Form:** `components/dashboard/branding-settings.tsx`
- Client component with form inputs
- Calls `updateBrandingSettings` mutation
- Real-time preview of defaults

**New Mutation:** `convex/agents.ts::updateBrandingSettings`
- Updates agent branding settings
- Merges with existing values
- Validates agent exists

---

## 📋 Environment Variables

**Still needed for defaults and API credentials:**

```bash
# Required for email functionality
RESEND_API_KEY=re_your_key_here

# Defaults (overridable per-agent)
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=RealtorAI

# Required for SMS functionality  
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# Default SMS phone (overridable per-agent)
TWILIO_PHONE_NUMBER=+15551234567
```

**Agents customize in UI, not env vars!**

---

## 💡 Use Cases

### Real Estate Team
```
Broker: Century 21 <broker@century21.com> / +1-555-CENTURY
Agent 1: John Smith - Century 21 <john@century21.com> / +1-555-JOHN
Agent 2: Sarah Lee - Century 21 <sarah@century21.com> / +1-555-SARAH
```

### Independent Agents
```
Agent: Wright Realty Group <matt@wrightrealty.com> / +1-555-WRIGHT
```

### Multi-Brand Agency
```
Brand A: Luxury Homes <luxury@agency.com> / +1-555-LUXURY
Brand B: Budget Homes <budget@agency.com> / +1-555-BUDGET
```

---

## 🎨 Benefits

1. **Professional Branding** - Each agent maintains their brand identity
2. **Better Deliverability** - Clients recognize sender names
3. **Higher Response Rates** - Personal touch increases engagement
4. **Compliance** - SMS sent from verified agent numbers
5. **White-Label Ready** - Perfect for agencies with multiple brands
6. **Easy Setup** - UI-based, no code changes needed

---

## 🔒 Fallback Strategy

System gracefully handles missing values:

```typescript
// Email
fromName = agent.brandingSettings?.companyName 
           || agent.agencyName 
           || "RealtorAI"

replyTo = agent.brandingSettings?.replyEmail 
          || agent.email

// SMS  
smsPhone = agent.brandingSettings?.smsPhone 
           || process.env.TWILIO_PHONE_NUMBER
```

**No errors if agents don't configure custom branding!**

---

## 🚀 Future Enhancements

- [ ] Email templates per agent (custom HTML)
- [ ] SMS templates with agent variables
- [ ] Bulk import of agent branding from CSV
- [ ] Preview emails/SMS before sending
- [ ] A/B testing of sender names
- [ ] Analytics per sender identity
- [ ] Team-wide branding presets
- [ ] Twilio sub-account integration

---

## 🧪 Testing

**Without Configuration:**
```bash
# Uses env defaults
EMAIL_FROM_NAME=RealtorAI
TWILIO_PHONE_NUMBER=+15551234567
```

**With Agent Configuration:**
```bash
# Visit: /dashboard/settings
# Fill in custom branding
# Send test campaign
# Verify sender info matches agent settings
```

---

## 📞 Free Email Option

**Resend:** 100 emails/day, 3000/month FREE
- Perfect for small-medium agencies
- No credit card for free tier
- Professional deliverability

**SMS Still Requires Payment:**
- Twilio: ~$0.01/SMS
- No free SMS service exists (carrier costs)
- But each agent can use their own Twilio account!

---

## ✅ Summary

**Before:** Static company-wide sender info  
**After:** Per-agent customizable branding

**Setup Time:** 2 minutes per agent  
**Cost:** $0 extra (uses existing Resend/Twilio)  
**Impact:** More professional, higher engagement

**Go to `/dashboard/settings` to customize your campaigns! 🎉**
