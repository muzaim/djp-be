import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkExperienceDto {
  @ApiProperty({
    description: 'ID Fungsi / Posisi Jabatan',
    example: 'uuid-posisi-fungsi',
  })
  @IsUUID()
  @IsNotEmpty()
  positionId!: string;

  @ApiProperty({
    description: 'Lama pengalaman kerja (misal: "2-5 tahun" atau "> 15 tahun")',
    example: '2-5 tahun',
  })
  @IsString()
  @IsNotEmpty()
  experienceDuration!: string;

  @ApiProperty({
    description: 'Bidang pengalaman kerja',
    example: 'Pengembangan Perangkat Lunak / TI',
  })
  @IsString()
  @IsNotEmpty()
  field!: string;

  @ApiPropertyOptional({
    description: 'Status aktif/nonaktif',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
