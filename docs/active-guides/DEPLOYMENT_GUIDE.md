# 🚀 Deployment Guide - RealtorAI Platform

**Complete step-by-step guide to deploying your platform to production**

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ All features tested locally
- ✅ Build passing (`npm run build`)
- ✅ All required API keys obtained
- ✅ Custom domain ready (optional)
- ✅ Email for sending notifications
- ✅ Company/brand name finalized

---

## 🔧 Step 1: Set Up Required Services

### 1.1 Convex (Backend Database)

**What it does:** Real-time database and serverless functions

1. Go to https://convex.dev
2. Sign in with GitHub
3. Click "Create Project"
4. Name it "RealtorAI Production"
5. Copy the deployment URL
6. In your terminal:
   ```bash
   npm install -g convex
   npx convex dev
   # Follow prompts to connect to your project
   ```

**Cost:** Free tier includes:
- 1GB storage
- 1M function calls/month
- Unlimited real-time subscriptions

**Upgrade needed when:** > 1,000 active users

---

### 1.2 Clerk (Agent Authentication)

**What it does:** Agent login/signup with social auth

1. Go to https://clerk.com
2. Sign up for free account
3. Click "Create Application"
4. Name it "RealtorAI Production"
5. Enable authentication methods:
   - ✅ Email + Password
   - ✅ Google OAuth
   - ✅ Microsoft OAuth (optional)
6. Go to API Keys:
   - Copy "Publishable Key"
   - Copy "Secret Key"

**Cost:** Free tier includes:
- 10,000 monthly active users
- All authentication methods
- Social connections

---

### 1.3 OpenRouter (AI Features)

**What it does:** AI property analysis and marketing generation

1. Go to https://openrouter.ai
2. Sign in with Google/GitHub
3. Go to "Keys" → "Create Key"
4. Name it "RealtorAI Production"
5. Set limit: $50/month (optional)
6. Copy the API key (starts with `sk-or-`)

**Cost:** Pay as you go:
- Claude 3.5 Sonnet: ~$0.01-0.02 per query
- ~$10-20/month for 50 agents

**Budget:** Start with $50/month credit

---

### 1.4 RentCast (Property Data)

**What it does:** Real property listings and data

1. Go to https://app.rentcast.io/app
2. Sign up for free account
3. Choose "Developer" plan ($49/month)
4. Go to Settings → API Keys
5. Copy your API key

**Cost:** 
- Free tier: 50 requests/month (very limited)
- Developer: $49/month (5,000 requests)
- Professional: $99/month (25,000 requests)

**Recommendation:** Start with Developer plan

---

### 1.5 Twilio (SMS Campaigns) - OPTIONAL

**What it does:** Send bulk SMS to clients

1. Go to https://twilio.com
2. Sign up (free trial includes $15 credit)
3. Get a phone number (~$1/month)
4. Go to Console → Account Info:
   - Copy "Account SID"
   - Copy "Auth Token"
5. Go to Phone Numbers → Copy your number

**Cost:**
- Phone number: ~$1/month
- SMS: ~$0.0079 per message (US)
- Monthly estimate: $20-50 for active agent

**Note:** Platform works without this (skip if budget limited)

---

### 1.6 Resend (Email Notifications) - OPTIONAL

**What it does:** Send email notifications to clients

1. Go to https://resend.com
2. Sign up for free
3. Go to API Keys → Create Key
4. Copy the key (starts with `re_`)

**Optional but recommended:**
5. Go to Domains → Add Domain
6. Add DNS records to your domain
7. Wait for verification (~1 hour)

**Cost:**
- Free: 100 emails/day (3,000/month)
- Pro: $20/month (50,000 emails/month)

**Recommendation:** Start with free tier

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Push Code to GitHub

```bash
# If not already in git
git init
git add .
git commit -m "Production ready"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/realtorAI.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository
5. Configure:
   - **Framework:** Next.js
   - **Root Directory:** ./
   - **Build Command:** npm run build
   - **Output Directory:** .next
6. Click "Deploy"

**Cost:** Free tier includes:
- Unlimited deployments
- 100GB bandwidth/month
- Custom domains
- Automatic SSL

---

### 2.3 Add Environment Variables in Vercel

Go to Project Settings → Environment Variables

Add these **REQUIRED** variables:

```bash
# Convex
CONVEX_DEPLOYMENT=prod:your-deployment-name-12345
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# AI Features
OPENROUTER_API_KEY=sk-or-xxxxx
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-xxxxx

# Property Data
RENTCAST_API_KEY=your_rentcast_key
```

Add these **OPTIONAL** variables:

```bash
# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Email (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=RealtorAI

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Important:** Mark all as "Production" environment

---

## 🔗 Step 3: Custom Domain (Optional)

### 3.1 Add Domain to Vercel

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow DNS configuration steps

### 3.2 Update DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.):

**For subdomain (recommended):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

**For root domain:**
```
Type: A
Name: @
Value: 76.76.19.19
```

**Wait 1-24 hours** for DNS propagation

### 3.3 Update Environment Variables

Once domain is active, update in Vercel:
```bash
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Core Features

1. **Landing Page**
   - Visit your domain
   - Check all sections load
   - Test CTA buttons

2. **Agent Authentication**
   - Click "Sign In"
   - Test login/signup
   - Verify dashboard loads

3. **Create Test Portal**
   - Create buyer session
   - Open portal link
   - Test AI chat
   - Browse properties

4. **AI Features**
   - Test AI chat in buyer portal
   - Generate marketing content (seller portal)
   - Verify responses are working

5. **Property Data**
   - Search properties
   - Verify images load
   - Check property details

### 4.2 Test Optional Features

If enabled:

**SMS Campaigns:**
- Create test campaign
- Send to your phone
- Verify delivery

**Email Notifications:**
- Create buyer session
- Check welcome email
- Verify formatting

---

## 🔍 Step 5: Monitoring & Analytics

### 5.1 Set Up Error Tracking

**Option 1: Sentry (Recommended)**

1. Go to https://sentry.io
2. Create project "RealtorAI"
3. Copy DSN
4. Add to `.env`:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your_dsn
   ```
5. Install: `npm install @sentry/nextjs`

**Cost:** Free for 5,000 errors/month

**Option 2: LogRocket**

Great for session replay and debugging

---

### 5.2 Set Up Analytics

**Google Analytics (Free):**

1. Go to https://analytics.google.com
2. Create property
3. Copy Measurement ID
4. Add to `app/layout.tsx`:

```tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

**Vercel Analytics (Recommended):**

1. Go to Project Settings → Analytics
2. Enable (free)
3. View real-time traffic and performance

---

## 📧 Step 6: Email Domain Setup (Optional)

### If Using Resend with Custom Domain

1. In Resend, go to Domains → Add Domain
2. Enter: `mail.yourdomain.com`
3. Add these DNS records:

**SPF Record:**
```
Type: TXT
Name: mail.yourdomain.com
Value: v=spf1 include:resend.com ~all
```

**DKIM Records:**
Follow instructions from Resend

**DMARC Record:**
```
Type: TXT
Name: _dmarc.mail.yourdomain.com
Value: v=DMARC1; p=none;
```

4. Wait for verification (usually < 1 hour)
5. Update environment variable:
   ```bash
   EMAIL_FROM=noreply@mail.yourdomain.com
   ```

---

## 🎨 Step 7: Branding Customization

### 7.1 Update Site Metadata

Edit `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "YourBrand - AI Real Estate Platform",
  description: "Your custom description",
  icons: {
    icon: "/favicon.ico",
  },
};
```

### 7.2 Add Your Logo

Replace these files in `/public`:
- `logo.svg` - Your main logo
- `favicon.ico` - Browser icon
- `og-image.png` - Social media preview (1200x630)

### 7.3 Update Colors (Optional)

Edit `app/globals.css` to match your brand colors:

```css
@layer base {
  :root {
    --primary: 220 90% 56%; /* Your brand blue */
    --secondary: 142 76% 36%; /* Your brand green */
  }
}
```

---

## 💰 Step 8: Cost Breakdown

### Monthly Costs Estimate

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| **Convex** | Free | $0 | Up to 1GB + 1M calls |
| **Clerk** | Free | $0 | Up to 10K MAU |
| **Vercel** | Free | $0 | 100GB bandwidth |
| **OpenRouter** | PAYG | $10-30 | Depends on usage |
| **RentCast** | Developer | $49 | 5K requests/month |
| **Twilio** | PAYG | $20-50 | Optional, ~$0.01/SMS |
| **Resend** | Free | $0 | Up to 3K emails |
| **Domain** | Annual | $12/yr | ~$1/month |
| **Total** | | **$80-130/mo** | For ~50 agents |

### When to Upgrade

**Convex ($25/month):**
- > 1GB storage
- > 1M function calls/month
- ~1,000+ active users

**Clerk ($25/month):**
- > 10,000 MAU
- Need advanced features

**Vercel ($20/month):**
- > 100GB bandwidth
- Need more build minutes
- Advanced analytics

---

## 🛡️ Step 9: Security Checklist

Before going live:

- ✅ All environment variables in Vercel (not in code)
- ✅ No API keys committed to Git
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Clerk production instance configured
- ✅ Rate limiting enabled (Convex has built-in)
- ✅ Input validation on all forms
- ✅ CORS configured properly
- ✅ Error messages don't expose sensitive data

---

## 📚 Step 10: Create Agent Onboarding

### 10.1 Create Welcome Email Template

Send to new agents:

```
Subject: Welcome to [YourBrand]! 🎉

Hi [Agent Name],

Welcome to [YourBrand]! Your AI-powered real estate platform is ready.

GET STARTED:
1. Sign in: [Your Domain]/sign-in
2. Create your first buyer portal
3. Try the AI chat with your clients

FEATURES:
✅ AI Property Analysis
✅ Personalized Buyer/Seller Portals
✅ Real-time Analytics
✅ Automated Marketing
✅ SMS Campaigns
✅ And much more!

Need help? Reply to this email.

Best regards,
[Your Team]
```

### 10.2 Create Quick Start Guide

Add to `/dashboard` or create PDF:

**"Getting Started in 5 Minutes"**

1. **Create Buyer Portal**
   - Dashboard → Buyers → New Buyer
   - Enter name, email, preferences
   - Copy portal link
   - Send to client

2. **Add Listings**
   - Dashboard → Listings → Search Properties
   - Add from RentCast or manual entry
   - Assign to buyer portals

3. **Generate Marketing**
   - Open seller portal
   - Marketing tab → Generate
   - Copy & use content

4. **Send SMS Campaign**
   - Dashboard → SMS Campaigns
   - Choose template
   - Select recipients
   - Send!

---

## 🚨 Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

**Environment Variables Not Working:**
- Redeploy after adding variables
- Check spelling exactly matches code
- Ensure marked as "Production"

**Convex Functions Not Found:**
```bash
# Redeploy Convex
npx convex deploy
```

**Clerk Login Not Working:**
- Check publishable/secret keys match
- Verify domain in Clerk settings
- Check redirect URLs configured

**OpenRouter API Errors:**
- Verify API key is active
- Check billing/credits
- Ensure model name correct (`anthropic/claude-3.5-sonnet`)

**Property Search Returns No Results:**
- Verify RentCast API key
- Check request limits not exceeded
- Try manual property entry

---

## 📈 Step 11: Launch Checklist

Ready to launch? Go through this:

### Technical
- ✅ All services connected and working
- ✅ Domain configured with SSL
- ✅ Email sending verified
- ✅ SMS sending verified (if enabled)
- ✅ Analytics tracking
- ✅ Error monitoring set up
- ✅ Backups configured (Convex does automatic)

### Content
- ✅ Landing page copy finalized
- ✅ Pricing page updated
- ✅ Terms of Service added
- ✅ Privacy Policy added
- ✅ Contact information updated

### Marketing
- ✅ Demo video recorded
- ✅ Screenshots taken
- ✅ Social media accounts created
- ✅ Launch email prepared
- ✅ Sales materials ready

---

## 🎉 You're Live!

**Congratulations!** Your RealtorAI platform is now live!

### Next Steps

1. **Onboard Beta Users**
   - Start with 5-10 agents
   - Gather feedback
   - Fix any issues

2. **Monitor Performance**
   - Check Vercel Analytics daily
   - Review error logs in Sentry
   - Track API usage/costs

3. **Iterate Based on Feedback**
   - Add requested features
   - Fix reported bugs
   - Improve UX

4. **Scale Marketing**
   - Create case studies
   - Get testimonials
   - Launch marketing campaigns

---

## 📞 Support Resources

**Documentation:**
- Next.js: https://nextjs.org/docs
- Convex: https://docs.convex.dev
- Clerk: https://clerk.com/docs

**Community:**
- Convex Discord: https://convex.dev/community
- Next.js Discord: https://nextjs.org/discord

**Paid Support:**
- Hire Next.js expert on Upwork
- Convex has paid support plans
- Agency partnerships available

---

## 🔄 Ongoing Maintenance

### Weekly Tasks
- Check error logs
- Review analytics
- Monitor API costs
- Test critical features

### Monthly Tasks
- Update dependencies: `npm update`
- Review and optimize API usage
- Analyze user feedback
- Plan new features

### Quarterly Tasks
- Security audit
- Performance optimization
- Major feature releases
- Update documentation

---

**Deployment Guide Version 1.0**  
**Last Updated:** January 16, 2025  
**Platform Status:** Production Ready ✅

**Need help?** Create an issue on GitHub or email support@yourdomain.com

---

🚀 **Good luck with your launch!** 🚀
