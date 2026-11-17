import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class IngestMetricDto {
  @IsUUID()
  nodeId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  cpuUsage: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  ramUsage: number;

  @IsInt()
  @Min(0)
  latencyMs: number;

  @IsBoolean()
  @IsOptional()
  isHealthy?: boolean;
}