import { Controller, Get, UseGuards, Req, Put, Body, Post, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto, SavedPassengerDto } from '../common/dto';

@ApiTags('users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@Req() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, body);
  }

  @Get('me/wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user wallet' })
  async getWallet(@Req() req: any) {
    return this.usersService.getWallet(req.user.userId);
  }

  @Get('me/saved-passengers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved passengers' })
  async getSavedPassengers(@Req() req: any) {
    return this.usersService.getSavedPassengers(req.user.userId);
  }

  @Post('me/saved-passengers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add saved passenger' })
  @ApiBody({ type: SavedPassengerDto })
  async addSavedPassenger(@Req() req: any, @Body() body: SavedPassengerDto) {
    return this.usersService.addSavedPassenger(req.user.userId, body);
  }

  @Put('me/saved-passengers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update saved passenger' })
  @ApiBody({ type: SavedPassengerDto })
  async updateSavedPassenger(@Req() req: any, @Param('id') id: string, @Body() body: SavedPassengerDto) {
    return this.usersService.updateSavedPassenger(req.user.userId, id, body);
  }

  @Delete('me/saved-passengers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete saved passenger' })
  async deleteSavedPassenger(@Req() req: any, @Param('id') id: string) {
    return this.usersService.deleteSavedPassenger(req.user.userId, id);
  }

  @Get('me/affiliate-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate statistics (for affiliate users)' })
  async getAffiliateStats(@Req() req: any) {
    return this.usersService.getAffiliateStats(req.user.userId);
  }

  @Get('me/affiliate-flights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate created flights' })
  async getAffiliateFlights(@Req() req: any) {
    return this.usersService.getAffiliateFlights(req.user.userId);
  }

  @Get('me/affiliate-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bookings for affiliate flights' })
  async getAffiliateBookings(@Req() req: any) {
    return this.usersService.getAffiliateBookings(req.user.userId);
  }

  @Get('me/affiliate-accounting')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate commission accounting' })
  async getAffiliateAccounting(@Req() req: any) {
    return this.usersService.getAffiliateAccounting(req.user.userId);
  }
}
