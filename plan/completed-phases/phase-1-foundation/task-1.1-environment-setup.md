# Task 1.1: Environment Setup

**Phase:** 1 - Foundation & Setup  
**Estimated Time:** 2-3 hours  
**Priority:** Critical  
**Dependencies:** None

## Overview
Set up the development environment with OpenRouter integration and all necessary API keys.

## Subtasks

### 1.1.1 Install OpenRouter Dependencies
- [ ] Install OpenAI SDK for OpenRouter compatibility
  ```bash
  npm install openai@^4.75.0
  ```
- [ ] Install AG-UI protocol libraries
  ```bash
  npm install @ag-ui-protocol/react
  ```
- [ ] Install utility libraries
  ```bash
  npm install axios@^1.7.9
  ```
- [ ] Verify installation
  ```bash
  npm list openai @ag-ui-protocol/react axios
  ```

### 1.1.2 Configure Environment Variables

**Create `.env.local` file:**
- [ ] Copy `.env.example` to `.env.local`
  ```bash
  cp .env.example .env.local
  ```

**Add OpenRouter configuration:**
- [ ] Get OpenRouter API key from https://openrouter.ai/keys
- [ ] Add to `.env.local`:
  ```bash
  # OpenRouter Configuration
  OPENROUTER_API_KEY=sk-or-v1-...
  OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
  OPENROUTER_SITE_URL=http://localhost:3000
  OPENROUTER_SITE_NAME=Neighborhood Deal Finder
  ```

**Add external API keys:**
- [ ] Get MLS API access credentials (if available)
  ```bash
  MLS_API_KEY=your_mls_api_key
  MLS_API_URL=https://api.mls-provider.com
  ```
- [ ] Get Mapbox access token from https://account.mapbox.com/
  ```bash
  MAPBOX_ACCESS_TOKEN=pk.eyJ...
  ```
- [ ] Add optional data enrichment APIs:
  ```bash
  WALKSCORE_API_KEY=your_walkscore_key
  GREATSCHOOLS_API_KEY=your_greatschools_key
  ```

### 1.1.3 Configure Convex Environment

**Initialize Convex (if not already done):**
- [ ] Run Convex initialization
  ```bash
  npx convex dev
  ```
- [ ] Note the deployment URL and update `.env.local`

**Add Convex environment variables:**
- [ ] Go to Convex Dashboard → Settings → Environment Variables
- [ ] Add OpenRouter credentials:
  ```bash
  OPENROUTER_API_KEY=sk-or-v1-...
  OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
  ```
- [ ] Add external API keys:
  ```bash
  MLS_API_KEY=your_mls_api_key
  MAPBOX_ACCESS_TOKEN=pk.eyJ...
  ```

### 1.1.4 Verify Existing Clerk Setup

**Check Clerk configuration:**
- [ ] Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- [ ] Verify `CLERK_SECRET_KEY` is set
- [ ] Verify JWT template "convex" exists in Clerk dashboard
- [ ] Verify webhook endpoint is configured

### 1.1.5 Test Environment

**Create test script:**
- [ ] Create `scripts/test-env.ts`:
  ```typescript
  import OpenAI from 'openai';
  
  async function testOpenRouter() {
    const client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    
    const response = await client.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: 'Say hello!' }],
    });
    
    console.log('OpenRouter test successful:', response.choices[0].message.content);
  }
  
  testOpenRouter().catch(console.error);
  ```

- [ ] Run test script:
  ```bash
  npx tsx scripts/test-env.ts
  ```

- [ ] Verify successful response from OpenRouter

## Acceptance Criteria
- [ ] All npm packages installed successfully
- [ ] `.env.local` contains all required variables
- [ ] Convex environment variables configured
- [ ] Test script runs without errors
- [ ] OpenRouter returns successful response

## Troubleshooting

**Issue: OpenRouter API key invalid**
- Verify key starts with `sk-or-v1-`
- Check key has sufficient credits at https://openrouter.ai/credits

**Issue: Convex deployment fails**
- Run `npx convex logout` then `npx convex dev` again
- Verify Node.js version is 18+

**Issue: Module not found errors**
- Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Next Steps
Proceed to Task 1.2: Database Schema Extension
