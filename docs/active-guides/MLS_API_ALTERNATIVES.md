# Real Estate & MLS API Alternatives - Research Results

## 🎯 Best Options for MVP (Free to Start)

### 1. **RentCast API** (Formerly Realty Mole) ⭐ RECOMMENDED
**Website:** https://www.rentcast.io/api  
**Free Tier:** ✅ 50 API calls/month FREE  
**Coverage:** 140+ million properties (US)

**What You Get:**
- Property details (beds, baths, sqft, year built)
- Owner information
- Property value estimates
- Rent estimates
- Tax history
- Sale history
- Active listings (for-sale and for-rent)
- Market trends by zip code
- Historical price data

**Pricing:**
- Developer: $0/month (50 calls)
- Starter: $49/month (1,000 calls)
- Professional: $149/month (5,000 calls)
- Business: $449/month (25,000 calls)

**Setup:**
```bash
# 1. Sign up at https://www.rentcast.io/
# 2. Get API key
# 3. Add to .env.local:
RENTCAST_API_KEY=your_key_here
```

**Example API Call:**
```javascript
const response = await fetch(
  `https://api.rentcast.io/v1/properties?address=123+Main+St&city=San+Francisco&state=CA`,
  {
    headers: {
      'X-Api-Key': 'your_api_key_here'
    }
  }
);
```

**Status:** ✅ **BEST CHOICE** - Free tier, excellent data, easy to use

---

### 2. **SimplyRETS** (Demo Account)
**Website:** https://simplyrets.com/  
**Free Tier:** ✅ Demo account with sample data (unlimited for testing)  
**Real Data:** $49-99/month per MLS connection

**What You Get (Demo):**
- Sample property listings
- RESO Web API compliant
- Full API features for testing
- No signup required for demo

**Demo Credentials:**
```bash
Username: simplyrets
Password: simplyrets
API URL: https://api.simplyrets.com/properties
```

**What You Get (Paid):**
- Real MLS data from specific markets
- RESO certified
- Residential & rental listings
- Agent information
- Open house data

**Pricing:**
- One-time setup: $99
- Basic: $49/month (1 MLS)
- Plus: $79/month (1 MLS + enhanced features)

**Setup:**
```bash
# Demo (Free):
MLS_API_KEY=simplyrets:simplyrets
MLS_API_URL=https://api.simplyrets.com

# Production (Paid):
MLS_API_KEY=your_username:your_password
MLS_API_URL=https://api.simplyrets.com
```

**Status:** ✅ **BEST FOR TESTING** - Perfect demo data, easy transition to production

---

### 3. **Zillow API via RapidAPI**
**Website:** https://rapidapi.com/apimaker/api/zillow-com1  
**Free Tier:** ✅ 100 requests/month FREE  
**Note:** Unofficial API (not from Zillow directly)

**What You Get:**
- Property search by address
- Property details
- Zestimate values
- Rent estimates
- Similar properties
- Recently sold properties
- Agent information

**Pricing:**
- Basic: FREE (100 req/month)
- Pro: $9.99/month (1,000 req/month)
- Ultra: $29.99/month (10,000 req/month)
- Mega: $99.99/month (100,000 req/month)

**Setup:**
```bash
# 1. Sign up at https://rapidapi.com/
# 2. Subscribe to Zillow API
# 3. Get API key from RapidAPI

RAPIDAPI_KEY=your_rapidapi_key_here
```

**Example:**
```javascript
const options = {
  method: 'GET',
  url: 'https://zillow-com1.p.rapidapi.com/property',
  params: { zpid: '61975204' },
  headers: {
    'X-RapidAPI-Key': 'your_key_here',
    'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
  }
};
```

**Status:** ✅ **GOOD FREE OPTION** - 100 free requests is enough for testing

---

### 4. **HomeHarvest** (Python Library)
**Website:** https://github.com/Bunsly/HomeHarvest  
**Free Tier:** ✅ 100% FREE & Open Source  
**Note:** Scrapes public data (use responsibly)

**What You Get:**
- Property listings from Zillow, Realtor.com, Redfin
- Property details
- Price history
- Recent sales
- Rental listings

**Setup:**
```bash
pip install homeharvest
```

**Example Usage:**
```python
from homeharvest import scrape_property

properties = scrape_property(
    location="San Francisco, CA",
    listing_type="for_sale",
    site_name="zillow"
)
```

**Pros:**
- Completely free
- Works for multiple sites
- Open source

**Cons:**
- Scraping (can break if sites change)
- Rate limiting issues
- May violate ToS

**Status:** ⚠️ **USE CAREFULLY** - Free but may have legal risks

---

### 5. **RESO Web API Developer Reference Server**
**Website:** https://www.reso.org/web-api-developer-reference-server/  
**Free Tier:** ✅ FREE access to Austin Board of REALTORS® data  

**What You Get:**
- Previous year's real listing data from Austin, TX
- RESO Web API compliant
- Real MLS data for testing
- Standardized data format

**Use Case:**
- Perfect for development and testing
- Learn RESO Web API standards
- Real data structure and formats

**Access:**
- Provided by Zillow's Bridge Interactive
- Free for developers
- Testing environment only

**Status:** ✅ **GREAT FOR LEARNING** - Real MLS data for free, but limited to Austin

---

### 6. **Realtor.com via RapidAPI**
**Website:** https://rapidapi.com/apidojo/api/realtor  
**Free Tier:** ✅ 500 requests/month FREE  

**What You Get:**
- Property search
- Property details
- Agent information
- Market trends
- School data
- Neighborhood info

**Pricing:**
- Basic: FREE (500 req/month)
- Pro: $10/month (10,000 req/month)
- Ultra: $50/month (100,000 req/month)

**Status:** ✅ **GENEROUS FREE TIER** - 500 free requests is solid for testing

---

## 🚫 Not Recommended / Unavailable

### Walk Score API
- **Status:** ❌ No free tier
- **Cost:** $100+/month minimum
- **Alternative:** Google Places API (see below)

### GreatSchools API
- **Status:** ❌ Shut down in 2020
- **Alternative:** Manual data or web scraping

### Traditional MLS APIs
- **Status:** ❌ $500+/month minimum
- **Reason:** Require MLS partnership
- **Alternative:** Use RentCast, SimplyRETS, or RapidAPI services

---

## ✅ Recommended Free Alternatives for Other Features

### For School Data (GreatSchools Alternative):

#### **Niche API** (Request Access)
**Website:** https://www.niche.com/about/data-api/  
**Free Tier:** Available for educational/non-commercial use  
**What You Get:**
- School ratings
- Reviews
- Test scores
- Demographics

**Status:** ⚠️ Need to request access, may be approved

#### **Manual School Database**
- Use public data from SchoolDigger.com
- State education department data
- Store in Convex as static data
- Update quarterly or annually

---

### For Walk Score / Places (Walk Score Alternative):

#### **Google Places API**
**Website:** https://console.cloud.google.com/  
**Free Tier:** ✅ $300 free credits for 90 days  
**Then:** $0.017 per request (so $300 = ~17,600 requests)

**What You Get:**
- Nearby places (restaurants, shops, parks)
- Place details and ratings
- Distance calculations
- Walking directions

**Setup:**
```bash
# 1. Go to Google Cloud Console
# 2. Create project
# 3. Enable Places API
# 4. Create API key

GOOGLE_PLACES_API_KEY=your_key_here
```

**Example:**
```javascript
const response = await fetch(
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.7749,-122.4194&radius=1000&type=restaurant&key=${API_KEY}`
);
```

**Status:** ✅ **BEST FREE ALTERNATIVE** to Walk Score

#### **Overpass API** (OpenStreetMap)
**Website:** https://overpass-api.de/  
**Free Tier:** ✅ 100% FREE  
**What You Get:**
- Query OpenStreetMap data
- Find nearby amenities
- Calculate distances
- All free, no limits

**Status:** ✅ **COMPLETELY FREE** alternative

---

## 💰 Cost Comparison for MVP

### Completely Free Setup:
| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| RentCast API | 50 calls/month | $0 |
| Zillow RapidAPI | 100 calls/month | $0 |
| Realtor.com RapidAPI | 500 calls/month | $0 |
| SimplyRETS Demo | Unlimited (test data) | $0 |
| Google Places API | $300 credits (90 days) | $0 |
| OpenRouter (AI) | $5 credits | $0 |
| **TOTAL** | **Fully functional!** | **$0** |

### Low-Cost Production Setup:
| Service | Monthly Cost | What You Get |
|---------|--------------|--------------|
| RentCast API | $49 | 1,000 property lookups |
| SimplyRETS | $49 | 1 MLS market |
| Google Places API | ~$20 | After free credits |
| OpenRouter (AI) | ~$30 | Pay per use |
| **TOTAL** | **~$150/mo** | **Production-ready** |

---

## 🎯 My Recommendation for Your MVP

### Phase 1: Free Testing (0-3 months)
```bash
# .env.local

# Primary property data (50 calls/month free)
RENTCAST_API_KEY=your_rentcast_key

# Backup/additional data (100 calls/month free)
RAPIDAPI_KEY=your_rapidapi_key

# Places data ($300 free for 90 days)
GOOGLE_PLACES_API_KEY=your_google_key

# AI chat ($5 free credits)
OPENROUTER_API_KEY=sk-or-v1-your-key
```

**Total Cost:** $0  
**You Get:** ~150 property lookups/month + full functionality

### Phase 2: Low-Cost Production (months 3-6)
```bash
# Primary MLS data
RENTCAST_API_KEY=your_rentcast_key  # $49/mo

# OR

# Real MLS feed (choose 1 market)
SIMPLYRETS_API_KEY=username:password  # $49/mo

# AI chat (pay as you go)
OPENROUTER_API_KEY=sk-or-v1-your-key  # ~$30/mo

# Places (after free credits expire)
GOOGLE_PLACES_API_KEY=your_key  # ~$20/mo
```

**Total Cost:** ~$100-150/month  
**You Get:** Real MLS data + full production features

---

## 📝 Implementation Guide

### Step 1: Get RentCast API Key (5 minutes)
```bash
# 1. Go to https://www.rentcast.io/
# 2. Sign up for free
# 3. Get API key from dashboard
# 4. Test with 50 free calls/month

# Add to .env.local:
RENTCAST_API_KEY=your_key_here
```

### Step 2: Add Google Places API (10 minutes)
```bash
# 1. Go to https://console.cloud.google.com/
# 2. Create new project
# 3. Enable "Places API"
# 4. Create credentials (API key)
# 5. Get $300 free credits for 90 days

# Add to .env.local:
GOOGLE_PLACES_API_KEY=your_key_here
```

### Step 3: Add Zillow RapidAPI (5 minutes)
```bash
# 1. Go to https://rapidapi.com/
# 2. Sign up
# 3. Subscribe to Zillow API (free tier)
# 4. Copy API key

# Add to .env.local:
RAPIDAPI_KEY=your_key_here
```

### Step 4: Update Tool Handlers (30 minutes)

Edit `lib/openrouter/tool-handlers.ts` to use real APIs instead of mock data:

```typescript
// Example: Real property search using RentCast
export async function searchComparableProperties(params: any) {
  const { address, radius = 1, minBeds, maxPrice } = params;
  
  const response = await fetch(
    `https://api.rentcast.io/v1/properties/comps?address=${encodeURIComponent(address)}&radius=${radius}`,
    {
      headers: {
        'X-Api-Key': process.env.RENTCAST_API_KEY!
      }
    }
  );
  
  return await response.json();
}
```

---

## ⚡ Quick Start Script

```bash
#!/bin/bash

# Install dependencies (if needed)
npm install

# Set up environment variables
cat >> .env.local << EOF

# Real Estate APIs
RENTCAST_API_KEY=your_rentcast_key_here
RAPIDAPI_KEY=your_rapidapi_key_here

# Google Places (for walkability/amenities)
GOOGLE_PLACES_API_KEY=your_google_key_here

# AI Chat (already have this)
OPENROUTER_API_KEY=sk-or-v1-your-existing-key

# Optional: SimplyRETS Demo (no key needed for demo)
MLS_API_KEY=simplyrets:simplyrets
MLS_API_URL=https://api.simplyrets.com
EOF

echo "✅ API keys configured!"
echo "🚀 Start your servers:"
echo "   npm run dev"
echo "   npx convex dev"
```

---

## 🎉 Bottom Line

**You can get REAL MLS data for FREE:**

1. **RentCast**: 50 property lookups/month (free)
2. **Zillow RapidAPI**: 100 property lookups/month (free)
3. **Realtor.com RapidAPI**: 500 property lookups/month (free)
4. **SimplyRETS Demo**: Unlimited (test data, looks real)

**Total free property lookups: ~650/month** - more than enough for MVP testing!

**When you're ready for production:** $49-99/month gets you real MLS data.

**This is MUCH better than manually entering properties!** 🎉
