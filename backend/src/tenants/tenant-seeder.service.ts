import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantSeederService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedMainTenant();
  }

  async seedMainTenant() {
    try {
      // Check if main tenant exists
      const existingTenant = await this.prisma.tenant.findFirst({
        where: { slug: 'main' }
      });

      if (!existingTenant) {
        // Create main tenant
        const mainTenant = await this.prisma.tenant.create({
          data: {
            name: 'Trevel Main',
            slug: 'main',
            contactEmail: 'admin@trevel.com',
            contactPhone: '+98-912-1234567',
            isActive: true,
            isWhiteLabel: false,
            commissionRate: 0, // Main tenant doesn't pay commission
            parentCommissionRate: 0,
            domain: 'trevel.com',
            primaryColor: '#3B82F6',
            theme: 'default',
            footerText: 'Powered by Trevel',
            supportEmail: 'support@trevel.com',
            supportPhone: '+98-912-1234567'
          }
        });

        console.log('✅ Main tenant created:', mainTenant.id);

        // Update existing users to belong to main tenant
        await this.prisma.user.updateMany({
          where: { tenantId: { equals: null } },
          data: { tenantId: mainTenant.id }
        });

        // Update existing bookings to belong to main tenant
        await this.prisma.booking.updateMany({
          where: { tenantId: { equals: null } },
          data: { tenantId: mainTenant.id }
        });

        console.log('✅ Existing users and bookings assigned to main tenant');
      } else {
        console.log('✅ Main tenant already exists');
      }
    } catch (error) {
      console.error('❌ Error seeding main tenant:', error);
    }
  }
}
