import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { WorkEnvironmentsService } from './work-environments.service';
import { CreateWorkEnvironmentDto } from './dto/create-work-environment.dto';
import { UpdateWorkEnvironmentDto } from './dto/update-work-environment.dto';
import { FilterWorkEnvironmentDto } from './dto/filter-work-environment.dto';

@ApiBearerAuth()
@ApiTags('Work Environments (Master Lingkungan Kerja)')
@Controller('work-environments')
export class WorkEnvironmentsController {
  constructor(
    private readonly workEnvironmentsService: WorkEnvironmentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tambah lingkungan kerja baru (terkait posisi fungsi)' })
  create(@Body() createDto: CreateWorkEnvironmentDto) {
    return this.workEnvironmentsService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar lingkungan kerja dengan advanced filter (via Body)' })
  findAllPost(@Body() filterDto: FilterWorkEnvironmentDto) {
    return this.workEnvironmentsService.findAll(
      filterDto,
      filterDto.divisionId,
      filterDto.departmentId,
      filterDto.positionId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar lingkungan kerja dengan advanced filter (via Query)' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'positionId', required: false, type: String })
  findAll(
    @Query() filterDto: FilterWorkEnvironmentDto,
    @Query('divisionId') divisionId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('positionId') positionId?: string,
  ) {
    return this.workEnvironmentsService.findAll(
      filterDto,
      divisionId || filterDto.divisionId,
      departmentId || filterDto.departmentId,
      positionId || filterDto.positionId,
    );
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export data lingkungan kerja ke format Excel (.xlsx) dengan filter (via Body)' })
  exportPost(
    @Body() filterDto: FilterWorkEnvironmentDto,
    @Res() res: Response,
  ) {
    return this.workEnvironmentsService.exportToExcel(
      res,
      filterDto,
      filterDto.divisionId,
      filterDto.departmentId,
      filterDto.positionId,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export data lingkungan kerja ke format Excel (.xlsx) dengan filter (via Query)' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'positionId', required: false, type: String })
  exportGet(
    @Query() filterDto: FilterWorkEnvironmentDto,
    @Query('divisionId') divisionId: string,
    @Query('departmentId') departmentId: string,
    @Query('positionId') positionId: string,
    @Res() res: Response,
  ) {
    return this.workEnvironmentsService.exportToExcel(
      res,
      filterDto,
      divisionId || filterDto.divisionId,
      departmentId || filterDto.departmentId,
      positionId || filterDto.positionId,
    );
  }

  @Get('by-position/:positionId')
  @ApiOperation({ summary: 'Ambil daftar lingkungan kerja berdasarkan ID Posisi / Fungsi' })
  findByPosition(@Param('positionId', ParseUUIDPipe) positionId: string) {
    return this.workEnvironmentsService.findByPositionId(positionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail lingkungan kerja berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workEnvironmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data lingkungan kerja' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateWorkEnvironmentDto,
  ) {
    return this.workEnvironmentsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) lingkungan kerja' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workEnvironmentsService.remove(id);
  }
}
