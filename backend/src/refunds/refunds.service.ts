import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class RefundsService {
  async getUserRefunds(userId: string) {
    // Mock refunds for user - replace with Prisma when DB is ready
    return [
      {
        id: 'REF-001',
        bookingId: 'BK16252435123',
        userId,
        requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING_EXPERT_REVIEW',
        originalAmount: 11000000,
        penaltyAmount: 1100000,
        refundAmount: 9900000,
        reason: 'تغییر برنامه سفر',
        currency: 'IRR'
      }
    ];
  }

  async requestRefund(userId: string, data: { bookingId: string; reason?: string }) {
    // Mock refund request - replace with Prisma when DB is ready
    const newRefund = {
      id: `REF-${Date.now()}`,
      bookingId: data.bookingId,
      userId,
      requestDate: new Date().toISOString(),
      status: 'PENDING_EXPERT_REVIEW',
      originalAmount: 11000000,
      penaltyAmount: 1100000, // 10% penalty
      refundAmount: 9900000,
      reason: data.reason || 'درخواست استرداد',
      currency: 'IRR'
    };

    return {
      success: true,
      refund: newRefund,
      message: 'درخواست استرداد ثبت شد و در حال بررسی است'
    };
  }

  async getAllRefunds(status?: string) {
    // Mock all refunds for admin - replace with Prisma when DB is ready
    const allRefunds = [
      {
        id: 'REF-001',
        bookingId: 'BK16252435123',
        user: { name: 'احمد محمدی', email: 'ahmad@example.com' },
        requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING_EXPERT_REVIEW',
        originalAmount: 11000000,
        penaltyAmount: 1100000,
        refundAmount: 9900000,
        reason: 'تغییر برنامه سفر'
      },
      {
        id: 'REF-002',
        bookingId: 'BK16252435456',
        user: { name: 'فاطمه احمدی', email: 'fatemeh@example.com' },
        requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING_FINANCIAL_REVIEW',
        originalAmount: 15000000,
        penaltyAmount: 1500000,
        refundAmount: 13500000,
        reason: 'لغو سفر'
      }
    ];

    return status ? allRefunds.filter(r => r.status === status) : allRefunds;
  }

  async updateRefund(refundId: string, action: string, reason?: string) {
    // Mock refund update - replace with Prisma when DB is ready
    const actionMessages = {
      expert_approve: 'استرداد توسط کارشناس تایید شد',
      financial_approve: 'استرداد توسط واحد مالی تایید شد',
      process_payment: 'مبلغ استرداد پرداخت شد',
      reject: 'درخواست استرداد رد شد'
    };

    return {
      success: true,
      message: actionMessages[action as keyof typeof actionMessages] || 'وضعیت به‌روزرسانی شد'
    };
  }
  async getRefund(userId: string, refundId: string) {
    // Mock single refund - replace with Prisma when DB is ready
    return {
      id: refundId,
      bookingId: 'BK16252435123',
      userId,
      requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING_EXPERT_REVIEW',
      originalAmount: 11000000,
      penaltyAmount: 1100000,
      refundAmount: 9900000,
      reason: 'تغییر برنامه سفر',
      currency: 'IRR',
      booking: {
        id: 'BK16252435123',
        flight: {
          flightNumber: 'IR-452',
          departure: { city: 'تهران', dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
          arrival: { city: 'استانبول', dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString() }
        }
      }
    };
  }
}
