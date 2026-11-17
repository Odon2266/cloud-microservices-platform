import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { NodesService } from './nodes.service.js';
import { CreateNodeDto } from './dto/create-node.dto.js';

@Controller('nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Post()
  create(@Body() createNodeDto: CreateNodeDto) {
    return this.nodesService.create(createNodeDto);
  }

  @Get()
  findAll() {
    return this.nodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.nodesService.findOne(id);
  }
}