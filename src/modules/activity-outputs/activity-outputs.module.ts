import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityOutput } from './entities/activity-output.entity';
import { ActivityOutputsService } from './activity-outputs.service';
import { ActivityOutputsController } from './activity-outputs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityOutput])],
  controllers: [ActivityOutputsController],
  providers: [ActivityOutputsService],
  exports: [ActivityOutputsService],
})
export class ActivityOutputsModule {}
