import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { OrganizationUnit } from '../entities/organization-unit.entity';
import { Position } from '../entities/position.entity';
import { CreateOrganizationUnitDto } from '../dto/create-organization-unit.dto';
import { UpdateOrganizationUnitDto } from '../dto/update-organization-unit.dto';
import { PaginationDto, PaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class OrganizationUnitsService {
  constructor(
    @InjectRepository(OrganizationUnit)
    private readonly orgRepository: Repository<OrganizationUnit>,
    @InjectRepository(Position)
    private readonly posRepository: Repository<Position>,
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

  async findChart(): Promise<any[]> {
    const orgs = await this.orgRepository.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });

    const positions = await this.posRepository.find({
      relations: ['organizationUnit', 'jobLevel'],
      order: { title: 'ASC' },
    });

    const posMap = new Map<string, Position[]>();
    for (const pos of positions) {
      if (
        pos.jobLevel?.code === 'DIREKTUR' ||
        pos.jobLevel?.code === 'KADIV' ||
        pos.jobLevel?.code === 'KABAG' ||
        pos.title.startsWith('Kepala ') ||
        pos.title.startsWith('Direktur ') ||
        pos.title.startsWith('Deputi Direktur ')
      ) {
        continue;
      }
      const unitId = pos.organizationUnitId;
      if (!posMap.has(unitId)) {
        posMap.set(unitId, []);
      }
      posMap.get(unitId)!.push(pos);
    }

    const rootOrgs = orgs.filter((o) => !o.parentId);

    const buildNode = (unit: OrganizationUnit): any => {
      const childOrgs = orgs.filter((o) => o.parentId === unit.id);
      const unitPositions = posMap.get(unit.id) || [];

      const mappedChildOrgs: any[] = childOrgs.map(buildNode);

      const positionNodes = unitPositions.map((p) => ({
        id: p.id,
        name: p.title,
        type: 'POSITION',
        levelType: 'POSITION',
        label: 'Fungsi',
        jobLevel: p.jobLevel ? p.jobLevel.name : null,
        children: [],
      }));

      let labelName = 'Unit Organisasi';
      if (unit.levelType === 'COMPANY') labelName = 'Perusahaan';
      else if (unit.levelType === 'DIRECTORATE') labelName = 'Direktorat';
      else if (unit.levelType === 'DIVISION') labelName = 'Divisi';
      else if (unit.levelType === 'DEPARTMENT') labelName = 'Bagian';

      return {
        id: unit.id,
        code: unit.code,
        name: unit.name,
        type: unit.levelType,
        levelType: unit.levelType,
        label: labelName,
        children: [...mappedChildOrgs, ...positionNodes],
      };
    };

    return rootOrgs.map(buildNode);
  }

  async findDivisions(): Promise<OrganizationUnit[]> {
    return this.orgRepository.find({
      where: { levelType: 'DIVISION' },
      relations: ['parent'],
      order: { name: 'ASC' },
    });
  }

  async findDepartmentsByDivision(divisionId: string): Promise<OrganizationUnit[]> {
    return this.orgRepository.find({
      where: { parentId: divisionId, levelType: 'DEPARTMENT' },
      relations: ['parent'],
      order: { name: 'ASC' },
    });
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
