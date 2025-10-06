import { IsString, IsEmail, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsEmail()
  contactEmail!: string;

  @IsString()
  contactPhone!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  customDomain?: string;

  @IsOptional()
  @IsString()
  parentTenantId?: string;

  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @IsOptional()
  @IsNumber()
  commissionAmount?: number;

  @IsOptional()
  @IsString()
  commissionType?: 'PERCENTAGE' | 'FIXED';

  @IsOptional()
  @IsNumber()
  parentCommissionRate?: number;

  @IsOptional()
  @IsNumber()
  parentCommissionAmount?: number;

  @IsOptional()
  @IsString()
  parentCommissionType?: 'PERCENTAGE' | 'FIXED';

  @IsOptional()
  @IsBoolean()
  isWhiteLabel?: boolean;

  @IsOptional()
  @IsString()
  pricingType?: 'GROSS' | 'NET';

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  supportPhone?: string;

  @IsOptional()
  @IsObject()
  customBranding?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  customDomain?: string;

  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @IsOptional()
  @IsNumber()
  commissionAmount?: number;

  @IsOptional()
  @IsString()
  commissionType?: 'PERCENTAGE' | 'FIXED';

  @IsOptional()
  @IsNumber()
  parentCommissionRate?: number;

  @IsOptional()
  @IsNumber()
  parentCommissionAmount?: number;

  @IsOptional()
  @IsString()
  parentCommissionType?: 'PERCENTAGE' | 'FIXED';

  @IsOptional()
  @IsBoolean()
  isWhiteLabel?: boolean;

  @IsOptional()
  @IsString()
  pricingType?: 'GROSS' | 'NET';

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  supportPhone?: string;

  @IsOptional()
  @IsObject()
  customBranding?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}