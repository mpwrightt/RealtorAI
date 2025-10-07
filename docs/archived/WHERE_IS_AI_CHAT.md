# 🤖 Where is the AI Chat? - Complete Guide

## Quick Answer

The AI chat is on **Property Detail Pages** in the **Buyer Portal**.

---

## 📍 Exact Location

### Visual Path:

```
1. Buyer Portal → 2. Click Property → 3. AI Chat (bottom-right)
```

### Step-by-Step:

```
Dashboard (/dashboard)
    ↓
Generate Demo Data (/dashboard/demo)
    ↓
Get Buyer Session Code (e.g., "AfoCS0gqh648kjUx")
    ↓
Open Buyer Portal (/buyer/AfoCS0gqh648kjUx)
    ↓
Browse Properties (you'll see property cards)
    ↓
Click "View Details" on any property
    ↓
🎉 AI CHAT APPEARS (floating button, bottom-right corner)
```

---

## 🎯 How to Test Right Now:

### Option A: Use Demo Data (Fastest)

1. **Login to Dashboard**
   ```
   Go to: /dashboard
   Login with: mawrigh602@gmail.com
   ```

2. **Generate Demo Data**
   ```
   Click: "Demo Mode" in sidebar
   Click: "Generate Demo Data" button
   Wait: 3-5 seconds
   ```

3. **Open Buyer Session**
   ```
   Look for: "Buyer Session Links" section
   Click: 🔗 External link icon next to "Buyer #1"
   Opens in new tab → /buyer/{sessionCode}
   ```

4. **Browse Properties**
   ```
   You'll see: Grid of property cards
   Each card shows: Photo, address, price, beds/baths
   ```

5. **Open Property Details**
   ```
   Click: Any property card (or "View Details" button)
   Goes to: /buyer/{sessionCode}/properties/{listingId}
   ```

6. **Find AI Chat**
   ```
   Look at: BOTTOM-RIGHT CORNER of screen
   You'll see: Floating circular button (chat icon)
   Label: "AI Assistant" or chat bubble icon
   ```

7. **Start Chatting!**
   ```
   Click: The chat button
   Chat opens: Right side panel
   Type: "What are comparable properties nearby?"
   Watch: AI streams response with tool calls!
   ```

---

## 🗺️ Page Structure

When you're on a property detail page, you'll see:

```
┌─────────────────────────────────────────────────┐
│ Header: Property Address, Price, Save Button   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Photo Gallery (main images)                    │
│                                                 │
├─────────────────────────────────────────────────┤
│  Property Details (beds, baths, sqft, etc.)     │
├─────────────────────────────────────────────────┤
│  Neighborhood Insights                          │
├─────────────────────────────────────────────────┤
│  Mortgage Calculator                            │
└─────────────────────────────────────────────────┘
                                        ┌──────┐
                                        │  💬  │ ← AI Chat Button
                                        │      │   (bottom-right)
                                        └──────┘
```

---

## 💬 What the AI Chat Looks Like

### Before Opening:
- Floating circular button
- Bottom-right corner of page
- Chat bubble icon
- May have a badge or notification dot

### After Opening:
- Slides in from right side
- Takes up ~30% of screen width
- Shows conversation history
- Input box at bottom
- "Send" button

### While AI is Responding:
- Shows typing indicator
- Tool calls appear as expandable cards
- Each tool shows:
  - Tool name (e.g., "Calculate Comparables")
  - Progress spinner
  - Expandable result (click to see details)
  - Timestamp
- Final response appears as regular message

---

## 🎤 Example Questions to Ask

### About the Property:
```
"Tell me about this property"
"What's included in the sale?"
"Is this a good deal?"
```

### Market Analysis:
```
"What are comparable properties nearby?"
"What's the market trend in this area?"
"How does this price compare to similar homes?"
```

### Location & Amenities:
```
"What restaurants are nearby?"
"Tell me about schools in the area"
"What's the walk score?"
"What parks are close by?"
```

### Financial:
```
"Calculate my monthly mortgage payment"
"What would my payment be with 20% down?"
"How much do I need for a down payment?"
```

### General Advice:
```
"Should I make an offer on this property?"
"What contingencies should I include?"
"Is this a good neighborhood?"
```

---

## 🔍 What You'll See When Using AI

### Example Interaction:

**You type:**
> "What are comparable properties nearby?"

**AI responds with tools:**

1. **Tool Call: Calculate Comparables** ⏳
   ```
   Searching for similar properties...
   Using RentCast API
   ```

2. **Tool Result:** ✅
   ```
   Found 8 comparable properties:
   
   1. 123 Main St - $1.2M (sold 2024-01-15)
      3 bed, 2 bath, 1,800 sqft
   
   2. 456 Oak Ave - $1.35M (sold 2024-02-01)
      3 bed, 2.5 bath, 2,000 sqft
   
   ... (click to expand)
   ```

3. **AI Analysis:**
   ```
   Based on the comparable properties, this home is 
   priced competitively. The average price per square 
   foot in the area is $675, and this property is at 
   $667/sqft, which is slightly below market average.
   
   Recent sales show the market is appreciating at 
   about 2-3% monthly, with properties selling in 
   an average of 21 days.
   ```

---

## 🎬 Visual Demo Flow

### Step 1: Dashboard
```
┌──────────────────────────────────┐
│ Agent Dashboard                  │
│                                  │
│ ☰ Dashboard                      │
│ ☰ My Listings                    │
│ ☰ Buyers                         │
│ ☰ Sellers                        │
│ ☰ Demo Mode ← CLICK THIS         │
└──────────────────────────────────┘
```

### Step 2: Generate Demo Data
```
┌──────────────────────────────────┐
│ Demo Mode                        │
│                                  │
│ [Generate Demo Data] ← CLICK     │
│                                  │
│ Buyer Session Links:             │
│ Buyer #1: AfoCS0... [📋] [🔗]   │ ← CLICK 🔗
│ Buyer #2: Bh3Dt9... [📋] [🔗]   │
└──────────────────────────────────┘
```

### Step 3: Buyer Portal
```
┌──────────────────────────────────┐
│ Browse Properties                │
│                                  │
│ ┌────────┐ ┌────────┐ ┌────────┐│
│ │ Photo  │ │ Photo  │ │ Photo  ││
│ │$1.2M   │ │$1.8M   │ │$950K   ││ ← CLICK ANY
│ │3BR 2BA │ │4BR 3BA │ │2BR 2BA ││
│ │[View]  │ │[View]  │ │[View]  ││
│ └────────┘ └────────┘ └────────┘│
└──────────────────────────────────┘
```

### Step 4: Property Detail Page
```
┌──────────────────────────────────────┐
│ 2847 Steiner Street - $3.25M        │
├──────────────────────────────────────┤
│ [Photo Gallery]                      │
│                                      │
│ 4 Beds | 3.5 Baths | 2,800 sqft     │
│                                      │
│ [Property Details]                   │
│ [Neighborhood Info]                  │
│ [Mortgage Calculator]                │
└──────────────────────────────────────┘
                              ┌──────┐
                              │  💬  │ ← CLICK HERE!
                              └──────┘
```

### Step 5: Chat Opens
```
┌──────────────────────┬──────────────────┐
│ Property Details     │ AI Assistant     │
│                      │                  │
│ [Gallery]            │ Ask me anything  │
│ [Details]            │ about this prop. │
│ [Calculator]         │                  │
│                      │ ┌──────────────┐ │
│                      │ │ Type here... │ │
│                      │ └──────────────┘ │
└──────────────────────┴──────────────────┘
```

---

## 🚨 Troubleshooting

### "I don't see the chat button"

**Check:**
1. ✅ Are you on a **property detail page**?
   - URL should be: `/buyer/{code}/properties/{id}`
   - NOT just: `/buyer/{code}/properties`

2. ✅ Look at **bottom-right corner**
   - It's a floating button
   - Might be partially off-screen on small monitors
   - Try scrolling down

3. ✅ Check browser console
   - Press F12
   - Look for errors
   - May need to refresh page

### "The chat button is there but doesn't open"

**Try:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Check browser console for JavaScript errors
3. Make sure both servers are running:
   - `npm run dev` (Next.js)
   - `npx convex dev` (Convex)

### "Chat opens but AI doesn't respond"

**Check:**
1. ✅ OpenRouter API key configured?
   - Check `.env.local` for `OPENROUTER_API_KEY`
   - Without it, chat won't work

2. ✅ Look at browser console
   - Should see API calls
   - Check for error messages

3. ✅ Network tab
   - F12 → Network
   - Should see calls to `/api/ag-ui/stream`

---

## 📱 On Mobile

The AI chat works on mobile too!

**Location:**
- Same place: bottom-right corner
- May be smaller button
- Chat opens as full-screen overlay
- Swipe down to close

---

## 🎯 Summary

**To find AI chat:**

1. **Go to:** `/dashboard/demo`
2. **Generate:** Demo data
3. **Open:** Any buyer session link
4. **Click:** Any property card
5. **Look:** Bottom-right corner
6. **Click:** 💬 Chat button
7. **Ask:** "What are comparable properties?"

**The AI chat is ONLY on property detail pages in the buyer portal.**

---

## 💡 Pro Tips

### For Demos:
1. Open 2-3 property pages in different tabs
2. Ask different questions on each
3. Show the tool calling transparency
4. Point out real API data being fetched

### Best Questions to Show:
1. "What are comparables?" - Shows RentCast API
2. "What's nearby?" - Shows Google Places API
3. "Calculate mortgage" - Shows instant math
4. "Market trends?" - Shows real market data

### Impressive Features:
- ✨ Tool calls are transparent (clients see what AI is doing)
- ✨ Real MLS data (not fake responses)
- ✨ Streaming responses (feels conversational)
- ✨ Expandable results (click to see full data)
- ✨ Context-aware (knows which property you're viewing)

---

**Now go try it! The AI is waiting to help analyze properties! 🚀**

Path: `/dashboard/demo` → Generate → Open Session → Click Property → Chat!
