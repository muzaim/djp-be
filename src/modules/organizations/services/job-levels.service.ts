import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { JobLevel } from '../entities/job-level.entity';
import { CreateJobLevelDto } from '../dto/create-job-level.dto';
import { UpdateJobLevelDto } from '../dto/update-job-level.dto';
import { PaginationDto, PaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class JobLevelsService {
  constructor(
    @InjectRepository(JobLevel)
    private readonly jobLevelRepository: Repository<JobLevel>,
  ) {}

  async create(createDto: CreateJobLevelDto): Promise<JobLevel> {
    const jobLevel = this.jobLevelRepository.create(createDto);
    return this.jobLevelRepository.save(jobLevel);
  }

  async findAll(paginationDto: PaginationDto = new PaginationDto()): Promise<PaginatedResult<JobLevel>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const whereCondition = search
      ? [{ name: Like(`%${search}%`) }, { code: Like(`%${search}%`) }]
      : {};

    const [items, totalItems] = await this.jobLevelRepository.findAndCount({
      where: whereCondition,
      order: { rankWeight: 'ASC' },
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

  async findOne(id: string): Promise<JobLevel> {
    const jobLevel = await this.jobLevelRepository.findOneBy({ id });
    if (!jobLevel) {
      throw new NotFoundException(`Job Level with ID "${id}" not found`);
    }
    return jobLevel;
  }

  async update(id: string, updateDto: UpdateJobLevelDto): Promise<JobLevel> {
    const jobLevel = await this.findOne(id);
    Object.assign(jobLevel, updateDto);
    return this.jobLevelRepository.save(jobLevel);
  }

  async remove(id: string): Promise<void> {
    const jobLevel = await this.findOne(id);
    await this.jobLevelRepository.softRemove(jobLevel);
  }
}
