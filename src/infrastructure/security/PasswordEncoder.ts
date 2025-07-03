// src/infrastructure/security/PasswordEncoder.ts
import bcrypt from 'bcrypt';

export class PasswordEncoder {
  private readonly saltRounds: number = 12;

  async encode(plainPassword: string): Promise<string> {
    if (!plainPassword) {
      throw new Error('Password cannot be empty');
    }
    
    if (plainPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async matches(plainPassword: string, encodedPassword: string): Promise<boolean> {
    if (!plainPassword || !encodedPassword) {
      return false;
    }
    
    return bcrypt.compare(plainPassword, encodedPassword);
  }

  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password cannot exceed 128 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common weak passwords
    const weakPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and weak');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
