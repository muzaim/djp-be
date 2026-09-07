import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkEnvironment } from './entities/work-environment.entity';
import { Position } from '../organizations/entities/position.entity';
import { WorkEnvironmentsService } from './work-environments.service';
import { WorkEnvironmentsController } from './work-environments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkEnvironment, Position])],
  controllers: [WorkEnvironmentsController],
  providers: [WorkEnvironmentsService],
  exports: [WorkEnvironmentsService],
})
export class WorkEnvironmentsModule {}
