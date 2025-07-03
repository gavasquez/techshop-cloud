
// src/infrastructure/security/JwtTokenProvider.ts
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JwtTokenProvider {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpirationInMs: number;
  private readonly jwtRefreshExpirationInMs: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
    this.jwtExpirationInMs = parseInt(process.env.JWT_EXPIRATION || '3600000'); // 1 hour
    this.jwtRefreshExpirationInMs = parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800000'); // 7 days
  }

  generateTokenPair(payload: Omit<TokenPayload, 'iat' | 'exp'>): TokenPair {
    const now = Math.floor(Date.now() / 1000);
    
    const accessTokenPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + Math.floor(this.jwtExpirationInMs / 1000)
    };

    const refreshTokenPayload = {
      userId: payload.userId,
      type: 'refresh',
      iat: now,
      exp: now + Math.floor(this.jwtRefreshExpirationInMs / 1000)
    };

    const accessToken = jwt.sign(accessTokenPayload, this.jwtSecret, {
      algorithm: 'HS512'
    });

    const refreshToken = jwt.sign(refreshTokenPayload, this.jwtRefreshSecret, {
      algorithm: 'HS512'
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtExpirationInMs
    };
  }

  validateToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  validateRefreshToken(refreshToken: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;
      
      if (decoded.type !== 'refresh') {
        return null;
      }

      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  getUserIdFromToken(token: string): string | null {
    const payload = this.validateToken(token);
    return payload ? payload.userId : null;
  }

  getRolesFromToken(token: string): string[] {
    const payload = this.validateToken(token);
    return payload ? payload.roles : [];
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return null;
      }
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}