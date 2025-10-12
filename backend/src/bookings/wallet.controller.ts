import { Controller, Post, Get, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletBlockService, WalletBlockRequest, WalletUnblockRequest } from './wallet-block.service';
import { User } from '@prisma/client';

@ApiTags('wallet')
@Controller({ path: 'wallet', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletBlockService: WalletBlockService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved successfully' })
  async getBalance(user: User) {
    try {
      const balance = await this.walletBlockService.getWalletBalance(user.id);
      return {
        success: true,
        data: balance
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('block')
  @ApiOperation({ summary: 'Block funds in wallet' })
  @ApiResponse({ status: 200, description: 'Funds blocked successfully' })
  async blockFunds(
    user: User,
    @Body() blockRequest: Omit<WalletBlockRequest, 'userId'>
  ) {
    try {
      const request: WalletBlockRequest = {
        ...blockRequest,
        userId: user.id
      };

      const result = await this.walletBlockService.blockFunds(request);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('unblock')
  @ApiOperation({ summary: 'Unblock funds in wallet' })
  @ApiResponse({ status: 200, description: 'Funds unblocked successfully' })
  async unblockFunds(
    user: User,
    @Body() unblockRequest: WalletUnblockRequest
  ) {
    try {
      const result = await this.walletBlockService.unblockFunds(unblockRequest);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('confirm-payment/:transactionId')
  @ApiOperation({ summary: 'Confirm payment and transfer blocked funds' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  async confirmPayment(
    user: User,
    @Param('transactionId') transactionId: string,
    @Body() body: { bookingId: string }
  ) {
    try {
      const result = await this.walletBlockService.confirmPayment(transactionId, body.bookingId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully' })
  async getTransactions(user: User) {
    try {
      const transactions = await this.walletBlockService.getWalletTransactions(user.id);
      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
