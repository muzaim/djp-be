import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobLevelsService } from '../services/job-levels.service';
import { CreateJobLevelDto } from '../dto/create-job-level.dto';
import { UpdateJobLevelDto } from '../dto/update-job-level.dto';

@ApiBearerAuth()
@ApiTags('Job Levels')
@Controller('job-levels')
export class JobLevelsController {
  constructor(private readonly jobLevelsService: JobLevelsService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah job level baru' })
  create(@Body() createDto: CreateJobLevelDto) {
    return this.jobLevelsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar semua job level' })
  findAll() {
    return this.jobLevelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail job level berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobLevelsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data job level' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateJobLevelDto,
  ) {
    return this.jobLevelsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) job level' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobLevelsService.remove(id);
  }
}
