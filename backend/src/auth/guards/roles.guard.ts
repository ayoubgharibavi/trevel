import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('Required roles:', requiredRoles);

    if (!requiredRoles) {
      return true; // No roles specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    console.log('Token:', token);
    
    if (!token) {
      console.log('No token found');
      throw new UnauthorizedException();
    }
    
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'dev-access-secret'
      });
      console.log('Payload:', payload);
      request['user'] = payload;
      
      if (!payload.role) {
        console.log('No role in payload');
        return false;
      }

      const hasRole = requiredRoles.some((role) => payload.role === role);
      console.log('Has role:', hasRole, 'User role:', payload.role, 'Required roles:', requiredRoles);
      return hasRole;
    } catch (error) {
      console.log('JWT verification error:', error);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

