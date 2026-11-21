import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metric } from './metric.entity.js';
import { MetricsController } from './metrics.controller.js';
import { MetricsService } from './metrics.service.js';
import { NodesModule } from '../nodes/nodes.module.js';
import { AlertsModule } from '../alerts/alerts.module.js';
import { TelemetryGateway } from '../telemetry/telemetry.gateway.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Metric]),
    NodesModule,
    forwardRef(() => AlertsModule),
  ],
  controllers: [MetricsController],
  providers: [MetricsService, TelemetryGateway],
  exports: [MetricsService, TelemetryGateway],
})
export class MetricsModule {}