# 🏡 RealtorAI - AI-Powered Real Estate Platform

> **Empowering solo real estate agents with enterprise-level tools through AI**

A modern, full-stack real estate platform that enables agents to create personalized buyer and seller portals with AI-powered property analysis, marketing generation, and intelligent client management.

[![Built with Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Powered by Convex](https://img.shields.io/badge/Convex-Real--time-orange)](https://convex.dev/)
[![AI by OpenRouter](https://img.shields.io/badge/AI-Claude%203.5-purple)](https://openrouter.ai/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## 🌟 What Makes RealtorAI Special

RealtorAI levels the playing field for **solo real estate agents** by providing AI-powered tools that were previously only available to large brokerages:

- 🤖 **AI Marketing Generator** - Create professional listing descriptions, social media posts, and email campaigns in seconds
- 💬 **Smart Messaging Hub** - Real-time communication between agents, buyers, and sellers with notification preferences
- 📊 **Client CRM** - Track leads, pre-qualifications, and deal pipelines
- 🏠 **Personalized Buyer Portals** - Session-based access for property searches, favorites, tours, and offers
- 📈 **Seller Analytics** - Real-time engagement tracking and AI-powered insights
- ⚡ **Zero Login Required** - Buyers and sellers access via secure session codes

**Time Savings:** Our AI Marketing Generator alone saves agents **40+ hours per year** on content creation.

---

## 🚀 Key Features

### For Agents 👔

<table>
<tr>
<td width="50%">

**Client Management**
- 📋 Lead tracking with priorities (🔥💨❄️)
- 💰 Commission calculator
- 📧 Message inbox (buyers & sellers)
- 📊 Dashboard analytics

</td>
<td width="50%">

**AI Tools**
- ✨ Marketing content generator
- 🏘️ Neighborhood analysis
- 💡 Property insights
- 📝 Automated workflows

</td>
</tr>
</table>

### For Buyers 🏡

<table>
<tr>
<td width="50%">

**Property Discovery**
- 🔍 Advanced search & filters
- ⭐ Favorites & comparisons
- 🔔 Custom price alerts
- 🗺️ Interactive maps

</td>
<td width="50%">

**Decision Support**
- 💰 Mortgage calculator
- 🏘️ AI neighborhood summaries
- 💳 Pre-qualification tracking
- 📅 Tour scheduling

</td>
</tr>
</table>

### For Sellers 💼

<table>
<tr>
<td width="50%">

**Marketing Tools**
- ✨ AI-generated listings
- 📱 Social media posts (FB, IG, Twitter)
- 📧 Email templates
- #️⃣ Smart hashtags

</td>
<td width="50%">

**Performance Tracking**
- 📊 Real-time analytics
- 👀 View/engagement metrics
- 📥 Offer management
- 📈 Market insights

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router, React Server Components)
- **Styling:** TailwindCSS v4 + shadcn/ui components
- **Auth:** Clerk (agents) + Session-based (buyers/sellers)
- **Real-time:** Convex subscriptions

### Backend
- **Database:** Convex (serverless, real-time)
- **AI:** OpenRouter (Claude 3.5 Sonnet)
- **Functions:** Convex mutations, queries, actions
- **API Integration:** RapidAPI (property data)

### AI & Communication
- **OpenRouter:** Marketing generation, property analysis, neighborhood insights
- **AG-UI Protocol:** Transparent AI tool usage tracking
- **Real-time Messaging:** Convex-powered chat with email/SMS notifications

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm/pnpm installed
- **Convex account** (free tier available)
- **Clerk account** for agent authentication
- **OpenRouter API key** for AI features
- **RapidAPI key** for property data (optional)

---

## ⚡ Quick Start

### 1️⃣ Clone & Install

```bash
git clone https://github.com/mpwrightt/RealtorAI.git
cd RealtorAI
npm install
```

### 2️⃣ Set Up Environment Variables

Create `.env.local`:

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment-url
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Clerk (Agent Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# OpenRouter (AI)
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=RealtorAI

# RapidAPI (Property Data - Optional)
RAPIDAPI_KEY=your-rapidapi-key
```

<details>
<summary>📖 <b>How to get API keys</b></summary>

**Convex:**
1. Visit [convex.dev](https://convex.dev)
2. Create a new project
3. Copy deployment URL from dashboard

**Clerk:**
1. Go to [clerk.com](https://clerk.com)
2. Create application
3. Copy publishable and secret keys

**OpenRouter:**
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to Keys section
3. Create new API key (starts with `sk-or-v1-`)

**RapidAPI** (optional):
1. Visit [rapidapi.com](https://rapidapi.com)
2. Subscribe to RealEstateAPI
3. Copy API key from dashboard

</details>

### 3️⃣ Initialize Convex

```bash
# Install Convex CLI
npm install -g convex

# Initialize and deploy
npx convex dev
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 Project Structure

```
RealtorAI/
├── app/                          # Next.js 15 App Router
│   ├── api/                     # API routes (AG-UI streaming)
│   ├── buyer/[sessionCode]/     # 🏡 Buyer portal (no login)
│   │   ├── properties/          # Search, details, offers
│   │   ├── favorites/           # Saved properties
│   │   ├── compare/             # Side-by-side comparison
│   │   ├── tours/               # Tour scheduling
│   │   ├── alerts/              # Price alerts
│   │   └── messages/            # Chat with agent
│   ├── seller/[sessionCode]/    # 💼 Seller portal (no login)
│   │   ├── marketing/           # ✨ AI Marketing Generator
│   │   ├── analytics/           # 📊 Performance metrics
│   │   ├── offers/              # 📥 Offer management
│   │   └── messages/            # Chat with agent
│   └── dashboard/               # 👔 Agent dashboard (Clerk auth)
│       ├── buyers/              # Buyer session management
│       ├── sellers/             # Seller session management
│       ├── clients/             # CRM & lead tracking
│       ├── listings/            # Property management
│       └── messages/            # Message inbox
├── components/                   # React components
│   ├── buyer/                   # Buyer-specific components
│   ├── seller/                  # Seller-specific components
│   ├── dashboard/               # Agent dashboard components
│   ├── ag-ui/                   # AG-UI protocol components
│   └── ui/                      # shadcn/ui components
├── convex/                       # Convex backend
│   ├── schema.ts                # Database schema
│   ├── buyerSessions.ts         # Buyer session functions
│   ├── sellerSessions.ts        # Seller session functions
│   ├── listings.ts              # Property CRUD
│   ├── messages.ts              # Real-time messaging
│   ├── marketing.ts             # AI marketing campaigns
│   ├── favorites.ts             # Favorites & comparisons
│   ├── tours.ts                 # Tour scheduling
│   ├── offers.ts                # Offer management
│   ├── alerts.ts                # Price alerts
│   └── leads.ts                 # CRM functions
├── lib/                          # Utilities
│   ├── openrouter/              # AI service layer
│   │   ├── client.ts            # OpenRouter client
│   │   └── marketing-generator.ts # Marketing AI
│   └── buyer-auth.ts            # Session verification
├── hooks/                        # React hooks
│   ├── use-ag-ui-stream.ts      # AG-UI streaming
│   └── use-toast.ts             # Toast notifications
└── plan/                         # Implementation docs
    ├── phase-7-buyer-journey/
    ├── phase-8-seller-experience/
    ├── phase-9-agent-tools/
    ├── phase-10-enhanced-buyer/
    └── phase-11-enhanced-seller/
```

---

## 🎯 Core Workflows

### Creating a Buyer Portal

```typescript
// Agent creates buyer session
const session = await createBuyerSession({
  buyerName: "John Doe",
  email: "john@example.com",
  phone: "(555) 123-4567",
  budget: 500000,
  preferences: {
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "single-family"
  }
});

// Share URL: /buyer/ABC123
// Buyer accesses without login
```

### Generating AI Marketing

```typescript
// Seller clicks "Generate Marketing"
const campaign = await generateMarketing({
  listingId: "123"
});

// Returns:
// - Listing description (150-200 words)
// - Facebook post
// - Instagram caption
// - Twitter post
// - Email template
// - Hashtags

// One-click copy to clipboard
```

### Real-time Messaging

```typescript
// Buyer sends message
await sendBuyerMessage({
  buyerSessionId: "abc123",
  content: "When can I schedule a tour?"
});

// Agent receives in real-time inbox
// Notifications sent via email/SMS (if enabled)
```

---

## 🤖 AI Features

### 1. Marketing Content Generator

**Input:** Property details (address, price, features, photos)

**Output:**
- ✍️ Professional listing description
- 📱 Social media posts (Facebook, Instagram, Twitter)
- 📧 Email campaign template
- #️⃣ Optimized hashtags

**Time Saved:** ~2 hours per listing → **15 seconds**

### 2. Neighborhood Analysis

**Input:** Property location

**Output:**
- 🚶 Walk Score with description
- 🏫 School ratings and names
- 🏪 Nearby amenities (coffee, grocery, parks)
- 📝 AI-generated neighborhood summary

### 3. Property Insights (Coming Soon)

- Market value estimation
- Price trend analysis
- Investment potential scoring
- Comparable property recommendations

---

## 📊 Database Schema

<details>
<summary><b>View Convex Schema</b></summary>

```typescript
// Buyer Sessions
buyerSessions: {
  agentId: Id<"agents">,
  buyerName: string,
  email: string,
  phone: string,
  sessionCode: string,      // 6-char code
  budget: number,
  preferences: {
    bedrooms: number,
    bathrooms: number,
    propertyType: string,
    location: string
  },
  preQualification: {        // Phase 10
    amount: number,
    lender: string,
    expirationDate: number,
    verified: boolean
  },
  notificationPreferences: {
    email: boolean,
    sms: boolean
  },
  active: boolean,
  createdAt: number
}

// Seller Sessions
sellerSessions: {
  agentId: Id<"agents">,
  sellerName: string,
  listingId: Id<"listings">,
  sessionCode: string,
  notificationPreferences: {
    email: boolean,
    sms: boolean
  },
  active: boolean
}

// Marketing Campaigns (Phase 11)
marketingCampaigns: {
  listingId: Id<"listings">,
  agentId: Id<"agents">,
  type: string,
  generatedContent: {
    listingDescription: string,
    socialMediaPosts: {
      facebook: string,
      instagram: string,
      twitter: string
    },
    emailTemplate: string,
    hashtags: string[]
  },
  status: string,
  createdAt: number
}

// Messages
messages: {
  agentId: Id<"agents">,
  clientId: Id<"buyerSessions" | "sellerSessions">,
  clientType: "buyer" | "seller",
  content: string,
  direction: "inbound" | "outbound",
  read: boolean,
  timestamp: number
}

// + listings, favorites, tours, offers, alerts, leads
```

</details>

---

## 🎨 UI Components

Built with **shadcn/ui** for beautiful, accessible components:

- ✅ Forms & inputs
- 📊 Charts & analytics
- 💬 Chat interfaces
- 🗂️ Tables & data grids
- 🎯 Modals & dialogs
- 🍞 Toast notifications
- 📱 Mobile-responsive

---

## 🔐 Security & Authentication

### Agent Authentication (Clerk)
- Secure login/signup
- Session management
- Role-based access control
- Multi-factor authentication support

### Buyer/Seller Access (Session-based)
- No login required
- Secure 6-character session codes
- Server-side verification
- Automatic expiration
- No password management

### Data Protection
- Environment variable encryption
- API key security
- Server-side validation
- Input sanitization

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (this repo)

2. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Set Environment Variables** in Vercel dashboard

4. **Deploy Convex:**
   ```bash
   npx convex deploy
   ```

5. **Visit your live site!** 🎉

### Environment Setup Checklist

- [ ] Convex deployment URL configured
- [ ] Clerk keys added
- [ ] OpenRouter API key set
- [ ] RapidAPI key configured (if using)
- [ ] Site URL updated for production
- [ ] Webhook endpoints configured (if needed)

---

## 📈 Roadmap

### ✅ Completed (Phases 1-11)
- [x] Core agent dashboard
- [x] Buyer portal with property search
- [x] Seller portal with analytics
- [x] Real-time messaging system
- [x] AI Marketing Generator
- [x] Pre-qualification tracking
- [x] Neighborhood analysis
- [x] Client CRM

### 🚧 In Progress (Phase 12)
- [ ] SMS campaigns (Twilio integration)
- [ ] Enhanced commission tracking
- [ ] Deal pipeline automation
- [ ] Email drip campaigns

### 🔮 Future (Phase 13+)
- [ ] Mobile app (React Native)
- [ ] Virtual tour integration
- [ ] E-signature for offers
- [ ] MLS integration
- [ ] Market reports generator
- [ ] Open house management
- [ ] Virtual staging

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💡 Need Help?

- 📖 **Documentation:** Check `/plan` folder for detailed guides
- 💬 **Issues:** [GitHub Issues](https://github.com/mpwrightt/RealtorAI/issues)
- 📧 **Email:** [Your contact email]
- 🐦 **Twitter:** [@YourHandle]

---

## 🙏 Acknowledgments

- **Convex** for the amazing real-time backend
- **Clerk** for seamless authentication
- **OpenRouter** for AI infrastructure
- **shadcn/ui** for beautiful components
- **Vercel** for deployment platform

---

## ⭐ Show Your Support

If RealtorAI helps your real estate business, please:

1. ⭐ **Star this repository**
2. 🐦 **Share on social media**
3. 📝 **Write about your experience**
4. 🤝 **Contribute improvements**

---

<div align="center">

**Built with ❤️ for real estate agents who want to work smarter, not harder**

[Demo](https://realtora.ai) • [Documentation](./plan) • [Roadmap](#-roadmap) • [Support](#-need-help)

</div>
