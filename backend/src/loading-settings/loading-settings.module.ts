import { Module } from '@nestjs/common';
import { LoadingSettingsController } from './loading-settings.controller';
import { LoadingSettingsService } from './loading-settings.service';

@Module({
  controllers: [LoadingSettingsController],
  providers: [LoadingSettingsService],
  exports: [LoadingSettingsService],
})
export class LoadingSettingsModule {}












