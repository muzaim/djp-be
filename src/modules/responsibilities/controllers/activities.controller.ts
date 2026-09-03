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
import { ActivitiesService } from '../services/activities.service';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-activity.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('Activities (Master Aktivitas)')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah aktivitas baru di bawah tanggung jawab' })
  create(@Body() createDto: CreateActivityDto) {
    return this.activitiesService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar aktivitas dengan pagination (via Body)' })
  findAllPost(
    @Body() paginationDto: PaginationDto,
    @Query('responsibilityId') responsibilityId?: string,
  ) {
    return this.activitiesService.findAll(paginationDto, responsibilityId);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar aktivitas dengan pagination (via Query)' })
  @ApiQuery({ name: 'responsibilityId', required: false, type: String })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('responsibilityId') responsibilityId?: string,
  ) {
    return this.activitiesService.findAll(paginationDto, responsibilityId);
  }

  @Get('by-responsibility/:responsibilityId')
  @ApiOperation({ summary: 'Ambil daftar aktivitas berdasarkan ID Tanggung Jawab' })
  findByResponsibility(@Param('responsibilityId', ParseUUIDPipe) responsibilityId: string) {
    return this.activitiesService.findByResponsibility(responsibilityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail aktivitas berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data aktivitas' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) aktivitas' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.remove(id);
  }
}
