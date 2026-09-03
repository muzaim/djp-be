import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Activity } from './activity.entity';
import { Position } from '../../organizations/entities/position.entity';

@Entity('mst_responsibilities')
export class Responsibility {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'position_id', nullable: true })
  positionId?: string;

  @ManyToOne(() => Position, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'position_id' })
  position?: Position;

  @Column({ nullable: true })
  code?: string;

  @Column()
  name!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => Activity, (activity) => activity.responsibility, {
    cascade: true,
  })
  activities!: Activity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
