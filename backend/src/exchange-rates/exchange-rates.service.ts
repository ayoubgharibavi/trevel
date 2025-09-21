import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRateDto, UpdateExchangeRateDto } from '../common/dto';

@Injectable()
export class ExchangeRatesService {
  constructor(private prisma: PrismaService) {}

  async getAllExchangeRates() {
    return this.prisma.exchangeRate.findMany({
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });
  }

  async getExchangeRate(id: string) {
    const exchangeRate = await this.prisma.exchangeRate.findUnique({
      where: { id },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });

    if (!exchangeRate) {
      throw new NotFoundException('نرخ تبدیل ارز یافت نشد');
    }

    return exchangeRate;
  }

  async getExchangeRateByCurrencies(baseCurrencyId: string, targetCurrencyId: string) {
    const exchangeRate = await this.prisma.exchangeRate.findUnique({
      where: {
        baseCurrencyId_targetCurrencyId: {
          baseCurrencyId,
          targetCurrencyId,
        },
      },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });

    if (!exchangeRate) {
      throw new NotFoundException('نرخ تبدیل ارز یافت نشد');
    }

    return exchangeRate;
  }

  async createExchangeRate(createExchangeRateDto: CreateExchangeRateDto) {
    // Check if currencies exist
    const baseCurrency = await this.prisma.currency.findUnique({
      where: { id: createExchangeRateDto.baseCurrencyId },
    });

    const targetCurrency = await this.prisma.currency.findUnique({
      where: { id: createExchangeRateDto.targetCurrencyId },
    });

    if (!baseCurrency || !targetCurrency) {
      throw new BadRequestException('ارز مبدأ یا مقصد یافت نشد');
    }

    // Check if exchange rate already exists
    const existingRate = await this.prisma.exchangeRate.findUnique({
      where: {
        baseCurrencyId_targetCurrencyId: {
          baseCurrencyId: createExchangeRateDto.baseCurrencyId,
          targetCurrencyId: createExchangeRateDto.targetCurrencyId,
        },
      },
    });

    if (existingRate) {
      throw new BadRequestException('نرخ تبدیل ارز برای این جفت ارز قبلاً وجود دارد');
    }

    return this.prisma.exchangeRate.create({
      data: {
        baseCurrencyId: createExchangeRateDto.baseCurrencyId,
        targetCurrencyId: createExchangeRateDto.targetCurrencyId,
        rate: createExchangeRateDto.rate,
        source: createExchangeRateDto.source || 'MANUAL',
        lastUpdated: new Date(),
      },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });
  }

  async updateExchangeRate(id: string, updateExchangeRateDto: UpdateExchangeRateDto) {
    const exchangeRate = await this.prisma.exchangeRate.findUnique({
      where: { id },
    });

    if (!exchangeRate) {
      throw new NotFoundException('نرخ تبدیل ارز یافت نشد');
    }

    return this.prisma.exchangeRate.update({
      where: { id },
      data: {
        rate: updateExchangeRateDto.rate,
        source: updateExchangeRateDto.source,
        lastUpdated: new Date(),
      },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });
  }

  async deleteExchangeRate(id: string) {
    const exchangeRate = await this.prisma.exchangeRate.findUnique({
      where: { id },
    });

    if (!exchangeRate) {
      throw new NotFoundException('نرخ تبدیل ارز یافت نشد');
    }

    return this.prisma.exchangeRate.delete({
      where: { id },
    });
  }

  async getAllCurrencies() {
    return this.prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async convertCurrency(amount: number, fromCurrencyId: string, toCurrencyId: string) {
    if (fromCurrencyId === toCurrencyId) {
      return amount;
    }

    const exchangeRate = await this.prisma.exchangeRate.findUnique({
      where: {
        baseCurrencyId_targetCurrencyId: {
          baseCurrencyId: fromCurrencyId,
          targetCurrencyId: toCurrencyId,
        },
      },
    });

    if (!exchangeRate) {
      // Try reverse rate
      const reverseRate = await this.prisma.exchangeRate.findUnique({
        where: {
          baseCurrencyId_targetCurrencyId: {
            baseCurrencyId: toCurrencyId,
            targetCurrencyId: fromCurrencyId,
          },
        },
      });

      if (reverseRate) {
        return amount / reverseRate.rate;
      }

      throw new NotFoundException('نرخ تبدیل ارز برای این جفت ارز یافت نشد');
    }

    return amount * exchangeRate.rate;
  }
}

