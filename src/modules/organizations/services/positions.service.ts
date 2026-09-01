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

  async create(createDto: CreatePositionDto): Promise<Position> {
    const position = this.positionRepository.create(createDto);
    return this.positionRepository.save(position);
  }

  async findAll(paginationDto: PaginationDto = new PaginationDto()): Promise<PaginatedResult<Position>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition = search ? { title: Like(`%${search}%`) } : {};

    const [items, totalItems] = await this.positionRepository.findAndCount({
      where: whereCondition,
      relations: ['organizationUnit', 'jobLevel', 'parentPosition'],
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

  async findByDivision(divisionId: string): Promise<Position[]> {
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

    return this.positionRepository.find({
      where: { organizationUnitId: In(unitIds) },
      relations: ['organizationUnit', 'jobLevel', 'parentPosition'],
      order: { title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['organizationUnit', 'jobLevel', 'parentPosition'],
    });
    if (!position) {
      throw new NotFoundException(`Position with ID "${id}" not found`);
    }
    return position;
  }

  async update(id: string, updateDto: UpdatePositionDto): Promise<Position> {
    const position = await this.findOne(id);
    Object.assign(position, updateDto);
    return this.positionRepository.save(position);
  }

  async remove(id: string): Promise<void> {
    const position = await this.findOne(id);
    await this.positionRepository.softRemove(position);
  }
}
