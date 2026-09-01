import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'syafri@smf.co.id', description: 'Email user' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '12345', description: 'Password user' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
