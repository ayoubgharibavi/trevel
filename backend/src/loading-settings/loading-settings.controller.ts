import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoadingSettingsService } from './loading-settings.service';

@ApiTags('loading-settings')
@Controller({ path: 'loading-settings', version: '1' })
export class LoadingSettingsController {
  constructor(private readonly loadingSettingsService: LoadingSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get loading settings' })
  async getSettings() {
    return this.loadingSettingsService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Create loading settings' })
  async createSettings(@Body() createSettingsDto: any) {
    return this.loadingSettingsService.createSettings(createSettingsDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update loading settings' })
  async updateSettings(@Param('id') id: string, @Body() updateSettingsDto: any) {
    return this.loadingSettingsService.updateSettings(id, updateSettingsDto);
  }
}












