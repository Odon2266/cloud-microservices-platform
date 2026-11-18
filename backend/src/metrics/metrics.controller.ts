import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import { IngestMetricDto } from './dto/ingest-metric.dto.js';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  ingest(@Body() dto: IngestMetricDto) {
    return this.metricsService.ingest(dto);
  }

  @Get('node/:nodeId')
  findByNode(@Param('nodeId', ParseUUIDPipe) nodeId: string) {
    return this.metricsService.findByNode(nodeId);
  }
}