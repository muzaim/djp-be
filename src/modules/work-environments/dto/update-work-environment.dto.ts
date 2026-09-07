import { PartialType } from '@nestjs/swagger';
import { CreateWorkEnvironmentDto } from './create-work-environment.dto';

export class UpdateWorkEnvironmentDto extends PartialType(CreateWorkEnvironmentDto) {}
