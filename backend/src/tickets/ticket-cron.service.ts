import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketCronService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async autoCloseOldTickets() {
    console.log('🕐 Running auto-close check for old tickets...');
    
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    const oldTickets = await this.prisma.ticket.findMany({
      where: {
        status: {
          in: ['WAITING_FOR_SUPPORT', 'RESPONDED']
        },
        updatedAt: {
          lt: fortyEightHoursAgo
        }
      }
    });

    console.log(`🕐 Found ${oldTickets.length} tickets to auto-close`);

    for (const ticket of oldTickets) {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'COMPLETED', // Auto-close after 48 hours
          updatedAt: new Date(),
        },
      });
      
      console.log(`✅ Auto-closed ticket ${ticket.id} (${ticket.subject})`);
    }

    if (oldTickets.length > 0) {
      console.log(`🎯 Auto-closed ${oldTickets.length} tickets`);
    }
  }
}




