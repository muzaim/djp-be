import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ActivityOutput } from './entities/activity-output.entity';
import { CreateActivityOutputDto } from './dto/create-activity-output.dto';
import { UpdateActivityOutputDto } from './dto/update-activity-output.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ActivityOutputsService {
  constructor(
    @InjectRepository(ActivityOutput)
    private readonly activityOutputRepository: Repository<ActivityOutput>,
  ) {}

  async create(createDto: CreateActivityOutputDto): Promise<ActivityOutput> {
    const item = this.activityOutputRepository.create(createDto);
    return this.activityOutputRepository.save(item);
  }

  async findAll(paginationDto: PaginationDto = new PaginationDto()): Promise<PaginatedResult<ActivityOutput>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition = search
      ? [{ name: Like(`%${search}%`) }, { code: Like(`%${search}%`) }]
      : {};

    const [items, totalItems] = await this.activityOutputRepository.findAndCount({
      where: whereCondition,
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

  async findOne(id: string): Promise<ActivityOutput> {
    const item = await this.activityOutputRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Activity Output with ID "${id}" not found`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateActivityOutputDto): Promise<ActivityOutput> {
    const item = await this.findOne(id);
    Object.assign(item, updateDto);
    return this.activityOutputRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.activityOutputRepository.softRemove(item);
  }
}
