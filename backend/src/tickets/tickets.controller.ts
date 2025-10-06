import { Controller, Get, Post, UseGuards, Req, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, AddMessageDto } from '../common/dto';

@ApiTags('tickets')
@Controller({ path: 'tickets', version: '1' })
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user tickets' })
  async getTickets(@Req() req: any) {
    return this.ticketsService.getUserTickets(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new support ticket' })
  @ApiBody({ type: CreateTicketDto })
  async createTicket(@Req() req: any, @Body() body: CreateTicketDto) {
    return this.ticketsService.createTicket(req.user.userId, body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket details' })
  async getTicket(@Req() req: any, @Param('id') ticketId: string) {
    return this.ticketsService.getTicket(req.user.userId, ticketId);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add message to ticket' })
  @ApiBody({ type: AddMessageDto })
  async addMessage(@Req() req: any, @Param('id') ticketId: string, @Body() body: AddMessageDto) {
    return this.ticketsService.addMessage(req.user.userId, ticketId, body.message);
  }

  @Post(':id/admin-message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add admin message to ticket' })
  @ApiBody({ type: AddMessageDto })
  async addAdminMessage(@Req() req: any, @Param('id') ticketId: string, @Body() body: AddMessageDto) {
    return this.ticketsService.addAdminMessage(req.user.userId, ticketId, body.message);
  }

  @Put(':id/mark-in-progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark ticket as in progress' })
  async markTicketAsInProgress(@Param('id') ticketId: string) {
    return this.ticketsService.markTicketAsInProgress(ticketId);
  }

  @Post('auto-close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Auto-close old tickets' })
  async autoCloseOldTickets() {
    return this.ticketsService.autoCloseOldTickets();
  }

  @Put(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close ticket' })
  async closeTicket(@Req() req: any, @Param('id') ticketId: string) {
    return this.ticketsService.closeTicket(req.user.userId, ticketId);
  }
}
