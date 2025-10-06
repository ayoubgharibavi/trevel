import { Module } from '@nestjs/common';
import { ApiManagementController } from './api-management.controller';
import { ApiManagementService } from './api-management.service';

@Module({
  controllers: [ApiManagementController],
  providers: [ApiManagementService],
  exports: [ApiManagementService],
})
export class ApiManagementModule {}
