import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN_SDM', description: 'Kode unik role' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Admin SDM', description: 'Nama role' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Role untuk akses master data SDM', description: 'Deskripsi role' })
  @IsOptional()
  @IsString()
  description?: string;
}
