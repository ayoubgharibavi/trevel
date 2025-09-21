import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class FlightSearchDto {
  @ApiProperty({ example: 'تهران' })
  @IsString()
  @IsNotEmpty()
  from!: string;

  @ApiProperty({ example: 'مشهد' })
  @IsString()
  @IsNotEmpty()
  to!: string;

  @ApiProperty({ example: '2024-02-15' })
  @IsString()
  @IsNotEmpty()
  departureDate!: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  adults?: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  children?: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  infants?: number;
}







