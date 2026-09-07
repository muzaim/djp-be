import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkEnvironmentDto {
  @ApiProperty({
    description: 'ID Fungsi / Posisi Jabatan',
    example: 'uuid-posisi-fungsi',
  })
  @IsUUID()
  @IsNotEmpty()
  positionId!: string;

  @ApiPropertyOptional({
    description: 'Kode unik lingkungan kerja',
    example: 'LK-001',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Nama faktor lingkungan kerja',
    example: 'Suhu Udara',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Skala lingkungan kerja',
    example: 'Dingin dengan perubahan',
  })
  @IsString()
  @IsNotEmpty()
  scale!: string;

  @ApiPropertyOptional({
    description: 'Status aktif/nonaktif',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
