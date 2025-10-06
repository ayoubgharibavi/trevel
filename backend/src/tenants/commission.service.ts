import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from './pricing.service';
import { CreateCommissionTransactionDto } from './dto/create-commission-transaction.dto';

@Injectable()
export class CommissionService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PricingService))
    private pricingService: PricingService
  ) {}

  async createCommissionTransaction(createDto: CreateCommissionTransactionDto) {
    const { tenantId, bookingId, totalAmount, agentCommission, parentCommission, netAmount } = createDto;

    // Get tenant info
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { parentTenant: true }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // اگر کمیسیون‌ها از قبل محاسبه شده باشند، از آنها استفاده کن
    if (agentCommission !== undefined && parentCommission !== undefined) {
      const agentAmount = Math.floor(agentCommission);
      const parentAmount = Math.floor(parentCommission);

      return this.prisma.commissionTransaction.create({
        data: {
          tenantId,
          bookingId,
          agentCommission: agentCommission,
          parentCommission: parentCommission,
          totalAmount: BigInt(totalAmount),
          agentAmount: BigInt(agentAmount),
          parentAmount: BigInt(parentAmount),
          status: 'PENDING'
        }
      });
    }

    // روش قدیمی - محاسبه کمیسیون
    const agentCommissionRate = tenant.commissionRate || 5.0;
    const parentCommissionRate = tenant.parentCommissionRate || 2.0;

    let agentAmount: number;
    let parentAmount: number;

    // محاسبه کمیسیون آژانس
    if (tenant.commissionType === 'FIXED' && tenant.commissionAmount) {
      agentAmount = Number(tenant.commissionAmount);
    } else {
      agentAmount = Math.floor((totalAmount * agentCommissionRate) / 100);
    }

    // محاسبه کمیسیون والد
    if (tenant.parentCommissionType === 'FIXED' && tenant.parentCommissionAmount) {
      parentAmount = Number(tenant.parentCommissionAmount);
    } else {
      parentAmount = Math.floor((totalAmount * parentCommissionRate) / 100);
    }

    return this.prisma.commissionTransaction.create({
      data: {
        tenantId,
        bookingId,
        agentCommission: agentCommissionRate,
        parentCommission: parentCommissionRate,
        totalAmount: BigInt(totalAmount),
        agentAmount: BigInt(agentAmount),
        parentAmount: BigInt(parentAmount),
        status: 'PENDING'
      }
    });
  }

  async getTenantCommissions(tenantId: string) {
    return this.prisma.commissionTransaction.findMany({
      where: { tenantId },
      include: {
        booking: {
          include: {
            flight: true,
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getParentCommissions(parentTenantId: string) {
    // Get all sub-tenants
    const subTenants = await this.prisma.tenant.findMany({
      where: { parentTenantId },
      select: { id: true }
    });

    const subTenantIds = subTenants.map(t => t.id);

    return this.prisma.commissionTransaction.findMany({
      where: { 
        tenantId: { in: subTenantIds }
      },
      include: {
        tenant: true,
        booking: {
          include: {
            flight: true,
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateCommissionStatus(id: string, status: 'PENDING' | 'PAID' | 'CANCELLED') {
    return this.prisma.commissionTransaction.update({
      where: { id },
      data: { 
        status,
        paidAt: status === 'PAID' ? new Date() : null
      }
    });
  }

  async getCommissionStats(tenantId: string) {
    const stats = await this.prisma.commissionTransaction.aggregate({
      where: { tenantId },
      _sum: {
        agentAmount: true,
        parentAmount: true,
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    const pendingStats = await this.prisma.commissionTransaction.aggregate({
      where: { 
        tenantId,
        status: 'PENDING'
      },
      _sum: {
        agentAmount: true
      },
      _count: {
        id: true
      }
    });

    const paidStats = await this.prisma.commissionTransaction.aggregate({
      where: { 
        tenantId,
        status: 'PAID'
      },
      _sum: {
        agentAmount: true
      },
      _count: {
        id: true
      }
    });

    return {
      totalCommissions: stats._sum.agentAmount || BigInt(0),
      totalPaid: paidStats._sum.agentAmount || BigInt(0),
      totalPending: pendingStats._sum.agentAmount || BigInt(0),
      totalTransactions: stats._count.id,
      pendingTransactions: pendingStats._count.id,
      paidTransactions: paidStats._count.id
    };
  }

  async processBookingCommission(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tenant: true }
    });

    if (!booking || !booking.totalPrice) {
      throw new NotFoundException('Booking not found or has no price');
    }

    // تعیین منبع بر اساس source در booking
    let source: 'sepehr' | 'charter118' | 'manual' = 'manual';
    if (booking.source === 'sepehr') {
      source = 'sepehr';
    } else if (booking.source === 'charter118') {
      source = 'charter118';
    }

    // محاسبه کمیسیون با در نظر گیری نوع قیمت‌گذاری
    const commissionCalculation = await this.pricingService.calculateCommissionForBooking(
      booking.tenantId,
      booking.totalPrice,
      source
    );

    return this.createCommissionTransaction({
      tenantId: booking.tenantId,
      bookingId: booking.id,
      totalAmount: booking.totalPrice,
      agentCommission: commissionCalculation.agentCommission,
      parentCommission: commissionCalculation.parentCommission,
      netAmount: commissionCalculation.netAmount
    });
  }
}
