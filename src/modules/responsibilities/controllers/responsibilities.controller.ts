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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResponsibilitiesService } from '../services/responsibilities.service';
import { CreateResponsibilityDto } from '../dto/create-responsibility.dto';
import { UpdateResponsibilityDto } from '../dto/update-responsibility.dto';
import { FilterResponsibilityDto } from '../dto/filter-responsibility.dto';

@ApiBearerAuth()
@ApiTags('Responsibilities (Master Tanggung Jawab)')
@Controller('responsibilities')
export class ResponsibilitiesController {
  constructor(
    private readonly responsibilitiesService: ResponsibilitiesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tambah tanggung jawab baru (terkait posisi fungsi)' })
  create(@Body() createDto: CreateResponsibilityDto) {
    return this.responsibilitiesService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar tanggung jawab dengan advanced filter (via Body)' })
  findAllPost(@Body() filterDto: FilterResponsibilityDto) {
    return this.responsibilitiesService.findAll(
      filterDto,
      filterDto.divisionId,
      filterDto.departmentId,
      filterDto.positionId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar tanggung jawab dengan advanced filter (via Query)' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'positionId', required: false, type: String })
  findAll(
    @Query() filterDto: FilterResponsibilityDto,
    @Query('divisionId') divisionId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('positionId') positionId?: string,
  ) {
    return this.responsibilitiesService.findAll(
      filterDto,
      divisionId || filterDto.divisionId,
      departmentId || filterDto.departmentId,
      positionId || filterDto.positionId,
    );
  }

  @Get('by-position/:positionId')
  @ApiOperation({ summary: 'Ambil daftar tanggung jawab berdasarkan ID Posisi / Fungsi' })
  findByPosition(@Param('positionId', ParseUUIDPipe) positionId: string) {
    return this.responsibilitiesService.findByPositionId(positionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail tanggung jawab beserta daftar aktivitas turunannya & posisi fungsi' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsibilitiesService.findOne(id);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Ambil semua daftar aktivitas dari tanggung jawab tertentu' })
  findActivities(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsibilitiesService.findActivitiesByResponsibilityId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data tanggung jawab' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateResponsibilityDto,
  ) {
    return this.responsibilitiesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) tanggung jawab beserta aktivitas turunannya' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsibilitiesService.remove(id);
  }
}
