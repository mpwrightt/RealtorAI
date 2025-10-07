const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SALT = encoder.encode("realtorai.encryption");
const IV_LENGTH = 12;

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API is not available in this environment");
  }
  return subtle;
}

async function deriveKey(secretKey: string): Promise<CryptoKey> {
  if (!secretKey || secretKey.length < 16) {
    throw new Error("Encryption key must be at least 16 characters long");
  }

  const subtle = getSubtle();
  const keyMaterial = await subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: 310_000,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
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
    const offset = i * 2;
    array[i] = parseInt(hex.slice(offset, offset + 2), 16);
  }
  return array;
}

export async function encrypt(plaintext: string, secretKey: string): Promise<string> {
  if (plaintext === undefined || plaintext === null) {
    throw new Error("Cannot encrypt empty value");
  }

  const subtle = getSubtle();
  const key = await deriveKey(secretKey);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encrypted = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(plaintext)
  );

  return `${toHex(iv)}:${toHex(new Uint8Array(encrypted))}`;
}

export async function decrypt(ciphertext: string, secretKey: string): Promise<string> {
  if (!ciphertext) {
    throw new Error("Cannot decrypt empty value");
  }

  const [ivHex, dataHex] = ciphertext.split(":");
  if (!ivHex || !dataHex) {
    throw new Error("Invalid encrypted payload format");
  }

  const subtle = getSubtle();
  const key = await deriveKey(secretKey);
  const iv = fromHex(ivHex);
  const data = fromHex(dataHex);

  const decrypted = await subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    data
  );

  return decoder.decode(decrypted);
}

export function isEncrypted(value: string | undefined | null): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const segments = value.split(":");
  if (segments.length !== 2) {
    return false;
  }

  return segments.every((segment) => /^[0-9a-fA-F]+$/.test(segment));
}

export function requireEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY is not configured");
  }
  return key;
}

export async function decryptIfNeeded(value: string | undefined | null, secretKey: string): Promise<string | undefined> {
  if (typeof value !== "string" || value.length === 0) {
    return value ?? undefined;
  }

  if (!isEncrypted(value)) {
    return value;
  }

  return decrypt(value, secretKey);
}
