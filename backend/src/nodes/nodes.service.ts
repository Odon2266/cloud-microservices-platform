import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node } from './node.entity.js';
import { CreateNodeDto } from './dto/create-node.dto.js';

@Injectable()
export class NodesService {
  constructor(
    @InjectRepository(Node)
    private readonly nodeRepository: Repository<Node>,
  ) {}

  async create(createNodeDto: CreateNodeDto): Promise<Node> {
    const existing = await this.nodeRepository.findOne({
      where: { name: createNodeDto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Un nœud nommé "${createNodeDto.name}" existe déjà.`,
      );
    }

    const node = this.nodeRepository.create(createNodeDto);
    return this.nodeRepository.save(node);
  }

  async findAll(): Promise<Node[]> {
    return this.nodeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Node> {
    const node = await this.nodeRepository.findOne({ where: { id } });
    if (!node) {
      throw new NotFoundException(`Nœud avec l'id "${id}" introuvable.`);
    }
    return node;
  }
}