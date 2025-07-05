// src/domain/user/User.ts
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  PROVIDER = 'PROVIDER'
}

export class User {
  private readonly _id: string;
  private _email: string;
  private _passwordHash: string;
  private _firstName: string;
  private _lastName: string;
  private _roles: UserRole[];
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _lastLoginAt: Date | null;
  private _emailVerified: boolean;
  private _failedLoginAttempts: number;
  private _lockedUntil: Date | null;

  constructor(
    email: string,
    firstName: string,
    lastName: string,
    passwordHash: string,
    roles: UserRole[] = [UserRole.USER],
    id?: string
  ) {
    this._id = id || ''; // Empty string for new users, MongoDB will generate _id
    this._email = email;
    this._passwordHash = passwordHash;
    this._firstName = firstName;
    this._lastName = lastName;
    this._roles = roles;
    this._active = true;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._lastLoginAt = null;
    this._emailVerified = true; // Cambiado a true para permitir login inmediato
    this._failedLoginAttempts = 0;
    this._lockedUntil = null;

    this.validateInvariants();
  }

  // Getters
  get id(): string { return this._id; }
  get email(): string { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
  get firstName(): string { return this._firstName; }
  get lastName(): string { return this._lastName; }
  get fullName(): string { return `${this._firstName} ${this._lastName}`; }
  get roles(): UserRole[] { return [...this._roles]; }
  get active(): boolean { return this._active; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get lastLoginAt(): Date | null { return this._lastLoginAt; }
  get emailVerified(): boolean { return this._emailVerified; }
  get failedLoginAttempts(): number { return this._failedLoginAttempts; }
  get lockedUntil(): Date | null { return this._lockedUntil; }

  // Business Logic Methods - Role Management
  public hasRole(role: UserRole): boolean {
    return this._roles.includes(role);
  }

  public hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this._roles.includes(role));
  }

  public isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  public isProvider(): boolean {
    return this.hasRole(UserRole.PROVIDER);
  }

  public addRole(role: UserRole): void {
    if (!this._roles.includes(role)) {
      this._roles.push(role);
      this._updatedAt = new Date();
    }
  }

  public removeRole(role: UserRole): void {
    const index = this._roles.indexOf(role);
    if (index > -1) {
      this._roles.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  // Business Logic Methods - Profile Management
  public updateProfile(firstName: string, lastName: string): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this._updatedAt = new Date();

    this.validateInvariants();
  }

  public updateEmail(newEmail: string): void {
    this._email = newEmail;
    this._emailVerified = true; // Cambiado a true para no requerir verificación
    this._updatedAt = new Date();

    this.validateInvariants();
  }

  public updatePassword(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  // Business Logic Methods - Account Management
  public activate(): void {
    this._active = true;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._active = false;
    this._updatedAt = new Date();
  }

  public verifyEmail(): void {
    this._emailVerified = true;
    this._updatedAt = new Date();
  }

  // Business Logic Methods - Security
  public recordLogin(): void {
    this._lastLoginAt = new Date();
    this._failedLoginAttempts = 0; // Reset on successful login
    this._lockedUntil = null;
    this._updatedAt = new Date();
  }

  public recordFailedLogin(): void {
    this._failedLoginAttempts++;
    this._updatedAt = new Date();

    // Lock account after 5 failed attempts for 30 minutes
    if (this._failedLoginAttempts >= 5) {
      this._lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
  }

  public isLocked(): boolean {
    if (!this._lockedUntil) return false;

    if (new Date() > this._lockedUntil) {
      // Auto-unlock expired locks
      this._lockedUntil = null;
      this._failedLoginAttempts = 0;
      this._updatedAt = new Date();
      return false;
    }

    return true;
  }

  public unlock(): void {
    this._lockedUntil = null;
    this._failedLoginAttempts = 0;
    this._updatedAt = new Date();
  }

  public canLogin(): boolean {
    return this._active && this._emailVerified && !this.isLocked();
  }

  // Business Logic Methods - Utility
  public getDisplayName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  public isNewUser(): boolean {
    return !this._lastLoginAt;
  }

  public getDaysSinceCreation(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this._createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private validateInvariants(): void {
    if (!this._email || !this.isValidEmail(this._email)) {
      throw new Error('Invalid email format');
    }
    if (this._email.length > 100) {
      throw new Error('Email cannot exceed 100 characters');
    }
    if (!this._firstName || this._firstName.trim().length === 0) {
      throw new Error('First name cannot be empty');
    }

    if (!this._lastName || this._lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty');
    }

    if (!this._passwordHash || this._passwordHash.length === 0) {
      throw new Error('Password hash cannot be empty');
    }

    if (this._roles.length === 0) {
      throw new Error('User must have at least one role');
    }

    if (this._firstName.length > 50) {
      console.log(this._firstName);
      throw new Error('First name cannot exceed 50 characters');
    }

    if (this._lastName.length > 50) {
      throw new Error('Last name cannot exceed 50 characters');
    }

    if (this._email.length > 100) {
      throw new Error('Email cannot exceed 100 characters');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Factory method for reconstruction from persistence
  public static fromPersistence(data: {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roles: string[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    emailVerified: boolean;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
  }): User {
    const user = new User(
      data.email,
      data.firstName,    
      data.lastName,     
      data.passwordHash, 
      data.roles.map(role => role as UserRole),
      data.id
    );

    // Override the _id with the MongoDB _id
    (user as any)._id = data.id;
    user._active = data.active;
    user._updatedAt = data.updatedAt;
    user._lastLoginAt = data.lastLoginAt;
    user._emailVerified = data.emailVerified;
    user._failedLoginAttempts = data.failedLoginAttempts;
    user._lockedUntil = data.lockedUntil;

    return user;
  }


  // Convert to plain object for persistence
  public toPersistence(): {
    id?: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roles: string[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    emailVerified: boolean;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
  } {
    const data: any = {
      email: this._email,
      passwordHash: this._passwordHash,
      firstName: this._firstName,
      lastName: this._lastName,
      roles: this._roles.map(role => role.toString()),
      active: this._active,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      lastLoginAt: this._lastLoginAt,
      emailVerified: this._emailVerified,
      failedLoginAttempts: this._failedLoginAttempts,
      lockedUntil: this._lockedUntil
    };

    // Only include id if it's not a new user (has been saved before)
    if (this._id && this._id !== '') {
      data.id = this._id;
    }

    return data;
  }

  // Convert to DTO for API responses (excluding sensitive data)
  public toDto(): {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    roles: string[];
    active: boolean;
    emailVerified: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    isNewUser: boolean;
    daysSinceCreation: number;
  } {
    return {
      id: this._id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      roles: this._roles.map(role => role.toString()),
      active: this._active,
      emailVerified: this._emailVerified,
      lastLoginAt: this._lastLoginAt,
      createdAt: this._createdAt,
      isNewUser: this.isNewUser(),
      daysSinceCreation: this.getDaysSinceCreation()
    };
  }

  // Convert to JWT payload (minimal data for tokens)
  public toJwtPayload(): {
    userId: string;
    email: string;
    roles: string[];
  } {
    return {
      userId: this._id,
      email: this._email,
      roles: this._roles.map(role => role.toString())
    };
  }
}
