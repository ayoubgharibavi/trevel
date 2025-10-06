import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class UpdateFlightDto {
  @ApiProperty({ example: 'IR1234', required: false })
  @IsString()
  @IsOptional()
  flightNumber?: string;

  @ApiProperty({ example: 'ایران ایر', required: false })
  @IsString()
  @IsOptional()
  airline?: string;

  @ApiProperty({ example: 'Boeing 737', required: false })
  @IsString()
  @IsOptional()
  aircraft?: string;

  @ApiProperty({ example: 'اقتصادی', required: false })
  @IsString()
  @IsOptional()
  flightClass?: string;

  @ApiProperty({ example: 180, required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ example: 1500000, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  taxes?: number;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  availableSeats?: number;

  @ApiProperty({ example: 150, required: false })
  @IsNumber()
  @IsOptional()
  totalCapacity?: number;

  @ApiProperty({ example: 'airport-1', required: false })
  @IsString()
  @IsOptional()
  departureAirportId?: string;

  @ApiProperty({ example: 'airport-2', required: false })
  @IsString()
  @IsOptional()
  arrivalAirportId?: string;

  @ApiProperty({ example: '2025-10-05T10:00:00Z', required: false })
  @IsString()
  @IsOptional()
  departureTime?: string;

  @ApiProperty({ example: '2025-10-05T13:00:00Z', required: false })
  @IsString()
  @IsOptional()
  arrivalTime?: string;

  @ApiProperty({ example: 'ON_TIME', enum: ['ON_TIME', 'CLOSE', 'WAITING_FOR_COMMAND', 'NO_AVAILABILITY', 'CALL_US', 'CANCELLED'], required: false })
  @IsEnum(['ON_TIME', 'CLOSE', 'WAITING_FOR_COMMAND', 'NO_AVAILABILITY', 'CALL_US', 'CANCELLED'])
  @IsOptional()
  status?: string;
}

