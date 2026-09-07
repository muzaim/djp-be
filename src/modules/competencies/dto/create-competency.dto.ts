import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompetencyDto {
  @ApiProperty({
    description: 'ID Fungsi / Posisi Jabatan',
    example: 'uuid-posisi-fungsi',
  })
  @IsUUID()
  @IsNotEmpty()
  positionId!: string;

  @ApiProperty({
    description: 'Tingkat pendidikan (misal: "S1", "S2", "D3")',
    example: 'S1',
  })
  @IsString()
  @IsNotEmpty()
  degreeLevel!: string;

  @ApiProperty({
    description: 'Jurusan pendidikan',
    example: 'Teknik Informatika',
  })
  @IsString()
  @IsNotEmpty()
  major!: string;

  @ApiPropertyOptional({
    description: 'Status aktif/nonaktif',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
