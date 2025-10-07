# Free API Keys Guide

## Required APIs

### 1. **OpenRouter** (AI - Required for Chat)
**Website:** https://openrouter.ai/  
**Free Tier:** $5 free credits to start  
**Pricing:** Pay-as-you-go (~$0.10-0.50 per 1K requests)

**How to get:**
1. Go to https://openrouter.ai/
2. Sign up with Google/GitHub
3. Go to "Keys" section
4. Create new API key
5. Copy key starting with `sk-or-v1-...`

**Add to `.env.local`:**
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Status:** ⚠️ **REQUIRED** - AI chat won't work without this

---

## Map & Location APIs

### 2. **Mapbox** (Maps - Optional)
**Website:** https://www.mapbox.com/  
**Free Tier:** 50,000 free map loads/month (plenty for MVP!)  
**Pricing:** Free tier is very generous

**How to get:**
1. Go to https://account.mapbox.com/auth/signup/
2. Sign up (email or Google)
3. Verify email
4. Go to https://account.mapbox.com/access-tokens/
5. Copy your "Default public token" (starts with `pk.`)
6. Or click "Create a token" for a new one

**Add to `.env.local`:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

**Status:** ✅ **OPTIONAL** - Currently using static coordinates, works without this

**What it enables:**
- Interactive maps on property pages
- Draw search areas on map
- Nearby amenities visualization
- Commute time calculations

---

### 3. **Walk Score API** (Walkability - Optional)
**Website:** https://www.walkscore.com/professional/api.php  
**Free Tier:** ⚠️ **NO FREE TIER** - Requires paid plan ($100+/month)  
**Alternative:** Use Google Places API instead (see below)

**Status:** ❌ **SKIP THIS** - Too expensive for MVP

**Free Alternative - Google Places API:**
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable "Places API"
4. Create credentials (API key)
5. Get $300 free credits for 90 days

**Add to `.env.local`:**
```
GOOGLE_PLACES_API_KEY=your_google_key_here
```

**What it enables:**
- Search nearby restaurants, shops, parks
- Calculate walking distances
- Get ratings and reviews

---

## School & Education APIs

### 4. **GreatSchools API** (School Ratings - Optional)
**Website:** https://www.greatschools.org/api/  
**Free Tier:** ⚠️ **NO LONGER AVAILABLE** - API was shut down in 2020  
**Alternative:** Use Niche.com or manual data

**Status:** ❌ **NOT AVAILABLE**

**Free Alternatives:**

**Option A: Niche API** (Request access)
- Website: https://www.niche.com/about/data-api/
- Request API access (may be approved for non-commercial)
- Limited free tier for education use

**Option B: Manual School Data**
- Create your own school database
- Pull from public sources (SchoolDigger, state education departments)
- Store in Convex as static data

**Option C: Web Scraping** (use carefully)
- GreatSchools.org public pages
- Niche.com public pages
- Must respect robots.txt and rate limits

---

## Real Estate / MLS APIs

### 5. **MLS API** (Property Listings - Optional)
**Free Options:** ⚠️ **VERY LIMITED**

#### Option A: Bridge Interactive (RESO)
**Website:** https://www.bridgeinteractive.com/  
**Free Tier:** Demo/trial access only  
**Pricing:** Starts at $500/month

**Status:** ❌ **TOO EXPENSIVE** for MVP

#### Option B: Zillow API
**Website:** https://www.zillow.com/howto/api/APIOverview.htm  
**Status:** ⚠️ **DEPRECATED** - No longer accepting new API keys

#### Option C: Realtor.com API
**Website:** https://developer.move.com/  
**Status:** 🔒 **CLOSED** - Only for partners

#### Option D: SimplyRETS (Best for Testing!)
**Website:** https://simplyrets.com/  
**Free Tier:** ✅ **YES!** Demo account with sample data  
**Pricing:** Starts at $69/month for real data

**How to get (FREE DEMO):**
1. Go to https://simplyrets.com/
2. Click "Try the Demo"
3. Use demo credentials:
   - Username: `simplyrets`
   - Password: `simplyrets`
4. API endpoint: `https://api.simplyrets.com/`

**Add to `.env.local`:**
```
MLS_API_KEY=simplyrets:simplyrets
MLS_API_URL=https://api.simplyrets.com
```

**Status:** ✅ **RECOMMENDED** - Free demo with real-looking data

---

## What You Actually Need Right Now

### Minimum to Get Started (AI Chat Working):

**1. OpenRouter (Required):**
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```
Cost: $5 free credits (~500-1000 AI conversations)

**That's it!** Everything else works with mock data.

---

### Recommended Setup (Better Experience):

**1. OpenRouter** - $5 free credits  
**2. Mapbox** - 50k free map loads/month  
**3. SimplyRETS** - Free demo data  

**Total cost:** $0/month with free tiers!

---

## Complete Free Setup Instructions

### Step 1: OpenRouter (5 minutes)
```bash
# 1. Go to https://openrouter.ai/
# 2. Sign up
# 3. Go to Keys → Create Key
# 4. Copy key

# Add to .env.local:
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Step 2: Mapbox (5 minutes) - Optional
```bash
# 1. Go to https://account.mapbox.com/auth/signup/
# 2. Sign up
# 3. Go to Access Tokens
# 4. Copy default public token

# Add to .env.local:
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-token-here
```

### Step 3: SimplyRETS Demo (1 minute) - Optional
```bash
# No signup needed - just use demo credentials!

# Add to .env.local:
MLS_API_KEY=simplyrets:simplyrets
MLS_API_URL=https://api.simplyrets.com
```

### Step 4: Restart Dev Server
```bash
# Stop servers (Ctrl+C)
npm run dev
npx convex dev
```

---

## What Works Without Any APIs

Even without API keys, your platform has:

✅ **Mock property listings** (via test data button)  
✅ **Mock AI responses** (shows tool calls, no real data)  
✅ **Mock school ratings**  
✅ **Mock walk scores**  
✅ **Mock comparable properties**  
✅ **All UI features working**  

The mock data looks realistic and lets you demo everything!

---

## Cost Comparison

### Free Tier (What I Recommend for MVP):

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| OpenRouter | $5 credits | ~1,000 AI conversations |
| Mapbox | 50k loads/month | Plenty for 100+ users |
| SimplyRETS Demo | Unlimited | Sample property data |
| **Total** | **$0/month** | **Fully functional!** |

### Paid Tier (For Production):

| Service | Monthly Cost | What You Get |
|---------|--------------|--------------|
| OpenRouter | ~$20-50 | Unlimited AI (pay per use) |
| Mapbox | $0-5 | Still free under 50k loads |
| SimplyRETS | $69 | Real MLS data (1 market) |
| Google Places | $0 | $300/mo free credits |
| **Total** | **~$90-125/mo** | **Production-ready** |

---

## My Recommendation

### For MVP/Testing (This Week):
1. ✅ Get OpenRouter API key ($5 free credits)
2. ✅ Get Mapbox token (free)
3. ✅ Use SimplyRETS demo (free)
4. ⏭️ Skip everything else (mock data works fine)

**Time:** 15 minutes  
**Cost:** $0

### For Production (When You Have Users):
1. OpenRouter (pay-as-you-go)
2. Mapbox (still free under 50k)
3. SimplyRETS paid ($69/mo for 1 market)
4. Google Places API ($300 free credits)

**Cost:** ~$70-90/month

---

## Quick Setup Script

```bash
# 1. Copy .env.local.example
cp .env.local.example .env.local

# 2. Edit .env.local and add:

# Required (get from https://openrouter.ai/)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional but recommended (get from https://mapbox.com/)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-token-here

# Optional demo data (use as-is)
MLS_API_KEY=simplyrets:simplyrets
MLS_API_URL=https://api.simplyrets.com

# 3. Restart servers
npm run dev
npx convex dev

# 4. Test AI chat in buyer portal!
```

---

## Testing Without Any APIs

Want to test everything first before getting API keys?

**You can!** The platform works with mock data:
- Mock AI responses show the UX
- Mock property data looks realistic
- Mock tools demonstrate functionality
- All UI features work perfectly

Then add real APIs one at a time when you're ready.

---

## Need Help?

**OpenRouter not working?**  
- Check key starts with `sk-or-v1-`
- Check you have credits: https://openrouter.ai/credits
- Restart dev server after adding key

**Mapbox not working?**  
- Token must be public (starts with `pk.`)
- Add `NEXT_PUBLIC_` prefix in .env.local
- Restart dev server

**Still having issues?**  
Let me know which API and I'll help debug!

---

**Bottom line:** You only really need OpenRouter ($5 free credits) to get the AI chat working. Everything else can use mock data or free tiers! 🎉
