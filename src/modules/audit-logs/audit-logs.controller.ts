import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar audit logs dengan pagination (via Body)' })
  findAllPost(@Body() paginationDto: PaginationDto) {
    return this.auditLogsService.findAll(paginationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar audit logs dengan pagination (via Query)' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.auditLogsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail audit log berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditLogsService.findOne(id);
  }
}
