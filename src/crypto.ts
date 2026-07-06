/**
 * AES-GCM password-based encryption for state backups.
 * Key derived via PBKDF2-SHA256 (250k iterations) from a user password.
 * Ciphertext, salt, and IV are base64-encoded and wrapped in a JSON envelope.
 */

const PBKDF2_ITERATIONS = 250_000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export const ENCRYPTED_MARKER = 'financial-tracker::encrypted-backup::v1';

export interface EncryptedEnvelope {
  format: typeof ENCRYPTED_MARKER;
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromBase64(str: string): Uint8Array {
  const s = atob(str);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

/** Cast Uint8Array's underlying buffer to ArrayBuffer, which SubtleCrypto expects. */
function bufOf(u: Uint8Array): ArrayBuffer {
  return u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: bufOf(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptToEnvelope(
  plaintext: string,
  password: string
): Promise<EncryptedEnvelope> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: bufOf(iv) },
    key,
    enc.encode(plaintext)
  );

  return {
    format: ENCRYPTED_MARKER,
    kdf: 'PBKDF2-SHA256',
    iterations: PBKDF2_ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(cipherBuf)),
  };
}

export async function decryptEnvelope(
  envelope: EncryptedEnvelope,
  password: string
): Promise<string> {
  if (envelope.format !== ENCRYPTED_MARKER) {
    throw new Error('Not an encrypted backup');
  }
  const salt = fromBase64(envelope.salt);
  const iv = fromBase64(envelope.iv);
  const key = await deriveKey(password, salt);
  const cipher = fromBase64(envelope.ciphertext);
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bufOf(iv) },
    key,
    bufOf(cipher)
  );
  return new TextDecoder().decode(buf);
}

export function isEncryptedEnvelope(input: unknown): input is EncryptedEnvelope {
  return (
    !!input &&
    typeof input === 'object' &&
    (input as { format?: string }).format === ENCRYPTED_MARKER
  );
}
