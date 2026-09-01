import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async create(createDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createDto);
    return this.roleRepository.save(role);
  }

  async findAll(paginationDto: PaginationDto = new PaginationDto()): Promise<PaginatedResult<Role>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition = search
      ? [{ name: Like(`%${search}%`) }, { code: Like(`%${search}%`) }]
      : {};

    const [items, totalItems] = await this.roleRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    return role;
  }

  async update(id: string, updateDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, updateDto);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.softRemove(role);
  }

  async assignRole(assignDto: AssignRoleDto): Promise<UserRole> {
    const existing = await this.userRoleRepository.findOne({
      where: { userId: assignDto.userId, roleId: assignDto.roleId },
    });

    if (existing) {
      throw new ConflictException('User already has this role assigned');
    }

    const userRole = this.userRoleRepository.create(assignDto);
    return this.userRoleRepository.save(userRole);
  }

  async revokeRole(userId: string, roleId: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (!userRole) {
      throw new NotFoundException('Role assignment for this user not found');
    }

    await this.userRoleRepository.softRemove(userRole);
  }
}
