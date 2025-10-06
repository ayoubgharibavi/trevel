import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PricingCalculation {
  netPrice: number;
  grossPrice: number;
  commissionAmount: number;
  parentCommissionAmount: number;
  finalPrice: number;
}

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  /**
   * محاسبه قیمت نهایی بر اساس نوع قیمت‌گذاری
   * @param tenantId - ID تننت
   * @param basePrice - قیمت پایه از API
   * @param source - منبع قیمت (sepehr, charter118, manual)
   */
  async calculateFinalPrice(
    tenantId: string,
    basePrice: number,
    source: 'sepehr' | 'charter118' | 'manual'
  ): Promise<PricingCalculation> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        commissionRate: true,
        parentCommissionRate: true,
        pricingType: true,
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const { commissionRate, parentCommissionRate, pricingType } = tenant;

    // تعیین نوع قیمت بر اساس منبع و تنظیمات تننت
    const effectivePricingType = this.getEffectivePricingType(pricingType, source);

    let netPrice: number;
    let grossPrice: number;
    let commissionAmount: number;
    let parentCommissionAmount: number;
    let finalPrice: number;

    if (effectivePricingType === 'NET') {
      // قیمت خالص - باید کمیسیون اضافه شود
      netPrice = basePrice;
      commissionAmount = (basePrice * commissionRate) / 100;
      parentCommissionAmount = (basePrice * parentCommissionRate) / 100;
      grossPrice = basePrice + commissionAmount + parentCommissionAmount;
      finalPrice = grossPrice;
    } else {
      // قیمت ناخالص - کمیسیون از آن کسر می‌شود
      grossPrice = basePrice;
      commissionAmount = (basePrice * commissionRate) / 100;
      parentCommissionAmount = (basePrice * parentCommissionRate) / 100;
      netPrice = basePrice - commissionAmount - parentCommissionAmount;
      finalPrice = basePrice;
    }

    return {
      netPrice: Math.round(netPrice),
      grossPrice: Math.round(grossPrice),
      commissionAmount: Math.round(commissionAmount),
      parentCommissionAmount: Math.round(parentCommissionAmount),
      finalPrice: Math.round(finalPrice),
    };
  }

  /**
   * تعیین نوع قیمت‌گذاری مؤثر بر اساس تنظیمات و منبع
   */
  private getEffectivePricingType(
    tenantPricingType: string,
    source: 'sepehr' | 'charter118' | 'manual'
  ): 'GROSS' | 'NET' {
    // اگر تنظیمات تننت NET باشد، همیشه NET است
    if (tenantPricingType === 'NET') {
      return 'NET';
    }

    // اگر تنظیمات تننت GROSS باشد، بر اساس منبع تصمیم‌گیری می‌کنیم
    if (tenantPricingType === 'GROSS') {
      // Sepehr معمولاً قیمت ناخالص ارائه می‌دهد
      if (source === 'sepehr') {
        return 'GROSS';
      }
      // Charter118 معمولاً قیمت خالص ارائه می‌دهد
      if (source === 'charter118') {
        return 'NET';
      }
      // Manual booking همیشه ناخالص است
      if (source === 'manual') {
        return 'GROSS';
      }
    }

    // پیش‌فرض: GROSS
    return 'GROSS';
  }

  /**
   * محاسبه کمیسیون برای یک رزرو
   */
  async calculateCommissionForBooking(
    tenantId: string,
    bookingPrice: number,
    source: 'sepehr' | 'charter118' | 'manual'
  ): Promise<{
    agentCommission: number;
    parentCommission: number;
    netAmount: number;
  }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        commissionRate: true,
        commissionAmount: true,
        commissionType: true,
        parentCommissionRate: true,
        parentCommissionAmount: true,
        parentCommissionType: true,
        pricingType: true,
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const { 
      commissionRate, 
      commissionAmount, 
      commissionType,
      parentCommissionRate, 
      parentCommissionAmount, 
      parentCommissionType,
      pricingType 
    } = tenant;

    // تعیین نوع قیمت‌گذاری مؤثر
    const effectivePricingType = this.getEffectivePricingType(pricingType, source);

    let agentCommission: number;
    let parentCommission: number;
    let netAmount: number;

    // محاسبه کمیسیون آژانس
    if (commissionType === 'FIXED' && commissionAmount) {
      agentCommission = Number(commissionAmount);
    } else {
      agentCommission = (bookingPrice * (commissionRate || 5.0)) / 100;
    }

    // محاسبه کمیسیون والد
    if (parentCommissionType === 'FIXED' && parentCommissionAmount) {
      parentCommission = Number(parentCommissionAmount);
    } else {
      parentCommission = (bookingPrice * (parentCommissionRate || 2.0)) / 100;
    }

    // محاسبه مبلغ خالص
    if (effectivePricingType === 'NET') {
      // قیمت خالص - کمیسیون‌ها اضافه می‌شوند
      netAmount = bookingPrice;
    } else {
      // قیمت ناخالص - کمیسیون‌ها کسر می‌شوند
      netAmount = bookingPrice - agentCommission - parentCommission;
    }

    return {
      agentCommission: Math.round(agentCommission),
      parentCommission: Math.round(parentCommission),
      netAmount: Math.round(netAmount),
    };
  }
}
