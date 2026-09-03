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
import { Responsibility } from './responsibility.entity';

@Entity('mst_activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'responsibility_id' })
  responsibilityId!: string;

  @ManyToOne(() => Responsibility, (responsibility) => responsibility.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'responsibility_id' })
  responsibility!: Responsibility;

  @Column()
  name!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
