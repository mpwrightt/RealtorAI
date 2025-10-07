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

**A. Web Crypto API (Built-in, runtime-portable) ⭐ Recommended**
```typescript
// Pros: Works in Convex actions and Next.js edge runtimes
// Cons: Requires async APIs and careful buffer handling
const subtle = globalThis.crypto?.subtle;
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

**Decision:** Use Web Crypto API (PBKDF2 + AES-256-GCM)

---

### 2. Create Encryption Utility (2 hours)

**Create:** `lib/crypto/encryption.ts`

```typescript
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function deriveKey(secretKey: string) {
  const subtle = crypto.subtle;
  const keyMaterial = await subtle.importKey("raw", encoder.encode(secretKey), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey(
    { name: "PBKDF2", salt: encoder.encode("realtorai.encryption"), iterations: 310_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex input length");
  }
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
    array[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return array;
}

export async function encrypt(plaintext: string, secretKey: string): Promise<string> {
  const subtle = crypto.subtle;
  const key = await deriveKey(secretKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plaintext));
  return `${toHex(iv)}:${toHex(new Uint8Array(ciphertext))}`;
}

export async function decrypt(ciphertext: string, secretKey: string): Promise<string> {
  const [ivHex, dataHex] = ciphertext.split(":");
  const subtle = crypto.subtle;
  const key = await deriveKey(secretKey);
  const plaintext = await subtle.decrypt(
    { name: "AES-GCM", iv: fromHex(ivHex) },
    key,
    fromHex(dataHex),
  );
  return decoder.decode(plaintext);
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
import { encrypt } from "./lib/encryption";

export const connectEmailProvider = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const encryptionKey = requireEncryptionKey();
    const encryptedApiKey = await encrypt(args.apiKey, encryptionKey);

    await ctx.db.patch(args.agentId, {
      integrations: {
        email: {
          provider: args.provider,
          apiKey: encryptedApiKey,
          // ...
        }
      }
    });
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
  const encryptionKey = requireEncryptionKey();
  
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

Encrypt webhook URLs (they can contain sensitive tokens) and decrypt before dispatching events via Next.js routes.

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

- [x] Encryption utility created and tested
- [x] All email integration functions encrypt API keys
- [x] All SMS integration functions encrypt credentials
- [x] Zapier webhook URLs encrypted
- [x] Email sending decrypts keys correctly
- [x] SMS sending decrypts credentials correctly
- [x] Environment variable `ENCRYPTION_KEY` documented
- [x] Unit tests pass
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

- [Web Crypto API (MDN)](https://developer.mozilla.org/docs/Web/API/SubtleCrypto)
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
