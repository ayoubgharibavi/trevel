import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsNumber, IsArray, IsBoolean, IsDateString, ValidateNested, IsDefined, IsNumberString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Re-export LoginDto
export { LoginDto } from './login.dto';

export class CreateExchangeRateDto {
  @ApiProperty({ description: 'شناسه ارز مبدأ' })
  @IsString()
  @IsNotEmpty()
  baseCurrencyId!: string;

  @ApiProperty({ description: 'شناسه ارز مقصد' })
  @IsString()
  @IsNotEmpty()
  targetCurrencyId!: string;

  @ApiProperty({ example: 1.5, description: 'نرخ تبدیل' })
  @IsNumber()
  @IsNotEmpty()
  rate!: number;

  @ApiProperty({ example: 'MANUAL', description: 'منبع نرخ تبدیل', required: false })
  @IsString()
  @IsOptional()
  source?: string;
}

export class UpdateExchangeRateDto {
  @ApiProperty({ example: 1.5, description: 'نرخ تبدیل' })
  @IsNumber()
  @IsNotEmpty()
  rate!: number;

  @ApiProperty({ example: 'MANUAL', description: 'منبع نرخ تبدیل', required: false })
  @IsString()
  @IsOptional()
  source?: string;
}
export class SignupDto {
  @ApiProperty({ example: 'احمد محمدی' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ahmad123' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'ahmad@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: '+989123456789' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}


export class UpdateProfileDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  currentPassword?: string;

  @ApiProperty({ required: false })
  newPassword?: string;
}

export class SavedPassengerDto {
  @ApiProperty({ example: 'احمد' })
  firstName!: string;

  @ApiProperty({ example: 'محمدی' })
  lastName!: string;

  @ApiProperty({ example: 'Iranian' })
  nationality!: string;

  @ApiProperty({ example: 'Male' })
  gender!: string;

  @ApiProperty({ required: false })
  nationalId?: string;

  @ApiProperty({ required: false })
  passportNumber?: string;
}

export class CreateBookingDto {
  @ApiProperty()
  flightId!: string;

  @ApiProperty()
  passengers!: {
    adults: any[];
    children: any[];
    infants: any[];
  };

  @ApiProperty()
  contactEmail!: string;

  @ApiProperty()
  contactPhone!: string;
}

export class CancelBookingDto {
  @ApiProperty({ required: false })
  reason?: string;
}

export class CreateTicketDto {
  @ApiProperty({ example: 'درخواست تغییر صندلی' })
  subject!: string;

  @ApiProperty({ example: 'سلام، امکان تغییر صندلی وجود دارد؟' })
  message!: string;

  @ApiProperty({ required: false })
  bookingId?: string;

  @ApiProperty({ required: false, enum: ['LOW', 'MEDIUM', 'HIGH'] })
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class AddMessageDto {
  @ApiProperty()
  message!: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  role?: string;

  @ApiProperty({ required: false })
  status?: string;
}

// DTOs are defined inline in this file

export class FlightSearchQueryDto {
  @IsNotEmpty()
  @IsString()
  from!: string;

  @IsNotEmpty()
  @IsString()
  to!: string;

  @IsNotEmpty()
  @IsString()
  departureDate!: string; // YYYY-MM-DD format

  @IsOptional()
  @IsString()
  adults?: string; // Number of adults

  @IsOptional()
  @IsString()
  children?: string; // Number of children

  @IsOptional()
  @IsString()
  infants?: string; // Number of infants
}

class FlightLocationDto {
  // Allow additional properties for frontend compatibility
  [key: string]: any;

  @ApiProperty({ example: 'clmey6sjo6d000fumywum4qyl', description: 'شناسه فرودگاه', required: false })
  @IsString()
  @IsOptional()
  airportId?: string;

  @ApiProperty({ example: 'تهران', description: 'نام شهر', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'IKA', description: 'کد IATA فرودگاه', required: false })
  @IsString()
  @IsOptional()
  airportCode?: string;

  @ApiProperty({ example: 'Terminal 1', description: 'ترمینال', required: false })
  @IsString()
  @IsOptional()
  terminal?: string;

  @ApiProperty({ example: '2025-01-01T08:00:00Z', description: 'زمان پرواز برنامه ریزی شده', required: false })
  @IsDateString()
  @IsOptional()
  scheduledTime?: string;

  @ApiProperty({ example: 'A1', description: 'گیت', required: false })
  @IsString()
  @IsOptional()
  gate?: string;
}

class FlightAllotmentDto {
  // Allow additional properties for frontend compatibility
  [key: string]: any;

  @ApiProperty({ example: 'Economy', description: 'کلاس پروازی', required: false })
  @IsString()
  @IsOptional()
  flightClass?: string;

  @ApiProperty({ example: 100, description: 'تعداد صندلی ها', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'seats must be a valid number' })
  seats?: number;

  @ApiProperty({ example: 5000000, description: 'قیمت هر صندلی', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'price must be a valid number' })
  price?: number;
}

export class CreateFlightDto {
  @ApiProperty({ example: 'Iran Air', description: 'نام ایرلاین' })
  @IsString()
  @IsNotEmpty()
  airline!: string;

  @ApiProperty({ example: 'https://example.com/logo.png', description: 'لگوی ایرلاین', required: false })
  @IsString()
  @IsOptional()
  airlineLogoUrl?: string;

  @ApiProperty({ example: 'IR-452', description: 'شماره پرواز' })
  @IsString()
  @IsNotEmpty()
  flightNumber!: string;

  @ApiProperty({ type: FlightLocationDto, description: 'اطلاعات پرواز مبدأ' })
  @Type(() => FlightLocationDto)
  @ValidateNested()
  @IsDefined()
  departure!: FlightLocationDto;

  @ApiProperty({ type: FlightLocationDto, description: 'اطلاعات پرواز مقصد' })
  @Type(() => FlightLocationDto)
  @ValidateNested()
  @IsDefined()
  arrival!: FlightLocationDto;

  @ApiProperty({ example: 120, description: 'مدت زمان پرواز به دقیقه', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'duration must be a valid number' })
  duration?: number;

  @ApiProperty({ example: 0, description: 'تعداد توقف ها', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'stops must be a valid number' })
  stops?: number;

  @ApiProperty({ example: 10000000, description: 'قیمت پایه بلیط' })
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @ApiProperty({ example: 1000000, description: 'مالیات بلیط' })
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber()
  @IsNotEmpty()
  taxes!: number;

  @ApiProperty({ example: 'Economy', description: 'کلاس پروازی' })
  @IsString()
  @IsNotEmpty()
  flightClass!: string;

  @ApiProperty({ example: 'A320', description: 'نوع هواپیما' })
  @IsString()
  @IsNotEmpty()
  aircraft!: string;

  @ApiProperty({ example: 150, description: 'تعداد صندلی های موجود', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'availableSeats must be a valid number' })
  availableSeats?: number;

  @ApiProperty({ example: 180, description: 'ظرفیت کل هواپیما', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'totalCapacity must be a valid number' })
  totalCapacity?: number;

  @ApiProperty({ example: '20kg', description: 'میزان بار مجاز', required: false })
  @IsString()
  @IsOptional()
  baggageAllowance?: string;

  @ApiProperty({ example: 'SCHEDULED', description: 'وضعیت پرواز', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 2, description: 'تعداد ساعات قبل از پرواز برای بستن رزرو', required: false })
  @IsNumber()
  @IsOptional()
  bookingClosesBeforeDepartureHours?: number;

  @ApiProperty({ example: 'MANUAL', description: 'نوع منبع یابی پرواز (Manual, API)', required: false })
  @IsString()
  @IsOptional()
  sourcingType?: string;

  @ApiProperty({ description: 'شناسه مدل کمیسیون', required: false })
  @IsString()
  @IsOptional()
  commissionModelId?: string;

  @ApiProperty({ description: 'شناسه سیاست بازپرداخت', required: false })
  @IsString()
  @IsOptional()
  refundPolicyId?: string;

  @ApiProperty({ type: [FlightAllotmentDto], description: 'تخصیص صندلی ها', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightAllotmentDto)
  @IsOptional()
  allotments?: FlightAllotmentDto[];
}

export class UpdateFlightDto {
  // Allow additional properties for frontend compatibility
  [key: string]: any;

  @ApiProperty({ example: 'Iran Air', description: 'نام ایرلاین', required: false })
  @IsString()
  @IsOptional()
  airline?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', description: 'لگوی ایرلاین', required: false })
  @IsString()
  @IsOptional()
  airlineLogoUrl?: string;

  @ApiProperty({ example: 'IR-452', description: 'شماره پرواز', required: false })
  @IsString()
  @IsOptional()
  flightNumber?: string;

  @ApiProperty({ type: FlightLocationDto, description: 'اطلاعات پرواز مبدأ', required: false })
  @Type(() => FlightLocationDto)
  @ValidateNested()
  @IsOptional()
  departure?: FlightLocationDto;

  @ApiProperty({ type: FlightLocationDto, description: 'اطلاعات پرواز مقصد', required: false })
  @Type(() => FlightLocationDto)
  @ValidateNested()
  @IsOptional()
  arrival?: FlightLocationDto;

  @ApiProperty({ example: 120, description: 'مدت زمان پرواز به دقیقه', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'duration must be a valid number' })
  duration?: number;

  @ApiProperty({ example: 0, description: 'تعداد توقف ها', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'stops must be a valid number' })
  stops?: number;

  @ApiProperty({ example: 10000000, description: 'قیمت پایه بلیط', required: false })
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 1000000, description: 'مالیات بلیط', required: false })
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber()
  @IsOptional()
  taxes?: number;

  @ApiProperty({ example: 'Economy', description: 'کلاس پروازی', required: false })
  @IsString()
  @IsOptional()
  flightClass?: string;

  @ApiProperty({ example: 'A320', description: 'نوع هواپیما', required: false })
  @IsString()
  @IsOptional()
  aircraft?: string;

  @ApiProperty({ example: 150, description: 'تعداد صندلی های موجود', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'availableSeats must be a valid number' })
  availableSeats?: number;

  @ApiProperty({ example: 180, description: 'ظرفیت کل هواپیما', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  })
  @IsNumber({}, { message: 'totalCapacity must be a valid number' })
  totalCapacity?: number;

  @ApiProperty({ example: '20kg', description: 'میزان بار مجاز', required: false })
  @IsString()
  @IsOptional()
  baggageAllowance?: string;

  @ApiProperty({ example: 'SCHEDULED', description: 'وضعیت پرواز', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 2, description: 'تعداد ساعات قبل از پرواز برای بستن رزرو', required: false })
  @IsNumber()
  @IsOptional()
  bookingClosesBeforeDepartureHours?: number;

  @ApiProperty({ example: 'MANUAL', description: 'نوع منبع یابی پرواز (Manual, API)', required: false })
  @IsString()
  @IsOptional()
  sourcingType?: string;

  @ApiProperty({ description: 'شناسه مدل کمیسیون', required: false })
  @IsString()
  @IsOptional()
  commissionModelId?: string;

  @ApiProperty({ description: 'شناسه سیاست بازپرداخت', required: false })
  @IsString()
  @IsOptional()
  refundPolicyId?: string;

  @ApiProperty({ type: [FlightAllotmentDto], description: 'تخصیص صندلی ها', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightAllotmentDto)
  @IsOptional()
  allotments?: FlightAllotmentDto[];
}

export * from './flight.dto';
export * from './login.dto';
export * from './update-user.dto';
export * from './wallet.dto';
export * from './refresh.dto';












































