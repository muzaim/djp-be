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
import { OrganizationUnitsService } from '../services/organization-units.service';
import { CreateOrganizationUnitDto } from '../dto/create-organization-unit.dto';
import { UpdateOrganizationUnitDto } from '../dto/update-organization-unit.dto';

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

  @Get()
  @ApiOperation({ summary: 'Ambil daftar semua unit organisasi' })
  findAll() {
    return this.orgService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Ambil hirarki unit organisasi dalam bentuk tree' })
  findTree() {
    return this.orgService.findTree();
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
