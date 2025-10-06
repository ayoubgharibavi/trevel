import { IsString, IsNumber, IsEmail, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SepehrFlightSearchDto {
  @IsString()
  departureCity!: string;

  @IsString()
  arrivalCity!: string;

  @IsString()
  departureDate!: string;

  @IsNumber()
  adults!: number;

  @IsNumber()
  children!: number;

  @IsNumber()
  infants!: number;

  @IsOptional()
  @IsString()
  cabinClass?: string;
}

export class SepehrPassengerDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEnum(['male', 'female'])
  gender!: 'male' | 'female';

  @IsString()
  birthDate!: string;

  @IsString()
  nationality!: string;
}

export class SepehrContactInfoDto {
  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;
}

export class SepehrPaymentInfoDto {
  @IsString()
  method!: string;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  cvv?: string;
}

export class SepehrBookingDto {
  @IsString()
  flightId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SepehrPassengerDto)
  passengers!: SepehrPassengerDto[];

  @ValidateNested()
  @Type(() => SepehrContactInfoDto)
  contactInfo!: SepehrContactInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SepehrPaymentInfoDto)
  paymentInfo?: SepehrPaymentInfoDto;
}

