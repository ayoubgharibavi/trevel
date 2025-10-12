import { Body, Controller, Post, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SignupDto, RefreshDto, LoginDto } from '../common/dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('test-login')
  @Public()
  @ApiOperation({ summary: 'Test login endpoint for debugging' })
  async testLogin(@Body() body: any) {
    console.log('🔍 Test Login - Raw body:', body);
    console.log('🔍 Test Login - Body type:', typeof body);
    console.log('🔍 Test Login - Body keys:', Object.keys(body || {}));
    
    return {
      success: true,
      message: 'Test endpoint working',
      receivedData: body,
      timestamp: new Date().toISOString()
    };
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email/password' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    console.log('🔍 Auth Controller - Incoming login body:', body);
    console.log('🔍 Auth Controller - Body keys:', Object.keys(body));
    console.log('🔍 Auth Controller - Body values:', Object.values(body));
    
    try {
      // Validate that either email or username is provided
      const identifier = body.username || body.email;
      if (!identifier) {
        console.log('❌ Auth Controller - No identifier provided');
        throw new UnauthorizedException('Email or username is required');
      }
      
      if (!body.password) {
        console.log('❌ Auth Controller - No password provided');
        throw new UnauthorizedException('Password is required');
      }
      
      console.log('🔍 Auth Controller - Calling auth service with:', { identifier, passwordLength: body.password.length });
      const result = await this.authService.login(identifier, body.password);
      console.log('✅ Auth Controller - Login successful');
      return result;
    } catch (error) {
      console.error('❌ Auth Controller - Login error:', (error as Error).message);
      console.error('❌ Auth Controller - Error stack:', (error as Error).stack);
      throw error;
    }
  }

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: SignupDto })
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshDto })
  async refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.userId);
  }
}
