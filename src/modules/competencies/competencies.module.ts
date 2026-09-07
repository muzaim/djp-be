import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competency } from './entities/competency.entity';
import { Position } from '../organizations/entities/position.entity';
import { CompetenciesService } from './competencies.service';
import { CompetenciesController } from './competencies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Competency, Position])],
  controllers: [CompetenciesController],
  providers: [CompetenciesService],
  exports: [CompetenciesService],
})
export class CompetenciesModule {}
