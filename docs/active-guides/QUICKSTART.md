# ⚡ Quick Start - 2 Minute Demo

## Start the Application

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npx convex dev
```

---

## One-Click Setup (NEW!)

### Step 1: Create Your Agent Profile

1. Go to: `http://localhost:3000/dashboard`
2. Sign in with Clerk
3. Fill out the form:
   - **Agency Name:** "Premier Realty"
   - **License Number:** "CA-123456"
   - **Email:** your email
   - **Phone:** (optional)
4. Click **"Create Agent Profile"**
5. ✅ Dashboard loads!

### Step 2: Create Test Data (One Click!)

On your dashboard, you'll see a **"Quick Demo Setup"** card on the right side.

1. Click **"Create Test Data"** button
2. Wait ~2 seconds
3. ✅ You'll get:
   - 1 sample property listing
   - 1 buyer session with link
   - 1 seller session with link

### Step 3: Open the Portals

The test data card shows clickable links:

**Buyer Portal:**
- Click the external link icon
- Opens in new tab
- Browse properties, use AI chat, view details!

**Seller Portal:**
- Click the external link icon
- Opens in new tab
- See analytics, view offers, track engagement!

---

## That's It! 🎉

You now have a working demo with:
- ✅ Your agent dashboard
- ✅ A test property listing
- ✅ A buyer portal (no login!)
- ✅ A seller portal with analytics

---

## What to Try

### In Buyer Portal:
1. Click "Browse" to see all properties
2. Click a property to see full details
3. Scroll through the photo gallery
4. Try the mortgage calculator
5. Ask the AI a question (UI ready, mock response for now)
6. Check out the neighborhood insights

### In Seller Portal:
1. View the analytics dashboard
2. See total views and engagement
3. Check the "Views Over Time" chart
4. Click "Offers" to see the offers page
5. Notice how offers show detailed info

### In Agent Dashboard:
1. See overview stats
2. Check active sessions
3. Click "My Listings" to see properties
4. Click "Buyers" to manage buyer sessions
5. Use the copy icon to share portal links

---

## Create More Data

### Add More Buyers:

1. Click "Create Buyer Session" in Quick Actions
2. Fill out the form
3. Get instant portal link!

### Add More Listings:

Use the "Quick Demo Setup" button again to create another property (coming soon: full listing form)

---

## Next Steps

1. **Customize the test data** - Edit `convex/setup.ts` to match your market
2. **Add real API keys** - OpenRouter, Mapbox, etc. in `.env.local`
3. **Invite real clients** - Create real buyer/seller sessions
4. **Deploy** - Push to production when ready!

---

**Total Setup Time: 2 minutes** ⚡

**No manual database entries needed!** 🎊

**Everything is clickable and works!** 🚀
