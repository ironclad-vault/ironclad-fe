/**
 * Vault Cryptography Service
 * 
 * Provides client-side encryption/decryption for Digital Will messages
 * using Web Crypto API (AES-GCM). Frontend generates keys and encrypts,
 * backend stores ciphertext (public) and key (private).
 */

export interface EncryptedData {
  ciphertext: string; // Hex-encoded ciphertext with IV prepended
  keyHex: string;     // Hex-encoded encryption key
}

export interface VaultCryptoService {
  generateKeyAndEncrypt(message: string): Promise<EncryptedData>;
  decrypt(encryptedDataHex: string, keyHex: string): Promise<string>;
}

class VaultCryptoServiceImpl implements VaultCryptoService {
  /**
   * Generates a new AES-GCM key and encrypts a message
   * @param message - Plain text message to encrypt
   * @returns Object with encrypted data (hex) and key (hex)
   */
  async generateKeyAndEncrypt(message: string): Promise<EncryptedData> {
    // Generate 256-bit AES-GCM key
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    // Export key as raw bytes
    const keyBuffer = await window.crypto.subtle.exportKey("raw", key);
    const keyHex = this.bytesToHex(new Uint8Array(keyBuffer));

    // Generate random IV (12 bytes for GCM)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encode message to bytes
    const messageBytes = new TextEncoder().encode(message);
    
    // Encrypt
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      messageBytes
    );
    
    // Combine IV + Ciphertext
    const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertextBuffer), iv.length);
    
    // Return as hex
    const ciphertext = this.bytesToHex(combined);

    return { ciphertext, keyHex };
  }

  /**
   * Decrypts a message using AES-GCM
   * @param encryptedDataHex - Hex-encoded IV + Ciphertext
   * @param keyHex - Hex-encoded decryption key
   * @returns Decrypted plain text message
   */
  async decrypt(encryptedDataHex: string, keyHex: string): Promise<string> {
    // Convert hex key to bytes
    const keyBytes = this.hexToBytes(keyHex);

    // Import key - create a new Uint8Array to ensure correct typing
    const key = await window.crypto.subtle.importKey(
      "raw",
      new Uint8Array(keyBytes),
      { name: "AES-GCM", length: 256 },
      false, // not extractable
      ["decrypt"]
    );

    // Decode hex to bytes
    const combined = this.hexToBytes(encryptedDataHex);
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertextBytes = combined.slice(12);
    
    // Decrypt
    const messageBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertextBytes
    );
    
    // Decode bytes to string
    return new TextDecoder().decode(messageBuffer);
  }

  // ============= Helper Methods =============

  private hexToBytes(hex: string): Uint8Array {
    // Remove 0x prefix if present
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
    
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Export singleton instance
export const vaultCryptoService: VaultCryptoService = new VaultCryptoServiceImpl();
