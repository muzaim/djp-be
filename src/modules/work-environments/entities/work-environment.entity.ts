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
import { Position } from '../../organizations/entities/position.entity';

@Entity('mst_work_environments')
export class WorkEnvironment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'position_id' })
  positionId!: string;

  @ManyToOne(() => Position, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'position_id' })
  position!: Position;

  @Column({ nullable: true })
  code?: string;

  @Column()
  name!: string;

  @Column()
  scale!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
