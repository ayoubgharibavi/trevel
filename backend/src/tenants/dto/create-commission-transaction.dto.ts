import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCommissionTransactionDto {
  @IsString()
  tenantId!: string;

  @IsString()
  bookingId!: string;

  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsNumber()
  agentCommission?: number;

  @IsOptional()
  @IsNumber()
  parentCommission?: number;

  @IsOptional()
  @IsNumber()
  netAmount?: number;
}
