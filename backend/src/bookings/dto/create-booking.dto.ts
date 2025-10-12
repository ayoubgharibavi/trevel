import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class PassengerDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  seatNumber?: string;

  @IsString()
  @IsOptional()
  ticketNumber?: string;
}

export class CreateBookingDto {
  @IsString()
  flightId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];

  @IsNumber()
  totalPrice!: number;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  buyerReference?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsString()
  @IsOptional()
  searchQuery?: string;

  @IsString()
  @IsOptional()
  sepehrBookingId?: string;

  @IsString()
  @IsOptional()
  sepehrPnr?: string;

  @IsString()
  @IsOptional()
  charter118BookingId?: string;

  @IsString()
  @IsOptional()
  charter118ConfirmationCode?: string;

  @IsObject()
  @IsOptional()
  flightData?: any; // Flight data from external APIs (Sepehr, Charter118)
}


