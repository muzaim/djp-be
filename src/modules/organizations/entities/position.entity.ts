import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrganizationUnit } from './organization-unit.entity';
import { JobLevel } from './job-level.entity';

@Entity('mst_positions')
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'organization_unit_id' })
  organizationUnitId!: string;

  @ManyToOne(() => OrganizationUnit)
  @JoinColumn({ name: 'organization_unit_id' })
  organizationUnit!: OrganizationUnit;

  @Column({ name: 'job_level_id' })
  jobLevelId!: string;

  @ManyToOne(() => JobLevel)
  @JoinColumn({ name: 'job_level_id' })
  jobLevel!: JobLevel;

  @Column()
  title!: string;

  @Column({ name: 'parent_position_id', nullable: true })
  parentPositionId!: string;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'parent_position_id' })
  parentPosition!: Position;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date;
}
