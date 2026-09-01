import { PartialType } from '@nestjs/swagger';
import { CreateJobLevelDto } from './create-job-level.dto';

export class UpdateJobLevelDto extends PartialType(CreateJobLevelDto) {}
