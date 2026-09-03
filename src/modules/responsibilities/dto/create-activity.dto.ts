import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiPropertyOptional({ description: 'ID Tanggung Jawab parent', example: 'uuid-tanggunjawab' })
  @IsUUID()
  @IsOptional()
  responsibilityId?: string;

  @ApiProperty({ description: 'Nama aktivitas', example: 'Melakukan pengumpulan dokumen' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Status aktif/nonaktif', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
