import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationUnit } from './entities/organization-unit.entity';
import { JobLevel } from './entities/job-level.entity';
import { Position } from './entities/position.entity';
import { OrganizationUnitsService } from './services/organization-units.service';
import { JobLevelsService } from './services/job-levels.service';
import { PositionsService } from './services/positions.service';
import { OrganizationUnitsController } from './controllers/organization-units.controller';
import { JobLevelsController } from './controllers/job-levels.controller';
import { PositionsController } from './controllers/positions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationUnit, JobLevel, Position]),
  ],
  controllers: [
    OrganizationUnitsController,
    JobLevelsController,
    PositionsController,
  ],
  providers: [
    OrganizationUnitsService,
    JobLevelsService,
    PositionsService,
  ],
  exports: [
    OrganizationUnitsService,
    JobLevelsService,
    PositionsService,
  ],
})
export class OrganizationsModule {}
