import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Responsibility } from '../entities/responsibility.entity';
import { Activity } from '../entities/activity.entity';
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
  ) {}

  async create(createDto: CreateResponsibilityDto): Promise<Responsibility> {
    const { activities, ...respData } = createDto;

    const responsibility = this.responsibilityRepository.create(respData);

    if (activities && activities.length > 0) {
      responsibility.activities = activities.map((act) =>
        this.activityRepository.create(act),
      );
    }

    return this.responsibilityRepository.save(responsibility);
  }

  async findAll(
    paginationDto: PaginationDto = new PaginationDto(),
  ): Promise<PaginatedResult<Responsibility>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition = search ? [{ name: Like(`%${search}%`) }] : {};

    const [items, totalItems] =
      await this.responsibilityRepository.findAndCount({
        where: whereCondition,
        relations: ['activities'],
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

  async findOne(id: string): Promise<Responsibility> {
    const item = await this.responsibilityRepository.findOne({
      where: { id },
      relations: ['activities'],
    });
    if (!item) {
      throw new NotFoundException(`Responsibility with ID "${id}" not found`);
    }
    return item;
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
  ): Promise<Responsibility> {
    const responsibility = await this.findOne(id);
    const { activities, ...respData } = updateDto;

    Object.assign(responsibility, respData);

    if (activities) {
      responsibility.activities = activities.map((act) =>
        this.activityRepository.create({ ...act, responsibilityId: id }),
      );
    }

    return this.responsibilityRepository.save(responsibility);
  }

  async remove(id: string): Promise<void> {
    const responsibility = await this.findOne(id);
    await this.responsibilityRepository.softRemove(responsibility);
  }
}
