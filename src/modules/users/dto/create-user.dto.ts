import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'syafri@smf.co.id', description: 'Email unik user' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Syafri Surya', description: 'Nama lengkap user' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: '12345', description: 'Password user' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: '08123456789', description: 'Nomor telepon' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'uuid-position', description: 'ID posisi jabatan' })
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @ApiPropertyOptional({ example: ['STAFF', 'KABAG'], description: 'Daftar ID atau Kode role yang dimiliki user', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];

  @ApiPropertyOptional({ example: ['STAFF', 'KABAG'], description: 'Alias untuk roleIds (Bisa ID atau Kode Role)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({ example: true, description: 'Status aktif' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
