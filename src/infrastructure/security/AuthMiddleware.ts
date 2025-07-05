import { Request, Response, NextFunction } from 'express';
import { JwtTokenProvider } from './JwtTokenProvider';
import { UserRepository } from '../../domain/user/UserRepository';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export class AuthMiddleware {
  constructor(
    private readonly jwtTokenProvider: JwtTokenProvider,
    private readonly userRepository: UserRepository
  ) {}

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autenticación requerido'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      const payload = this.jwtTokenProvider.validateToken(token);
      if (!payload) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }

      // Verify user still exists and can login
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.canLogin()) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o acceso denegado'
        });
      }

      // Add user info to request
      req.user = {
        id: payload.userId,
        email: payload.email,
        roles: payload.roles
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Error de autenticación'
      });
    }
  };

  requireRole = (requiredRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida'
        });
      }

      const hasRequiredRole = requiredRoles.some(role => 
        req.user!.roles.includes(role)
      );

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Permisos insuficientes'
        });
      }

      next();
    };
  };

  requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    return this.requireRole(['ADMIN'])(req, res, next);
  };

  requireProvider = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    return this.requireRole(['PROVIDER', 'ADMIN'])(req, res, next);
  };

  optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Continue without authentication
      }

      const token = authHeader.substring(7);
      const payload = this.jwtTokenProvider.validateToken(token);
      
      if (payload) {
        const user = await this.userRepository.findById(payload.userId);
        if (user && user.canLogin()) {
          req.user = {
            id: payload.userId,
            email: payload.email,
            roles: payload.roles
          };
        }
      }

      next();
    } catch (error) {
      next(); // Continue without authentication on error
    }
  };
} 