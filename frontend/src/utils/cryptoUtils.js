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

// --- Helper: Convert Hex String to Uint8Array ---
function hexToBytes(hex) {
    if (!hex) {
        throw new Error("Vault is locked! Please refresh and unlock the vault to continue.");
    }
    return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

// --- Helper: Import the Hex Key into a Browser CryptoKey ---
async function importKey(hexKey) {
    const keyBytes = hexToBytes(hexKey);
    return await window.crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-GCM",
        false,
        ["encrypt", "decrypt"]
    );
}

// --- ENCRYPT Function ---
export async function encryptPassword(plainText) {
    const key = await importKey(memoryKey);
    const encodedText = new TextEncoder().encode(plainText);
    
    // Generate a unique Initialization Vector (IV) for every encryption
    // This ensures that encrypting "password123" twice produces different results
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encodedText
    );

    // Return as Base64 strings to send to server easily
    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

// --- DECRYPT Function ---
export async function decryptPassword(ciphertextB64, ivB64) {
    const key = await importKey(memoryKey);
    
    // Convert Base64 back to byte arrays
    const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));

    try {
        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            ciphertext
        );
        return new TextDecoder().decode(decryptedContent);
    } catch (e) {
        throw new Error("Decryption failed. Key might be wrong or data corrupted.");
    }
}