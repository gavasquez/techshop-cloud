// src/infrastructure/security/AuthService.ts
import { User, UserRole } from '../../domain/user/User';
import { JwtTokenProvider, TokenPair } from './JwtTokenProvider';
import { PasswordEncoder } from './PasswordEncoder';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  tokens?: TokenPair;
  message?: string;
}

export class AuthService {
  constructor(
    private readonly jwtTokenProvider: JwtTokenProvider,
    private readonly passwordEncoder: PasswordEncoder,
    private readonly userRepository: any // We'll define this interface later
  ) {}

  async login(request: LoginRequest): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if user can login
      if (!user.canLogin()) {
        let message = 'Account access denied';
        
        if (!user.active) {
          message = 'Account is deactivated';
        } else if (!user.emailVerified) {
          message = 'Email not verified';
        } else if (user.isLocked()) {
          message = 'Account is temporarily locked due to failed login attempts';
        }
        
        return {
          success: false,
          message
        };
      }

      // Verify password
      const passwordValid = await this.passwordEncoder.matches(request.password, user.passwordHash);
      
      if (!passwordValid) {
        // Record failed login attempt
        user.recordFailedLogin();
        await this.userRepository.save(user);
        
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Successful login
      user.recordLogin();
      await this.userRepository.save(user);

      // Generate tokens
      const jwtPayload = user.toJwtPayload();
      const tokens = this.jwtTokenProvider.generateTokenPair(jwtPayload);

      return {
        success: true,
        user,
        tokens
      };

    } catch (error) {
      return {
        success: false,
        message: 'Login failed due to server error'
      };
    }
  }

  async register(request: RegisterRequest): Promise<AuthResult> {
    try {
      console.log('AuthService.register - Starting registration for:', request.email);
      
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        console.log('AuthService.register - User already exists:', request.email);
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Validate password strength
      const passwordValidation = this.passwordEncoder.validatePasswordStrength(request.password);
      if (!passwordValidation.isValid) {
        console.log('AuthService.register - Password validation failed:', passwordValidation.errors);
        return {
          success: false,
          message: passwordValidation.errors.join(', ')
        };
      }

      // Hash password
      const passwordHash = await this.passwordEncoder.encode(request.password);
      console.log('AuthService.register - Password hashed successfully');

      // Create user
      const user = new User(
        request.email,
        request.firstName,
        request.lastName,
        passwordHash,
        [UserRole.USER] // Default role
      );
      console.log('AuthService.register - User object created successfully');

      // Save user
      const savedUser = await this.userRepository.save(user);
      console.log('AuthService.register - User saved successfully:', savedUser.id);

      return {
        success: true,
        user: savedUser,
        message: 'User registered successfully. You can now login.'
      };

    } catch (error) {
      console.error('AuthService.register - Error during registration:', error);
      return {
        success: false,
        message: 'Registration failed due to server error'
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Validate refresh token
      const decoded = this.jwtTokenProvider.validateRefreshToken(refreshToken);
      if (!decoded) {
        return {
          success: false,
          message: 'Invalid refresh token'
        };
      }

      // Find user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.canLogin()) {
        return {
          success: false,
          message: 'User not found or access denied'
        };
      }

      // Generate new tokens
      const jwtPayload = user.toJwtPayload();
      const tokens = this.jwtTokenProvider.generateTokenPair(jwtPayload);

      return {
        success: true,
        user,
        tokens
      };

    } catch (error) {
      return {
        success: false,
        message: 'Token refresh failed'
      };
    }
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user?: User; payload?: any }> {
    try {
      const payload = this.jwtTokenProvider.validateToken(token);
      if (!payload) {
        return { valid: false };
      }

      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.canLogin()) {
        return { valid: false };
      }

      return {
        valid: true,
        user,
        payload
      };

    } catch (error) {
      return { valid: false };
    }
  }
}