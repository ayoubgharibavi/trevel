import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async login(identifier: string, password: string) {
    try {
      console.log('🔍 Auth Service - Login attempt:', { identifier, passwordLength: password.length });
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { username: identifier }
          ]
        }
      });

      console.log('Found user:', user ? { id: user.id, email: user.email, username: user.username, status: user.status } : 'null');

      if (!user) {
        console.log('❌ Auth Service - User not found');
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      console.log('Password match:', passwordMatch);

      if (!passwordMatch) {
        console.log('❌ Auth Service - Invalid password');
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.status !== 'ACTIVE') {
        console.log('❌ Auth Service - Account inactive:', user.status);
        throw new UnauthorizedException('Your account is inactive. Please contact support.');
      }

      const payload = { sub: user.id, username: user.username, role: user.role };
      const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '24h' });
      const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' });

      // Hash and store refresh token in DB
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);

      await this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashedRefreshToken,
          expiresAt: refreshTokenExpiry,
        },
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          canBypassRateLimit: user.canBypassRateLimit,
          tenantId: user.tenantId,
          displayCurrencies: user.displayCurrencies ? JSON.parse(user.displayCurrencies) as string[] : [],
          wallet: null,
          savedPassengers: [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async signup(data: { name: string; username: string; email: string; password: string; phone: string }) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Account with this username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const defaultTenantId = this.configService.get<string>('DEFAULT_TENANT_ID') || 'tenant-1';

    const newUser = await this.prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        passwordHash: hashedPassword,
        phone: data.phone,
        role: UserRole.USER,
        status: 'ACTIVE',
        tenantId: defaultTenantId,
        displayCurrencies: '["IRR"]',
      },
    });

    // Create wallet for new user
    await this.prisma.wallet.create({
      data: {
        userId: newUser.id,
        balance: 0,
        currency: 'IRR',
      },
    });

    const payload = { sub: newUser.id, username: newUser.username, role: newUser.role };
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    // Hash and store refresh token in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: newUser.id,
        tokenHash: hashedRefreshToken,
        expiresAt: refreshTokenExpiry,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        status: newUser.status,
        canBypassRateLimit: newUser.canBypassRateLimit,
        tenantId: newUser.tenantId,
                  displayCurrencies: newUser.displayCurrencies ? JSON.parse(newUser.displayCurrencies) as string[] : [],
        wallet: {
          balance: 0,
          currency: 'IRR',
        },
        savedPassengers: [],
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is required');
      }

      const payload = await this.jwtService.verifyAsync(refreshToken);

      const storedToken = await this.prisma.refreshToken.findFirst({
        where: { userId: payload.sub },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Generate new access token
      const newPayload = { sub: payload.sub, username: payload.username, role: payload.role };
      const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '24h' });

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: refreshToken // Keep the same refresh token
        }
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        error: 'Invalid or expired refresh token'
      };
    }
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { message: 'Logged out successfully' };
  }
}
