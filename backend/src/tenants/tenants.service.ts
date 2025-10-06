import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const { name, slug, contactEmail, contactPhone, parentTenantId, ...otherFields } = createTenantDto;

    // Check if slug is unique
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug }
    });

    if (existingTenant) {
      throw new BadRequestException('Tenant slug already exists');
    }

    // Check if parent tenant exists
    if (parentTenantId) {
      const parentTenant = await this.prisma.tenant.findUnique({
        where: { id: parentTenantId }
      });

      if (!parentTenant) {
        throw new NotFoundException('Parent tenant not found');
      }
    }

    return this.prisma.tenant.create({
      data: {
        name,
        slug,
        contactEmail,
        contactPhone,
        parentTenantId,
        ...otherFields
      }
    });
  }

  async findAllTenants(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      include: {
        parentTenant: true,
        subTenants: true,
        users: true,
        bookings: true,
        _count: {
          select: {
            users: true,
            bookings: true,
            subTenants: true
          }
        }
      }
    });
  }

  async findTenantById(id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        parentTenant: true,
        subTenants: true,
        users: true,
        bookings: true,
        commissionTransactions: true
      }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async findTenantBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        parentTenant: true,
        subTenants: true
      }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async findTenantByDomain(domain: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { domain: domain },
          { subdomain: domain },
          { customDomain: domain }
        ]
      },
      include: {
        parentTenant: true,
        subTenants: true
      }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found for domain');
    }

    return tenant;
  }

  async updateTenant(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findTenantById(id);

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto
    });
  }

  async deleteTenant(id: string): Promise<void> {
    const tenant = await this.findTenantById(id);

    // Check if tenant has sub-tenants
    if (tenant.subTenants && tenant.subTenants.length > 0) {
      throw new BadRequestException('Cannot delete tenant with sub-tenants');
    }

    await this.prisma.tenant.delete({
      where: { id }
    });
  }

  async getSubTenants(parentTenantId: string): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      where: { parentTenantId },
      include: {
        users: true,
        bookings: true,
        _count: {
          select: {
            users: true,
            bookings: true
          }
        }
      }
    });
  }

  async getTenantStats(tenantId: string) {
    const tenant = await this.findTenantById(tenantId);

    const stats = await this.prisma.booking.aggregate({
      where: { tenantId },
      _sum: {
        totalPrice: true
      },
      _count: {
        id: true
      }
    });

    const commissionStats = await this.prisma.commissionTransaction.aggregate({
      where: { tenantId },
      _sum: {
        agentAmount: true,
        parentAmount: true
      },
      _count: {
        id: true
      }
    });

    return {
      tenant,
      totalBookings: stats._count.id,
      totalRevenue: stats._sum.totalPrice || 0,
      totalCommissionEarned: commissionStats._sum.agentAmount || 0,
      totalCommissionPaid: commissionStats._sum.parentAmount || 0,
      commissionTransactions: commissionStats._count.id
    };
  }

  async activateTenant(id: string): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: true }
    });
  }

  async deactivateTenant(id: string): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
