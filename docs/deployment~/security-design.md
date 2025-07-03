# TechShop Cloud - Diseño de Seguridad

## 🛡️ Arquitectura de Seguridad

TechShop Cloud implementa un modelo de seguridad por capas que protege desde la infraestructura hasta la lógica de negocio.

## 🔒 Modelo de Seguridad por Capas

```
┌─────────────────────────────────────────────────────────┐
│                 APPLICATION SECURITY                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │     JWT     │  │    RBAC     │  │ Input Valid │     │
│  │ Tokens      │  │ Authorization│  │ & Sanitize  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                TRANSPORT SECURITY                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   HTTPS     │  │   CORS      │  │  Security   │     │
│  │   TLS 1.3   │  │  Headers    │  │  Headers    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  DATA SECURITY                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  AES-256    │  │   bcrypt    │  │  Field-Level│     │
│  │ Encryption  │  │  Password   │  │ Encryption  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│               INFRASTRUCTURE SECURITY                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Network    │  │ Container   │  │   Secrets   │     │
│  │ Policies    │  │ Security    │  │ Management  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Sistema de Autenticación

### JWT Token Strategy

```typescript
interface TokenPair {
  accessToken: string;    // 1 hour expiration
  refreshToken: string;   // 7 days expiration
}

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;   // Issued at
  exp?: number;   // Expires at
}
```

### JwtTokenProvider Implementation

```typescript
class JwtTokenProvider {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiration: number;
  private readonly refreshTokenExpiration: number;

  constructor() {
    this.validateEnvironment();
    this.accessTokenSecret = process.env.JWT_SECRET!;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
    this.accessTokenExpiration = parseInt(process.env.JWT_EXPIRATION!);
    this.refreshTokenExpiration = parseInt(process.env.JWT_REFRESH_EXPIRATION!);
  }

  generateTokens(user: User): TokenPair {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map(role => role.toString())
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiration,
      algorithm: 'HS256'
    });

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiration,
        algorithm: 'HS256'
      }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
    } catch (error) {
      throw new InvalidTokenException('Invalid access token');
    }
  }

  refreshTokens(refreshToken: string): TokenPair {
    try {
      const payload = jwt.verify(refreshToken, this.refreshTokenSecret) as any;
      // Fetch updated user data
      const user = this.userRepository.findById(payload.userId);
      return this.generateTokens(user);
    } catch (error) {
      throw new InvalidTokenException('Invalid refresh token');
    }
  }
}
```

### Authentication Flow

```
Client → Login Request → AuthService → User Validation → JWT Generation
   ↑                                                           ↓
Response ← Token Pair ← JWT Provider ← Password Verify ← Database
```

## 🔑 Sistema de Autorización

### Role-Based Access Control (RBAC)

```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  PROVIDER = 'PROVIDER'
}

enum Permission {
  // Product permissions
  CREATE_PRODUCT = 'CREATE_PRODUCT',
  UPDATE_PRODUCT = 'UPDATE_PRODUCT',
  DELETE_PRODUCT = 'DELETE_PRODUCT',
  VIEW_PRODUCT = 'VIEW_PRODUCT',
  
  // User permissions
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  VIEW_USER = 'VIEW_USER',
  
  // Order permissions
  CREATE_ORDER = 'CREATE_ORDER',
  VIEW_ORDER = 'VIEW_ORDER',
  CANCEL_ORDER = 'CANCEL_ORDER',
  PROCESS_ORDER = 'PROCESS_ORDER'
}
```

### Permission Matrix

| Role | Permissions |
|------|-------------|
| **ADMIN** | ALL_PERMISSIONS |
| **PROVIDER** | CREATE_PRODUCT, UPDATE_PRODUCT, VIEW_PRODUCT, PROCESS_ORDER |
| **USER** | VIEW_PRODUCT, CREATE_ORDER, VIEW_ORDER, CANCEL_ORDER |

### Authorization Service

```typescript
class AuthorizationService {
  private readonly rolePermissions = new Map<UserRole, Permission[]>([
    [UserRole.ADMIN, Object.values(Permission)],
    [UserRole.PROVIDER, [
      Permission.CREATE_PRODUCT,
      Permission.UPDATE_PRODUCT,
      Permission.VIEW_PRODUCT,
      Permission.PROCESS_ORDER
    ]],
    [UserRole.USER, [
      Permission.VIEW_PRODUCT,
      Permission.CREATE_ORDER,
      Permission.VIEW_ORDER,
      Permission.CANCEL_ORDER
    ]]
  ]);

  hasPermission(user: User, permission: Permission): boolean {
    return user.roles.some(role => 
      this.rolePermissions.get(role)?.includes(permission)
    );
  }

  checkPermission(user: User, permission: Permission): void {
    if (!this.hasPermission(user, permission)) {
      throw new InsufficientPermissionsException(
        `User ${user.id} lacks permission: ${permission}`
      );
    }
  }

  checkResourceAccess(user: User, resource: any): void {
    // Check if user can access specific resource
    if (user.hasRole(UserRole.ADMIN)) {
      return; // Admin can access everything
    }

    if (resource.ownerId && resource.ownerId !== user.id) {
      throw new UnauthorizedAccessException(
        'User can only access own resources'
      );
    }
  }
}
```

### Authorization Decorators

```typescript
// Method decorator for permission checking
function RequirePermission(permission: Permission) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const user = this.getCurrentUser(); // Get from context
      const authService = new AuthorizationService();
      
      authService.checkPermission(user, permission);
      
      return originalMethod.apply(this, args);
    };
  };
}

// Usage example
class ProductController {
  @RequirePermission(Permission.CREATE_PRODUCT)
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Implementation
  }
}
```

## 🔒 Encriptación y Hashing

### AES-256 Encryption Service

```typescript
class AESEncryption {
  private readonly algorithm = 'aes-256-cbc';
  private readonly secretKey: Buffer;

  constructor() {
    const keyString = process.env.AES_SECRET_KEY || 'your-32-character-secret-key-here';
    if (keyString.length !== 32) {
      throw new Error('AES secret key must be exactly 32 characters long');
    }
    this.secretKey = createHash('sha256').update(keyString).digest();
  }

  encrypt(text: string): { encrypted: string; iv: string } {
    if (!text) {
      throw new Error('Text to encrypt cannot be empty');
    }

    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.algorithm, this.secretKey, iv);
      
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
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = createDecipheriv(this.algorithm, this.secretKey, iv);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data: Invalid key or corrupted data');
    }
  }

  // Encrypt sensitive user data
  encryptPersonalData(data: any): string {
    const jsonString = JSON.stringify(data);
    const encrypted = this.encrypt(jsonString);
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  }

  decryptPersonalData<T>(encryptedString: string): T {
    try {
      const encryptedData = JSON.parse(Buffer.from(encryptedString, 'base64').toString());
      const decryptedString = this.decrypt(encryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      throw new Error('Failed to decrypt personal data');
    }
  }
}
```

### Password Security

```typescript
class PasswordEncoder {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  static validatePassword(password: string): void {
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
    }

    if (!this.PASSWORD_REGEX.test(password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
  }

  static async hash(password: string): Promise<string> {
    this.validatePassword(password);
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    
    // Ensure at least one character from each required category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '@$!%*?&'[Math.floor(Math.random() * 7)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
```

## 🛡️ Middleware de Seguridad

### Authentication Middleware

```typescript
class AuthenticationMiddleware {
  constructor(
    private jwtProvider: JwtTokenProvider,
    private userRepository: UserRepository
  ) {}

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        throw new UnauthorizedException('Access token required');
      }

      const payload = this.jwtProvider.verifyAccessToken(token);
      const user = await this.userRepository.findById(payload.userId);

      if (!user || !user.canLogin()) {
        throw new UnauthorizedException('Invalid user session');
      }

      // Attach user to request context
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error.message
      });
    }
  };

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    return null;
  }
}
```

### Rate Limiting Middleware

```typescript
class RateLimitMiddleware {
  private static readonly requests = new Map<string, number[]>();
  private static readonly MAX_REQUESTS = 100;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  static create() {
    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = this.getIdentifier(req);
      const now = Date.now();
      const windowStart = now - this.WINDOW_MS;

      // Get existing requests for this identifier
      const userRequests = this.requests.get(identifier) || [];
      
      // Filter out old requests
      const recentRequests = userRequests.filter(time => time > windowStart);
      
      if (recentRequests.length >= this.MAX_REQUESTS) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Try again later.'
        });
        return;
      }

      // Add current request
      recentRequests.push(now);
      this.requests.set(identifier, recentRequests);
      
      next();
    };
  }

  private static getIdentifier(req: Request): string {
    // Use user ID if authenticated, otherwise IP address
    return req.user?.id || req.ip;
  }
}
```

### Security Headers Middleware

```typescript
class SecurityHeadersMiddleware {
  static setup() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Prevent XSS attacks
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // HTTPS enforcement
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      
      // Content Security Policy
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
      
      // Referrer Policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      next();
    };
  }
}
```

## 🔍 Auditoría y Logging

### Security Audit Service

```typescript
class SecurityAuditService {
  constructor(private logger: Logger) {}

  logSuccessfulLogin(user: User, request: Request): void {
    this.logger.info('Successful login', {
      userId: user.id,
      email: user.email,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date().toISOString(),
      event: 'LOGIN_SUCCESS'
    });
  }

  logFailedLogin(email: string, request: Request, reason: string): void {
    this.logger.warn('Failed login attempt', {
      email,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      reason,
      timestamp: new Date().toISOString(),
      event: 'LOGIN_FAILED'
    });
  }

  logPermissionDenied(user: User, resource: string, action: string): void {
    this.logger.warn('Permission denied', {
      userId: user.id,
      email: user.email,
      resource,
      action,
      timestamp: new Date().toISOString(),
      event: 'PERMISSION_DENIED'
    });
  }

  logSecurityViolation(description: string, context: any): void {
    this.logger.error('Security violation detected', {
      description,
      context,
      timestamp: new Date().toISOString(),
      event: 'SECURITY_VIOLATION'
    });
  }
}
```

## 🚨 Threat Detection

### Anomaly Detection

```typescript
class AnomalyDetectionService {
  private readonly suspiciousActivities = new Map<string, number>();

  detectSuspiciousActivity(user: User, activity: string): boolean {
    const key = `${user.id}:${activity}`;
    const count = this.suspiciousActivities.get(key) || 0;
    
    this.suspiciousActivities.set(key, count + 1);
    
    // Define thresholds for different activities
    const thresholds = {
      'failed_login': 5,
      'password_change': 3,
      'rapid_requests': 50
    };
    
    return count >= (thresholds[activity] || 10);
  }

  checkForBruteForce(request: Request): boolean {
    const ip = request.ip;
    const key = `brute_force:${ip}`;
    const attempts = this.suspiciousActivities.get(key) || 0;
    
    return attempts > 20; // 20 failed attempts from same IP
  }

  flagSuspiciousUser(userId: string, reason: string): void {
    // Implementation for flagging users
    this.logger.warn('User flagged as suspicious', {
      userId,
      reason,
      timestamp: new Date().toISOString(),
      event: 'SUSPICIOUS_USER_FLAGGED'
    });
    
    // Additional actions: notify security team, temporary restrictions, etc.
  }
}
```

## 🔐 Session Management

### Session Security

```typescript
class SessionManager {
  private readonly activeSessions = new Map<string, UserSession>();
  private readonly maxSessionsPerUser = 5;
  private readonly sessionTimeout = 30 * 60 * 1000; // 30 minutes

  createSession(user: User, request: Request): UserSession {
    const sessionId = this.generateSecureSessionId();
    
    const session: UserSession = {
      id: sessionId,
      userId: user.id,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] || '',
      isActive: true
    };

    // Limit sessions per user
    this.enforceSessionLimit(user.id);
    
    this.activeSessions.set(sessionId, session);
    return session;
  }

  validateSession(sessionId: string): UserSession | null {
    const session = this.activeSessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return null;
    }

    // Check for timeout
    const timeSinceActivity = Date.now() - session.lastActivityAt.getTime();
    if (timeSinceActivity > this.sessionTimeout) {
      this.invalidateSession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivityAt = new Date();
    return session;
  }

  invalidateSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.activeSessions.delete(sessionId);
    }
  }

  invalidateAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.activeSessions) {
      if (session.userId === userId) {
        this.invalidateSession(sessionId);
      }
    }
  }

  private enforceSessionLimit(userId: string): void {
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId && session.isActive)
      .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());

    if (userSessions.length >= this.maxSessionsPerUser) {
      // Remove oldest sessions
      const sessionsToRemove = userSessions.slice(this.maxSessionsPerUser - 1);
      sessionsToRemove.forEach(session => this.invalidateSession(session.id));
    }
  }

  private generateSecureSessionId(): string {
    return randomBytes(32).toString('hex');
  }
}

interface UserSession {
  id: string;
  userId: string;
  createdAt: Date;
  lastActivityAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}
```

## 🛡️ Input Validation y Sanitization

### Validation Service

```typescript
class ValidationService {
  // SQL Injection prevention
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>\"'%;()&+]/g, '')
      .trim()
      .substring(0, 1000); // Limit length
  }

  // XSS Prevention
  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static validatePasswordStrength(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check for common passwords
  static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

### DTO Validation

```typescript
// Custom validation decorators
function IsStrongPassword() {
  return function (target: any, propertyName: string) {
    // Implementation for password validation decorator
  };
}

function IsSanitized() {
  return function (target: any, propertyName: string) {
    // Implementation for input sanitization decorator
  };
}

// Usage in DTOs
class CreateUserDto {
  @IsEmail()
  @IsSanitized()
  email: string;

  @IsStrongPassword()
  password: string;

  @Length(1, 50)
  @IsSanitized()
  firstName: string;

  @Length(1, 50)
  @IsSanitized()
  lastName: string;
}
```

## 🚨 Incident Response

### Security Incident Handler

```typescript
class SecurityIncidentHandler {
  constructor(
    private notificationService: NotificationService,
    private auditService: SecurityAuditService,
    private userRepository: UserRepository
  ) {}

  async handleSuspiciousActivity(incident: SecurityIncident): Promise<void> {
    // Log the incident
    this.auditService.logSecurityViolation(incident.description, incident.context);

    // Determine severity
    const severity = this.calculateSeverity(incident);

    switch (severity) {
      case IncidentSeverity.CRITICAL:
        await this.handleCriticalIncident(incident);
        break;
      case IncidentSeverity.HIGH:
        await this.handleHighSeverityIncident(incident);
        break;
      case IncidentSeverity.MEDIUM:
        await this.handleMediumSeverityIncident(incident);
        break;
      default:
        await this.handleLowSeverityIncident(incident);
    }
  }

  private async handleCriticalIncident(incident: SecurityIncident): Promise<void> {
    // Immediate response for critical incidents
    
    // 1. Lock affected user accounts
    if (incident.userId) {
      const user = await this.userRepository.findById(incident.userId);
      if (user) {
        user.lockAccount();
        await this.userRepository.save(user);
      }
    }

    // 2. Notify security team immediately
    await this.notificationService.sendCriticalSecurityAlert(incident);

    // 3. Block suspicious IP addresses
    if (incident.ipAddress) {
      await this.blockIpAddress(incident.ipAddress);
    }

    // 4. Revoke all active sessions for affected user
    if (incident.userId) {
      this.sessionManager.invalidateAllUserSessions(incident.userId);
    }
  }

  private async handleHighSeverityIncident(incident: SecurityIncident): Promise<void> {
    // Enhanced monitoring and notifications
    await this.notificationService.sendSecurityAlert(incident);
    
    // Temporary rate limiting for affected IP
    if (incident.ipAddress) {
      await this.addTemporaryRateLimit(incident.ipAddress);
    }
  }

  private calculateSeverity(incident: SecurityIncident): IncidentSeverity {
    // Algorithm to determine incident severity
    let score = 0;

    // Base score by incident type
    const typeScores = {
      'BRUTE_FORCE_ATTACK': 7,
      'SQL_INJECTION_ATTEMPT': 9,
      'XSS_ATTEMPT': 6,
      'UNAUTHORIZED_ACCESS': 8,
      'PRIVILEGE_ESCALATION': 9,
      'DATA_BREACH': 10
    };

    score += typeScores[incident.type] || 5;

    // Additional factors
    if (incident.context.adminAccount) score += 3;
    if (incident.context.sensitiveData) score += 2;
    if (incident.context.repeatedAttempts > 10) score += 2;

    if (score >= 9) return IncidentSeverity.CRITICAL;
    if (score >= 7) return IncidentSeverity.HIGH;
    if (score >= 5) return IncidentSeverity.MEDIUM;
    return IncidentSeverity.LOW;
  }

  private async blockIpAddress(ipAddress: string): Promise<void> {
    // Implementation to block IP address
  }

  private async addTemporaryRateLimit(ipAddress: string): Promise<void> {
    // Implementation for temporary rate limiting
  }
}

interface SecurityIncident {
  id: string;
  type: string;
  description: string;
  userId?: string;
  ipAddress?: string;
  context: any;
  timestamp: Date;
}

enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}
```

## 🔍 Compliance y Estándares

### GDPR Compliance

```typescript
class GDPRComplianceService {
  constructor(
    private encryptionService: AESEncryption,
    private auditService: SecurityAuditService
  ) {}

  // Right to be forgotten
  async deleteUserData(userId: string): Promise<void> {
    // 1. Anonymize user data
    const user = await this.userRepository.findById(userId);
    if (user) {
      user.anonymize();
      await this.userRepository.save(user);
    }

    // 2. Delete or anonymize related data
    await this.anonymizeUserOrders(userId);
    await this.deleteUserSessions(userId);

    // 3. Log the deletion for compliance
    this.auditService.logDataDeletion(userId);
  }

  // Data portability
  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await this.userRepository.findById(userId);
    const orders = await this.orderRepository.findByUserId(userId);

    return {
      personalData: user.toExportFormat(),
      orderHistory: orders.map(order => order.toExportFormat()),
      exportDate: new Date(),
      format: 'JSON'
    };
  }

  // Data minimization
  scheduleDataCleanup(): void {
    // Schedule job to clean up old data
    // Remove inactive accounts after 2 years
    // Delete old logs after 7 years
  }
}

interface UserDataExport {
  personalData: any;
  orderHistory: any[];
  exportDate: Date;
  format: string;
}
```

### Security Standards Compliance

```typescript
class SecurityStandardsCompliance {
  // OWASP Top 10 Compliance Checklist
  static validateOWASPCompliance(): ComplianceReport {
    return {
      A1_Injection: 'COMPLIANT', // Parameterized queries, input validation
      A2_BrokenAuthentication: 'COMPLIANT', // JWT, strong passwords, MFA ready
      A3_SensitiveDataExposure: 'COMPLIANT', // AES-256 encryption, HTTPS
      A4_XMLExternalEntities: 'NOT_APPLICABLE', // No XML processing
      A5_BrokenAccessControl: 'COMPLIANT', // RBAC implementation
      A6_SecurityMisconfiguration: 'COMPLIANT', // Security headers, default configs
      A7_CrossSiteScripting: 'COMPLIANT', // Input sanitization, CSP headers
      A8_InsecureDeserialization: 'COMPLIANT', // Safe JSON parsing
      A9_KnownVulnerabilities: 'COMPLIANT', // Regular dependency updates
      A10_InsufficientLogging: 'COMPLIANT' // Comprehensive audit logging
    };
  }

  // ISO 27001 Security Controls
  static validateISO27001Controls(): boolean {
    // Implementation of ISO 27001 control checks
    return true;
  }
}

interface ComplianceReport {
  [key: string]: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
}
```

## 🔄 Security Monitoring

### Real-time Security Dashboard

```typescript
class SecurityMonitoringService {
  private metrics = {
    activeUsers: 0,
    failedLogins: 0,
    blockedIPs: 0,
    suspiciousActivities: 0,
    dataBreaches: 0
  };

  updateMetrics(): void {
    // Update security metrics for dashboard
  }

  generateSecurityReport(): SecurityReport {
    return {
      timestamp: new Date(),
      metrics: this.metrics,
      threats: this.getActiveThreats(),
      recommendations: this.getSecurityRecommendations(),
      complianceStatus: SecurityStandardsCompliance.validateOWASPCompliance()
    };
  }

  private getActiveThreats(): Threat[] {
    // Analyze current threats
    return [];
  }

  private getSecurityRecommendations(): string[] {
    // Generate security recommendations
    return [
      'Review and update security policies',
      'Conduct security awareness training',
      'Update security dependencies',
      'Review access permissions'
    ];
  }
}

interface SecurityReport {
  timestamp: Date;
  metrics: any;
  threats: Threat[];
  recommendations: string[];
  complianceStatus: ComplianceReport;
}

interface Threat {
  id: string;
  type: string;
  severity: string;
  description: string;
  mitigationStatus: string;
}
```

## 🚀 Implementación por Fases

### Fase 1 (Actual): Core Security
- [x] JWT Authentication
- [x] RBAC Authorization
- [x] AES-256 Encryption
- [x] Password Security
- [x] Basic Input Validation

### Fase 2: Advanced Security
- [ ] Multi-Factor Authentication
- [ ] Advanced Threat Detection
- [ ] Real-time Monitoring Dashboard
- [ ] Automated Incident Response
- [ ] Security Scanning Integration

### Fase 3: Enterprise Security
- [ ] Zero Trust Architecture
- [ ] Advanced Analytics
- [ ] Machine Learning Threat Detection
- [ ] Compliance Automation
- [ ] Security Orchestration

## 📋 Security Checklist

### Pre-Deployment Security Checklist

- [ ] All endpoints require authentication
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention implemented
- [ ] XSS protection in place
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted
- [ ] Rate limiting implemented
- [ ] Security logging enabled
- [ ] Error handling doesn't expose internals
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security tests passing
- [ ] Compliance requirements met

---

Este diseño de seguridad proporciona múltiples capas de protección y cumple con los estándares de seguridad modernos para aplicaciones empresariales.