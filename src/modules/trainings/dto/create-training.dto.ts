import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrainingDto {
  @ApiProperty({
    description: 'ID Fungsi / Posisi Jabatan',
    example: 'uuid-posisi-fungsi',
  })
  @IsUUID()
  @IsNotEmpty()
  positionId!: string;

  @ApiProperty({
    description: 'Nama pelatihan / sertifikasi',
    example: 'PMP (Project Management Professional)',
  })
  @IsString()
  @IsNotEmpty()
  certification!: string;

  @ApiPropertyOptional({
    description: 'Status aktif/nonaktif',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
