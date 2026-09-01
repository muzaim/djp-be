import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationUnit } from '../entities/organization-unit.entity';
import { CreateOrganizationUnitDto } from '../dto/create-organization-unit.dto';
import { UpdateOrganizationUnitDto } from '../dto/update-organization-unit.dto';

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

  async findAll(): Promise<OrganizationUnit[]> {
    return this.orgRepository.find({
      relations: ['parent', 'children'],
      order: { createdAt: 'ASC' },
    });
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
