import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { DatabaseService } from './database.service';
import type { Polygon, PolygonData } from '../types';

@Injectable()
export class PolygonService {
  private readonly logger = new Logger(PolygonService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<Polygon[]> {
    return this.databaseService.findAll();
  }

  async findOne(id: string): Promise<Polygon> {
    const polygon = await this.databaseService.findById(id);
    if (!polygon) {
      throw new NotFoundException(`Polygon ${id} not found`);
    }
    return polygon;
  }

  async create(data: PolygonData): Promise<Polygon> {
    const polygon: Polygon = {
      ...data,
      id: v4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.databaseService.create(polygon);
    this.logger.log(`Created polygon: ${polygon.id}`);
    return polygon;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.databaseService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Polygon ${id} not found`);
    }

    this.logger.log(`Deleted polygon: ${id}`);
  }
}