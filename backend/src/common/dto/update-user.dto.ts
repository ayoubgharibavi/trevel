import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] })
  @IsString()
  @IsOptional()
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';

  @ApiProperty({ required: false, enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] })
  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  canBypassRateLimit?: boolean;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  displayCurrencies?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}







