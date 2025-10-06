import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';

@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Get()
  findAll() {
    return this.advertisementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advertisementService.findOne(id);
  }
}
