import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobLevel } from '../entities/job-level.entity';
import { CreateJobLevelDto } from '../dto/create-job-level.dto';
import { UpdateJobLevelDto } from '../dto/update-job-level.dto';

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

  async findAll(): Promise<JobLevel[]> {
    return this.jobLevelRepository.find({
      order: { rankWeight: 'ASC' },
    });
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
