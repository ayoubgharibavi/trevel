import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class ChargeWalletDto {
  @ApiProperty({ example: 1000000 })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ example: 'IRR' })
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ApiProperty({ example: 'شارژ کیف پول' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}







