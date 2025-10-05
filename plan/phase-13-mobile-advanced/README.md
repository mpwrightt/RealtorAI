# Phase 13: Mobile App (Solo Agent Focus)

**Priority:** MEDIUM (Actually Important!)  
**Timeline:** 3-4 weeks  
**Dependencies:** Phase 1-12 (completed)

## 🎯 For Solo Agents
**Mobile is CRITICAL** for solo agents who work on-the-go. This should be MEDIUM priority, not LOW.

## Overview
Simple mobile app (iOS/Android) with push notifications. **Removed:** AR, video messaging, offline mode, voice commands (all nice-to-have but not critical).

## Features Summary (Revised for Solo Agents)

### 1. Mobile App (iOS + Android) - **CRITICAL**
**Priority:** HIGH | **Effort:** Large (3-4 weeks)
- React Native (one codebase for both platforms)
- Core features only:
  - Property search
  - View listings
  - AI chat
  - Favorites
  - Push notifications
  - Quick photo upload for new listings
- Biometric login (Face ID / fingerprint)
- ~~Offline mode~~ (removed - just need internet)
- ~~Complex camera features~~ (removed - use phone camera)

**Why This Matters:** Solo agents live on their phones. This is a MUST HAVE.

### 2. Push Notifications - **CRITICAL (Part of Mobile App)**
**Priority:** HIGH | **Included in mobile app**
- New offer notification
- New message notification  
- Tour reminder (1 hour before)
- "Property you favorited dropped price"
- Simple on/off toggles per type

### 3-6. Everything Else - **REMOVE**
❌ **Video Messaging** - Use Loom or phone video. Not worth building.
❌ **AR Visualization** - Cool but nobody uses it. Gimmick.
❌ **Offline Mode** - Agents always have internet. Not worth the complexity.
❌ **Voice Commands** - Typing is faster. Gimmick.

**Philosophy:** Build a GREAT mobile app with core features. Skip the gimmicks.

## Technical Stack

### Mobile
- React Native or Flutter
- Expo for rapid development
- Native modules for camera/AR

### AR
- ARKit (iOS)
- ARCore (Android)
- React Native ARKit/ARCore libraries

### Voice
- Web Speech API
- iOS Speech Framework
- Android Speech Recognition

### Push Notifications
- Firebase Cloud Messaging (FCM)
- Apple Push Notification Service (APNS)

## Database Changes
```typescript
mobileDevices: {
  userId: v.id("users"),
  deviceId: v.string(),
  platform: v.union(v.literal("ios"), v.literal("android")),
  pushToken: v.string(),
  lastActive: v.number(),
}

videoMessages: {
  senderId: v.id("users"),
  recipientId: v.string(),
  videoUrl: v.string(),
  thumbnail: v.string(),
  duration: v.number(),
  transcript: v.optional(v.string()),
  watched: v.boolean(),
  createdAt: v.number(),
}

offlineCache: {
  userId: v.id("users"),
  listingId: v.id("listings"),
  cachedData: v.string(), // JSON
  cachedAt: v.number(),
  expiresAt: v.number(),
}
```

## Success Metrics
- 10,000+ mobile app downloads in first 3 months
- 60%+ mobile user retention rate
- 20%+ users try AR features
- 80%+ opt-in to push notifications
- 15%+ use voice commands

## Rollout
Week 1-2: Mobile app development (core features)  
Week 3: Video messaging  
Week 4: AR features  
Week 5: Push notifications + Offline mode  
Week 6: Voice commands + Polish

## App Store Requirements
- Privacy policy
- Terms of service
- App screenshots
- App description
- Keywords for SEO
- App preview videos
- Age rating
- Content ratings

## Notes
- Mobile development requires separate skillset
- AR features require newer devices
- Voice commands need fallback to text
- Offline mode has storage limitations
- App store approval can take 1-2 weeks
- Consider cross-platform framework to save time
