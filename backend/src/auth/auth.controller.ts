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
    return this.authService.login(body.email, body.password);
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
