import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { OrganizationUnit } from '../entities/organization-unit.entity';
import { CreateOrganizationUnitDto } from '../dto/create-organization-unit.dto';
import { UpdateOrganizationUnitDto } from '../dto/update-organization-unit.dto';
import { PaginationDto, PaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class OrganizationUnitsService {
  constructor(
    @InjectRepository(OrganizationUnit)
    private readonly orgRepository: Repository<OrganizationUnit>,
  ) {}

  async create(createDto: CreateOrganizationUnitDto): Promise<OrganizationUnit> {
    const org = this.orgRepository.create(createDto);
    return this.orgRepository.save(org);
  }

  async findAll(paginationDto: PaginationDto = new PaginationDto()): Promise<PaginatedResult<OrganizationUnit>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition = search
      ? [{ name: Like(`%${search}%`) }, { code: Like(`%${search}%`) }]
      : {};

    const [items, totalItems] = await this.orgRepository.findAndCount({
      where: whereCondition,
      relations: ['parent', 'children'],
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

  async findTree(): Promise<OrganizationUnit[]> {
    const roots = await this.orgRepository.find({
      where: { parentId: undefined },
      relations: ['children', 'children.children', 'children.children.children'],
    });
    return roots;
  }

  async findOne(id: string): Promise<OrganizationUnit> {
    const org = await this.orgRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!org) {
      throw new NotFoundException(`Organization Unit with ID "${id}" not found`);
    }
    return org;
  }

  async update(id: string, updateDto: UpdateOrganizationUnitDto): Promise<OrganizationUnit> {
    const org = await this.findOne(id);
    Object.assign(org, updateDto);
    return this.orgRepository.save(org);
  }

  async remove(id: string): Promise<void> {
    const org = await this.findOne(id);
    await this.orgRepository.softRemove(org);
  }
}
