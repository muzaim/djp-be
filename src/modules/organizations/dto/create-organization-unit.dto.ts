import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrganizationUnitDto {
  @ApiProperty({ example: 'DIV-TI', description: 'Kode unik unit organisasi' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Divisi Teknologi Informasi', description: 'Nama unit organisasi' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'DIVISION', description: 'Tipe level: COMPANY, DIRECTORATE, DIVISION, DEPARTMENT, SECTION' })
  @IsString()
  @IsNotEmpty()
  levelType!: string;

  @ApiPropertyOptional({ example: 'uuid-parent-org', description: 'ID Parent unit organisasi' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
