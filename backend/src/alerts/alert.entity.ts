import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Node } from '../nodes/node.entity.js';

export enum AlertSeverity {
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum AlertType {
  HIGH_CPU = 'HIGH_CPU',
  HIGH_RAM = 'HIGH_RAM',
  HIGH_LATENCY = 'HIGH_LATENCY',
  NODE_DOWN = 'NODE_DOWN',
}

@Entity('alerts')
@Index(['nodeId', 'isResolved', 'createdAt'])
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  nodeId: string;

  @ManyToOne(() => Node, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nodeId' })
  node: Node;

  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Column({ type: 'enum', enum: AlertSeverity })
  severity: AlertSeverity;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'float', nullable: true })
  observedValue: number | null;

  @Column({ type: 'float', nullable: true })
  thresholdValue: number | null;

  @Column({ default: false })
  isResolved: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}