import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CommissionService } from './commission.service';
import { DomainRoutingService } from './domain-routing.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateCommissionTransactionDto } from './dto/create-commission-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly commissionService: CommissionService,
    private readonly domainRoutingService: DomainRoutingService
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.createTenant(createTenantDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findAll() {
    return this.tenantsService.findAllTenants();
  }

  @Get('sub-tenants/:parentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getSubTenants(@Param('parentId') parentId: string) {
    return this.tenantsService.getSubTenants(parentId);
  }

  @Get('stats/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getTenantStats(@Param('id') id: string) {
    return this.tenantsService.getTenantStats(id);
  }

  @Get('by-slug/:slug')
  getTenantBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findTenantBySlug(slug);
  }

  @Get('by-domain/:domain')
  getTenantByDomain(@Param('domain') domain: string) {
    return this.domainRoutingService.findTenantByDomain(domain);
  }

  @Get('validate-domain/:domain')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  validateDomain(@Param('domain') domain: string, @Query('excludeId') excludeId?: string) {
    return this.domainRoutingService.validateDomain(domain, excludeId);
  }

  @Get('branding/:id')
  getTenantBranding(@Param('id') id: string) {
    return this.domainRoutingService.getTenantBranding(id);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.tenantsService.findTenantById(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.updateTenant(id, updateTenantDto);
  }

  @Put(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  activate(@Param('id') id: string) {
    return this.tenantsService.activateTenant(id);
  }

  @Put(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  deactivate(@Param('id') id: string) {
    return this.tenantsService.deactivateTenant(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.tenantsService.deleteTenant(id);
  }

  // Commission endpoints
  @Post('commission')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  createCommission(@Body() createDto: CreateCommissionTransactionDto) {
    return this.commissionService.createCommissionTransaction(createDto);
  }

  @Get('commission/:tenantId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getTenantCommissions(@Param('tenantId') tenantId: string) {
    return this.commissionService.getTenantCommissions(tenantId);
  }

  @Get('commission/parent/:parentTenantId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getParentCommissions(@Param('parentTenantId') parentTenantId: string) {
    return this.commissionService.getParentCommissions(parentTenantId);
  }

  @Get('commission/stats/:tenantId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getCommissionStats(@Param('tenantId') tenantId: string) {
    return this.commissionService.getCommissionStats(tenantId);
  }

  @Put('commission/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  updateCommissionStatus(
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'PAID' | 'CANCELLED'
  ) {
    return this.commissionService.updateCommissionStatus(id, status);
  }

  @Post('commission/process-booking/:bookingId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  processBookingCommission(@Param('bookingId') bookingId: string) {
    return this.commissionService.processBookingCommission(bookingId);
  }
}

