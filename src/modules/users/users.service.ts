import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD') || '12345';
    const rawPassword = createUserDto.password || defaultPassword;
    createUserDto.password = await bcrypt.hash(rawPassword, 10);
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto = new PaginationDto()): Promise<PaginatedResult<User>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition = search
      ? [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }]
      : {};

    const [items, totalItems] = await this.usersRepository.findAndCount({
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

  async findOne(id: string): Promise<User> {
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
    return user;
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      delete updateUserDto.password;
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async resetPassword(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD') || '12345';
    user.password = await bcrypt.hash(defaultPassword, 10);
    await this.usersRepository.save(user);
    return { message: `Password user berhasil di-reset menjadi ${defaultPassword}` };
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }
}
