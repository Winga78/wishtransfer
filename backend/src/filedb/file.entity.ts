import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class FileUpload {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('text')
  bucket!: string;

  @Column('text')
  fileName!: string;

  @Column('text')
  originalName!: string;

  @Column('int')
  size!: number;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status!: 'pending' | 'completed' | 'failed';

  @CreateDateColumn()
  createdAt!: Date;

  @CreateDateColumn()
  updatedAt!: Date;
}