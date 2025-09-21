import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto, UpdateExchangeRateDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('exchange-rates')
@Controller({ path: 'exchange-rates', version: '1' })
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'دریافت تمام نرخ‌های تبدیل ارز' })
  @ApiResponse({ status: 200, description: 'لیست نرخ‌های تبدیل ارز' })
  async getAllExchangeRates() {
    const rates = await this.exchangeRatesService.getAllExchangeRates();
    // Transform dates to ensure proper serialization
    return rates.map(rate => ({
      ...rate,
      lastUpdated: rate.lastUpdated ? new Date(rate.lastUpdated).toISOString() : null,
    }));
  }

  @Public()
  @Get('currencies')
  @ApiOperation({ summary: 'دریافت تمام ارزها' })
  @ApiResponse({ status: 200, description: 'لیست ارزها' })
  async getAllCurrencies() {
    return this.exchangeRatesService.getAllCurrencies();
  }

  @Public()
  @Get('convert')
  @ApiOperation({ summary: 'تبدیل ارز' })
  @ApiResponse({ status: 200, description: 'مقدار تبدیل شده' })
  async convertCurrency(
    @Query('amount') amount: string,
    @Query('from') fromCurrencyId: string,
    @Query('to') toCurrencyId: string,
  ) {
    const convertedAmount = await this.exchangeRatesService.convertCurrency(
      parseFloat(amount),
      fromCurrencyId,
      toCurrencyId,
    );
    return { convertedAmount };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'دریافت نرخ تبدیل ارز با شناسه' })
  @ApiResponse({ status: 200, description: 'نرخ تبدیل ارز' })
  @ApiResponse({ status: 404, description: 'نرخ تبدیل ارز یافت نشد' })
  async getExchangeRate(@Param('id') id: string) {
    return this.exchangeRatesService.getExchangeRate(id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'ایجاد نرخ تبدیل ارز جدید' })
  @ApiResponse({ status: 201, description: 'نرخ تبدیل ارز ایجاد شد' })
  @ApiResponse({ status: 400, description: 'داده‌های نامعتبر' })
  async createExchangeRate(@Body() createExchangeRateDto: CreateExchangeRateDto) {
    return this.exchangeRatesService.createExchangeRate(createExchangeRateDto);
  }

  @Public()
  @Put(':id')
  @ApiOperation({ summary: 'به‌روزرسانی نرخ تبدیل ارز' })
  @ApiResponse({ status: 200, description: 'نرخ تبدیل ارز به‌روزرسانی شد' })
  @ApiResponse({ status: 404, description: 'نرخ تبدیل ارز یافت نشد' })
  async updateExchangeRate(
    @Param('id') id: string,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto,
  ) {
    return this.exchangeRatesService.updateExchangeRate(id, updateExchangeRateDto);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'حذف نرخ تبدیل ارز' })
  @ApiResponse({ status: 200, description: 'نرخ تبدیل ارز حذف شد' })
  @ApiResponse({ status: 404, description: 'نرخ تبدیل ارز یافت نشد' })
  async deleteExchangeRate(@Param('id') id: string) {
    return this.exchangeRatesService.deleteExchangeRate(id);
  }
}

