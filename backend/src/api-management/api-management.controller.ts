import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiManagementService } from './api-management.service';

@ApiTags('api-management')
@Controller({ path: 'api-management', version: '1' })
export class ApiManagementController {
  constructor(private readonly apiManagementService: ApiManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all API management configurations' })
  async getAllApis() {
    return this.apiManagementService.getAllApis();
  }

  @Post()
  @ApiOperation({ summary: 'Create new API management configuration' })
  async createApi(@Body() createApiDto: any) {
    return this.apiManagementService.createApi(createApiDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update API management configuration' })
  async updateApi(@Param('id') id: string, @Body() updateApiDto: any) {
    return this.apiManagementService.updateApi(id, updateApiDto);
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle API active status' })
  async toggleApiStatus(@Param('id') id: string) {
    return this.apiManagementService.toggleApiStatus(id);
  }

  @Put(':id/toggle-enabled')
  @ApiOperation({ summary: 'Toggle API enabled status' })
  async toggleApiEnabled(@Param('id') id: string) {
    return this.apiManagementService.toggleApiEnabled(id);
  }

  @Post(':id/test-connection')
  @ApiOperation({ summary: 'Test API connection' })
  async testApiConnection(@Param('id') id: string) {
    return this.apiManagementService.testApiConnection(id);
  }

  @Post(':id/get-balance')
  @ApiOperation({ summary: 'Get API balance' })
  async getApiBalance(@Param('id') id: string) {
    return this.apiManagementService.getApiBalance(id);
  }

  @Post('update-all-statuses')
  @ApiOperation({ summary: 'Update all API statuses' })
  async updateAllStatuses() {
    return this.apiManagementService.updateAllStatuses();
  }

  @Post('update-all-balances')
  @ApiOperation({ summary: 'Update all API balances' })
  async updateAllBalances() {
    return this.apiManagementService.updateAllBalances();
  }
}