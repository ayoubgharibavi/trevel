import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SepehrController } from './sepehr.controller';
import { SepehrApiService } from './sepehr-api.service';
import { MockBookingService } from './mock-booking.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [SepehrController],
  providers: [SepehrApiService, MockBookingService],
  exports: [SepehrApiService, MockBookingService],
})
export class SepehrModule {}



















