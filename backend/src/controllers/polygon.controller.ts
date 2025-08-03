import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { PolygonService } from '../services/polygon.service';
import { CreatePolygonDto } from '../dto/polygon.dto';
import { DelayInterceptor } from '../interceptors/delay.interceptor';
import type { Polygon } from '../types';

@Controller('polygons')
@UseInterceptors(DelayInterceptor)
export class PolygonController {
  constructor(private readonly service: PolygonService) {}

  @Post()
  async create(@Body() dto: CreatePolygonDto): Promise<Polygon> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(): Promise<Polygon[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Polygon> {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}