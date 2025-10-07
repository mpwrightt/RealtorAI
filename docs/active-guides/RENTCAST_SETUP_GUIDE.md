# RentCast API Setup Guide

## What is RentCast?

RentCast (formerly Realty Mole) provides access to over 140 million property records in the US, including:
- Property details (beds, baths, sqft, etc.)
- Property value estimates
- Rent estimates  
- Sale history
- Tax assessments
- Owner information
- Active listings (for-sale & for-rent)
- Market trends

**Best part:** 50 FREE API calls per month!

---

## 🚀 Step-by-Step Setup (5 minutes)

### Step 1: Create RentCast Account

1. Go to https://www.rentcast.io/
2. Click **"Get Started Free"** or **"Sign Up"**
3. Fill out the form:
   - Email
   - Password
   - Name
   - Company (can put your name if solo)
4. Click **"Create Account"**
5. Verify your email

**You're signed up!** ✅

---

### Step 2: Get Your API Key

Once logged in:

1. Go to your **Dashboard**: https://app.rentcast.io/
2. Click **"API Keys"** in the sidebar
3. You'll see **"Developer Plan"** - FREE (50 calls/month)
4. Click **"Create API Key"**
5. Give it a name (e.g., "Neighborhood Deal Finder")
6. Click **"Create"**
7. **Copy the API key** (starts with `rc_`)

**Save this key!** You won't be able to see it again.

Example key format:
```
rc_1234567890abcdef1234567890abcdef
```

**Add to `.env.local`:**
```bash
RENTCAST_API_KEY=rc_your_copied_key_here
```

---

### Step 3: Test Your API Key

Let's make sure it works!

#### Quick Browser Test:

Replace `YOUR_API_KEY` with your actual key:

```
https://api.rentcast.io/v1/properties?address=5500+Grand+Lake+Drive&city=San+Antonio&state=TX&zipCode=78244&apiKey=YOUR_API_KEY
```

Paste that URL in your browser. You should see JSON data with property info!

#### Node.js Test:

**File:** `scripts/test-rentcast.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testRentCast() {
  const response = await fetch(
    'https://api.rentcast.io/v1/properties?address=5500+Grand+Lake+Drive&city=San+Antonio&state=TX',
    {
      headers: {
        'X-Api-Key': process.env.RENTCAST_API_KEY!
      }
    }
  );
  
  const data = await response.json();
  
  if (data.error) {
    console.error('❌ Error:', data.error);
  } else {
    console.log('✅ RentCast API working!');
    console.log('Property:', data[0]?.formattedAddress);
    console.log('Value:', data[0]?.valueEstimate);
    console.log('Rent:', data[0]?.rentEstimate);
  }
}

testRentCast();
```

**Run it:**
```bash
npx tsx scripts/test-rentcast.ts
```

---

## 📝 How to Use RentCast API

### Main Endpoints:

#### 1. **Property Records** (`/v1/properties`)
Get property details by address:

```typescript
const response = await fetch(
  `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}&city=${city}&state=${state}`,
  {
    headers: {
      'X-Api-Key': process.env.RENTCAST_API_KEY!
    }
  }
);

const properties = await response.json();
```

**Returns:**
- Property ID
- Address details
- Bedrooms, bathrooms, sqft
- Lot size, year built
- Property type
- Owner name
- Last sale date & price
- Tax assessment
- Value estimate
- Rent estimate

#### 2. **Comparable Properties** (`/v1/properties/comps`)
Find similar properties nearby:

```typescript
const response = await fetch(
  `https://api.rentcast.io/v1/properties/comps?address=${address}&radius=1&propertyType=Single+Family`,
  {
    headers: {
      'X-Api-Key': process.env.RENTCAST_API_KEY!
    }
  }
);

const comps = await response.json();
```

**Parameters:**
- `address`: Property address
- `radius`: Search radius in miles (default: 1)
- `propertyType`: Filter by type
- `squareFeet`: ± 20% of target
- `bedrooms`: Match bedrooms
- `bathrooms`: Match bathrooms

#### 3. **Rent Estimate** (`/v1/avm/rent/value`)
Get rental value estimate:

```typescript
const response = await fetch(
  `https://api.rentcast.io/v1/avm/rent/value?address=${address}&city=${city}&state=${state}`,
  {
    headers: {
      'X-Api-Key': process.env.RENTCAST_API_KEY!
    }
  }
);

const estimate = await response.json();
```

**Returns:**
- Rent estimate (monthly)
- Price range (low/high)
- Confidence score

#### 4. **Property Value** (`/v1/avm/value`)
Get property value estimate:

```typescript
const response = await fetch(
  `https://api.rentcast.io/v1/avm/value?address=${address}&city=${city}&state=${state}`,
  {
    headers: {
      'X-Api-Key': process.env.RENTCAST_API_KEY!
    }
  }
);

const value = await response.json();
```

#### 5. **Market Statistics** (`/v1/markets`)
Get market trends by zip code:

```typescript
const response = await fetch(
  `https://api.rentcast.io/v1/markets?zipCode=94105`,
  {
    headers: {
      'X-Api-Key': process.env.RENTCAST_API_KEY!
    }
  }
);

const marketData = await response.json();
```

**Returns:**
- Average rent by bedrooms
- Price trends
- Inventory levels
- Days on market

#### 6. **Listings** (`/v1/listings/sale` or `/v1/listings/rental`)
Search active listings:

```typescript
// For-sale listings
const response = await fetch(
  `https://api.rentcast.io/v1/listings/sale?city=San+Francisco&state=CA&limit=50`,
  {
    headers: {
      'X-Api-Key': process.env.RENTCAST_API_KEY!
    }
  }
);

// Rental listings
const rentalResponse = await fetch(
  `https://api.rentcast.io/v1/listings/rental?city=San+Francisco&state=CA`,
  {
    headers: {
      'X-Api-Key': process.env.RENTCAST_API_KEY!
    }
  }
);
```

---

## 💡 Integration Example

### Update your tool handlers:

**File:** `lib/openrouter/tool-handlers.ts`

```typescript
export async function searchComparableProperties(params: {
  address: string;
  city?: string;
  state?: string;
  radius?: number;
  minBeds?: number;
  maxPrice?: number;
}) {
  try {
    const response = await fetch(
      `https://api.rentcast.io/v1/properties/comps?` + 
      `address=${encodeURIComponent(params.address)}&` +
      `radius=${params.radius || 1}&` +
      `bedrooms=${params.minBeds || ''}`,
      {
        headers: {
          'X-Api-Key': process.env.RENTCAST_API_KEY!
        }
      }
    );
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      comparables: data.slice(0, 10).map((prop: any) => ({
        address: prop.formattedAddress,
        price: prop.price || prop.lastSalePrice,
        beds: prop.bedrooms,
        baths: prop.bathrooms,
        sqft: prop.squareFootage,
        distance: prop.distance,
        similarity: prop.similarityScore
      })),
      count: data.length
    };
    
  } catch (error) {
    console.error('RentCast API error:', error);
    // Fallback to mock data
    return getMockComparables(params);
  }
}

export async function analyzeMarketTrends(params: {
  city: string;
  state: string;
  zipCode?: string;
}) {
  try {
    const response = await fetch(
      `https://api.rentcast.io/v1/markets?zipCode=${params.zipCode || ''}`,
      {
        headers: {
          'X-Api-Key': process.env.RENTCAST_API_KEY!
        }
      }
    );
    
    const data = await response.json();
    
    return {
      averageRent: data.averageRent,
      medianPrice: data.medianPrice,
      daysOnMarket: data.averageDaysOnMarket,
      inventory: data.inventory,
      priceGrowth: data.priceGrowthYoY,
      rentGrowth: data.rentGrowthYoY
    };
    
  } catch (error) {
    console.error('Market trends error:', error);
    return getMockMarketTrends(params);
  }
}
```

---

## 📊 Monitoring Usage

### Check your usage:

1. Go to https://app.rentcast.io/
2. Click **"Usage"** in sidebar
3. See:
   - Calls used this month
   - Calls remaining
   - Daily usage chart
   - Historical usage

**Free tier:** 50 calls/month (resets on billing date)

---

## 💰 Pricing Tiers

| Plan | Calls/Month | Price | Cost per Call |
|------|-------------|-------|---------------|
| **Developer** | 50 | **FREE** | $0 |
| **Starter** | 1,000 | $49 | $0.049 |
| **Professional** | 5,000 | $149 | $0.030 |
| **Business** | 25,000 | $449 | $0.018 |

**Upgrade anytime** when you need more calls.

---

## ⚠️ Best Practices

### 1. Cache Results
Don't fetch the same property twice!

```typescript
// Store in Convex after fetching
const cached = await ctx.db
  .query("propertyCache")
  .withIndex("byAddress", q => q.eq("address", address))
  .first();

if (cached && cached.fetchedAt > Date.now() - 86400000) {
  // Use cached data if less than 24 hours old
  return cached.data;
}

// Otherwise fetch from API and cache it
const data = await fetchFromRentCast(address);
await ctx.db.insert("propertyCache", {
  address,
  data,
  fetchedAt: Date.now()
});
```

### 2. Error Handling

```typescript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (response.status === 401) {
    console.error('Invalid API key');
    return fallbackData;
  }
  
  if (response.status === 429) {
    console.error('Rate limit exceeded');
    return fallbackData;
  }
  
  if (data.error) {
    console.error('API error:', data.error);
    return fallbackData;
  }
  
  return data;
  
} catch (error) {
  console.error('Network error:', error);
  return fallbackData;
}
```

### 3. Rate Limiting

The free tier has:
- **50 calls per month**
- **10 calls per minute** (burst limit)

Space out your requests!

```typescript
// Add delay between requests
await new Promise(resolve => setTimeout(resolve, 6000)); // 6 second delay
```

---

## 🔍 Common Use Cases

### Use Case 1: Property Valuation

```typescript
// Get property value + rent estimate in one go
async function getPropertyValuation(address: string, city: string, state: string) {
  // This counts as 1 API call (returns both)
  const response = await fetch(
    `https://api.rentcast.io/v1/properties?address=${address}&city=${city}&state=${state}`,
    { headers: { 'X-Api-Key': process.env.RENTCAST_API_KEY! }}
  );
  
  const [property] = await response.json();
  
  return {
    value: property.valueEstimate,
    rent: property.rentEstimate,
    lastSale: property.lastSalePrice,
    taxAssessment: property.assessedValue
  };
}
```

### Use Case 2: CMA (Comparative Market Analysis)

```typescript
async function generateCMA(address: string) {
  // Get subject property (1 call)
  const subject = await fetchProperty(address);
  
  // Get comparables (1 call)
  const comps = await fetchComps(address, {
    radius: 0.5,
    bedrooms: subject.bedrooms,
    propertyType: subject.propertyType
  });
  
  // Calculate average
  const avgPrice = comps.reduce((sum, c) => sum + c.price, 0) / comps.length;
  
  return {
    subject,
    comparables: comps,
    averagePrice: avgPrice,
    suggestedPrice: avgPrice * 1.02 // 2% above average
  };
}
```

---

## 📚 Documentation

**Official Docs:** https://developers.rentcast.io/  
**API Reference:** https://developers.rentcast.io/reference/  
**Migration from Realty Mole:** https://developers.rentcast.io/reference/realty-mole-migration-guide

---

## ✅ Quick Checklist

- [ ] Created RentCast account
- [ ] Got API key
- [ ] Added `RENTCAST_API_KEY` to `.env.local`
- [ ] Tested API call works
- [ ] Implemented caching strategy
- [ ] Updated tool handlers
- [ ] Added error handling

---

## 🎉 You're Ready!

You now have:
- ✅ Access to 140+ million properties
- ✅ 50 free API calls per month
- ✅ Property values, rent estimates, comparables
- ✅ Market trends and statistics

**Start building with real property data!** 🚀
