# 🚀 Quick Start: Connect Your Email & SMS

**2-minute setup for agents**

---

## Step 1: Get Free Email Account

Choose one (all have free tiers):

### Option A: Resend (Easiest)
1. Go to **[resend.com/signup](https://resend.com/signup)**
2. Sign up (no credit card needed)
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with `re_`)
5. **Done!** (Use their test domain or verify your own)

### Option B: SendGrid
1. Go to **[sendgrid.com/pricing](https://sendgrid.com/pricing)** → Free plan
2. Sign up (no credit card)
3. Settings → API Keys → Create API Key
4. Select "Full Access"
5. Copy key (starts with `SG.`)

### Option C: Mailgun  
1. Go to **[mailgun.com/pricing](https://mailgun.com/pricing)** → Free trial
2. Sign up
3. Verify your domain
4. Settings → API Keys → Copy private key

---

## Step 2: Connect in RealtorAI

1. Log into your RealtorAI dashboard
2. Go to **Settings** (top right menu)
3. Click **"Integrations"** tab
4. Under "Email Provider":
   - Click **"Connect Email Provider"**
   - Select your provider (Resend, SendGrid, or Mailgun)
   - Paste your API key
   - (Optional) Enter custom from-email
   - Click **"Connect"**

✅ **Done!** All email notifications now use your account.

---

## Step 3: SMS (Optional)

Only if you want to send SMS campaigns:

### Get Twilio Account
1. Go to **[twilio.com/try-twilio](https://twilio.com/try-twilio)**
2. Sign up (get $15 trial credit)
3. Buy a phone number ($1/month)
4. Go to Console → Account Info
5. Copy **Account SID** and **Auth Token**

### Connect in RealtorAI
1. Settings → Integrations tab
2. Under "SMS Provider":
   - Click **"Connect Twilio"**
   - Paste Account SID
   - Paste Auth Token
   - Enter your Twilio phone number
   - Click **"Connect"**

✅ **Done!** SMS campaigns now use your Twilio account.

---

## What Happens Now?

### Email Notifications
- Buyer/Seller welcome emails → Sent from YOUR account
- New offer notifications → Sent from YOUR account
- Campaign emails → Sent from YOUR account

### SMS Campaigns  
- Property alerts → Sent from YOUR number
- Open house reminders → Sent from YOUR number
- Price drop notifications → Sent from YOUR number

### Your Benefits
✓ **Better deliverability** (your verified domain)  
✓ **Your brand** (company name as sender)  
✓ **Full control** (see logs in your dashboard)  
✓ **Higher limits** (not shared with others)  
✓ **Still FREE** (within free tier limits)

---

## Free Tier Limits

### Email
- **Resend:** 100/day, 3000/month
- **SendGrid:** 100/day forever
- **Mailgun:** 100/day for 3 months

### SMS
- **Twilio:** $15 trial credit (~1,875 SMS)
- Then ~$0.01 per SMS + $1/month for number

**Most agents stay in free email tier!**

---

## Troubleshooting

### Email Not Sending?
1. Check API key is correct
2. Verify "Active" badge shows in Settings
3. Check your provider's dashboard for errors
4. Verify domain (if using custom from-email)

### SMS Not Sending?
1. Check Account SID and Auth Token
2. Verify phone number format (+1...)
3. Check Twilio balance
4. Look for errors in Twilio console

### Need Help?
- Settings → Integrations → See status badges
- Check provider dashboards for logs
- Contact platform support if connection fails

---

## What If I Don't Connect?

**No problem!** 

- Platform defaults are used
- Everything still works
- You can connect anytime later
- No penalty for not connecting

**But connecting is recommended for:**
- Professional branding
- Better deliverability  
- Your own analytics
- Higher sending limits

---

## Summary

**Time:** 2 minutes  
**Cost:** $0 (free tiers)  
**Benefit:** Professional branded communications

**Ready? Go to Dashboard → Settings → Integrations! 🚀**
