import { Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service.js';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(
    @Query('nodeId') nodeId?: string,
    @Query('unresolved') unresolved?: string,
  ) {
    return this.alertsService.findAll(nodeId, unresolved === 'true');
  }

  @Patch(':id/resolve')
  resolve(@Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.resolve(id);
  }
}