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
import { PositionsService } from '../services/positions.service';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('Positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah posisi jabatan baru' })
  create(@Body() createDto: CreatePositionDto) {
    return this.positionsService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar posisi jabatan dengan pagination (via Body)' })
  findAllPost(@Body() paginationDto: PaginationDto) {
    return this.positionsService.findAll(paginationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar posisi jabatan dengan pagination (via Query)' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.positionsService.findAll(paginationDto);
  }

  @Get('by-division/:divisionId')
  @ApiOperation({ summary: 'Ambil daftar posisi jabatan / fungsi berdasarkan ID Divisi' })
  findByDivision(@Param('divisionId', ParseUUIDPipe) divisionId: string) {
    return this.positionsService.findByDivision(divisionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail posisi jabatan berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data posisi jabatan' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) posisi jabatan' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.remove(id);
  }
}
