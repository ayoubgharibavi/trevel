import { Controller, Get, Post, Query, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinancialReportsService } from './financial-reports.service';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    sub: string;
    username: string;
    role: string;
  };
}

@Controller('financial-reports')
@UseGuards(JwtAuthGuard)
export class FinancialReportsController {
  constructor(private readonly financialReportsService: FinancialReportsService) {}

  @Get('user-summary')
  async getUserFinancialSummary(@Request() req: AuthenticatedRequest) {
    return this.financialReportsService.getUserFinancialSummary(req.user.sub);
  }

  @Get('profit-loss')
  async getProfitLossReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.financialReportsService.getProfitLossReport(start, end);
  }

  @Get('travel-expenses')
  async getUserTravelExpenses(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.financialReportsService.getUserTravelExpenses(req.user.sub, start, end);
  }

  @Get('invoice/:bookingId')
  async generateInvoice(@Param('bookingId') bookingId: string, @Request() req: AuthenticatedRequest) {
    return this.financialReportsService.generateInvoice(bookingId, req.user.sub);
  }
}








