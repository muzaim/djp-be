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
import { ActivityOutputsService } from './activity-outputs.service';
import { CreateActivityOutputDto } from './dto/create-activity-output.dto';
import { UpdateActivityOutputDto } from './dto/update-activity-output.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('Activity Outputs')
@Controller('activity-outputs')
export class ActivityOutputsController {
  constructor(private readonly activityOutputsService: ActivityOutputsService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah keluaran aktivitas baru' })
  create(@Body() createDto: CreateActivityOutputDto) {
    return this.activityOutputsService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar keluaran aktivitas dengan pagination (via Body)' })
  findAllPost(@Body() paginationDto: PaginationDto) {
    return this.activityOutputsService.findAll(paginationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar keluaran aktivitas dengan pagination (via Query)' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.activityOutputsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail keluaran aktivitas berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activityOutputsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data keluaran aktivitas' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateActivityOutputDto,
  ) {
    return this.activityOutputsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) keluaran aktivitas' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.activityOutputsService.remove(id);
  }
}
