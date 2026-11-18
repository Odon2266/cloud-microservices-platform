import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metric } from './metric.entity.js';
import { IngestMetricDto } from './dto/ingest-metric.dto.js';
import { Node, NodeStatus } from '../nodes/node.entity.js';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Metric)
    private readonly metricRepository: Repository<Metric>,
    @InjectRepository(Node)
    private readonly nodeRepository: Repository<Node>,
  ) {}

  async ingest(dto: IngestMetricDto): Promise<Metric> {
    // 1. Vérifier si le nœud existe
    const node = await this.nodeRepository.findOne({
      where: { id: dto.nodeId },
    });
    if (!node) {
      throw new NotFoundException(`Nœud avec l'id "${dto.nodeId}" introuvable.`);
    }

    // 2. Enregistrer la métrique
    const metric = this.metricRepository.create(dto);
    const savedMetric = await this.metricRepository.save(metric);

    // 3. Mettre à jour lastSeenAt et évaluer le statut du nœud
    node.lastSeenAt = new Date();

    if (dto.isHealthy === false) {
      node.status = NodeStatus.DOWN;
    } else if (
      dto.cpuUsage > node.cpuThreshold ||
      dto.ramUsage > node.ramThreshold ||
      dto.latencyMs > node.latencyThresholdMs
    ) {
      node.status = NodeStatus.DEGRADED;
    } else {
      node.status = NodeStatus.UP;
    }

    await this.nodeRepository.save(node);

    return savedMetric;
  }

  async findByNode(nodeId: string): Promise<Metric[]> {
    return this.metricRepository.find({
      where: { nodeId },
      order: { recordedAt: 'DESC' },
      take: 50,
    });
  }
}