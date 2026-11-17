import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Node } from '../nodes/node.entity.js';

@Entity('metrics')
@Index(['nodeId', 'recordedAt'])
export class Metric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  nodeId: string;

  @ManyToOne(() => Node, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeId' })
  node: Node;

  @Column({ type: 'float' })
  cpuUsage: number;

  @Column({ type: 'float' })
  ramUsage: number;

  @Column({ type: 'int' })
  latencyMs: number;

  @Column({ default: true })
  isHealthy: boolean;

  @CreateDateColumn()
  recordedAt: Date;
}