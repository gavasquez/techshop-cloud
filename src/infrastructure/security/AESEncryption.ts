// src/infrastructure/security/AESEncryption.ts
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class AESEncryption {
  private readonly algorithm = 'aes-256-cbc';
  private readonly secretKey: Buffer;

  constructor() {
    const keyString = process.env.AES_SECRET_KEY || 'your-32-character-secret-key-here';
    
    if (keyString.length !== 32) {
      throw new Error('AES secret key must be exactly 32 characters long');
    }
    
    // Convert string to 32-byte buffer
    this.secretKey = createHash('sha256').update(keyString).digest();
  }

  encrypt(text: string): { encrypted: string; iv: string } {
    if (!text) {
      throw new Error('Text to encrypt cannot be empty');
    }

    try {
      // Generate a random initialization vector
      const iv = randomBytes(16);
      
      // Create cipher
      const cipher = createCipheriv(this.algorithm, this.secretKey, iv);
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        encrypted,
        iv: iv.toString('hex')
      };
    } catch (error) {
      throw new Error('Encryption failed: ' + (error as Error).message);
    }
  }

  decrypt(encryptedData: { encrypted: string; iv: string }): string {
    if (!encryptedData.encrypted || !encryptedData.iv) {
      throw new Error('Invalid encrypted data format');
    }

    try {
      // Convert hex iv back to buffer
      const iv = Buffer.from(encryptedData.iv, 'hex');
      
      // Create decipher
      const decipher = createDecipheriv(this.algorithm, this.secretKey, iv);

      // Decrypt the text
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data: Invalid key or corrupted data');
    }
  }

  encryptObject(obj: any): string {
    if (!obj) {
      throw new Error('Object to encrypt cannot be null or undefined');
    }

    try {
      const jsonString = JSON.stringify(obj);
      const encrypted = this.encrypt(jsonString);
      return Buffer.from(JSON.stringify(encrypted)).toString('base64');
    } catch (error) {
      throw new Error('Failed to encrypt object: ' + (error as Error).message);
    }
  }

  decryptObject<T>(encryptedString: string): T {
    if (!encryptedString) {
      throw new Error('Encrypted string cannot be empty');
    }

    try {
      const encryptedData = JSON.parse(Buffer.from(encryptedString, 'base64').toString());
      const decryptedString = this.decrypt(encryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      throw new Error('Failed to decrypt object: ' + (error as Error).message);
    }
  }

  // Utility method to generate a secure secret key
  static generateSecretKey(): string {
    return randomBytes(16).toString('hex'); // 32 characters hex string
  }

  // Utility method to hash sensitive data (one-way)
  hashData(data: string): string {
    if (!data) {
      throw new Error('Data to hash cannot be empty');
    }

    return createHash('sha256').update(data).digest('hex');
  }

  // Utility method to verify hashed data
  verifyHash(data: string, hash: string): boolean {
    if (!data || !hash) {
      return false;
    }

    const computedHash = this.hashData(data);
    return computedHash === hash;
  }

  // Generate unique ID using UUID (compatible with Product.ts)
  generateId(): string {
    return uuidv4();
  }
}