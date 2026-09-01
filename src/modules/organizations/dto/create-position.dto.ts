import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({ example: 'Kepala Bagian Perencanaan & Pengembangan', description: 'Judul/nama posisi jabatan' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'uuid-org-unit', description: 'ID Unit Organisasi' })
  @IsUUID()
  @IsNotEmpty()
  organizationUnitId!: string;

  @ApiProperty({ example: 'uuid-job-level', description: 'ID Job Level' })
  @IsUUID()
  @IsNotEmpty()
  jobLevelId!: string;

  @ApiPropertyOptional({ example: 'uuid-parent-position', description: 'ID Posisi Atasan Langsung' })
  @IsOptional()
  @IsUUID()
  parentPositionId?: string;
}
