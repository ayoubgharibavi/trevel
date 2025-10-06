import { Controller, Get, Query, Param, Post, Body, Put, Delete, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FlightsService } from './flights.service';
import { CreateFlightDto, UpdateFlightDto, FlightSearchQueryDto } from '../common/dto';
import { Public } from '../auth/decorators/public.decorator'; // Corrected import path
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import JwtAuthGuard

@ApiTags('flights')
@Controller({ path: 'flights', version: '1' })
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('search')
  @Public() // Allow unauthenticated access, but still pass user if logged in
  @ApiOperation({ summary: 'Search flights' })
  @ApiQuery({ name: 'from', type: String, required: true })
  @ApiQuery({ name: 'to', type: String, required: true })
  @ApiQuery({ name: 'departureDate', type: String, required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'adults', type: Number, required: false, description: 'Defaults to 1' })
  @ApiQuery({ name: 'children', type: Number, required: false, description: 'Defaults to 0' })
  @ApiQuery({ name: 'infants', type: Number, required: false, description: 'Defaults to 0' })
  @ApiOkResponse({ description: 'List of flights' })
  async search(@Query() query: FlightSearchQueryDto, @Req() req: any) {
    return this.flightsService.search(query, req.user); // Pass req.user for rate limit bypass check
  }

  @Get('popular-routes')
  @Public()
  @ApiOperation({ summary: 'Get popular flight routes' })
  async getPopularRoutes() {
    return this.flightsService.getPopularRoutes();
  }

  @Get('daily-prices')
  @Public()
  @ApiOperation({ summary: 'Get daily flight prices for a route' })
  @ApiQuery({ name: 'from', type: String, required: true })
  @ApiQuery({ name: 'to', type: String, required: true })
  @ApiQuery({ name: 'month', type: String, required: false, description: 'YYYY-MM format, defaults to current month' })
  @ApiOkResponse({ description: 'Daily prices for the specified month' })
  async getDailyPrices(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('month') month?: string
  ) {
    return this.flightsService.getDailyPrices(from, to, month);
  }

  @Post('cancel-past-flights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually cancel all past flights' })
  @ApiOkResponse({ description: 'Past flights cancelled successfully' })
  async cancelPastFlights(@Req() req: any) {
    // Only allow admin users to cancel flights
    if (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
      throw new UnauthorizedException('Only admin users can cancel flights');
    }
    
    return this.flightsService.cancelPastFlights();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get flight by ID' })
  async getById(@Param('id') flightId: string) {
    return this.flightsService.getById(flightId);
  }

  @Post('ai-search')
  @Public()
  @ApiOperation({ summary: 'AI-powered flight search using Gemini' })
  @ApiQuery({ name: 'language', required: false })
  async aiSearch(@Body() query: FlightSearchQueryDto, @Query('language') language = 'fa', @Req() req: any) {
    return this.flightsService.aiSearch(query, language, req.user); // Pass req.user to aiSearch as well
  }

  @Post('save-charter118')
  @Public() // Allow unauthenticated access for booking flow
  @ApiOperation({ summary: 'Save Charter118 flight to local database' })
  @ApiOkResponse({ description: 'Charter118 flight saved successfully' })
  async saveCharter118(@Body() data: { flight: any, charter118BookingId: string }) {
    return this.flightsService.saveCharter118Flight(data.flight, data.charter118BookingId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new flight' })
  async createFlight(@Body() createFlightDto: CreateFlightDto) {
    return this.flightsService.createFlight(createFlightDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a flight' })
  async updateFlight(@Param('id') flightId: string, @Body() updateFlightDto: UpdateFlightDto) {
    return this.flightsService.updateFlight(flightId, updateFlightDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a flight' })
  async deleteFlight(@Param('id') flightId: string) {
    return this.flightsService.deleteFlight(flightId);
  }

  @Get('airports/search')
  @Public()
  @ApiOperation({ summary: 'Search airports by city or code' })
  @ApiQuery({ name: 'q', required: true })
  async searchAirports(@Query('q') searchTerm: string) {
    return this.flightsService.searchAirports(searchTerm);
  }
}

