// Encryption utilities for AppPorter Extension
class CryptoManager {
  constructor() {
    this.sessionKey = null
    this.sessionId = null
    this.cryptoKey = null
    this.legacyCryptoKey = null
    this.LEGACY_ENCRYPTION_KEY_RAW = new TextEncoder().encode(
      'AppPorter_WebSocket_Key_32bytes!'
    )
  }

  // Initialize legacy crypto key for backward compatibility
  async initializeLegacyCrypto() {
    if (!this.legacyCryptoKey) {
      this.legacyCryptoKey = await crypto.subtle.importKey(
        'raw',
        this.LEGACY_ENCRYPTION_KEY_RAW,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      )
    }
  }

  // Initialize crypto key for session-based encryption
  async initializeCrypto() {
    if (!this.sessionKey) {
      // Session key will be set during handshake
      return
    }

    if (!this.cryptoKey) {
      this.cryptoKey = await crypto.subtle.importKey(
        'raw',
        this.sessionKey,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      )
    }
  }

  // Set session key from handshake response
  setSessionKey(keyB64, sessionIdStr) {
    try {
      this.sessionKey = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0))
      this.sessionId = sessionIdStr
      this.cryptoKey = null // Reset crypto key to force re-initialization
    } catch (e) {
      console.error('Failed to set session key:', e)
    }
  }

  // Get current session ID
  getSessionId() {
    return this.sessionId
  }

  // Encrypt data using AES-GCM
  async encryptData(data) {
    await this.initializeCrypto()

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Encrypt the data
    const encodedData = new TextEncoder().encode(data)
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      this.cryptoKey,
      encodedData
    )

    // Convert to base64 for transmission
    const encryptedB64 = btoa(
      String.fromCharCode(...new Uint8Array(encryptedData))
    )
    const ivB64 = btoa(String.fromCharCode(...iv))

    return { data: encryptedB64, nonce: ivB64 }
  }

  // Decrypt data using AES-GCM
  async decryptData(encryptedB64, ivB64) {
    await this.initializeCrypto()

    // Decode from base64
    const encryptedData = Uint8Array.from(atob(encryptedB64), (c) =>
      c.charCodeAt(0)
    )
    const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0))

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      this.cryptoKey,
      encryptedData
    )

    return new TextDecoder().decode(decryptedData)
  }

  // Legacy encryption method using the old key
  async encryptDataLegacy(data) {
    await this.initializeLegacyCrypto()

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Encrypt the data
    const encodedData = new TextEncoder().encode(data)
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      this.legacyCryptoKey,
      encodedData
    )

    // Convert to base64 for transmission
    const encryptedB64 = btoa(
      String.fromCharCode(...new Uint8Array(encryptedData))
    )
    const ivB64 = btoa(String.fromCharCode(...iv))

    return { data: encryptedB64, nonce: ivB64 }
  }

  // Legacy decryption method using the old key
  async decryptDataLegacy(encryptedB64, ivB64) {
    await this.initializeLegacyCrypto()

    // Decode from base64
    const encryptedData = Uint8Array.from(atob(encryptedB64), (c) =>
      c.charCodeAt(0)
    )
    const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0))

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      this.legacyCryptoKey,
      encryptedData
    )

    return new TextDecoder().decode(decryptedData)
  }
}

// Export singleton instance
const cryptoManager = new CryptoManager()

// Export for ES6 modules
export { cryptoManager }
