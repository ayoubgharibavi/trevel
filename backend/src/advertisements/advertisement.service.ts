import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdvertisementService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return {
      success: true,
      data: [],
      message: 'Advertisements retrieved successfully'
    };
  }

  async findOne(id: string) {
    return {
      success: true,
      data: null,
      message: 'Advertisement retrieved successfully'
    };
  }
}


