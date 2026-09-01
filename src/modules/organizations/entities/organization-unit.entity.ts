import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('mst_organization_units')
export class OrganizationUnit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId!: string;

  @ManyToOne(() => OrganizationUnit, (org) => org.children)
  @JoinColumn({ name: 'parent_id' })
  parent!: OrganizationUnit;

  @OneToMany(() => OrganizationUnit, (org) => org.parent)
  children!: OrganizationUnit[];

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column({ name: 'level_type' })
  levelType!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date;
}
