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
import { CompetenciesService } from './competencies.service';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { FilterCompetencyDto } from './dto/filter-competency.dto';

@ApiBearerAuth()
@ApiTags('Competencies (Master Kompetensi / Pendidikan)')
@Controller('competencies')
export class CompetenciesController {
  constructor(
    private readonly competenciesService: CompetenciesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tambah kompetensi pendidikan baru (terkait posisi fungsi)' })
  create(@Body() createDto: CreateCompetencyDto) {
    return this.competenciesService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar kompetensi pendidikan dengan advanced filter (via Body)' })
  findAllPost(@Body() filterDto: FilterCompetencyDto) {
    return this.competenciesService.findAll(
      filterDto,
      filterDto.divisionId,
      filterDto.departmentId,
      filterDto.positionId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar kompetensi pendidikan dengan advanced filter (via Query)' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'positionId', required: false, type: String })
  findAll(
    @Query() filterDto: FilterCompetencyDto,
    @Query('divisionId') divisionId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('positionId') positionId?: string,
  ) {
    return this.competenciesService.findAll(
      filterDto,
      divisionId || filterDto.divisionId,
      departmentId || filterDto.departmentId,
      positionId || filterDto.positionId,
    );
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export data kompetensi ke format Excel (.xlsx) dengan filter (via Body)' })
  exportPost(
    @Body() filterDto: FilterCompetencyDto,
    @Res() res: Response,
  ) {
    return this.competenciesService.exportToExcel(
      res,
      filterDto,
      filterDto.divisionId,
      filterDto.departmentId,
      filterDto.positionId,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export data kompetensi ke format Excel (.xlsx) dengan filter (via Query)' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'positionId', required: false, type: String })
  exportGet(
    @Query() filterDto: FilterCompetencyDto,
    @Query('divisionId') divisionId: string,
    @Query('departmentId') departmentId: string,
    @Query('positionId') positionId: string,
    @Res() res: Response,
  ) {
    return this.competenciesService.exportToExcel(
      res,
      filterDto,
      divisionId || filterDto.divisionId,
      departmentId || filterDto.departmentId,
      positionId || filterDto.positionId,
    );
  }

  @Get('by-position/:positionId')
  @ApiOperation({ summary: 'Ambil daftar kompetensi berdasarkan ID Posisi / Fungsi' })
  findByPosition(@Param('positionId', ParseUUIDPipe) positionId: string) {
    return this.competenciesService.findByPositionId(positionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail kompetensi berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.competenciesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data kompetensi' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCompetencyDto,
  ) {
    return this.competenciesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) kompetensi' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.competenciesService.remove(id);
  }
}
