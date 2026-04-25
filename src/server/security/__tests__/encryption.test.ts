import {
  encrypt,
  decrypt,
  isEncrypted,
  encryptFields,
  decryptFields,
  validateEncryptionConfig,
  maskSensitive,
  maskPAN,
  maskAadhaar,
  maskBankAccount,
} from '../encryption'

// Ensure we are in development mode for tests (allows default dev key)
const originalEnv = process.env.NODE_ENV

beforeEach(() => {
  Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true })
  delete process.env.ENCRYPTION_KEY
  delete process.env.ENCRYPTION_SALT
})

afterAll(() => {
  Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true })
})

// ============================================
// encrypt / decrypt roundtrip
// ============================================
describe('encrypt and decrypt', () => {
  it('should roundtrip a simple string', () => {
    const plaintext = 'Hello, Pioneer OS!'
    const ciphertext = encrypt(plaintext)
    expect(ciphertext).not.toBe(plaintext)
    expect(decrypt(ciphertext)).toBe(plaintext)
  })

  it('should produce different ciphertexts for the same plaintext (random IV)', () => {
    const plaintext = 'deterministic?'
    const a = encrypt(plaintext)
    const b = encrypt(plaintext)
    expect(a).not.toBe(b)
    // Both should decrypt to the same value
    expect(decrypt(a)).toBe(plaintext)
    expect(decrypt(b)).toBe(plaintext)
  })

  it('should return empty/falsy values unchanged', () => {
    expect(encrypt('')).toBe('')
    expect(decrypt('')).toBe('')
  })

  it('should handle unicode content', () => {
    const plaintext = 'Rupees: ₹10,000 — Aadhaar: 1234'
    expect(decrypt(encrypt(plaintext))).toBe(plaintext)
  })
})

// ============================================
// isEncrypted
// ============================================
describe('isEncrypted', () => {
  it('should detect an encrypted value', () => {
    const ciphertext = encrypt('test')
    expect(isEncrypted(ciphertext)).toBe(true)
  })

  it('should reject plain text', () => {
    expect(isEncrypted('just-plain-text')).toBe(false)
  })

  it('should reject empty or falsy values', () => {
    expect(isEncrypted('')).toBe(false)
  })

  it('should reject values with wrong number of colon-separated parts', () => {
    expect(isEncrypted('a:b')).toBe(false)
    expect(isEncrypted('a:b:c:d')).toBe(false)
  })
})

// ============================================
// encryptFields / decryptFields
// ============================================
describe('encryptFields and decryptFields', () => {
  it('should encrypt specified fields and leave others intact', () => {
    const obj = { name: 'Alice', panCard: 'ABCDE1234F', city: 'Mumbai' }
    const encrypted = encryptFields(obj, ['panCard'])

    expect(encrypted.name).toBe('Alice')
    expect(encrypted.city).toBe('Mumbai')
    expect(encrypted.panCard).not.toBe('ABCDE1234F')
    expect(isEncrypted(encrypted.panCard)).toBe(true)
  })

  it('should decrypt fields back to original values', () => {
    const obj = { name: 'Alice', panCard: 'ABCDE1234F', city: 'Mumbai' }
    const encrypted = encryptFields(obj, ['panCard'])
    const decrypted = decryptFields(encrypted, ['panCard'])

    expect(decrypted.panCard).toBe('ABCDE1234F')
    expect(decrypted.name).toBe('Alice')
  })

  it('should not double-encrypt already encrypted fields', () => {
    const obj = { secret: 'value' }
    const first = encryptFields(obj, ['secret'])
    const second = encryptFields(first, ['secret'])

    // Should still decrypt to original
    expect(decrypt(second.secret)).toBe('value')
  })

  it('should skip null/undefined/non-string fields', () => {
    const obj = { a: null, b: undefined, c: 42 } as Record<string, any>
    const result = encryptFields(obj, ['a', 'b', 'c'])
    expect(result.a).toBeNull()
    expect(result.b).toBeUndefined()
    expect(result.c).toBe(42)
  })
})

// ============================================
// validateEncryptionConfig
// ============================================
describe('validateEncryptionConfig', () => {
  it('should be valid in development without ENCRYPTION_KEY', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true })
    delete process.env.ENCRYPTION_KEY
    const result = validateEncryptionConfig()
    expect(result.valid).toBe(true)
  })

  it('should be invalid in production without ENCRYPTION_KEY', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
    delete process.env.ENCRYPTION_KEY
    const result = validateEncryptionConfig()
    expect(result.valid).toBe(false)
  })

  it('should be invalid in production without ENCRYPTION_SALT', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
    process.env.ENCRYPTION_KEY = 'a'.repeat(32)
    delete process.env.ENCRYPTION_SALT
    const result = validateEncryptionConfig()
    expect(result.valid).toBe(false)
  })

  it('should be invalid when ENCRYPTION_KEY is too short', () => {
    process.env.ENCRYPTION_KEY = 'short'
    const result = validateEncryptionConfig()
    expect(result.valid).toBe(false)
  })

  it('should be valid in production with proper key and salt', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
    process.env.ENCRYPTION_KEY = 'a'.repeat(32)
    process.env.ENCRYPTION_SALT = 'my-unique-salt'
    const result = validateEncryptionConfig()
    expect(result.valid).toBe(true)
  })
})

// ============================================
// Masking utilities
// ============================================
describe('maskSensitive', () => {
  it('should mask all but the last 4 characters', () => {
    expect(maskSensitive('1234567890')).toBe('******7890')
  })

  it('should return empty string for empty input', () => {
    expect(maskSensitive('')).toBe('')
  })

  it('should mask entirely if shorter than showLast', () => {
    expect(maskSensitive('abc')).toBe('***')
  })

  it('should respect custom showLast parameter', () => {
    expect(maskSensitive('1234567890', 2)).toBe('********90')
  })
})

describe('maskPAN', () => {
  it('should mask a valid 10-character PAN', () => {
    expect(maskPAN('ABCDE1234F')).toBe('****E1234F')
  })

  it('should fall back to maskSensitive for invalid length', () => {
    expect(maskPAN('SHORT')).toBe('*HORT')
  })

  it('should return empty via maskSensitive for empty input', () => {
    expect(maskPAN('')).toBe('')
  })
})

describe('maskAadhaar', () => {
  it('should mask a valid 12-digit Aadhaar', () => {
    expect(maskAadhaar('123456781234')).toBe('XXXX XXXX 1234')
  })

  it('should handle Aadhaar with spaces', () => {
    expect(maskAadhaar('1234 5678 1234')).toBe('XXXX XXXX 1234')
  })

  it('should return empty for empty input', () => {
    expect(maskAadhaar('')).toBe('')
  })
})

describe('maskBankAccount', () => {
  it('should mask all but last 4 digits', () => {
    expect(maskBankAccount('12345678901234')).toBe('**********1234')
  })

  it('should mask entirely if 4 or fewer digits', () => {
    expect(maskBankAccount('1234')).toBe('****')
  })

  it('should return empty for empty input', () => {
    expect(maskBankAccount('')).toBe('')
  })
})
