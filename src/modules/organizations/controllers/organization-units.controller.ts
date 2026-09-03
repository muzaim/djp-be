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
import { OrganizationUnitsService } from '../services/organization-units.service';
import { CreateOrganizationUnitDto } from '../dto/create-organization-unit.dto';
import { UpdateOrganizationUnitDto } from '../dto/update-organization-unit.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('Organization Units')
@Controller('organization-units')
export class OrganizationUnitsController {
  constructor(private readonly orgService: OrganizationUnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah unit organisasi baru' })
  create(@Body() createDto: CreateOrganizationUnitDto) {
    return this.orgService.create(createDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil daftar unit organisasi dengan pagination (via Body)' })
  findAllPost(@Body() paginationDto: PaginationDto) {
    return this.orgService.findAll(paginationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar unit organisasi dengan pagination (via Query)' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.orgService.findAll(paginationDto);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Ambil hirarki unit organisasi dalam bentuk tree' })
  findTree() {
    return this.orgService.findTree();
  }

  @Get('chart')
  @ApiOperation({ summary: 'Ambil data struktur bagan organisasi lengkap (Company -> Direktorat -> Divisi -> Bagian / Non Bagian -> Fungsi)' })
  findChart() {
    return this.orgService.findChart();
  }

  @Get('divisions')
  @ApiOperation({ summary: 'Ambil daftar semua divisi (levelType DIVISION)' })
  findDivisions() {
    return this.orgService.findDivisions();
  }

  @Get('departments/by-division/:divisionId')
  @ApiOperation({ summary: 'Ambil daftar bagian (department) berdasarkan ID Divisi' })
  findDepartmentsByDivision(@Param('divisionId', ParseUUIDPipe) divisionId: string) {
    return this.orgService.findDepartmentsByDivision(divisionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail unit organisasi berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orgService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data unit organisasi' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOrganizationUnitDto,
  ) {
    return this.orgService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) unit organisasi' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orgService.remove(id);
  }
}
