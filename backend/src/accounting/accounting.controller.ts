import { Controller, Get, Post, Put, UseGuards, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountingService } from './accounting.service';

class CreateAccountDto {
  id!: string;
  name!: any; // LocalizedName
  type!: string;
  isParent?: boolean;
  parentId?: string;
}

class CreateExpenseDto {
  description!: string;
  amount!: number;
  accountId!: string;
  date!: string;
  userId!: string;
}

class CreateJournalEntryDto {
  description!: string;
  transactions!: Array<{
    accountId: string;
    debit: number;
    credit: number;
  }>;
  userId!: string;
}

@ApiTags('accounting')
@Controller({ path: 'accounting', version: '1' })
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get accounting overview' })
  async getOverview() {
    return this.accountingService.getOverview();
  }

  @Get('chart-of-accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chart of accounts' })
  async getChartOfAccounts() {
    return this.accountingService.getChartOfAccounts();
  }

  @Post('chart-of-accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new account' })
  @ApiBody({ type: CreateAccountDto })
  async createAccount(@Body() data: CreateAccountDto) {
    return this.accountingService.createAccount(data);
  }

  @Put('chart-of-accounts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update account' })
  @ApiBody({ type: CreateAccountDto })
  async updateAccount(@Param('id') accountId: string, @Body() data: CreateAccountDto) {
    return this.accountingService.updateAccount(accountId, data);
  }

  @Get('journal-entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get journal entries' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getJournalEntries(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.accountingService.getJournalEntries(startDate, endDate);
  }

  @Post('journal-entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create journal entry' })
  @ApiBody({ type: CreateJournalEntryDto })
  async createJournalEntry(@Body() data: CreateJournalEntryDto) {
    return this.accountingService.createJournalEntry(data);
  }

  @Get('expenses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get expenses' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getExpenses(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.accountingService.getExpenses(startDate, endDate);
  }

  @Post('expenses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create expense' })
  @ApiBody({ type: CreateExpenseDto })
  async createExpense(@Body() data: CreateExpenseDto) {
    return this.accountingService.createExpense(data);
  }

  @Get('reports/profit-loss')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profit & loss report' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getProfitLossReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.accountingService.getProfitLossReport(startDate, endDate);
  }

  @Get('reports/balance-sheet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get balance sheet report' })
  @ApiQuery({ name: 'asOfDate', required: true })
  async getBalanceSheetReport(@Query('asOfDate') asOfDate: string) {
    return this.accountingService.getBalanceSheetReport(asOfDate);
  }

  @Get('reports/trial-balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trial balance report' })
  @ApiQuery({ name: 'asOfDate', required: true })
  async getTrialBalanceReport(@Query('asOfDate') asOfDate: string) {
    return this.accountingService.getTrialBalanceReport(asOfDate);
  }
  @Get('ledger/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get account ledger' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getAccountLedger(@Param('accountId') accountId: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.accountingService.getAccountLedger(accountId, startDate, endDate);
  }
}
