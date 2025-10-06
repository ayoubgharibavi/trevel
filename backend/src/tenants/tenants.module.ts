import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { DomainRoutingService } from './domain-routing.service';
import { TenantSeederService } from './tenant-seeder.service';
import { PricingService } from './pricing.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantsController],
  providers: [TenantsService, DomainRoutingService, TenantSeederService, PricingService],
  exports: [TenantsService, DomainRoutingService, PricingService]
})
export class TenantsModule {}
