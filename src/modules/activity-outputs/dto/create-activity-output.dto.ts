import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityOutputDto {
  @ApiProperty({ description: 'Nama keluaran aktivitas', example: 'Laporan Kinerja Bulanan' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Deskripsi / Keterangan', example: 'Dokumen laporan hasil evaluasi bulanan' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Status aktif/nonaktif', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
