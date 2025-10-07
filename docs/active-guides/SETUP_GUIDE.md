# Quick Demo Setup

## Step-by-Step Setup

### 1. Get Your Clerk User ID

After signing in to `/dashboard`, your Clerk user ID will be shown in any error. It looks like:
```
user_33XTgorBKpU959nlqfcXEfnmtrE
```

Or find it at: https://dashboard.clerk.com → Users → (your user) → User ID

### 2. Run These Functions in Convex Dashboard

**Open:** The Convex dashboard URL (shown when you run `npx convex dev`)

**Function 1: Create Agent Profile**
```
Function: setup:createTestAgent
Args:
{
  "externalId": "user_YOUR_CLERK_ID_HERE",
  "agencyName": "Bay Area Realty",
  "email": "your@email.com"
}
```

Copy the `agent._id` from the result (looks like: `j97abc123def456`)

**Function 2: Create Test Listing**
```
Function: setup:createTestListing
Args:
{
  "agentId": "PASTE_AGENT_ID_HERE"
}
```

Copy the `listingId` from the result

**Function 3: Create Buyer Session**
```
Function: setup:createTestBuyerSession
Args:
{
  "agentId": "PASTE_AGENT_ID_HERE",
  "buyerName": "John Smith",
  "buyerEmail": "john@example.com"
}
```

Copy the `buyerUrl` from the result (e.g., `/buyer/abc123xyz456`)

**Function 4: Create Seller Session**
```
Function: setup:createTestSellerSession
Args:
{
  "agentId": "PASTE_AGENT_ID_HERE",
  "listingId": "PASTE_LISTING_ID_HERE",
  "sellerName": "Jane Doe",
  "sellerEmail": "jane@example.com"
}
```

Copy the `sellerUrl` from the result (e.g., `/seller/def789uvw012`)

### 3. Test the Portals

**Agent Dashboard:**
```
http://localhost:3000/dashboard
```
Sign in with Clerk, should now see your dashboard!

**Buyer Portal:**
```
http://localhost:3000/buyer/[YOUR_BUYER_SESSION_CODE]
```
No login required - just visit the URL!

**Seller Portal:**
```
http://localhost:3000/seller/[YOUR_SELLER_SESSION_CODE]
```
No login required - just visit the URL!

## Example Full Flow

1. Sign in to dashboard
2. Run `createTestAgent` with your user ID
3. Get agent ID from result (e.g., `j97abc123def456`)
4. Run `createTestListing` with that agent ID
5. Get listing ID (e.g., `k28def456ghi789`)
6. Run `createTestBuyerSession` with agent ID
7. Get buyer URL from result
8. Run `createTestSellerSession` with agent ID and listing ID
9. Get seller URL from result
10. Open the buyer and seller URLs in different tabs - they work instantly!

## What You'll See

**Buyer Portal:**
- Dashboard with recommended properties
- Property browsing with filters
- Property detail pages with galleries
- AI chat widget
- Mortgage calculator
- Offer submission

**Seller Portal:**
- Analytics dashboard
- View counts and engagement
- Offer management
- Performance metrics

**Agent Dashboard:**
- Overview of all listings
- Active buyer/seller sessions
- Quick actions panel
- Performance stats

## Tips

- Session codes are 16 characters (secure and unguessable)
- Codes don't expire (they're like magic links that always work)
- One seller session per listing
- Multiple buyer sessions per agent
- No passwords needed for buyers/sellers!
