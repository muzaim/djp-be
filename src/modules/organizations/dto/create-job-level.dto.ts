import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobLevelDto {
  @ApiProperty({ example: 'KADIV', description: 'Kode unik job level' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Kepala Divisi', description: 'Nama job level' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 20, description: 'Bobot peringkat untuk hierarki' })
  @IsOptional()
  @IsInt()
  rankWeight?: number;
}
