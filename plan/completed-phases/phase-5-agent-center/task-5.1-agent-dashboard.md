# Task 5.1: Agent Control Center Dashboard

**Phase:** 5 - Frontend - Agent Control Center  
**Estimated Time:** 8-10 hours  
**Priority:** High  
**Dependencies:** All previous backend tasks

## Overview
Build the agent control center where real estate agents can manage multiple listings, buyer/seller sessions, and monitor AI agent activity.

## Subtasks

### 5.1.1 Create Agent Dashboard Routes

**File:** `app/dashboard/agent/page.tsx`

- [ ] Extend existing dashboard layout
- [ ] Create agent overview page:
  ```typescript
  import { auth } from "@clerk/nextjs/server";
  import { api } from "@/convex/_generated/api";
  import { fetchQuery } from "convex/nextjs";
  import AgentStats from "@/components/dashboard/agent-stats";
  import ActiveSessions from "@/components/dashboard/active-sessions";
  
  export default async function AgentDashboard() {
    const { userId } = await auth();
    
    const agent = await fetchQuery(api.agents.getAgentByUserId, {
      userId: userId!,
    });
    
    if (!agent) {
      // Redirect to agent setup
    }
    
    const listings = await fetchQuery(api.listings.getListingsByAgent, {
      agentId: agent._id,
    });
    
    const buyerSessions = await fetchQuery(api.buyerSessions.getByAgent, {
      agentId: agent._id,
    });
    
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Agent Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your listings and client sessions
          </p>
        </div>
        
        <AgentStats agent={agent} listings={listings} sessions={buyerSessions} />
        <ActiveSessions agentId={agent._id} />
      </div>
    );
  }
  ```

### 5.1.2 Create Listings Management Page

**File:** `app/dashboard/listings/page.tsx`

- [ ] Create listings table with filters:
  ```typescript
  import ListingsTable from "@/components/dashboard/listings-table";
  import { Button } from "@/components/ui/button";
  import { Plus } from "lucide-react";
  import Link from "next/link";
  
  export default async function ListingsPage() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Listings</h2>
          <Link href="/dashboard/listings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </Button>
          </Link>
        </div>
        
        <ListingsTable />
      </div>
    );
  }
  ```

### 5.1.3 Create Listing Editor

**File:** `app/dashboard/listings/[listingId]/edit/page.tsx`

- [ ] Create comprehensive listing editor
- [ ] Image upload functionality
- [ ] Video upload
- [ ] Feature selection
- [ ] Auto-save draft functionality

### 5.1.4 Create Buyer Sessions Management

**File:** `app/dashboard/buyers/page.tsx`

- [ ] List all buyer sessions
- [ ] Show engagement scores
- [ ] Quick actions (send properties, message)
- [ ] Create new buyer session

### 5.1.5 Create Session Invite Generator

**File:** `components/dashboard/invite-generator.tsx`

- [ ] Generate unique session codes:
  ```typescript
  'use client';
  
  import { useState } from 'react';
  import { useMutation } from 'convex/react';
  import { api } from '@/convex/_generated/api';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Copy, Mail } from 'lucide-react';
  
  export default function InviteGenerator({ agentId, type }: { agentId: string; type: 'buyer' | 'seller' }) {
    const [email, setEmail] = useState('');
    const [sessionCode, setSessionCode] = useState('');
    const createSession = useMutation(
      type === 'buyer' 
        ? api.buyerSessions.createBuyerSession 
        : api.sellerSessions.createSellerSession
    );
    
    const handleGenerate = async () => {
      const result = await createSession({
        agentId,
        email,
        // other required fields
      });
      setSessionCode(result.sessionCode);
    };
    
    return (
      <div className="space-y-4">
        <div>
          <Label>Client Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <Button onClick={handleGenerate}>Generate Invite</Button>
        
        {sessionCode && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm mb-2">Share this link with your client:</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/${type}/${sessionCode}`}
              />
              <Button size="icon" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  ```

### 5.1.6 Create Bulk Operations

- [ ] Bulk listing updates
- [ ] Mass email to buyers
- [ ] Bulk session management

### 5.1.7 Create Agent Profile Settings

**File:** `app/dashboard/settings/profile/page.tsx`

- [ ] Edit agency info
- [ ] Upload profile photo
- [ ] Update license number
- [ ] Manage invite code

### 5.1.8 Create Analytics Summary

**File:** `components/dashboard/agent-stats.tsx`

- [ ] Total listings overview
- [ ] Active sessions count
- [ ] Total offers received
- [ ] Overall engagement metrics

### 5.1.9 Create Quick Actions Panel

- [ ] Recent activity feed
- [ ] Pending tasks
- [ ] Notifications
- [ ] Quick links

### 5.1.10 Create Agent Reports

- [ ] Monthly performance report
- [ ] Listing performance breakdown
- [ ] Client engagement report
- [ ] Export capabilities

## Acceptance Criteria
- [ ] Dashboard displays all key metrics
- [ ] Listings CRUD functional
- [ ] Session management works
- [ ] Invite generation functional
- [ ] Reports accurate
- [ ] Mobile responsive

## Testing Checklist
- [ ] Test with multiple listings
- [ ] Test session creation flow
- [ ] Test invite generation
- [ ] Test bulk operations
- [ ] Test reports accuracy
- [ ] Test permissions

## Next Steps
Proceed to Task 5.2: AI Monitoring & Control
