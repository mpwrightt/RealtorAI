# Task 01: API Key Encryption

**Phase:** 14 - Security & Production Ready  
**Effort:** 8 hours  
**Priority:** 🔥🔥🔥 CRITICAL  
**Dependencies:** None

---

## 🎯 Objective

Encrypt all API keys and sensitive credentials before storing in database. Currently stored in plaintext, which is a security risk.

---

## 📋 Current State

**Problem:**
```typescript
// convex/integrations.ts - Currently stores plaintext
await ctx.db.patch(agentId, {
  integrations: {
    email: {
      apiKey: args.apiKey,  // ⚠️ PLAINTEXT!
      // ...
    }
  }
});
```

**What needs encryption:**
- Email provider API keys (Resend, SendGrid, Mailgun)
- SMS provider credentials (Twilio, MessageBird, Vonage, AWS)
- Zapier webhook URLs (sensitive)
- Any future API keys

---

## 🎯 Target State

**Solution:**
```typescript
// Encrypt before storing
const encryptedKey = await encrypt(args.apiKey, process.env.ENCRYPTION_KEY);

await ctx.db.patch(agentId, {
  integrations: {
    email: {
      apiKey: encryptedKey,  // ✅ ENCRYPTED!
      // ...
    }
  }
});

// Decrypt before using
const decryptedKey = await decrypt(stored.apiKey, process.env.ENCRYPTION_KEY);
await sendEmail({ integration: { apiKey: decryptedKey } });
```

---

## 📝 Subtasks

### 1. Choose Encryption Method (1 hour)

**Options:**

**A. Node.js crypto (Built-in) ⭐ Recommended**
```typescript
// Pros: No dependencies, fast, secure
// Cons: Need to manage keys
import crypto from 'crypto';
```

**B. AWS KMS**
```typescript
// Pros: Managed keys, audit logs
// Cons: AWS dependency, costs money
```

**C. Vercel KV with encryption**
```typescript
// Pros: Managed service
// Cons: Another service dependency
```

**Decision:** Use Node.js crypto (AES-256-GCM)

---

### 2. Create Encryption Utility (2 hours)

**Create:** `lib/crypto/encryption.ts`

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export async function encrypt(text: string, secretKey: string): Promise<string> {
  // Derive key from secret
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  
  // Generate IV
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get auth tag
  const authTag = cipher.getAuthTag();
  
  // Combine: iv + encrypted + authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

export async function decrypt(encryptedText: string, secretKey: string): Promise<string> {
  // Split components
  const [ivHex, encrypted, authTagHex] = encryptedText.split(':');
  
  // Derive key
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  
  // Convert from hex
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function isEncrypted(text: string): boolean {
  // Check if text has encryption format (iv:encrypted:authTag)
  return text.includes(':') && text.split(':').length === 3;
}
```

**Test file:** `lib/crypto/encryption.test.ts`

```typescript
import { encrypt, decrypt, isEncrypted } from './encryption';

test('encrypts and decrypts correctly', async () => {
  const original = 'example_api_key_for_testing_only';
  const key = 'my-32-char-encryption-key-123456';
  
  const encrypted = await encrypt(original, key);
  expect(encrypted).not.toBe(original);
  expect(isEncrypted(encrypted)).toBe(true);
  
  const decrypted = await decrypt(encrypted, key);
  expect(decrypted).toBe(original);
});

test('different encryptions produce different results', async () => {
  const text = 'secret';
  const key = 'my-32-char-encryption-key-123456';
  
  const enc1 = await encrypt(text, key);
  const enc2 = await encrypt(text, key);
  
  // Different IVs = different encrypted text
  expect(enc1).not.toBe(enc2);
  
  // But both decrypt to same value
  expect(await decrypt(enc1, key)).toBe(text);
  expect(await decrypt(enc2, key)).toBe(text);
});
```

---

### 3. Update Email Integration (2 hours)

**Update:** `convex/integrations.ts`

```typescript
import { encrypt, decrypt } from '../lib/crypto/encryption';

export const connectEmailProvider = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // Get encryption key from environment
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not configured');
    }
    
    // Encrypt API key before storing
    const encryptedApiKey = await encrypt(args.apiKey, encryptionKey);
    
    await ctx.db.patch(args.agentId, {
      integrations: {
        email: {
          provider: args.provider,
          apiKey: encryptedApiKey,  // ✅ Encrypted
          // ...
        }
      }
    });
    
    return { success: true };
  },
});
```

**Update:** `convex/emailNotifications.ts`

```typescript
// When reading integration
const agent = await ctx.runQuery(api.agents.getAgentById, { agentId });

if (agent.integrations?.email?.active) {
  // Decrypt API key before using
  const { decrypt } = await import('../lib/crypto/encryption');
  const encryptionKey = process.env.ENCRYPTION_KEY!;
  
  const decryptedApiKey = await decrypt(
    agent.integrations.email.apiKey,
    encryptionKey
  );
  
  const emailIntegration = {
    provider: agent.integrations.email.provider,
    apiKey: decryptedApiKey,  // ✅ Decrypted for use
    fromEmail: agent.integrations.email.fromEmail,
  };
  
  await sendEmail({
    to: session.buyerEmail,
    integration: emailIntegration,
    // ...
  });
}
```

---

### 4. Update SMS Integration (2 hours)

**Update:** `convex/integrations.ts` - SMS functions

Apply same encryption logic to:
- `connectTwilio()`
- `connectMessageBird()`
- `connectVonage()`
- `connectAwsSns()`

**Update:** `convex/smsCampaigns.ts`

Decrypt credentials before using in `sendCampaign()` action.

---

### 5. Update Zapier Integration (1 hour)

**Update:** `convex/zapier.ts`

Encrypt webhook URLs (they can contain sensitive tokens).

---

### 6. Data Migration (Optional) (30 min)

**Create migration script:** `scripts/migrate-encrypt-keys.ts`

```typescript
// Encrypt existing plaintext keys in database
// Run once after deploying encryption

import { encrypt } from '../lib/crypto/encryption';

async function migrateKeys() {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const agents = await db.query('agents').collect();
  
  for (const agent of agents) {
    if (!agent.integrations) continue;
    
    const updated = { ...agent.integrations };
    let needsUpdate = false;
    
    // Encrypt email API key if plaintext
    if (updated.email?.apiKey && !isEncrypted(updated.email.apiKey)) {
      updated.email.apiKey = await encrypt(updated.email.apiKey, encryptionKey);
      needsUpdate = true;
    }
    
    // Same for SMS credentials...
    
    if (needsUpdate) {
      await db.patch(agent._id, { integrations: updated });
      console.log(`Migrated agent: ${agent._id}`);
    }
  }
  
  console.log('Migration complete!');
}
```

---

## 🔐 Environment Setup

**Add to `.env.local`:**
```bash
# Encryption key for API keys/credentials
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=your-64-char-hex-string-here-keep-this-secret
```

**Generate key:**
```bash
openssl rand -hex 32
```

**⚠️ IMPORTANT:**
- Store `ENCRYPTION_KEY` securely
- Never commit to git
- Use different keys for dev/staging/production
- If key is lost, encrypted data cannot be recovered
- Rotate keys periodically (with re-encryption)

---

## ✅ Acceptance Criteria

- [ ] Encryption utility created and tested
- [ ] All email integration functions encrypt API keys
- [ ] All SMS integration functions encrypt credentials
- [ ] Zapier webhook URLs encrypted
- [ ] Email sending decrypts keys correctly
- [ ] SMS sending decrypts credentials correctly
- [ ] Environment variable `ENCRYPTION_KEY` documented
- [ ] Unit tests pass (100% coverage)
- [ ] Integration tests pass
- [ ] No plaintext keys in database
- [ ] Performance impact < 10ms per operation

---

## 🧪 Testing

```bash
# Unit tests
npm test lib/crypto/encryption.test.ts

# Integration test
npm test convex/integrations.test.ts

# Manual test
1. Connect email provider in UI
2. Check database - API key should be encrypted (not readable)
3. Send email campaign
4. Verify email sends successfully (decryption works)
5. Disconnect and reconnect
6. Verify still works
```

---

## 📊 Performance Impact

**Expected:**
- Encryption: ~1-2ms per operation
- Decryption: ~1-2ms per operation
- Negligible impact on user experience

**Monitor:**
- Average encryption time
- Average decryption time
- Total request time impact

---

## 🚨 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Lost encryption key | CRITICAL | Store in multiple secure locations |
| Key compromised | HIGH | Key rotation procedure |
| Performance impact | LOW | Benchmark before/after |
| Migration errors | MEDIUM | Test on staging first |
| Backward compatibility | MEDIUM | Check if encrypted before decrypting |

---

## 📚 Resources

- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [AES-256-GCM Explained](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)

---

## ✅ Definition of Done

- [ ] Code written and reviewed
- [ ] Tests pass (unit + integration)
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Deployed to staging
- [ ] Tested on staging
- [ ] Deployed to production
- [ ] Monitoring confirms no errors

---

*Estimated: 8 hours*  
*Priority: CRITICAL*  
*Next Task: 02 - Security Audit Logging*
