# RapidAPI Setup Guide - Complete Walkthrough

## What is RapidAPI?

RapidAPI is a marketplace for APIs where you can access thousands of APIs with a single account and API key. Instead of signing up for each API separately (Zillow, Realtor.com, etc.), you sign up once and get access to all of them.

**Think of it like:** Amazon for APIs - one account, one payment method, access to everything.

---

## 🚀 Step-by-Step Setup (5 minutes)

### Step 1: Create RapidAPI Account

1. Go to https://rapidapi.com/
2. Click **"Sign Up"** (top right)
3. Sign up with:
   - Email & password, OR
   - GitHub account, OR
   - Google account
4. Verify your email

**You're now signed up!** ✅

---

### Step 2: Get Your API Key

Once logged in:

1. Click your **profile icon** (top right)
2. Click **"My Apps"**
3. You'll see **"default-application"** (automatically created)
4. Click on it
5. Click **"Security"** tab
6. Copy the **"X-RapidAPI-Key"** value

**This is your master API key!** It works for ALL APIs on RapidAPI.

Example key format:
```
1234567890abcdef1234567890abcdef12
```

**Add to `.env.local`:**
```bash
RAPIDAPI_KEY=your_copied_key_here
```

---

### Step 3: Subscribe to Free APIs

Now subscribe to the APIs we need:

#### A. Subscribe to Zillow API (100 free requests/month)

1. Go to: https://rapidapi.com/apimaker/api/zillow-com1
2. Click **"Subscribe to Test"** button
3. You'll see pricing plans:
   - **Basic:** FREE - 100 requests/month
   - Pro: $9.99/month
   - Ultra: $29.99/month
   - Mega: $99.99/month
4. Select **"Basic (FREE)"**
5. Click **"Subscribe"**
6. Enter payment info (required even for free tier, but you won't be charged)
7. Confirm subscription

**You're now subscribed to Zillow API!** ✅

#### B. Subscribe to Realtor.com API (500 free requests/month)

1. Go to: https://rapidapi.com/apidojo/api/realtor
2. Click **"Subscribe to Test"**
3. Select **"Basic (FREE)"** - 500 requests/month
4. Click **"Subscribe"**
5. Confirm

**You're now subscribed to Realtor.com API!** ✅

---

### Step 4: Test Your Setup

Let's make sure it works:

#### Test Zillow API:

1. Go back to: https://rapidapi.com/apimaker/api/zillow-com1
2. Click **"Endpoints"** tab
3. Select **"Property Details"** endpoint
4. On the right side, you'll see **"Code Snippets"**
5. The API key is already filled in from your account!
6. Click **"Test Endpoint"**
7. You should see property data in the response

**If you see data, it's working!** ✅

---

## 📝 How to Use RapidAPI in Your App

### Option 1: Using fetch (JavaScript/TypeScript)

```typescript
// Example: Get property details from Zillow
async function getZillowProperty(zpid: string) {
  const response = await fetch(
    `https://zillow-com1.p.rapidapi.com/property?zpid=${zpid}`,
    {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
      }
    }
  );
  
  return await response.json();
}
```

### Option 2: Using axios

```typescript
import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://zillow-com1.p.rapidapi.com/property',
  params: { zpid: '61975204' },
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
    'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
  }
};

const response = await axios.request(options);
console.log(response.data);
```

---

## 🔍 Understanding RapidAPI Endpoints

Each API has multiple **endpoints** (different functions):

### Zillow API Endpoints:

1. **Property Details** (`/property`)
   - Get full property info by Zillow Property ID (zpid)
   
2. **Property Search** (`/propertyExtendedSearch`)
   - Search properties by address, city, zip code
   
3. **Similar Properties** (`/similarProperties`)
   - Find similar homes for comparables
   
4. **Recently Sold** (`/recentlySold`)
   - Get recently sold properties in an area
   
5. **Rent Estimate** (`/rentEstimate`)
   - Get rental value estimates

### Realtor.com API Endpoints:

1. **Property List** (`/properties/v2/list-for-sale`)
   - Search for-sale properties
   
2. **Property Detail** (`/properties/v3/detail`)
   - Get detailed property info
   
3. **Agent Details** (`/agents/detail`)
   - Get real estate agent information

---

## 💡 Example: Complete Integration

Here's how to update your tool handlers to use real RapidAPI data:

### Update `lib/openrouter/tool-handlers.ts`:

```typescript
// Search comparable properties using Zillow
export async function searchComparableProperties(params: {
  address: string;
  city?: string;
  state?: string;
  radius?: number;
  minBeds?: number;
  maxPrice?: number;
}) {
  try {
    // First, search for the property
    const searchResponse = await fetch(
      `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(params.address)}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
        }
      }
    );
    
    const searchData = await searchResponse.json();
    
    if (!searchData.zpid) {
      throw new Error('Property not found');
    }
    
    // Then get similar properties
    const compsResponse = await fetch(
      `https://zillow-com1.p.rapidapi.com/similarProperties?zpid=${searchData.zpid}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
        }
      }
    );
    
    const compsData = await compsResponse.json();
    
    return {
      property: searchData,
      comparables: compsData.properties || [],
      count: compsData.properties?.length || 0
    };
    
  } catch (error) {
    console.error('Error fetching comparables:', error);
    // Fallback to mock data
    return getMockComparables(params);
  }
}

// Get school ratings using Realtor.com API
export async function getSchoolRatings(params: {
  address: string;
  city?: string;
  state?: string;
  radius?: number;
}) {
  try {
    const response = await fetch(
      `https://realtor.p.rapidapi.com/properties/v3/detail?property_id=${params.address}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'realtor.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    
    return {
      schools: data.schools || [],
      elementary: data.schools?.filter((s: any) => s.education_levels?.includes('elementary')),
      middle: data.schools?.filter((s: any) => s.education_levels?.includes('middle')),
      high: data.schools?.filter((s: any) => s.education_levels?.includes('high'))
    };
    
  } catch (error) {
    console.error('Error fetching schools:', error);
    return getMockSchools(params);
  }
}
```

---

## 📊 Monitoring Your Usage

### Check how many API calls you've used:

1. Go to https://rapidapi.com/developer/billing
2. Click **"Usage"** tab
3. See usage for each API you're subscribed to
4. View daily/monthly usage charts

**Important:** The free tier resets every month!

---

## 🎯 RapidAPI vs Direct APIs

### Why use RapidAPI instead of Zillow directly?

| Feature | RapidAPI | Direct Zillow |
|---------|----------|---------------|
| **Access** | Anyone can sign up | Requires commercial approval |
| **Free Tier** | ✅ 100 requests/month | ❌ No free tier |
| **Setup Time** | 5 minutes | Weeks/months for approval |
| **Single API Key** | ✅ One key for all APIs | ❌ Different key per service |
| **Billing** | One place for all APIs | Multiple bills |
| **Documentation** | Standardized format | Varies per API |

**Zillow's official API (Bridge Interactive) only works with:**
- Commercial real estate companies
- Must prove business legitimacy
- Minimum fees apply
- Takes weeks to get approved

**RapidAPI gives you access immediately!**

---

## 💰 Pricing Tiers

### Zillow API Pricing:

- **Basic (FREE):** 100 requests/month
- **Pro ($9.99/mo):** 1,000 requests/month
- **Ultra ($29.99/mo):** 10,000 requests/month
- **Mega ($99.99/mo):** 100,000 requests/month

### Realtor.com API Pricing:

- **Basic (FREE):** 500 requests/month
- **Pro ($10/mo):** 10,000 requests/month
- **Ultra ($50/mo):** 100,000 requests/month

**With both free tiers, you get 600 free property lookups per month!**

---

## ⚠️ Important Notes

### API Rate Limits:

- **Per second:** Usually 10-20 requests/second
- **Per month:** Based on your plan (100-500 for free)
- **Hard limit:** You can't exceed monthly quota

### Error Handling:

Always include error handling:

```typescript
try {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    // Rate limit exceeded
    console.error('Rate limit hit - wait and retry');
    return fallbackData;
  }
  
  if (response.status === 403) {
    // API key invalid or quota exceeded
    console.error('API access denied - check your key');
    return fallbackData;
  }
  
  return await response.json();
  
} catch (error) {
  console.error('API error:', error);
  return fallbackData; // Use mock data as backup
}
```

### Best Practices:

1. **Cache results** - Don't fetch the same property multiple times
2. **Use Convex storage** - Store property data you've already fetched
3. **Fallback to mock data** - Always have a backup when API fails
4. **Monitor usage** - Check your dashboard regularly
5. **Rate limit client-side** - Don't let users spam API calls

---

## 🔧 Testing Your Integration

### Create a test file:

**File:** `scripts/test-rapidapi.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testZillowAPI() {
  console.log('Testing Zillow API...');
  
  const response = await fetch(
    'https://zillow-com1.p.rapidapi.com/property?zpid=61975204',
    {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
      }
    }
  );
  
  const data = await response.json();
  
  console.log('✅ Zillow API working!');
  console.log('Property:', data.address);
  console.log('Price:', data.price);
}

async function testRealtorAPI() {
  console.log('Testing Realtor.com API...');
  
  const response = await fetch(
    'https://realtor.p.rapidapi.com/properties/v3/detail?property_id=M5926951899',
    {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'realtor.p.rapidapi.com'
      }
    }
  );
  
  const data = await response.json();
  
  console.log('✅ Realtor.com API working!');
  console.log('Property:', data.address);
}

// Run tests
testZillowAPI();
testRealtorAPI();
```

**Run it:**
```bash
npx tsx scripts/test-rapidapi.ts
```

---

## 📚 Additional Resources

### RapidAPI Documentation:
- Main docs: https://docs.rapidapi.com/
- Zillow API: https://rapidapi.com/apimaker/api/zillow-com1/details
- Realtor.com: https://rapidapi.com/apidojo/api/realtor/details

### Tutorials:
- RapidAPI Hub: https://rapidapi.com/learn
- Video tutorials: Search "RapidAPI tutorial" on YouTube

---

## ✅ Quick Checklist

- [ ] Created RapidAPI account
- [ ] Got API key from "My Apps"
- [ ] Subscribed to Zillow API (free tier)
- [ ] Subscribed to Realtor.com API (free tier)
- [ ] Added `RAPIDAPI_KEY` to `.env.local`
- [ ] Tested API calls work
- [ ] Updated tool handlers to use real data

---

## 🎉 You're Done!

You now have:
- ✅ Access to Zillow property data
- ✅ Access to Realtor.com listings
- ✅ 600 free API calls per month
- ✅ Single API key for everything

**Ready to integrate real property data into your app!** 🚀

---

## 💡 Need Help?

**RapidAPI not working?**
1. Check API key is correct in `.env.local`
2. Verify you're subscribed to the API
3. Check monthly quota hasn't been exceeded
4. Look at RapidAPI logs: https://rapidapi.com/developer/logs

**Still stuck?**
- RapidAPI Support: https://rapidapi.com/support
- Community: https://community.rapidapi.com/

Let me know and I'll help debug!
