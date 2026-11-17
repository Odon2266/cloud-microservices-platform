import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { NodeType } from '../node.entity.js';

export class CreateNodeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  hostname: string;

  @IsEnum(NodeType)
  @IsOptional()
  type?: NodeType;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  cpuThreshold?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  ramThreshold?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  latencyThresholdMs?: number;
}