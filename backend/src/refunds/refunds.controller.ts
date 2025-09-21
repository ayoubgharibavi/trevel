import { Controller, Get, Post, Put, UseGuards, Req, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RefundsService } from './refunds.service';

class CreateRefundDto {
  bookingId!: string;
  reason?: string;
}

class UpdateRefundDto {
  action!: 'expert_approve' | 'financial_approve' | 'process_payment' | 'reject';
  reason?: string;
}

@ApiTags('refunds')
@Controller({ path: 'refunds', version: '1' })
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user refunds' })
  async getUserRefunds(@Req() req: any) {
    return this.refundsService.getUserRefunds(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request refund' })
  @ApiBody({ type: CreateRefundDto })
  async requestRefund(@Req() req: any, @Body() body: CreateRefundDto) {
    return this.refundsService.requestRefund(req.user.userId, body);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all refunds (admin)' })
  @ApiQuery({ name: 'status', required: false })
  async getAllRefunds(@Query('status') status?: string) {
    return this.refundsService.getAllRefunds(status);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update refund status (admin)' })
  @ApiBody({ type: UpdateRefundDto })
  async updateRefund(@Param('id') refundId: string, @Body() body: UpdateRefundDto) {
    return this.refundsService.updateRefund(refundId, body.action, body.reason);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get refund details' })
  async getRefund(@Req() req: any, @Param('id') refundId: string) {
    return this.refundsService.getRefund(req.user.userId, refundId);
  }
}
