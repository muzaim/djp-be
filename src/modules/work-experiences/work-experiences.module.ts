import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkExperience } from './entities/work-experience.entity';
import { Position } from '../organizations/entities/position.entity';
import { WorkExperiencesService } from './work-experiences.service';
import { WorkExperiencesController } from './work-experiences.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkExperience, Position])],
  controllers: [WorkExperiencesController],
  providers: [WorkExperiencesService],
  exports: [WorkExperiencesService],
})
export class WorkExperiencesModule {}
