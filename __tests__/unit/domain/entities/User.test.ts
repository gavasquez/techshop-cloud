// __tests__/unit/domain/entities/User.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { User, UserRole } from '../../../../src/domain/user/User';

describe('User Entity', () => {
  let validUserData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
  };

  beforeEach(() => {
    validUserData = {
      email: 'test@example.com',
      passwordHash: 'hashedpassword123',
      firstName: 'John',
      lastName: 'Doe',
      roles: [UserRole.USER]
    };
  });

  describe('User Creation', () => {
    it('should create user with correct initial values', () => {
      const user = new User(
        validUserData.email,
        validUserData.firstName,
        validUserData.lastName,
        validUserData.passwordHash,
        validUserData.roles
      );

      expect(user.id).toBeDefined();
      expect(user.email).toBe(validUserData.email);
      expect(user.passwordHash).toBe(validUserData.passwordHash);
      expect(user.firstName).toBe(validUserData.firstName);
      expect(user.lastName).toBe(validUserData.lastName);
      expect(user.fullName).toBe('John Doe');
      expect(user.roles).toEqual(validUserData.roles);
      expect(user.active).toBe(true);
      expect(user.emailVerified).toBe(false);
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lockedUntil).toBeNull();
      expect(user.lastLoginAt).toBeNull();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create user with default USER role when no roles provided', () => {
      const user = new User(
        validUserData.email,
        validUserData.passwordHash,
        validUserData.firstName,
        validUserData.lastName
      );

      expect(user.roles).toEqual([UserRole.USER]);
    });

    it('should throw error when email is invalid', () => {
      expect(() => {
        new User(
          'invalid-email',
          validUserData.passwordHash,
          validUserData.firstName,
          validUserData.lastName,
          validUserData.roles
        );
      }).toThrow('Invalid email format');
    });

    it('should throw error when firstName is empty', () => {
      expect(() => {
        new User(
          validUserData.email,
          '',
          validUserData.lastName,
          validUserData.passwordHash,
          validUserData.roles
        );
      }).toThrow('First name cannot be empty');
    });

    it('should throw error when lastName is empty', () => {
      expect(() => {
        new User(
          validUserData.email,
          validUserData.firstName,
          '',
          validUserData.passwordHash,
          validUserData.roles
        );
      }).toThrow('Last name cannot be empty');
    });

    it('should throw error when passwordHash is empty', () => {
      expect(() => {
        new User(
          validUserData.email,
          validUserData.firstName,
          validUserData.lastName,
          '',
          validUserData.roles
        );
      }).toThrow('Password hash cannot be empty');
    });

    it('should throw error when firstName exceeds 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(() => {
        new User(
          validUserData.email,
          longName,
          validUserData.lastName,
          validUserData.passwordHash,
          validUserData.roles
        );
      }).toThrow('First name cannot exceed 50 characters');
    });

    it('should throw error when email exceeds 100 characters', () => {
      const longEmail = 'a'.repeat(92) + '@test.com';
      expect(() => {
        new User(
          longEmail,
          validUserData.firstName,      // firstName  
          validUserData.lastName,       // lastName
          validUserData.passwordHash,   // passwordHash
          validUserData.roles          // roles
        );
       
      }).toThrow('Email cannot exceed 100 characters');
    });
  });

  describe('Role Management', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.email,
        validUserData.passwordHash,
        validUserData.firstName,
        validUserData.lastName,
        [UserRole.USER]
      );
    });

    it('should check if user has specific role', () => {
      expect(user.hasRole(UserRole.USER)).toBe(true);
      expect(user.hasRole(UserRole.ADMIN)).toBe(false);
    });

    it('should check if user has any of the provided roles', () => {
      expect(user.hasAnyRole([UserRole.USER, UserRole.ADMIN])).toBe(true);
      expect(user.hasAnyRole([UserRole.ADMIN, UserRole.PROVIDER])).toBe(false);
    });

    it('should identify admin users', () => {
      expect(user.isAdmin()).toBe(false);

      const adminUser = new User(
        'admin@example.com',
        'hashedpassword',
        'Admin',
        'User',
        [UserRole.ADMIN]
      );

      expect(adminUser.isAdmin()).toBe(true);
    });

    it('should identify provider users', () => {
      expect(user.isProvider()).toBe(false);

      const providerUser = new User(
        'provider@example.com',
        'hashedpassword',
        'Provider',
        'User',
        [UserRole.PROVIDER]
      );

      expect(providerUser.isProvider()).toBe(true);
    });

    it('should add role correctly', () => {
      user.addRole(UserRole.ADMIN);
      
      expect(user.hasRole(UserRole.ADMIN)).toBe(true);
      expect(user.roles).toContain(UserRole.ADMIN);
    });

    it('should not add duplicate roles', () => {
      user.addRole(UserRole.USER); // Already has this role
      
      expect(user.roles.filter(role => role === UserRole.USER).length).toBe(1);
    });

    it('should remove role correctly', () => {
      user.addRole(UserRole.ADMIN);
      user.removeRole(UserRole.ADMIN);
      
      expect(user.hasRole(UserRole.ADMIN)).toBe(false);
    });
  });

  describe('Profile Management', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.email,
        validUserData.passwordHash,
        validUserData.firstName,
        validUserData.lastName,
        validUserData.roles
      );
    });

    it('should update profile correctly', () => {
      const newFirstName = 'Jane';
      const newLastName = 'Smith';
      
      user.updateProfile(newFirstName, newLastName);
      
      expect(user.firstName).toBe(newFirstName);
      expect(user.lastName).toBe(newLastName);
      expect(user.fullName).toBe('Jane Smith');
    });

    it('should update email correctly', () => {
      const newEmail = 'newemail@example.com';
      
      user.updateEmail(newEmail);
      
      expect(user.email).toBe(newEmail);
      expect(user.emailVerified).toBe(false); // Should require re-verification
    });

    it('should update password correctly', () => {
      const newPasswordHash = 'newhashedpassword';
      
      user.updatePassword(newPasswordHash);
      
      expect(user.passwordHash).toBe(newPasswordHash);
    });

    it('should verify email correctly', () => {
      user.verifyEmail();
      
      expect(user.emailVerified).toBe(true);
    });

    it('should activate and deactivate user', () => {
      user.deactivate();
      expect(user.active).toBe(false);
      
      user.activate();
      expect(user.active).toBe(true);
    });
  });

  describe('Security Features', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.email,
        validUserData.passwordHash,
        validUserData.firstName,
        validUserData.lastName,
        validUserData.roles
      );
      user.verifyEmail(); // Make user ready for login
    });

    it('should record successful login', () => {
      user.recordLogin();
      
      expect(user.lastLoginAt).toBeInstanceOf(Date);
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lockedUntil).toBeNull();
    });

    it('should record failed login attempts', () => {
      user.recordFailedLogin();
      
      expect(user.failedLoginAttempts).toBe(1);
    });

    it('should lock account after 5 failed attempts', () => {
      for (let i = 0; i < 5; i++) {
        user.recordFailedLogin();
      }
      
      expect(user.isLocked()).toBe(true);
      expect(user.lockedUntil).toBeInstanceOf(Date);
    });

    it('should unlock account manually', () => {
      // Lock the account first
      for (let i = 0; i < 5; i++) {
        user.recordFailedLogin();
      }
      
      user.unlock();
      
      expect(user.isLocked()).toBe(false);
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lockedUntil).toBeNull();
    });

    it('should check if user can login', () => {
      expect(user.canLogin()).toBe(true);
      
      user.deactivate();
      expect(user.canLogin()).toBe(false);
      
      user.activate();
      user.updateEmail('new@example.com'); // This unverifies email
      expect(user.canLogin()).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.email,
        validUserData.firstName,
        validUserData.lastName,
        validUserData.passwordHash,
        validUserData.roles
      );
    });

    it('should get display name', () => {
    const user = new User(
        'john.doe@example.com',
        'John',      // firstName válido
        'Doe',       // lastName válido
        'hashedPassword123', // passwordHash
        [UserRole.USER]
    );
    
    expect(user.getDisplayName()).toBe('John Doe');
    });

    it('should identify new users', () => {
      expect(user.isNewUser()).toBe(true);
      
      user.recordLogin();
      expect(user.isNewUser()).toBe(false);
    });

    it('should calculate days since creation', () => {
      const days = user.getDaysSinceCreation();
      expect(days).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Transfer Methods', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.email,
        validUserData.passwordHash,
        validUserData.firstName,
        validUserData.lastName,
        validUserData.roles
      );
    });

    it('should convert to DTO correctly', () => {
      const dto = user.toDto();
      
      expect(dto.id).toBe(user.id);
      expect(dto.email).toBe(user.email);
      expect(dto.firstName).toBe(user.firstName);
      expect(dto.lastName).toBe(user.lastName);
      expect(dto.fullName).toBe(user.fullName);
      expect(dto.roles).toEqual(['USER']);
      expect(dto.active).toBe(user.active);
      expect(dto.emailVerified).toBe(user.emailVerified);
      expect(dto.isNewUser).toBe(true);
      expect(dto.daysSinceCreation).toBeGreaterThanOrEqual(0);
      // Should not include sensitive data
      expect(dto).not.toHaveProperty('passwordHash');
      expect(dto).not.toHaveProperty('failedLoginAttempts');
      expect(dto).not.toHaveProperty('lockedUntil');
    });

    it('should convert to JWT payload correctly', () => {
      const jwtPayload = user.toJwtPayload();
      
      expect(jwtPayload.userId).toBe(user.id);
      expect(jwtPayload.email).toBe(user.email);
      expect(jwtPayload.roles).toEqual(['USER']);
      // Should only include minimal data for JWT
      expect(Object.keys(jwtPayload)).toHaveLength(3);
    });

    it('should convert to persistence format correctly', () => {
      const persistenceData = user.toPersistence();
      
      expect(persistenceData.id).toBe(user.id);
      expect(persistenceData.email).toBe(user.email);
      expect(persistenceData.passwordHash).toBe(user.passwordHash);
      expect(persistenceData.firstName).toBe(user.firstName);
      expect(persistenceData.lastName).toBe(user.lastName);
      expect(persistenceData.roles).toEqual(['USER']);
      expect(persistenceData.active).toBe(user.active);
      expect(persistenceData.emailVerified).toBe(user.emailVerified);
      expect(persistenceData.failedLoginAttempts).toBe(user.failedLoginAttempts);
      expect(persistenceData.lockedUntil).toBe(user.lockedUntil);
      expect(persistenceData.lastLoginAt).toBe(user.lastLoginAt);
      expect(persistenceData.createdAt).toBe(user.createdAt);
      expect(persistenceData.updatedAt).toBe(user.updatedAt);
    });

    it('should create from persistence data correctly', () => {
      const persistenceData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        roles: ['USER', 'ADMIN'],
        active: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        lastLoginAt: new Date('2023-01-03'),
        emailVerified: true,
        failedLoginAttempts: 2,
        lockedUntil: null
      };

      const recreatedUser = User.fromPersistence(persistenceData);

      expect(recreatedUser.id).toBe(persistenceData.id);
      expect(recreatedUser.email).toBe(persistenceData.email);
      expect(recreatedUser.hasRole(UserRole.USER)).toBe(true);
      expect(recreatedUser.hasRole(UserRole.ADMIN)).toBe(true);
      expect(recreatedUser.active).toBe(false);
      expect(recreatedUser.emailVerified).toBe(true);
      expect(recreatedUser.failedLoginAttempts).toBe(2);
    });
  });
});