import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateActivityDto } from './create-activity.dto';

export class CreateResponsibilityDto {
  @ApiProperty({
    description: 'ID Fungsi / Posisi Jabatan',
    example: 'uuid-posisi-fungsi',
  })
  @IsUUID()
  @IsNotEmpty()
  positionId!: string;

  @ApiPropertyOptional({
    description: 'Kode Tanggung Jawab Utama (kode TJU)',
    example: 'TJU-001',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Nama tanggung jawab',
    example: 'Administrasi Karyawan Join/Resign',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Status aktif/nonaktif',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Daftar aktivitas turunan (opsional saat buat baru)',
    type: [CreateActivityDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityDto)
  activities?: CreateActivityDto[];
}
