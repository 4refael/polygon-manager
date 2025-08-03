import { Test } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { v4 } from 'uuid';
import type { Polygon } from '../types';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    // Use in-memory SQLite database for isolated testing
    process.env['DB_FILE'] = ':memory:';
    
    const module = await Test.createTestingModule({
      providers: [DatabaseService]
    }).compile();

    service = module.get(DatabaseService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize database tables', async () => {
      // Service should already be initialized from beforeEach
      const polygons = await service.findAll();
      expect(Array.isArray(polygons)).toBe(true);
      expect(polygons).toHaveLength(0);
    });
  });

  describe('Create Operations', () => {
    it('should create a polygon with all required fields', async () => {
      const polygon: Polygon = {
        id: v4(),
        name: 'Test Triangle',
        points: [[0, 0], [10, 0], [5, 10]],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await service.create(polygon);
      expect(result).toEqual(polygon);
    });

    it('should create polygons with complex point data', async () => {
      const polygon: Polygon = {
        id: v4(),
        name: 'Complex Shape',
        points: [
          [0.123456789, -9.987654321],
          [1000.5, 2000.75],
          [-500, -1000]
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await service.create(polygon);
      expect(result.points).toEqual(polygon.points);
    });

    it('should handle concurrent creates without conflicts', async () => {
      const polygons = Array.from({ length: 5 }, (_, i) => ({
        id: v4(),
        name: `Polygon ${i}`,
        points: [[i, i], [i + 1, i], [i + 0.5, i + 1]] as [number, number][],
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const promises = polygons.map(p => service.create(p));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      expect(new Set(results.map(r => r.id)).size).toBe(5);
    });
  });

  describe('Read Operations', () => {
    it('should find polygon by id', async () => {
      const polygon: Polygon = {
        id: v4(),
        name: 'Find Me',
        points: [[1, 1], [2, 2], [3, 3]],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.create(polygon);
      const found = await service.findById(polygon.id);
      
      expect(found).toEqual(polygon);
    });

    it('should return null for non-existent id', async () => {
      const result = await service.findById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should find all polygons in creation order', async () => {
      const polygon1: Polygon = {
        id: v4(),
        name: 'First',
        points: [[1, 1], [2, 2], [3, 3]],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      const polygon2: Polygon = {
        id: v4(),
        name: 'Second',
        points: [[4, 4], [5, 5], [6, 6]],
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02')
      };

      await service.create(polygon1);
      await service.create(polygon2);

      const all = await service.findAll();
      expect(all).toHaveLength(2);
      // Should be ordered by created_at DESC (newest first)
      expect(all[0]?.name).toBe('Second');
      expect(all[1]?.name).toBe('First');
    });

    it('should return empty array when no polygons exist', async () => {
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('Delete Operations', () => {
    it('should delete existing polygon', async () => {
      const polygon: Polygon = {
        id: v4(),
        name: 'To Delete',
        points: [[1, 1], [2, 2], [3, 3]],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.create(polygon);
      const deleted = await service.delete(polygon.id);
      
      expect(deleted).toBe(true);
      
      const found = await service.findById(polygon.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent polygon', async () => {
      const result = await service.delete('non-existent-id');
      expect(result).toBe(false);
    });

    it('should not affect other polygons when deleting', async () => {
      const polygon1: Polygon = {
        id: v4(),
        name: 'Keep Me',
        points: [[1, 1], [2, 2], [3, 3]],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const polygon2: Polygon = {
        id: v4(),
        name: 'Delete Me',
        points: [[4, 4], [5, 5], [6, 6]],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.create(polygon1);
      await service.create(polygon2);
      
      await service.delete(polygon2.id);
      
      const remaining = await service.findAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0]?.id).toBe(polygon1.id);
    });
  });

  describe('Data Persistence and Integrity', () => {
    it('should persist data correctly across operations', async () => {
      const polygon: Polygon = {
        id: v4(),
        name: 'Persistence Test',
        points: [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]],
        createdAt: new Date('2023-05-15T10:30:00.000Z'),
        updatedAt: new Date('2023-05-15T10:30:00.000Z')
      };

      await service.create(polygon);
      
      // Test that all fields are properly stored and retrieved
      const retrieved = await service.findById(polygon.id);
      expect(retrieved).toEqual(polygon);
      expect(retrieved?.points[0]).toEqual([0.1, 0.2]);
      expect(retrieved?.createdAt).toEqual(polygon.createdAt);
    });

    it('should handle special characters in polygon names', async () => {
      const polygon: Polygon = {
        id: v4(),
        name: 'Test with "quotes" & symbols: é, ñ, 中文, 🔥',
        points: [[1, 1], [2, 2], [3, 3]],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.create(polygon);
      const retrieved = await service.findById(polygon.id);
      
      expect(retrieved?.name).toBe(polygon.name);
    });

    it('should handle large polygon data sets', async () => {
      // Create a polygon with 1000 points
      const points: [number, number][] = Array.from({ length: 1000 }, (_, i) => [
        Math.cos(i * 2 * Math.PI / 1000) * 100,
        Math.sin(i * 2 * Math.PI / 1000) * 100
      ]);

      const polygon: Polygon = {
        id: v4(),
        name: 'Large Polygon',
        points,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.create(polygon);
      const retrieved = await service.findById(polygon.id);
      
      expect(retrieved?.points).toHaveLength(1000);
      expect(retrieved?.points[0]).toEqual(points[0]);
      expect(retrieved?.points[999]).toEqual(points[999]);
    });
  });
});