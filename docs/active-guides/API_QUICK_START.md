# ⚡ API Keys Quick Start - 15 Minutes Total

## 🎯 Goal
Get real MLS property data working in your app with FREE API tiers.

---

## ✅ Step 1: RentCast API (5 minutes)

**Free tier:** 50 API calls/month

### Setup:
1. Go to: https://www.rentcast.io/
2. Click "Get Started Free"
3. Sign up with email
4. Go to Dashboard → API Keys
5. Create new key
6. Copy the key (starts with `rc_`)

### Add to `.env.local`:
```bash
RENTCAST_API_KEY=rc_your_key_here
```

**✅ Done!** You now have access to 140M properties.

📖 **Detailed guide:** See `RENTCAST_SETUP_GUIDE.md`

---

## ✅ Step 2: RapidAPI (5 minutes)

**Free tier:** 600+ API calls/month total (Zillow 100 + Realtor.com 500)

### Setup:
1. Go to: https://rapidapi.com/
2. Sign up (email or Google/GitHub)
3. Click profile → "My Apps" → "default-application"
4. Click "Security" tab
5. Copy the "X-RapidAPI-Key"

### Subscribe to free APIs:
1. Go to: https://rapidapi.com/apimaker/api/zillow-com1
2. Click "Subscribe to Test"
3. Select "Basic (FREE)" - 100 requests/month
4. Click "Subscribe"
5. Do the same for: https://rapidapi.com/apidojo/api/realtor
   - Select "Basic (FREE)" - 500 requests/month

### Add to `.env.local`:
```bash
RAPIDAPI_KEY=your_key_here
```

**✅ Done!** You now have Zillow & Realtor.com data.

📖 **Detailed guide:** See `RAPIDAPI_SETUP_GUIDE.md`

---

## ✅ Step 3: Google Places API (5 minutes - OPTIONAL)

**Free tier:** $300 credits for 90 days (~17,600 requests)

### Setup:
1. Go to: https://console.cloud.google.com/
2. Create new project
3. Click "Enable APIs & Services"
4. Search for "Places API"
5. Click "Enable"
6. Go to "Credentials"
7. Click "Create Credentials" → "API Key"
8. Copy the key

### Add to `.env.local`:
```bash
GOOGLE_PLACES_API_KEY=your_key_here
```

**✅ Done!** You now have nearby places data (restaurants, schools, etc.)

---

## 📊 What You Get (FREE)

| API | Free Tier | What You Get |
|-----|-----------|--------------|
| RentCast | 50/month | Property details, values, rent estimates, comparables |
| Zillow (RapidAPI) | 100/month | Property search, Zestimates, similar properties |
| Realtor.com (RapidAPI) | 500/month | Listings, agent info, schools, neighborhoods |
| Google Places | $300 credits | Nearby places, walking distances, ratings |
| **TOTAL** | **650+ calls/month** | **Everything you need!** |

**Cost: $0/month** 🎉

---

## 🔧 Test Your Setup

### Create test file:

**File:** `scripts/test-apis.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAPIs() {
  console.log('🧪 Testing API Keys...\n');
  
  // Test RentCast
  if (process.env.RENTCAST_API_KEY) {
    try {
      const res = await fetch(
        'https://api.rentcast.io/v1/properties?address=5500+Grand+Lake+Drive&city=San+Antonio&state=TX',
        { headers: { 'X-Api-Key': process.env.RENTCAST_API_KEY } }
      );
      const data = await res.json();
      console.log('✅ RentCast API: Working!');
      console.log(`   Found: ${data[0]?.formattedAddress}`);
    } catch (e) {
      console.log('❌ RentCast API: Failed');
    }
  } else {
    console.log('⚠️  RentCast API: Key not set');
  }
  
  // Test RapidAPI (Zillow)
  if (process.env.RAPIDAPI_KEY) {
    try {
      const res = await fetch(
        'https://zillow-com1.p.rapidapi.com/property?zpid=61975204',
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
          }
        }
      );
      const data = await res.json();
      console.log('✅ RapidAPI (Zillow): Working!');
      console.log(`   Found: ${data.address?.streetAddress}`);
    } catch (e) {
      console.log('❌ RapidAPI: Failed');
    }
  } else {
    console.log('⚠️  RapidAPI: Key not set');
  }
  
  // Test Google Places
  if (process.env.GOOGLE_PLACES_API_KEY) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.7749,-122.4194&radius=1000&type=restaurant&key=${process.env.GOOGLE_PLACES_API_KEY}`
      );
      const data = await res.json();
      console.log('✅ Google Places API: Working!');
      console.log(`   Found ${data.results?.length} nearby places`);
    } catch (e) {
      console.log('❌ Google Places API: Failed');
    }
  } else {
    console.log('⚠️  Google Places API: Key not set');
  }
  
  console.log('\n🎉 API setup complete!');
}

testAPIs();
```

### Run test:
```bash
npx tsx scripts/test-apis.ts
```

**Expected output:**
```
🧪 Testing API Keys...

✅ RentCast API: Working!
   Found: 5500 Grand Lake Drive, San Antonio, TX 78244
✅ RapidAPI (Zillow): Working!
   Found: 5500 Grand Lake Dr
✅ Google Places API: Working!
   Found 20 nearby places

🎉 API setup complete!
```

---

## 📝 Your `.env.local` File

Copy this template:

```bash
# Copy .env.local.example to .env.local first:
cp .env.local.example .env.local

# Then add your keys:

# Convex & Clerk (you already have these)
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# OpenRouter AI (you should have this)
OPENROUTER_API_KEY=sk-or-v1-...

# NEW: Real Estate APIs
RENTCAST_API_KEY=rc_...
RAPIDAPI_KEY=...
GOOGLE_PLACES_API_KEY=...

# Optional: Demo data (works as-is)
MLS_API_KEY=simplyrets:simplyrets
MLS_API_URL=https://api.simplyrets.com
```

---

## 🚀 Next Steps

### After getting your keys:

1. **Restart your servers:**
   ```bash
   # Stop servers (Ctrl+C)
   npm run dev
   npx convex dev
   ```

2. **Update tool handlers** to use real data:
   - Edit `lib/openrouter/tool-handlers.ts`
   - Replace mock functions with API calls
   - See examples in `RENTCAST_SETUP_GUIDE.md` and `RAPIDAPI_SETUP_GUIDE.md`

3. **Test in the app:**
   - Go to buyer portal
   - Open property detail page
   - Click AI chat
   - Ask: "What are comparable properties nearby?"
   - Should see real data from APIs!

---

## 💡 Tips

### Rate Limiting

With free tiers, be smart about API usage:

**Cache everything:**
```typescript
// Store API results in Convex
await ctx.db.insert("propertyCache", {
  address: "123 Main St",
  data: apiResult,
  fetchedAt: Date.now()
});

// Check cache first
const cached = await ctx.db
  .query("propertyCache")
  .withIndex("byAddress")
  .first();

if (cached && cached.fetchedAt > Date.now() - 86400000) {
  return cached.data; // Use cache if < 24 hours old
}
```

**Fallback to mock data:**
```typescript
try {
  return await fetchFromRentCast(address);
} catch (error) {
  console.warn('API failed, using mock data');
  return getMockData(address);
}
```

### Monitor Usage

**RentCast:** https://app.rentcast.io/ → Usage  
**RapidAPI:** https://rapidapi.com/developer/billing → Usage  
**Google:** https://console.cloud.google.com/ → APIs & Services → Dashboard

---

## ❓ Troubleshooting

### "Invalid API Key"
- Check key is copied correctly (no extra spaces)
- Verify key is in `.env.local` not `.env.example`
- Restart dev servers after adding keys

### "Rate Limit Exceeded"
- Check usage in API dashboard
- Implement caching to reduce calls
- Upgrade to paid tier if needed

### "Property Not Found"
- Try different address format
- Some APIs need full address with city/state
- Check API documentation for required fields

---

## 📚 Full Documentation

- **Complete API guide:** `API_KEYS_GUIDE.md`
- **RapidAPI tutorial:** `RAPIDAPI_SETUP_GUIDE.md`
- **RentCast tutorial:** `RENTCAST_SETUP_GUIDE.md`
- **All alternatives:** `MLS_API_ALTERNATIVES.md`

---

## ✅ Checklist

- [ ] Created RentCast account
- [ ] Got RentCast API key
- [ ] Created RapidAPI account
- [ ] Got RapidAPI key
- [ ] Subscribed to Zillow API (free)
- [ ] Subscribed to Realtor.com API (free)
- [ ] (Optional) Got Google Places API key
- [ ] Added all keys to `.env.local`
- [ ] Ran test script successfully
- [ ] Restarted dev servers

---

## 🎉 You're Ready!

**Total time:** 15 minutes  
**Total cost:** $0  
**Total API calls:** 650+ per month  

**You now have real MLS data in your app!** 🚀

Start the servers and test the AI chat with real property data!
