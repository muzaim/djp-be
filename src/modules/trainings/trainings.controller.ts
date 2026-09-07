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
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { FilterTrainingDto } from './dto/filter-training.dto';

@ApiBearerAuth()
@ApiTags('Trainings (Master Training / Sertifikasi)')
@Controller('trainings')
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tambah pelatihan / sertifikasi baru (terkait posisi fungsi)' })
  create(@Body() createDto: CreateTrainingDto) {
    return this.trainingsService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar pelatihan / sertifikasi dengan advanced filter (via Body)' })
  findAllPost(@Body() filterDto: FilterTrainingDto) {
    return this.trainingsService.findAll(
      filterDto,
      filterDto.divisionId,
      filterDto.departmentId,
      filterDto.positionId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar pelatihan / sertifikasi dengan advanced filter (via Query)' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'positionId', required: false, type: String })
  findAll(
    @Query() filterDto: FilterTrainingDto,
    @Query('divisionId') divisionId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('positionId') positionId?: string,
  ) {
    return this.trainingsService.findAll(
      filterDto,
      divisionId || filterDto.divisionId,
      departmentId || filterDto.departmentId,
      positionId || filterDto.positionId,
    );
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export data training sertifikasi ke format Excel (.xlsx) dengan filter (via Body)' })
  exportPost(
    @Body() filterDto: FilterTrainingDto,
    @Res() res: Response,
  ) {
    return this.trainingsService.exportToExcel(
      res,
      filterDto,
      filterDto.divisionId,
      filterDto.departmentId,
      filterDto.positionId,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export data training sertifikasi ke format Excel (.xlsx) dengan filter (via Query)' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'positionId', required: false, type: String })
  exportGet(
    @Query() filterDto: FilterTrainingDto,
    @Query('divisionId') divisionId: string,
    @Query('departmentId') departmentId: string,
    @Query('positionId') positionId: string,
    @Res() res: Response,
  ) {
    return this.trainingsService.exportToExcel(
      res,
      filterDto,
      divisionId || filterDto.divisionId,
      departmentId || filterDto.departmentId,
      positionId || filterDto.positionId,
    );
  }

  @Get('by-position/:positionId')
  @ApiOperation({ summary: 'Ambil daftar pelatihan / sertifikasi berdasarkan ID Posisi / Fungsi' })
  findByPosition(@Param('positionId', ParseUUIDPipe) positionId: string) {
    return this.trainingsService.findByPositionId(positionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail pelatihan / sertifikasi berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data pelatihan / sertifikasi' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTrainingDto,
  ) {
    return this.trainingsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) pelatihan / sertifikasi' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingsService.remove(id);
  }
}
