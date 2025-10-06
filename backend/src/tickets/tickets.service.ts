import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async getUserTickets(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return tickets.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      bookingId: ticket.bookingId,
      user: ticket.user,
      messages: ticket.messages.map(msg => ({
        id: msg.id,
        author: msg.authorType as 'USER' | 'ADMIN',
        authorName: msg.authorType === 'USER' ? ticket.user?.name || ticket.user?.username : 'پشتیبانی',
        text: msg.text,
        timestamp: msg.timestamp.toISOString()
      }))
    }));
  }

  async createTicket(userId: string, data: { subject: string; message: string; bookingId?: string; priority?: string; }) {
    const newTicket = await this.prisma.ticket.create({
      data: {
        userId,
        subject: data.subject,
        status: 'WAITING_FOR_SUPPORT', // User creates ticket, status is "waiting for support"
        priority: data.priority || 'MEDIUM',
        bookingId: data.bookingId,
        messages: {
          create: {
            authorId: userId,
            authorType: 'USER',
            text: data.message,
            timestamp: new Date(),
          },
        },
      },
      include: { 
        messages: {
          orderBy: { timestamp: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
    });

    return {
      success: true,
      ticket: newTicket,
      message: 'تیکت شما با موفقیت ایجاد شد',
    };
  }

  async getTicket(userId: string, ticketId: string) {
    // Mock single ticket - replace with Prisma when DB is ready
    return {
      id: ticketId,
      userId,
      subject: 'درخواست تغییر صندلی',
      status: 'OPEN',
      priority: 'MEDIUM',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      bookingId: 'BK16252435123',
      messages: [
        {
          id: 'msg-1',
          author: 'USER',
          authorName: 'کاربر تست',
          text: 'سلام، امکان تغییر صندلی به کنار پنجره وجود دارد؟',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'msg-2',
          author: 'ADMIN',
          authorName: 'پشتیبانی',
          text: 'درخواست شما دریافت شد و در حال بررسی است.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  }

  async addMessage(userId: string, ticketId: string, messageText: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    // Ensure the user is authorized to add a message to this ticket
    // For user replies, this means checking if userId matches ticket.userId
    if (ticket.userId !== userId) {
      throw new UnauthorizedException('شما مجاز به افزودن پیام به این تیکت نیستید');
    }

    const newMessage = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        authorId: userId,
        authorType: 'USER',
        text: messageText,
        timestamp: new Date(),
      },
    });

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'WAITING_FOR_SUPPORT', // User replies, status becomes "waiting for support"
        updatedAt: new Date(),
      },
      include: { 
        messages: {
          orderBy: { timestamp: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
    });

    // Format the ticket data to match frontend expectations
    const formattedTicket = {
      id: updatedTicket.id,
      subject: updatedTicket.subject,
      status: updatedTicket.status,
      priority: updatedTicket.priority,
      createdAt: updatedTicket.createdAt.toISOString(),
      updatedAt: updatedTicket.updatedAt.toISOString(),
      bookingId: updatedTicket.bookingId,
      user: updatedTicket.user,
      messages: updatedTicket.messages.map(msg => ({
        id: msg.id,
        author: msg.authorType as 'USER' | 'ADMIN',
        authorName: msg.authorType === 'USER' ? updatedTicket.user?.name || updatedTicket.user?.username : 'پشتیبانی',
        text: msg.text,
        timestamp: msg.timestamp.toISOString()
      }))
    };

    return {
      success: true,
      message: newMessage,
      ticketStatus: updatedTicket.status,
      ticket: formattedTicket,
    };
  }

  async addAdminMessage(adminId: string, ticketId: string, messageText: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    const newMessage = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        authorId: adminId,
        authorType: 'ADMIN',
        text: messageText,
        timestamp: new Date(),
      },
    });

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'RESPONDED', // Admin replies, status becomes "responded"
        updatedAt: new Date(),
      },
      include: { 
        messages: {
          orderBy: { timestamp: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
    });

    return {
      id: updatedTicket.id,
      subject: updatedTicket.subject,
      status: updatedTicket.status,
      priority: updatedTicket.priority,
      createdAt: updatedTicket.createdAt.toISOString(),
      updatedAt: updatedTicket.updatedAt.toISOString(),
      bookingId: updatedTicket.bookingId,
      user: updatedTicket.user,
      messages: updatedTicket.messages.map(msg => ({
        id: msg.id,
        author: msg.authorType as 'USER' | 'ADMIN',
        authorName: msg.authorType === 'USER' ? updatedTicket.user?.name || updatedTicket.user?.username : 'پشتیبانی',
        text: msg.text,
        timestamp: msg.timestamp.toISOString()
      }))
    };
  }

  async markTicketAsInProgress(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'IN_PROGRESS', // Admin opens ticket, status becomes "in progress"
        updatedAt: new Date(),
      },
    });

    return updatedTicket;
  }

  async autoCloseOldTickets() {
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

    for (const ticket of oldTickets) {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'COMPLETED', // Auto-close after 48 hours
          updatedAt: new Date(),
        },
      });
    }

    return { closedCount: oldTickets.length };
  }

  async closeTicket(userId: string, ticketId: string) {
    // Mock close ticket - replace with Prisma when DB is ready
    return {
      success: true,
      message: 'تیکت با موفقیت بسته شد'
    };
  }
}
