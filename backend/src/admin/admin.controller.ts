import { Controller, Get, Post, Put, Delete, UseGuards, Req, Body, Param, Query, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserDto, CreateFlightDto, UpdateFlightDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator'; // Make sure this is imported if needed for public endpoints

@ApiTags('admin')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('cancel-past-flights')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel all past flights' })
  async cancelPastFlights(@Req() req: any) {
    // Only allow admin users to cancel flights
    if (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
      throw new UnauthorizedException('Only admin users can cancel flights');
    }
    
    return this.adminService.cancelPastFlights();
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(@Req() req: any) {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUsers(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.adminService.getUsers(page, limit);
  }

  @Post('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new user (admin)' })
  async createUser(@Body() data: any) {
    return this.adminService.createUser(data);
  }

  @Put('users/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(@Param('id') userId: string, @Body() body: UpdateUserDto) {
    return this.adminService.updateUser(userId, body);
  }

  @Post('users/:id/charge-wallet')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Charge user wallet' })
  async chargeUserWallet(@Param('id') userId: string, @Body() body: { amount: number; currency: string; description: string }) {
    return this.adminService.chargeUserWallet(userId, body.amount, body.currency, body.description);
  }

  @Post('users/:id/reset-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user password' })
  async resetUserPassword(@Param('id') userId: string, @Body() body: { newPassword: string }) {
    return this.adminService.resetUserPassword(userId, body.newPassword);
  }

  @Get('bookings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getBookings(@Query('page') page = 1, @Query('status') status?: string) {
    return this.adminService.getBookings(page, status);
  }

  @Put('bookings/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking' })
  async updateBooking(@Param('id') bookingId: string, @Body() bookingData: any) {
    return this.adminService.updateBooking(bookingId, bookingData);
  }

  @Post('bookings/fix-sources')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fix booking sources' })
  async fixBookingSources() {
    return this.adminService.fixBookingSources();
  }

  @Post('bookings/force-update/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Force update specific booking source' })
  async forceUpdateBookingSource(@Param('id') bookingId: string, @Body() body: { source: string }) {
    return this.adminService.forceUpdateBookingSource(bookingId, body.source);
  }

  @Get('flights')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all flights' })
  async getFlights() {
    return this.adminService.getAllFlights();
  }

  @Post('flights')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new flight' })
  @ApiBody({ type: CreateFlightDto })
  async createFlight(@Req() req: any, @Body() body: CreateFlightDto) {
    return this.adminService.createFlight(req.user.userId, body);
  }

  @Put('flights/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update flight' })
  @ApiBody({ type: UpdateFlightDto })
  async updateFlight(@Param('id') flightId: string, @Body() body: UpdateFlightDto) {
    return this.adminService.updateFlight(flightId, body);
  }

  @Delete('flights/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete flight' })
  async deleteFlight(@Param('id') flightId: string) {
    return this.adminService.deleteFlight(flightId);
  }

  @Put('flights/:id/toggle-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle flight status (ON_TIME/CANCELLED)' })
  async toggleFlightStatus(@Param('id') flightId: string) {
    return this.adminService.toggleFlightStatus(flightId);
  }

  @Get('flights/:id/sales-report')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get flight sales report' })
  async getFlightSalesReport(@Param('id') flightId: string) {
    return this.adminService.getFlightSalesReport(flightId);
  }

  @Get('flights/:id/capacity-report')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get flight capacity report' })
  async getFlightCapacityReport(@Param('id') flightId: string) {
    return this.adminService.getFlightCapacityReport(flightId);
  }

  @Get('flights/:id/allotments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get flight seat allotments' })
  async getFlightAllotments(@Param('id') flightId: string) {
    return this.adminService.getFlightAllotments(flightId);
  }

  @Post('flights/:id/allotments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create seat allotment' })
  async createAllotment(@Param('id') flightId: string, @Body() data: { agentId: string; seats: number; expiresAt: string }) {
    return this.adminService.createAllotment(flightId, data);
  }

  @Delete('flights/:id/allotments/:allotmentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete seat allotment' })
  async deleteAllotment(@Param('id') flightId: string, @Param('allotmentId') allotmentId: string) {
    return this.adminService.deleteAllotment(flightId, allotmentId);
  }

  @Get('tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all support tickets' })
  async getAllTickets(@Query('status') status?: string) {
    return this.adminService.getAllTickets(status);
  }

  @Put('tickets/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ticket status' })
  async updateTicketStatus(@Param('id') ticketId: string, @Body() body: { status: string }) {
    return this.adminService.updateTicketStatus(ticketId, body.status);
  }

  @Post('tickets/:id/admin-reply')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin reply to ticket with notification channels' })
  async adminReplyToTicket(@Req() req: any, @Param('id') ticketId: string, @Body() body: { 
    message: string; 
    sendChannels: { email: boolean; sms: boolean; whatsapp: boolean; } 
  }) {
    return this.adminService.adminReplyToTicket(req.user.userId, ticketId, body.message, body.sendChannels);
  }

  @Get('basic-data/:type')
  @Public()
  @ApiOperation({ summary: 'Get basic data by type' })
  async getBasicData(@Param('type') type: string) {
    return this.adminService.getBasicData(type);
  }

  @Post('basic-data/:type')
  @Public()
  @ApiOperation({ summary: 'Create basic data item' })
  async createBasicData(@Param('type') type: string, @Body() data: any) {
    return this.adminService.createBasicData(type, data);
  }

  @Put('basic-data/:type/:id')
  @Public()
  @ApiOperation({ summary: 'Update basic data item' })
  async updateBasicData(@Param('type') type: string, @Param('id') id: string, @Body() data: any) {
    return this.adminService.updateBasicData(type, id, data);
  }

  @Delete('basic-data/:type/:id')
  @Public()
  @ApiOperation({ summary: 'Delete basic data item' })
  async deleteBasicData(@Param('type') type: string, @Param('id') id: string) {
    return this.adminService.deleteBasicData(type, id);
  }

  @Get('commission-models')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get commission models' })
  async getCommissionModels() {
    return this.adminService.getCommissionModels();
  }

  @Post('commission-models')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create commission model' })
  async createCommissionModel(@Body() data: any) {
    return this.adminService.createCommissionModel(data);
  }

  @Put('commission-models/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update commission model' })
  async updateCommissionModel(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCommissionModel(id, data);
  }

  @Delete('commission-models/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete commission model' })
  async deleteCommissionModel(@Param('id') id: string) {
    return this.adminService.deleteCommissionModel(id);
  }

  @Get('rate-limits')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rate limits' })
  async getRateLimits() {
    return this.adminService.getRateLimits();
  }

  @Post('rate-limits')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create rate limit' })
  async createRateLimit(@Body() data: any) {
    return this.adminService.createRateLimit(data);
  }

  @Put('rate-limits/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update rate limit' })
  async updateRateLimit(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateRateLimit(id, data);
  }

  @Delete('rate-limits/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete rate limit' })
  async deleteRateLimit(@Param('id') id: string) {
    return this.adminService.deleteRateLimit(id);
  }

  @Get('refund-policies')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get refund policies' })
  async getRefundPolicies() {
    return this.adminService.getRefundPolicies();
  }

  @Post('refund-policies')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create refund policy' })
  async createRefundPolicy(@Body() data: any) {
    return this.adminService.createRefundPolicy(data);
  }

  @Put('refund-policies/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update refund policy' })
  async updateRefundPolicy(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateRefundPolicy(id, data);
  }

  @Delete('refund-policies/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete refund policy' })
  async deleteRefundPolicy(@Param('id') id: string) {
    return this.adminService.deleteRefundPolicy(id);
  }

  @Get('activity-logs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activity logs' })
  async getActivityLogs(@Query('page') page = 1, @Query('limit') limit = 50): Promise<any> {
    return this.adminService.getActivityLogs(page, limit);
  }

  @Get('tenants')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tenants' })
  async getTenants() {
    return this.adminService.getTenants();
  }

  @Get('tenants/commission/stats/:tenantId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get commission statistics for a tenant' })
  async getCommissionStats(@Param('tenantId') tenantId: string) {
    return this.adminService.getCommissionStats(tenantId);
  }

  @Post('tenants')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new tenant' })
  async createTenant(@Body() data: any) {
    return this.adminService.createTenant(data);
  }

  @Put('tenants/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenant' })
  async updateTenant(@Param('id') tenantId: string, @Body() data: any) {
    return this.adminService.updateTenant(tenantId, data);
  }

  @Get('permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get role permissions' })
  async getPermissions() {
    return this.adminService.getPermissions();
  }

  @Put('permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role permissions' })
  async updatePermissions(@Body() permissions: any) {
    return this.adminService.updatePermissions(permissions);
  }

  @Get('advertisements')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get advertisements' })
  async getAdvertisements() {
    return this.adminService.getAdvertisements();
  }

  @Post('advertisements')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create advertisement' })
  async createAdvertisement(@Body() data: any) {
    return this.adminService.createAdvertisement(data);
  }

  @Put('advertisements/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update advertisement' })
  async updateAdvertisement(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateAdvertisement(id, data);
  }

  @Delete('advertisements/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete advertisement' })
  async deleteAdvertisement(@Param('id') id: string) {
    return this.adminService.deleteAdvertisement(id);
  }

  @Get('content')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get site content' })
  async getContent() {
    return this.adminService.getContent();
  }

  @Put('content')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update site content' })
  async updateContent(@Body() content: any) {
    return this.adminService.updateContent(content);
  }

  @Post('manual-booking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create manual booking' })
  async createManualBooking(@Body() data: any) {
    return this.adminService.createManualBooking(data);
  }

  // Refunds endpoints
  @Get('refunds')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all refunds (admin)' })
  @ApiQuery({ name: 'status', required: false })
  async getRefunds(@Query('status') status?: string) {
    return this.adminService.getRefunds(status);
  }

  @Put('refunds/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update refund status (admin)' })
  async updateRefund(@Param('id') refundId: string, @Body() body: { action: string; reason?: string }) {
    return this.adminService.updateRefund(refundId, body.action, body.reason);
  }

  // Accounting endpoints
  @Get('accounting/expenses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get expenses (admin)' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getExpenses(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.adminService.getExpenses(startDate, endDate);
  }

  @Post('accounting/expenses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create expense (admin)' })
  async createExpense(@Body() data: any) {
    return this.adminService.createExpense(data);
  }

  @Get('accounting/chart-of-accounts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chart of accounts (admin)' })
  async getChartOfAccounts() {
    return this.adminService.getChartOfAccounts();
  }

  @Post('accounting/chart-of-accounts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create account (admin)' })
  async createAccount(@Body() data: any) {
    return this.adminService.createAccount(data);
  }

  @Put('accounting/chart-of-accounts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update account (admin)' })
  async updateAccount(@Param('id') accountId: string, @Body() data: any) {
    return this.adminService.updateAccount(accountId, data);
  }

  // Integrations endpoints
  @Get('integrations/telegram')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Telegram configuration (admin)' })
  async getTelegramConfig() {
    return this.adminService.getTelegramConfig();
  }

  @Put('integrations/telegram')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Telegram configuration (admin)' })
  async updateTelegramConfig(@Body() config: any) {
    return this.adminService.updateTelegramConfig(config);
  }

  @Get('integrations/whatsapp')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get WhatsApp configuration (admin)' })
  async getWhatsAppConfig() {
    return this.adminService.getWhatsAppConfig();
  }

  @Put('integrations/whatsapp')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update WhatsApp configuration (admin)' })
  async updateWhatsAppConfig(@Body() config: any) {
    return this.adminService.updateWhatsAppConfig(config);
  }
}
