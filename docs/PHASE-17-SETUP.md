# Phase 17: AI-Powered Listing Creator - Setup Guide

## Prerequisites

Phase 17 requires two Google API services to function:

1. **Google AI Studio (Gemini)** - For photo analysis
2. **Google Places API** - For address autocomplete and validation

## Step 1: Get Google AI Studio API Key

### Option A: Free Tier (Recommended for Testing)

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Sign in with your Google account
4. Click "Create API Key"
5. Copy the API key

**Free Tier Limits:**
- 60 requests per minute
- ~$0.001 per image analysis
- Perfect for testing and moderate usage

### Option B: Google Cloud (For Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Generative Language API"
4. Create credentials → API Key
5. Copy the API key

## Step 2: Get Google Places API Key

### Enable the API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Library**
4. Search for and enable these APIs:
   - **Places API (New)** ⚠️ Must use the NEW version
   - **Geocoding API**
   - **Maps JavaScript API** (optional, for map display)

### Set Up Billing

⚠️ **Important:** Google Places API requires billing to be enabled, even for free tier usage.

1. Go to **Billing** in Google Cloud Console
2. Link a credit card (you won't be charged unless you exceed free tier)
3. Free tier includes:
   - $200 free credit per month
   - ~11,700 autocomplete sessions free per month
   - ~40,000 geocoding requests free per month

### Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key
4. (Optional but recommended) Click **Restrict Key**:
   - Application restrictions: None (for development) or HTTP referrers
   - API restrictions: Select "Places API", "Geocoding API"

## Step 3: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Google AI Studio (Gemini) - For photo analysis
GOOGLE_AI_STUDIO_API_KEY=your_gemini_api_key_here
GOOGLE_AI_MODEL=gemini-1.5-flash-latest

# Google Places API - For address lookup
GOOGLE_PLACES_API_KEY=your_places_api_key_here
```

## Step 4: Restart Your Services

```bash
# Stop current processes (Ctrl+C)

# Restart Next.js dev server
npm run dev

# Restart Convex (in separate terminal)
npx convex dev
```

## Step 5: Test the Integration

1. Go to `http://localhost:3000/dashboard/listings`
2. Click "Add Listing"
3. Start typing an address
   - ✅ If autocomplete works: API is configured correctly
   - ❌ If you see an error: Check the troubleshooting section below

4. Upload 5-10 property photos
5. Enter a price
6. Click "Analyze with AI"
7. Wait 30-60 seconds for analysis
8. Review the AI-generated details

## Troubleshooting

### "Address autocomplete not available"

**Cause:** Google Places API is not enabled or billing is not set up.

**Fix:**
1. Verify Places API is enabled: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
2. Check that billing is enabled in your project
3. Wait 5-10 minutes after enabling for changes to propagate
4. Check Convex logs for specific error messages

### "API key not found" or "Invalid API key"

**Cause:** Environment variable not set correctly.

**Fix:**
1. Check `.env.local` file exists in project root
2. Verify variable names match exactly:
   - `GOOGLE_AI_STUDIO_API_KEY` (not GOOGLE_API_KEY)
   - `GOOGLE_PLACES_API_KEY`
3. Restart both `npm run dev` and `npx convex dev`
4. Check for trailing spaces or quotes in `.env.local`

### Photo analysis fails

**Cause:** Gemini API key invalid or quota exceeded.

**Fix:**
1. Verify the API key is correct
2. Check quota at https://ai.google.dev/
3. If using Google Cloud, check billing is enabled
4. Try with fewer photos first (1-2 photos)

### "Request failed with status 403"

**Cause:** API not enabled in Google Cloud or billing issue.

**Fix:**
1. Enable the specific API in Google Cloud Console
2. Set up billing (required for Places API)
3. Check API key restrictions aren't too strict
4. Wait 5-10 minutes after making changes

## Cost Estimates

### Development/Testing (Low Volume)
- **Gemini Photo Analysis:** ~$0.001 per photo
- **Places Autocomplete:** ~$0.017 per session
- **Typical listing:** 10 photos = ~$0.03 total
- **Monthly (50 listings):** ~$1.50

### Production (Medium Volume)
- **500 listings/month:** ~$15/month
- **Autocomplete queries:** Usually free (within $200 credit)
- **Total estimated:** $15-25/month

### High Volume (1000+ listings/month)
- **1000 listings/month:** ~$30/month
- Consider bulk processing optimizations
- Monitor usage in Google Cloud Console

## API Key Security

### Development
```bash
# .env.local (never commit this file)
GOOGLE_AI_STUDIO_API_KEY=your_key_here
GOOGLE_PLACES_API_KEY=your_key_here
```

### Production
1. Use environment variables in your hosting platform
2. Restrict API keys in Google Cloud Console
3. Set up usage alerts to prevent unexpected charges
4. Use separate keys for dev/staging/production

## Alternative: Skip Autocomplete (Temporary)

If you want to test photo analysis without setting up Places API:

1. Comment out the address input autocomplete feature temporarily
2. Allow manual address entry
3. Use geocoding endpoint only (simpler, no autocomplete)
4. Focus on testing the AI photo analysis first

The system is designed to work even if Places API fails - it will just require manual address entry.

## Support

If you encounter issues:
1. Check Convex logs (`npx convex dev` terminal)
2. Check browser console for frontend errors
3. Verify API keys in Google Cloud Console
4. Check API quotas and billing status

## Success Indicators

You'll know everything is working when:
- ✅ Address autocomplete shows suggestions as you type
- ✅ Photos upload successfully
- ✅ AI analysis completes in 30-60 seconds
- ✅ Property details are auto-filled
- ✅ Features are detected from photos
- ✅ Description is generated
- ✅ You can publish the listing

## Next Steps

Once setup is complete:
1. Test with real property photos
2. Adjust AI prompts if needed (in `convex/gemini.ts`)
3. Fine-tune feature detection
4. Customize description generation tone
5. Monitor API usage and costs
6. Consider caching strategies for production

Happy listing! 🏡✨
