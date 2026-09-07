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
import { WorkExperiencesService } from './work-experiences.service';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { FilterWorkExperienceDto } from './dto/filter-work-experience.dto';

@ApiBearerAuth()
@ApiTags('Work Experiences (Master Pengalaman Kerja)')
@Controller('work-experiences')
export class WorkExperiencesController {
  constructor(
    private readonly workExperiencesService: WorkExperiencesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tambah pengalaman kerja baru (terkait posisi fungsi)' })
  create(@Body() createDto: CreateWorkExperienceDto) {
    return this.workExperiencesService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar pengalaman kerja dengan advanced filter (via Body)' })
  findAllPost(@Body() filterDto: FilterWorkExperienceDto) {
    return this.workExperiencesService.findAll(
      filterDto,
      filterDto.divisionId,
      filterDto.departmentId,
      filterDto.positionId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar pengalaman kerja dengan advanced filter (via Query)' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'positionId', required: false, type: String })
  findAll(
    @Query() filterDto: FilterWorkExperienceDto,
    @Query('divisionId') divisionId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('positionId') positionId?: string,
  ) {
    return this.workExperiencesService.findAll(
      filterDto,
      divisionId || filterDto.divisionId,
      departmentId || filterDto.departmentId,
      positionId || filterDto.positionId,
    );
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export data pengalaman kerja ke format Excel (.xlsx) dengan filter (via Body)' })
  exportPost(
    @Body() filterDto: FilterWorkExperienceDto,
    @Res() res: Response,
  ) {
    return this.workExperiencesService.exportToExcel(
      res,
      filterDto,
      filterDto.divisionId,
      filterDto.departmentId,
      filterDto.positionId,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export data pengalaman kerja ke format Excel (.xlsx) dengan filter (via Query)' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'positionId', required: false, type: String })
  exportGet(
    @Query() filterDto: FilterWorkExperienceDto,
    @Query('divisionId') divisionId: string,
    @Query('departmentId') departmentId: string,
    @Query('positionId') positionId: string,
    @Res() res: Response,
  ) {
    return this.workExperiencesService.exportToExcel(
      res,
      filterDto,
      divisionId || filterDto.divisionId,
      departmentId || filterDto.departmentId,
      positionId || filterDto.positionId,
    );
  }

  @Get('by-position/:positionId')
  @ApiOperation({ summary: 'Ambil daftar pengalaman kerja berdasarkan ID Posisi / Fungsi' })
  findByPosition(@Param('positionId', ParseUUIDPipe) positionId: string) {
    return this.workExperiencesService.findByPositionId(positionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail pengalaman kerja berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workExperiencesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data pengalaman kerja' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateWorkExperienceDto,
  ) {
    return this.workExperiencesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) pengalaman kerja' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workExperiencesService.remove(id);
  }
}
