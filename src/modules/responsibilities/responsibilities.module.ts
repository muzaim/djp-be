import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Responsibility } from './entities/responsibility.entity';
import { Activity } from './entities/activity.entity';
import { ResponsibilitiesService } from './services/responsibilities.service';
import { ActivitiesService } from './services/activities.service';
import { ResponsibilitiesController } from './controllers/responsibilities.controller';
import { ActivitiesController } from './controllers/activities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Responsibility, Activity])],
  controllers: [ResponsibilitiesController, ActivitiesController],
  providers: [ResponsibilitiesService, ActivitiesService],
  exports: [ResponsibilitiesService, ActivitiesService],
})
export class ResponsibilitiesModule {}
