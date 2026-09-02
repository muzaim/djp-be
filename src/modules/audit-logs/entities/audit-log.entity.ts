import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sys_audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ name: 'user_email', nullable: true })
  userEmail?: string;

  @Column()
  action!: string;

  @Column({ length: 10 })
  method!: string;

  @Column({ length: 255 })
  path!: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'json', nullable: true })
  payload?: any;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
