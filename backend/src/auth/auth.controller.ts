import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SignupDto, RefreshDto, LoginDto } from '../common/dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email/password' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    console.log('Incoming login body:', body); // Add this line for debugging
    try {
      const result = await this.authService.login(body.username || body.email, body.password);
      console.log('Login successful:', result);
      return result;
    } catch (error) {
          console.error('Login error:', (error as Error).message);
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
