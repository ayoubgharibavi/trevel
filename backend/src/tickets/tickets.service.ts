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
        author: msg.authorType,
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
        status: 'OPEN',
        priority: data.priority || 'MEDIUM',
        bookingId: data.bookingId,
        messages: {
          create: {
            authorId: userId,
            authorType: 'USER',
            text: data.message,
          },
        },
      },
      include: { messages: true },
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
        author: 'USER',
        text: messageText,
        timestamp: new Date().toISOString(),
      },
    });

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'OPEN', // Reopen ticket on new user message
        updatedAt: new Date().toISOString(),
      },
      include: { messages: true },
    });

    return {
      success: true,
      message: newMessage,
      ticketStatus: updatedTicket.status,
      ticket: updatedTicket,
    };
  }

  async closeTicket(userId: string, ticketId: string) {
    // Mock close ticket - replace with Prisma when DB is ready
    return {
      success: true,
      message: 'تیکت با موفقیت بسته شد'
    };
  }
}
