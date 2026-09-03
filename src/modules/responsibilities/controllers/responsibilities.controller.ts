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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResponsibilitiesService } from '../services/responsibilities.service';
import { CreateResponsibilityDto } from '../dto/create-responsibility.dto';
import { UpdateResponsibilityDto } from '../dto/update-responsibility.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('Responsibilities (Master Tanggung Jawab)')
@Controller('responsibilities')
export class ResponsibilitiesController {
  constructor(
    private readonly responsibilitiesService: ResponsibilitiesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tambah tanggung jawab baru (opsional berserta aktivitasnya)' })
  create(@Body() createDto: CreateResponsibilityDto) {
    return this.responsibilitiesService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar tanggung jawab dengan pagination (via Body)' })
  findAllPost(@Body() paginationDto: PaginationDto) {
    return this.responsibilitiesService.findAll(paginationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar tanggung jawab dengan pagination (via Query)' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.responsibilitiesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail tanggung jawab beserta daftar aktivitas turunannya' })
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
