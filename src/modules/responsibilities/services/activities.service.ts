import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';
import { Responsibility } from '../entities/responsibility.entity';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-activity.dto';
import { PaginationDto, PaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Responsibility)
    private readonly responsibilityRepository: Repository<Responsibility>,
  ) {}

  async create(createDto: CreateActivityDto): Promise<Activity> {
    if (createDto.responsibilityId) {
      const resp = await this.responsibilityRepository.findOneBy({
        id: createDto.responsibilityId,
      });
      if (!resp) {
        throw new NotFoundException(
          `Responsibility with ID "${createDto.responsibilityId}" not found`,
        );
      }
    }
    const activity = this.activityRepository.create(createDto);
    return this.activityRepository.save(activity);
  }

  async findAll(
    paginationDto: PaginationDto = new PaginationDto(),
    responsibilityId?: string,
  ): Promise<PaginatedResult<Activity>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition: any = {};

    if (search) {
      whereCondition.name = Like(`%${search}%`);
    }

    if (responsibilityId) {
      whereCondition.responsibilityId = responsibilityId;
    }

    const [items, totalItems] = await this.activityRepository.findAndCount({
      where: whereCondition,
      relations: ['responsibility'],
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

  async findByResponsibility(responsibilityId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { responsibilityId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Activity> {
    const item = await this.activityRepository.findOne({
      where: { id },
      relations: ['responsibility'],
    });
    if (!item) {
      throw new NotFoundException(`Activity with ID "${id}" not found`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateActivityDto): Promise<Activity> {
    const item = await this.findOne(id);
    Object.assign(item, updateDto);
    return this.activityRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.activityRepository.softRemove(item);
  }
}
