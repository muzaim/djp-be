import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { In, Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  public transformUser(user: User) {
    const orgUnit = user.position?.organizationUnit || null;
    const divisionName = this.findDivisionName(orgUnit);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      positionId: user.positionId,
      position: user.position
        ? {
            id: user.position.id,
            title: user.position.title,
            jobLevel: user.position.jobLevel ? user.position.jobLevel.name : null,
            organizationUnit: orgUnit ? orgUnit.name : null,
            division: divisionName,
          }
        : null,
      roles: user.userRoles ? user.userRoles.map((ur) => ur.role?.code).filter(Boolean) : [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private findDivisionName(unit: any): string | null {
    let curr = unit;
    while (curr) {
      if (curr.levelType === 'DIVISION') {
        return curr.name;
      }
      curr = curr.parent;
    }
    return null;
  }

  private async resolveRoleIds(inputs?: string[]): Promise<string[]> {
    if (!inputs || inputs.length === 0) return [];
    const roles = await this.roleRepository.find({
      where: [{ id: In(inputs) }, { code: In(inputs) }],
    });
    return roles.map((r) => r.id);
  }

  async create(createUserDto: CreateUserDto) {
    const { roleIds, roles, ...userData } = createUserDto;
    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD') || '12345';
    const rawPassword = userData.password || defaultPassword;
    userData.password = await bcrypt.hash(rawPassword, 10);

    const user = await this.usersRepository.save(this.usersRepository.create(userData));

    const roleInputs = roleIds || roles;
    if (roleInputs && roleInputs.length > 0) {
      const resolvedIds = await this.resolveRoleIds(roleInputs);
      const userRoles = resolvedIds.map((roleId) =>
        this.userRoleRepository.create({ userId: user.id, roleId }),
      );
      await this.userRoleRepository.save(userRoles);
    }

    return this.findOne(user.id);
  }

  async findAll(paginationDto: PaginationDto = new PaginationDto()): Promise<PaginatedResult<any>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition = search
      ? [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }]
      : {};

    const [rawItems, totalItems] = await this.usersRepository.findAndCount({
      where: whereCondition,
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
        'userRoles',
        'userRoles.role',
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const items = rawItems.map((user) => this.transformUser(user));

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

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
        'position.parentPosition',
        'userRoles',
        'userRoles.role',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return this.transformUser(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
        'userRoles',
        'userRoles.role',
      ],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['userRoles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const { roleIds, roles, ...userData } = updateUserDto;

    if (userData.password && userData.password.trim() !== '') {
      userData.password = await bcrypt.hash(userData.password, 10);
    } else {
      delete userData.password;
    }

    if (userData.positionId !== undefined) {
      delete (user as any).position;
    }

    Object.assign(user, userData);
    await this.usersRepository.save(user);

    const roleInputs = roleIds !== undefined ? roleIds : roles;
    if (roleInputs !== undefined) {
      await this.userRoleRepository.delete({ userId: user.id });

      if (roleInputs.length > 0) {
        const resolvedIds = await this.resolveRoleIds(roleInputs);
        const newUserRoles = resolvedIds.map((roleId) =>
          this.userRoleRepository.create({ userId: user.id, roleId }),
        );
        await this.userRoleRepository.save(newUserRoles);
      }
    }

    return this.findOne(id);
  }

  async resetPassword(id: string): Promise<{ message: string }> {
    const rawUser = await this.usersRepository.findOneBy({ id });
    if (!rawUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD') || '12345';
    rawUser.password = await bcrypt.hash(defaultPassword, 10);
    await this.usersRepository.save(rawUser);
    return { message: `Password user berhasil di-reset menjadi ${defaultPassword}` };
  }

  async remove(id: string): Promise<void> {
    const rawUser = await this.usersRepository.findOneBy({ id });
    if (!rawUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    await this.userRoleRepository.delete({ userId: rawUser.id });
    await this.usersRepository.softRemove(rawUser);
  }
}
