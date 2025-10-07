import assert from "node:assert/strict";

import { decrypt, decryptIfNeeded, encrypt, isEncrypted } from "./encryption";

const SECRET = "demo-encryption-passphrase";

async function runTests() {
  const plaintext = "example_api_key_for_testing_only";

  const encrypted = await encrypt(plaintext, SECRET);
  assert.notStrictEqual(encrypted, plaintext, "Encrypted value should differ from plaintext");
  assert.ok(isEncrypted(encrypted), "Encrypted value should be detected as encrypted");

  const decrypted = await decrypt(encrypted, SECRET);
  assert.strictEqual(decrypted, plaintext, "Decrypted value should match original plaintext");

  const encryptedAgain = await encrypt(plaintext, SECRET);
  assert.notStrictEqual(encryptedAgain, encrypted, "Multiple encryptions should produce different ciphertext");

  const decryptedAgain = await decrypt(encryptedAgain, SECRET);
  assert.strictEqual(decryptedAgain, plaintext, "Repeated encryption/decryption should round-trip");

  const maybeDecrypted = await decryptIfNeeded(encrypted, SECRET);
  assert.strictEqual(maybeDecrypted, plaintext, "decryptIfNeeded should decrypt encrypted strings");

  const passthrough = await decryptIfNeeded(plaintext, SECRET);
  assert.strictEqual(passthrough, plaintext, "decryptIfNeeded should return plaintext strings untouched");

  console.log("Encryption tests passed");
}

runTests().catch((error) => {
  console.error("Encryption tests failed", error);
  process.exit(1);
});
