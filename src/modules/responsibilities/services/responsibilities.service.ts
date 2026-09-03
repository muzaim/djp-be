import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Responsibility } from '../entities/responsibility.entity';
import { Activity } from '../entities/activity.entity';
import { Position } from '../../organizations/entities/position.entity';
import { OrganizationUnit } from '../../organizations/entities/organization-unit.entity';
import { CreateResponsibilityDto } from '../dto/create-responsibility.dto';
import { UpdateResponsibilityDto } from '../dto/update-responsibility.dto';
import { PaginationDto, PaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class ResponsibilitiesService {
  constructor(
    @InjectRepository(Responsibility)
    private readonly responsibilityRepository: Repository<Responsibility>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  private getDivisionForOrgUnit(unit: OrganizationUnit | null | undefined): any {
    if (!unit) return null;
    let curr: OrganizationUnit | null = unit;
    while (curr) {
      if (curr.levelType === 'DIVISION') {
        return {
          id: curr.id,
          code: curr.code,
          name: curr.name,
        };
      }
      curr = curr.parent || null;
    }
    return null;
  }

  private transformResponsibility(resp: Responsibility): any {
    if (!resp) return resp;
    let enrichedPosition = null;
    if (resp.position) {
      const division = this.getDivisionForOrgUnit(resp.position.organizationUnit);
      enrichedPosition = {
        id: resp.position.id,
        title: resp.position.title,
        jobLevel: resp.position.jobLevel
          ? {
              id: resp.position.jobLevel.id,
              code: resp.position.jobLevel.code,
              name: resp.position.jobLevel.name,
            }
          : null,
        organizationUnit: resp.position.organizationUnit
          ? {
              id: resp.position.organizationUnit.id,
              code: resp.position.organizationUnit.code,
              name: resp.position.organizationUnit.name,
              levelType: resp.position.organizationUnit.levelType,
            }
          : null,
        division,
      };
    }

    return {
      id: resp.id,
      positionId: resp.positionId,
      code: resp.code,
      name: resp.name,
      isActive: resp.isActive,
      position: enrichedPosition,
      activities: resp.activities || [],
      createdAt: resp.createdAt,
      updatedAt: resp.updatedAt,
      deletedAt: resp.deletedAt,
    };
  }

  async create(createDto: CreateResponsibilityDto): Promise<any> {
    if (createDto.positionId) {
      const pos = await this.positionRepository.findOneBy({ id: createDto.positionId });
      if (!pos) {
        throw new NotFoundException(`Position with ID "${createDto.positionId}" not found`);
      }
    }

    const { activities, ...respData } = createDto;
    const responsibility = this.responsibilityRepository.create(respData);

    if (activities && activities.length > 0) {
      responsibility.activities = activities.map((act) =>
        this.activityRepository.create(act),
      );
    }

    const saved = await this.responsibilityRepository.save(responsibility);
    return this.findOne(saved.id);
  }

  async findAll(
    paginationDto: PaginationDto = new PaginationDto(),
    positionId?: string,
  ): Promise<PaginatedResult<any>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition: any = search
      ? [{ name: Like(`%${search}%`) }, { code: Like(`%${search}%`) }]
      : {};

    if (positionId) {
      if (Array.isArray(whereCondition)) {
        whereCondition.forEach((cond) => (cond.positionId = positionId));
      } else {
        whereCondition.positionId = positionId;
      }
    }

    const [items, totalItems] = await this.responsibilityRepository.findAndCount({
      where: whereCondition,
      relations: [
        'activities',
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    return {
      items: items.map((item) => this.transformResponsibility(item)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const item = await this.responsibilityRepository.findOne({
      where: { id },
      relations: [
        'activities',
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
    });
    if (!item) {
      throw new NotFoundException(`Responsibility with ID "${id}" not found`);
    }
    return this.transformResponsibility(item);
  }

  async findByPositionId(positionId: string): Promise<any[]> {
    const items = await this.responsibilityRepository.find({
      where: { positionId },
      relations: [
        'activities',
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
      order: { createdAt: 'ASC' },
    });
    return items.map((item) => this.transformResponsibility(item));
  }

  async findActivitiesByResponsibilityId(
    responsibilityId: string,
  ): Promise<Activity[]> {
    await this.findOne(responsibilityId);
    return this.activityRepository.find({
      where: { responsibilityId },
      order: { createdAt: 'ASC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateResponsibilityDto,
  ): Promise<any> {
    const responsibility = await this.responsibilityRepository.findOneBy({ id });
    if (!responsibility) {
      throw new NotFoundException(`Responsibility with ID "${id}" not found`);
    }

    if (updateDto.positionId) {
      const pos = await this.positionRepository.findOneBy({ id: updateDto.positionId });
      if (!pos) {
        throw new NotFoundException(`Position with ID "${updateDto.positionId}" not found`);
      }
    }

    const { activities, ...respData } = updateDto;
    Object.assign(responsibility, respData);

    if (activities) {
      responsibility.activities = activities.map((act) =>
        this.activityRepository.create({ ...act, responsibilityId: id }),
      );
    }

    await this.responsibilityRepository.save(responsibility);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const responsibility = await this.responsibilityRepository.findOneBy({ id });
    if (!responsibility) {
      throw new NotFoundException(`Responsibility with ID "${id}" not found`);
    }
    await this.responsibilityRepository.softRemove(responsibility);
  }
}
