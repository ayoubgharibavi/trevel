import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class JwtAuthGuard {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('🔍 JWT Guard - URL:', url, 'isPublic:', isPublic, 'Handler:', context.getHandler().name, 'Class:', context.getClass().name);
    
    // If route is public, allow access regardless of token
    if (isPublic) {
      console.log('✅ Public route, allowing access');
      return true;
    }

    // For protected routes, token is required
    console.log('🔒 Protected route, checking token');
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      console.log('❌ No token provided for protected route');
      throw new UnauthorizedException();
    }
    
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'dev-access-secret',
      });
      request['user'] = { userId: payload.sub, username: payload.username, role: payload.role };
      console.log('✅ Token valid for protected route, user set:', payload.sub);
      return true;
    } catch (error) {
      console.log('❌ Invalid token for protected route:', error.message);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
