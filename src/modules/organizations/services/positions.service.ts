import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Position } from '../entities/position.entity';
import { OrganizationUnit } from '../entities/organization-unit.entity';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { PaginationDto, PaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(OrganizationUnit)
    private readonly orgRepository: Repository<OrganizationUnit>,
  ) {}

  public transformPosition(position: Position) {
    const orgUnit = position.organizationUnit || null;
    const division = this.findDivision(orgUnit);

    return {
      id: position.id,
      title: position.title,
      organizationUnitId: position.organizationUnitId,
      organizationUnit: orgUnit
        ? {
            id: orgUnit.id,
            code: orgUnit.code,
            name: orgUnit.name,
            levelType: orgUnit.levelType,
            parentId: orgUnit.parentId,
            parent: orgUnit.parent
              ? {
                  id: orgUnit.parent.id,
                  code: orgUnit.parent.code,
                  name: orgUnit.parent.name,
                  levelType: orgUnit.parent.levelType,
                }
              : null,
          }
        : null,
      division: division,
      jobLevelId: position.jobLevelId,
      jobLevel: position.jobLevel
        ? {
            id: position.jobLevel.id,
            code: position.jobLevel.code,
            name: position.jobLevel.name,
            rankWeight: position.jobLevel.rankWeight,
          }
        : null,
      parentPositionId: position.parentPositionId,
      parentPosition: position.parentPosition
        ? {
            id: position.parentPosition.id,
            title: position.parentPosition.title,
          }
        : null,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt,
    };
  }

  private findDivision(unit: any): any {
    let curr = unit;
    while (curr) {
      if (curr.levelType === 'DIVISION') {
        return {
          id: curr.id,
          code: curr.code,
          name: curr.name,
        };
      }
      curr = curr.parent;
    }
    return null;
  }

  async create(createDto: CreatePositionDto) {
    const position = this.positionRepository.create(createDto);
    const saved = await this.positionRepository.save(position);
    return this.findOne(saved.id);
  }

  async findAll(paginationDto: PaginationDto = new PaginationDto()): Promise<PaginatedResult<any>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition = search ? { title: Like(`%${search}%`) } : {};

    const [rawItems, totalItems] = await this.positionRepository.findAndCount({
      where: whereCondition,
      relations: [
        'organizationUnit',
        'organizationUnit.parent',
        'jobLevel',
        'parentPosition',
      ],
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    const items = rawItems.map((pos) => this.transformPosition(pos));

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

  async findByDivision(divisionId: string) {
    const childUnits = await this.orgRepository
      .createQueryBuilder('unit')
      .leftJoin('unit.parent', 'parent')
      .leftJoin('parent.parent', 'grandparent')
      .where('unit.id = :divisionId', { divisionId })
      .orWhere('unit.parentId = :divisionId', { divisionId })
      .orWhere('parent.parentId = :divisionId', { divisionId })
      .select(['unit.id'])
      .getMany();

    const unitIds = childUnits.map((u) => u.id);
    if (unitIds.length === 0) {
      return [];
    }

    const positions = await this.positionRepository.find({
      where: { organizationUnitId: In(unitIds) },
      relations: [
        'organizationUnit',
        'organizationUnit.parent',
        'jobLevel',
        'parentPosition',
      ],
      order: { title: 'ASC' },
    });

    return positions.map((pos) => this.transformPosition(pos));
  }

  async findOne(id: string) {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: [
        'organizationUnit',
        'organizationUnit.parent',
        'jobLevel',
        'parentPosition',
      ],
    });
    if (!position) {
      throw new NotFoundException(`Position with ID "${id}" not found`);
    }
    return this.transformPosition(position);
  }

  async update(id: string, updateDto: UpdatePositionDto) {
    const rawPosition = await this.positionRepository.findOneBy({ id });
    if (!rawPosition) {
      throw new NotFoundException(`Position with ID "${id}" not found`);
    }
    Object.assign(rawPosition, updateDto);
    await this.positionRepository.save(rawPosition);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const rawPosition = await this.positionRepository.findOneBy({ id });
    if (!rawPosition) {
      throw new NotFoundException(`Position with ID "${id}" not found`);
    }
    await this.positionRepository.softRemove(rawPosition);
  }
}
