import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterWorkEnvironmentDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter berdasarkan ID Divisi' })
  @IsUUID()
  @IsOptional()
  divisionId?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID Bagian / Department' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID Posisi / Fungsi' })
  @IsUUID()
  @IsOptional()
  positionId?: string;
}
