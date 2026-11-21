import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alert.entity.js';
import { AlertsController } from './alerts.controller.js';
import { AlertsService } from './alerts.service.js';
import { MetricsModule } from '../metrics/metrics.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert]),
    forwardRef(() => MetricsModule),
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}