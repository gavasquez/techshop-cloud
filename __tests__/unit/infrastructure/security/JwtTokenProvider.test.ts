// __tests__/unit/infrastructure/security/JwtTokenProvider.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { JwtTokenProvider } from '../../../../src/infrastructure/security/JwtTokenProvider';
import { User, UserRole } from '../../../../src/domain/user/User';

describe('JwtTokenProvider', () => {
  let jwtTokenProvider: JwtTokenProvider;
  let testUser: User;

  beforeEach(() => {
    // Mock environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-very-long';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-purposes-very-long';
    process.env.JWT_EXPIRATION = '3600000'; // 1 hour
    process.env.JWT_REFRESH_EXPIRATION = '604800000'; // 7 days

    jwtTokenProvider = new JwtTokenProvider();
    
    testUser = new User(
      'test@example.com',
      'John',
      'Doe',
      'hashedPassword123',
      [UserRole.USER]
    );
  });

  describe('Token Generation', () => {
    it('should generate valid access token', () => {
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      
      expect(tokenPair.accessToken).toBeDefined();
      expect(typeof tokenPair.accessToken).toBe('string');
      expect(tokenPair.accessToken.length).toBeGreaterThan(0);
    });

    it('should generate valid refresh token', () => {
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      
      expect(tokenPair.refreshToken).toBeDefined();
      expect(typeof tokenPair.refreshToken).toBe('string');
      expect(tokenPair.refreshToken.length).toBeGreaterThan(0);
    });

    it('should generate different tokens for different users', () => {
      const user2 = new User(
        'different@example.com',
        'Jane',
        'Smith',
        'differentPassword',
        [UserRole.ADMIN]
      );

      const tokens1 = jwtTokenProvider.generateTokens(testUser);
      const tokens2 = jwtTokenProvider.generateTokens(user2);

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });

    it('should include user information in token payload', () => {
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      const payload = jwtTokenProvider.verifyAccessToken(tokenPair.accessToken);

      expect(payload.userId).toBe(testUser.id);
      expect(payload.email).toBe(testUser.email);
      expect(payload.roles).toContain(UserRole.USER);
    });
  });

  describe('Token Validation', () => {
    it('should validate valid access token', () => {
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      const isValid = jwtTokenProvider.validateAccessToken(tokenPair.accessToken);
      
      expect(isValid).toBe(true);
    });

    it('should validate valid refresh token', () => {
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      const isValid = jwtTokenProvider.validateRefreshToken(tokenPair.refreshToken);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid access token', () => {
      const invalidToken = 'invalid.token.here';
      const isValid = jwtTokenProvider.validateAccessToken(invalidToken);
      
      expect(isValid).toBe(false);
    });

    it('should reject malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const isValid = jwtTokenProvider.validateAccessToken(malformedToken);
      
      expect(isValid).toBe(false);
    });

    it('should reject empty token', () => {
      const isValid = jwtTokenProvider.validateAccessToken('');
      
      expect(isValid).toBe(false);
    });
  });

  describe('Token Verification', () => {
    it('should verify and decode valid access token', () => {
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      const payload = jwtTokenProvider.verifyAccessToken(tokenPair.accessToken);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(testUser.id);
      expect(payload.email).toBe(testUser.email);
      expect(payload.roles).toEqual([UserRole.USER]);
    });

    it('should verify and decode valid refresh token', () => {
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      const payload = jwtTokenProvider.verifyRefreshToken(tokenPair.refreshToken);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(testUser.id);
      expect(payload.email).toBe(testUser.email);
    });

    it('should throw error for expired token', () => {
      // Mock expired token scenario
      const expiredToken = jwtTokenProvider.generateTokens(testUser).accessToken;
      
      // Fast forward time
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 3700000); // 1 hour + 1 minute
      
      expect(() => {
        jwtTokenProvider.verifyAccessToken(expiredToken);
      }).toThrow();
      
      jest.restoreAllMocks();
    });

    it('should handle token with wrong signature', () => {
      const validToken = jwtTokenProvider.generateTokens(testUser).accessToken;
      // Tamper with the token
      const tamperedToken = validToken.slice(0, -10) + 'tampered123';
      
      expect(() => {
        jwtTokenProvider.verifyAccessToken(tamperedToken);
      }).toThrow();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh access token using valid refresh token', () => {
      const originalTokens = jwtTokenProvider.generateTokens(testUser);
      const newTokens = jwtTokenProvider.refreshTokens(originalTokens.refreshToken);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.accessToken).not.toBe(originalTokens.accessToken);
    });

    it('should throw error when refreshing with invalid refresh token', () => {
      const invalidRefreshToken = 'invalid.refresh.token';
      
      expect(() => {
        jwtTokenProvider.refreshTokens(invalidRefreshToken);
      }).toThrow();
    });

    it('should maintain user information in refreshed tokens', () => {
      const originalTokens = jwtTokenProvider.generateTokens(testUser);
      const newTokens = jwtTokenProvider.refreshTokens(originalTokens.refreshToken);
      
      const originalPayload = jwtTokenProvider.verifyAccessToken(originalTokens.accessToken);
      const newPayload = jwtTokenProvider.verifyAccessToken(newTokens.accessToken);

      expect(newPayload.userId).toBe(originalPayload.userId);
      expect(newPayload.email).toBe(originalPayload.email);
      expect(newPayload.roles).toEqual(originalPayload.roles);
    });
  });

  describe('Token Security', () => {
    it('should use different secrets for access and refresh tokens', () => {
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      
      // Should not be able to verify access token with refresh secret
      expect(() => {
        jwtTokenProvider.verifyRefreshToken(tokenPair.accessToken);
      }).toThrow();
      
      // Should not be able to verify refresh token with access secret
      expect(() => {
        jwtTokenProvider.verifyAccessToken(tokenPair.refreshToken);
      }).toThrow();
    });

    it('should include issued at timestamp', () => {
      const beforeGeneration = Math.floor(Date.now() / 1000);
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      const afterGeneration = Math.floor(Date.now() / 1000);
      
      const payload = jwtTokenProvider.verifyAccessToken(tokenPair.accessToken);
      
      expect(payload.iat).toBeDefined();
      expect(payload.iat).toBeGreaterThanOrEqual(beforeGeneration);
      expect(payload.iat).toBeLessThanOrEqual(afterGeneration);
    });

    it('should include expiration timestamp', () => {
      const tokenPair = jwtTokenProvider.generateTokens(testUser);
      const payload = jwtTokenProvider.verifyAccessToken(tokenPair.accessToken);
      
      expect(payload.exp).toBeDefined();
      expect(payload.exp).toBeGreaterThan(payload.iat!);
    });

    it('should handle tokens with different roles correctly', () => {
      const adminUser = new User(
        'admin@example.com',
        'Admin',
        'User',
        'adminPassword',
        [UserRole.ADMIN, UserRole.USER]
      );

      const tokenPair = jwtTokenProvider.generateTokens(adminUser);
      const payload = jwtTokenProvider.verifyAccessToken(tokenPair.accessToken);

      expect(payload.roles).toContain(UserRole.ADMIN);
      expect(payload.roles).toContain(UserRole.USER);
      expect(payload.roles).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing environment variables gracefully', () => {
      delete process.env.JWT_SECRET;
      
      expect(() => {
        new JwtTokenProvider();
      }).toThrow('JWT_SECRET environment variable is required');
    });

    it('should handle null user input', () => {
      expect(() => {
        jwtTokenProvider.generateTokens(null as any);
      }).toThrow();
    });

    it('should handle undefined token input', () => {
      expect(() => {
        jwtTokenProvider.verifyAccessToken(undefined as any);
      }).toThrow();
    });

    it('should handle null token input', () => {
      expect(() => {
        jwtTokenProvider.verifyAccessToken(null as any);
      }).toThrow();
    });
  });
});