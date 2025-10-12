import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, ValidateIf } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'test@example.com', required: false, description: 'Email address for login' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  @ValidateIf((o) => !o.username)
  email?: string;

  @ApiProperty({ example: 'admin', required: false, description: 'Username for login' })
  @IsString({ message: 'Username must be a string' })
  @IsOptional()
  @ValidateIf((o) => !o.email)
  username?: string;

  @ApiProperty({ example: 'password', description: 'Password for login' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(1, { message: 'Password cannot be empty' })
  password!: string;
}






























































