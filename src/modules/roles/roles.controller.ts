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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah role baru' })
  create(@Body() createDto: CreateRoleDto) {
    return this.rolesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar semua role' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail role berdasarkan ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus (soft delete) role' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign role ke user' })
  assignRole(@Body() assignDto: AssignRoleDto) {
    return this.rolesService.assignRole(assignDto);
  }

  @Delete('user-roles/:userId/:roleId')
  @ApiOperation({ summary: 'Revoke role dari user' })
  revokeRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.rolesService.revokeRole(userId, roleId);
  }
}
