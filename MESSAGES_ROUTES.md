# Messages Routes - Quick Reference

## New Routes Added

### Buyer Portal Messages
```
/buyer/[sessionCode]/messages
```
**Features:**
- Real-time chat with agent
- Send messages to agent
- View conversation history
- Configure email/SMS notifications
- Auto-scrolling message feed
- Keyboard shortcuts (Cmd/Ctrl+Enter to send)

### Seller Portal Messages
```
/seller/[sessionCode]/messages
```
**Features:**
- Real-time chat with agent
- Send messages to agent
- View conversation history
- Configure email/SMS notifications
- Auto-scrolling message feed
- Keyboard shortcuts (Cmd/Ctrl+Enter to send)

### Existing Agent Dashboard Messages
```
/dashboard/messages
```
**Features:**
- Unified inbox for all clients (buyers and sellers)
- View conversations grouped by client
- Send SMS or email replies
- Mark conversations as read
- See unread message count

## Navigation Examples

### For Buyers
If a buyer has session code: `abc123xyz456`
- Access messages at: `http://localhost:3000/buyer/abc123xyz456/messages`

### For Sellers
If a seller has session code: `def789uvw012`
- Access messages at: `http://localhost:3000/seller/def789uvw012/messages`

## Testing Flow

### Test Buyer → Agent Communication
1. Create a buyer session from agent dashboard
2. Copy the buyer's session code
3. Navigate to `/buyer/[sessionCode]/messages`
4. Send a message as the buyer
5. Go to `/dashboard/messages` as the agent
6. See the buyer's message in the inbox
7. Reply as the agent
8. Refresh the buyer's messages page
9. See the agent's reply

### Test Seller → Agent Communication
1. Create a seller session from agent dashboard
2. Copy the seller's session code
3. Navigate to `/seller/[sessionCode]/messages`
4. Send a message as the seller
5. Go to `/dashboard/messages` as the agent
6. See the seller's message in the inbox
7. Reply as the agent
8. Refresh the seller's messages page
9. See the agent's reply

### Test Notification Settings
1. As buyer/seller, go to messages page
2. Toggle notification preferences in the side panel
3. Click "Save Notification Preferences"
4. Refresh the page
5. Verify settings are persisted

## API Endpoints (Convex Functions)

### Queries
- `api.messages.getBuyerMessages` - Get all messages for a buyer session
- `api.messages.getSellerMessages` - Get all messages for a seller session
- `api.messages.getMessagesByAgent` - Get all messages for an agent
- `api.messages.getConversation` - Get conversation between agent and specific client
- `api.messages.getUnreadCount` - Get unread message count for agent

### Mutations
- `api.messages.sendBuyerMessage` - Buyer sends message to agent
- `api.messages.sendSellerMessage` - Seller sends message to agent
- `api.messages.sendMessage` - Agent sends message to client (existing)
- `api.messages.markAsRead` - Mark message as read
- `api.messages.markConversationAsRead` - Mark all messages in conversation as read
- `api.buyerSessions.updateNotificationPreferences` - Update buyer notification settings
- `api.sellerSessions.updateNotificationPreferences` - Update seller notification settings

## Component Architecture

```
┌─────────────────────────────────────┐
│  Buyer/Seller Portal Messages Page  │
│  (Server Component)                  │
│  - Validates session                 │
│  - Fetches agent data                │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Messages Client Component           │
│  (Client Component)                  │
│  - Real-time message subscription    │
│  - Send message mutation             │
│  - Auto-scroll functionality         │
└───────────────┬─────────────────────┘
                │
      ┌─────────┴──────────┐
      ▼                    ▼
┌──────────────┐  ┌──────────────────┐
│ Chat UI      │  │ Notification     │
│ - Messages   │  │ Settings Card    │
│ - Input      │  │ - Email toggle   │
│ - Send btn   │  │ - SMS toggle     │
└──────────────┘  │ - Save button    │
                  └──────────────────┘
```

## Database Schema Changes

### buyerSessions Table
```typescript
{
  // ... existing fields
  notificationPreferences: {
    emailNotifications: boolean,
    smsNotifications: boolean
  }
}
```

### sellerSessions Table
```typescript
{
  // ... existing fields
  notificationPreferences: {
    emailNotifications: boolean,
    smsNotifications: boolean
  }
}
```

## Message Types in Database

Messages are stored with:
- `type`: "chat" (for portal messages) or "sms"/"email" (for agent messages)
- `direction`: "inbound" (client → agent) or "outbound" (agent → client)
- `clientType`: "buyer" or "seller"
- `clientId`: The session ID (buyerSession or sellerSession ID)
- `agentId`: The agent's ID
- `body`: Message text
- `read`: Boolean flag
- `createdAt`: Timestamp

## Next Steps for Full Implementation

1. **Add Navigation Links**
   - Add "Messages" link to buyer portal sidebar/nav
   - Add "Messages" link to seller portal sidebar/nav
   - Show unread count badge on navigation items

2. **Implement Notification Services**
   - Set up SendGrid or AWS SES for email notifications
   - Set up Twilio for SMS notifications
   - Create notification templates
   - Trigger notifications when `notificationPreferences` are enabled

3. **Enhance UX**
   - Add typing indicators
   - Add read receipts
   - Add message search
   - Add file attachments
   - Add push notifications

4. **Testing**
   - Manual testing with real sessions
   - Automated E2E tests with Playwright
   - Load testing for concurrent users

## Troubleshooting

### Messages not appearing?
- Check that Convex dev server is running: `npx convex dev`
- Verify session is valid and active
- Check browser console for errors
- Ensure you're looking at the correct session code

### Notification settings not saving?
- Check browser console for mutation errors
- Verify session ID is correct
- Ensure user has email/phone in their session data

### Build errors?
- Run `npm run build` to check for TypeScript errors
- Ensure all dependencies are installed: `npm install`
- Clear `.next` cache: `rm -rf .next`
