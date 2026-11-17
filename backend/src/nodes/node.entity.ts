import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NodeType {
  VM = 'VM',
  PHYSICAL = 'PHYSICAL',
  CONTAINER = 'CONTAINER',
  SERVICE = 'SERVICE',
}

export enum NodeStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
  UNKNOWN = 'UNKNOWN',
}

@Entity('nodes')
export class Node {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  hostname: string; // Ex: IP Tailscale (100.x.y.z) ou nom MagicDNS (ubuntu-worker)

  @Column({
    type: 'enum',
    enum: NodeType,
    default: NodeType.PHYSICAL,
  })
  type: NodeType;

  @Column({
    type: 'enum',
    enum: NodeStatus,
    default: NodeStatus.UNKNOWN,
  })
  status: NodeStatus;

  @Column({ type: 'float', default: 85.0 })
  cpuThreshold: number;

  @Column({ type: 'float', default: 85.0 })
  ramThreshold: number;

  @Column({ type: 'int', default: 500 })
  latencyThresholdMs: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}