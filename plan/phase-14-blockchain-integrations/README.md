# Phase 14: Service Integrations (Solo Agent Focus)

**Priority:** LOW  
**Timeline:** 2 weeks  
**Dependencies:** Phase 1-13 (completed)

## 🎯 For Solo Agents
**Skip blockchain entirely.** Focus on useful service integrations that provide referral revenue.

## Overview
Partner integrations for inspection, insurance, and moving services. **Removed:** All blockchain features (too complex, zero value for solo agents).

## Features Summary (Revised - NO BLOCKCHAIN)

### 1-2. Blockchain Features - **REMOVE ALL**
❌ **Blockchain Offer Verification** - Way too complex. Solo agents don't need this.
❌ **Smart Contracts** - Lawyers handle escrow. This adds zero value.

**Why Remove:** Blockchain is enterprise tech theater. Adds complexity, costs gas fees, provides ZERO benefit to solo agents or their clients.

### 3. Inspection Referrals - **KEEP (Simplified)**
**Priority:** Medium | **Effort:** Small (2 days)
- List of 3-5 vetted local inspectors
- Click to call or email
- **Referral fee tracking** (agent gets $50-100 per referral)
- ~~Complex scheduling system~~ (removed - just call them)
- ~~Upload reports~~ (removed - inspector emails it)

**Revenue Opportunity:** $500-1000/year in referral fees

### 4. Appraisal - **REMOVE**
**Reason:** Lenders order appraisals. Agents don't need to be involved.

### 5. Insurance Referrals - **KEEP (Simplified)**
**Priority:** Medium | **Effort:** Small (2 days)
- Partner with 1-2 insurance brokers
- "Get a quote" button → sends lead to partner
- **Referral fee:** $25-50 per closed policy
- ~~Complex quote comparison~~ (removed - broker handles it)

**Revenue Opportunity:** $250-500/year

### 6. Utility Setup - **REMOVE**
**Reason:** Buyers Google "electric company near me". Not worth building.

### 7. Moving Company Referrals - **KEEP (Simplified)**
**Priority:** Low | **Effort:** Tiny (1 day)
- List of 2-3 vetted movers
- Click to call
- Optional: **Referral fee** if mover pays
- ~~Complex booking system~~ (removed - just call)

**Revenue Opportunity:** $100-200/year

**Total Referral Revenue:** $850-1700/year (passive income for agent!)

## Technical Requirements

### Blockchain
```bash
npm install ethers
npm install @openzeppelin/contracts
npm install ipfs-http-client
```

### Web3 Wallet
- MetaMask integration
- WalletConnect support
- Wallet creation for non-crypto users

### Smart Contracts (Solidity)
```solidity
contract PropertyOffer {
  address public buyer;
  address public seller;
  uint256 public offerAmount;
  uint256 public earnestMoney;
  bool public accepted;
  
  function submitOffer() public payable { }
  function acceptOffer() public { }
  function releaseEarnest() public { }
}
```

## Database Changes
```typescript
blockchainOffers: {
  offerId: v.id("offers"),
  transactionHash: v.string(),
  blockNumber: v.number(),
  contractAddress: v.optional(v.string()),
  ipfsHash: v.optional(v.string()),
  verificationUrl: v.string(),
  createdAt: v.number(),
}

serviceBookings: {
  userId: v.id("users"),
  listingId: v.id("listings"),
  serviceType: v.union(
    v.literal("inspection"),
    v.literal("appraisal"),
    v.literal("insurance"),
    v.literal("utilities"),
    v.literal("moving")
  ),
  provider: v.string(),
  status: v.string(),
  scheduledDate: v.optional(v.number()),
  cost: v.optional(v.number()),
  bookingReference: v.string(),
  createdAt: v.number(),
}
```

## API Integrations

Each service needs:
- OAuth or API key setup
- Webhook handlers for status updates
- Error handling and fallbacks
- Rate limiting considerations

## Success Metrics
- 5%+ users verify offers on blockchain
- 30%+ book inspection through platform
- 25%+ get appraisals via integration
- 40%+ request insurance quotes
- 20%+ use utility setup service
- 15%+ book movers through platform

## Rollout
Week 1-2: Blockchain infrastructure + Smart contracts  
Week 3: Inspection + Appraisal integrations  
Week 4: Insurance integration  
Week 5: Utility + Moving integrations  
Week 6: Testing + Documentation

## Legal/Compliance
- Smart contracts need legal review
- Blockchain offers must be legally binding
- Service partner agreements required
- Insurance licensing considerations
- Data sharing agreements with partners
- RESPA compliance for service recommendations

## Notes
- Blockchain features are opt-in
- Gas fees for Ethereum transactions
- Consider L2 solutions (Polygon) for lower costs
- Service integrations need revenue share agreements
- Not all users will have crypto wallets
- Provide education on blockchain benefits
- Have non-blockchain backup workflow
