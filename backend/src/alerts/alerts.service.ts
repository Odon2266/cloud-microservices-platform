import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertSeverity, AlertType } from './alert.entity.js';
import { Node } from '../nodes/node.entity.js';
import { Metric } from '../metrics/metric.entity.js';
import { TelemetryGateway } from '../telemetry/telemetry.gateway.js';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @Inject(forwardRef(() => TelemetryGateway))
    private readonly telemetryGateway: TelemetryGateway,
  ) {}

  async evaluateMetric(node: Node, metric: Metric): Promise<Alert[]> {
    const generatedAlerts: Alert[] = [];

    if (metric.isHealthy === false) {
      const alert = await this.createIfNotActive(
        node.id,
        AlertType.NODE_DOWN,
        AlertSeverity.CRITICAL,
        `Le nœud "${node.name}" est signalé hors ligne / non sain (isHealthy=false).`,
        0,
        1,
      );
      if (alert) generatedAlerts.push(alert);
    }

    if (metric.cpuUsage > node.cpuThreshold) {
      const alert = await this.createIfNotActive(
        node.id,
        AlertType.HIGH_CPU,
        AlertSeverity.WARNING,
        `CPU élevé sur "${node.name}" : ${metric.cpuUsage}% (seuil : ${node.cpuThreshold}%).`,
        metric.cpuUsage,
        node.cpuThreshold,
      );
      if (alert) generatedAlerts.push(alert);
    }

    if (metric.ramUsage > node.ramThreshold) {
      const alert = await this.createIfNotActive(
        node.id,
        AlertType.HIGH_RAM,
        AlertSeverity.WARNING,
        `RAM élevée sur "${node.name}" : ${metric.ramUsage}% (seuil : ${node.ramThreshold}%).`,
        metric.ramUsage,
        node.ramThreshold,
      );
      if (alert) generatedAlerts.push(alert);
    }

    if (metric.latencyMs > node.latencyThresholdMs) {
      const alert = await this.createIfNotActive(
        node.id,
        AlertType.HIGH_LATENCY,
        AlertSeverity.WARNING,
        `Latence élevée sur "${node.name}" : ${metric.latencyMs}ms (seuil : ${node.latencyThresholdMs}ms).`,
        metric.latencyMs,
        node.latencyThresholdMs,
      );
      if (alert) generatedAlerts.push(alert);
    }

    return generatedAlerts;
  }

  private async createIfNotActive(
    nodeId: string,
    type: AlertType,
    severity: AlertSeverity,
    message: string,
    observedValue: number,
    thresholdValue: number,
  ): Promise<Alert | null> {
    const existing = await this.alertRepository.findOne({
      where: { nodeId, type, isResolved: false },
    });

    if (existing) {
      return null;
    }

    const alert = this.alertRepository.create({
      nodeId,
      type,
      severity,
      message,
      observedValue,
      thresholdValue,
      isResolved: false,
      resolvedAt: null,
    });

    const savedAlert = await this.alertRepository.save(alert);
    this.telemetryGateway.emitAlertTriggered(savedAlert);

    return savedAlert;
  }

  async findAll(nodeId?: string, onlyUnresolved?: boolean): Promise<Alert[]> {
    const where: Record<string, unknown> = {};
    if (nodeId) where.nodeId = nodeId;
    if (onlyUnresolved) where.isResolved = false;

    return this.alertRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async resolve(id: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`Alerte avec l'id "${id}" introuvable.`);
    }

    alert.isResolved = true;
    alert.resolvedAt = new Date();
    return this.alertRepository.save(alert);
  }
}