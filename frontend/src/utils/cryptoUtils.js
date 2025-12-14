import { argon2id } from 'hash-wasm';


let memoryKey = null;
// 1. Generate random salt (16 bytes minimum recommended for Argon2)
export function generateSalt() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...new Uint8Array(array)));
}

// 2. The Zero-Knowledge Derivation Logic
export async function deriveSecrets(masterPassword, saltBase64) {
  const saltBytes = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));

  // Step A: Derive Encryption Key (EK)
  // Config: 64MB memory, 3 iterations
  const encryptionKeyHex = await argon2id({
    password: masterPassword,
    salt: saltBytes,
    parallelism: 1,
    iterations: 3,
    memorySize: 64000,
    hashLength: 32,
    outputType: 'hex'
  });

  // Step B: Derive Authentication Hash (AH)
  // We feed the EK back into Argon2 (or SHA-256) to get the Auth Hash
  
  const authHashHex = await argon2id({
    password: encryptionKeyHex, // using EK as input
    salt: saltBytes,
    parallelism: 1,
    iterations: 2,     // lighter cost for auth
    memorySize: 16000,
    hashLength: 32,
    outputType: 'hex'
  });

  return {
    encryptionKey: encryptionKeyHex,
    authHash: authHashHex,
    salt: saltBase64
  };
}

export const setStoredKey = (key) => {
    memoryKey = key;
}

export const getStoredKey = () => {
    return memoryKey;
}

export const clearKey = () => {
    memoryKey = null;
}