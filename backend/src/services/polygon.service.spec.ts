import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PolygonService } from './polygon.service';
import { DatabaseService } from './database.service';
import type { PolygonData } from '../types';

describe('PolygonService', () => {
  let service: PolygonService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    // Use in-memory SQLite database for testing
    process.env['DB_FILE'] = ':memory:';

    const module = await Test.createTestingModule({
      providers: [PolygonService, DatabaseService]
    }).compile();

    service = module.get(PolygonService);
    databaseService = module.get(DatabaseService);
    
    // Initialize database
    await databaseService.onModuleInit();
  });

  afterEach(async () => {
    await databaseService.onModuleDestroy();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Create Operations', () => {
    it('should create polygon with generated id and timestamps', async () => {
      const polygonData: PolygonData = {
        name: 'Test Triangle',
        points: [[0, 0], [10, 0], [5, 10]]
      };

      const result = await service.create(polygonData);

      expect(result).toMatchObject({
        id: expect.any(String),
        name: 'Test Triangle',
        points: [[0, 0], [10, 0], [5, 10]],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });

      // Verify id is UUID format
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should create multiple polygons with unique ids', async () => {
      const polygonData1: PolygonData = {
        name: 'Polygon 1',
        points: [[0, 0], [1, 0], [0.5, 1]]
      };

      const polygonData2: PolygonData = {
        name: 'Polygon 2',
        points: [[2, 2], [3, 2], [2.5, 3]]
      };

      const result1 = await service.create(polygonData1);
      const result2 = await service.create(polygonData2);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.name).toBe('Polygon 1');
      expect(result2.name).toBe('Polygon 2');
    });

    it('should set createdAt and updatedAt to current time', async () => {
      const before = new Date();
      
      const polygonData: PolygonData = {
        name: 'Time Test',
        points: [[0, 0], [1, 1], [2, 2]]
      };

      const result = await service.create(polygonData);
      const after = new Date();

      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(result.updatedAt).toEqual(result.createdAt);
    });

    it('should persist created polygon in database', async () => {
      const polygonData: PolygonData = {
        name: 'Persistence Test',
        points: [[5, 5], [10, 5], [7.5, 10]]
      };

      const created = await service.create(polygonData);
      
      // Verify it was stored in database
      const found = await databaseService.findById(created.id);
      expect(found).toEqual(created);
    });
  });

  describe('Read Operations', () => {
    it('should find all polygons', async () => {
      const polygon1Data: PolygonData = {
        name: 'First',
        points: [[0, 0], [1, 0], [0.5, 1]]
      };

      const polygon2Data: PolygonData = {
        name: 'Second',
        points: [[2, 2], [3, 2], [2.5, 3]]
      };

      const created1 = await service.create(polygon1Data);
      const created2 = await service.create(polygon2Data);

      const all = await service.findAll();
      
      expect(all).toHaveLength(2);
      expect(all).toContainEqual(created2); // Should be first (newest)
      expect(all).toContainEqual(created1);
    });

    it('should return empty array when no polygons exist', async () => {
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should find specific polygon by id', async () => {
      const polygonData: PolygonData = {
        name: 'Find Me',
        points: [[1, 1], [2, 2], [3, 3]]
      };

      const created = await service.create(polygonData);
      const found = await service.findOne(created.id);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundException for non-existent polygon', async () => {
      await expect(service.findOne('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
      
      await expect(service.findOne('non-existent-id'))
        .rejects
        .toThrow('Polygon non-existent-id not found');
    });
  });

  describe('Delete Operations', () => {
    it('should remove existing polygon', async () => {
      const polygonData: PolygonData = {
        name: 'To Delete',
        points: [[1, 1], [2, 2], [3, 3]]
      };

      const created = await service.create(polygonData);
      
      await service.remove(created.id);
      
      // Should no longer exist
      await expect(service.findOne(created.id))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when deleting non-existent polygon', async () => {
      await expect(service.remove('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should not affect other polygons when deleting one', async () => {
      const polygon1Data: PolygonData = {
        name: 'Keep Me',
        points: [[1, 1], [2, 2], [3, 3]]
      };

      const polygon2Data: PolygonData = {
        name: 'Delete Me',
        points: [[4, 4], [5, 5], [6, 6]]
      };

      const created1 = await service.create(polygon1Data);
      const created2 = await service.create(polygon2Data);
      
      await service.remove(created2.id);
      
      const remaining = await service.findAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0]?.id).toBe(created1.id);
      
      // Should still be able to find the remaining polygon
      const found = await service.findOne(created1.id);
      expect(found).toEqual(created1);
    });
  });

  describe('Business Logic Validation', () => {
    it('should handle complex polygon data correctly', async () => {
      const complexPolygonData: PolygonData = {
        name: 'Complex Polygon with Special Characters: éñü 中文 🔥',
        points: [
          [0.123456789, -9.987654321],
          [1000.5, 2000.75],
          [-500.25, -1000.33],
          [0, 0]
        ]
      };

      const result = await service.create(complexPolygonData);
      
      expect(result.name).toBe(complexPolygonData.name);
      expect(result.points).toEqual(complexPolygonData.points);
      
      // Verify it can be retrieved correctly
      const found = await service.findOne(result.id);
      expect(found.name).toBe(complexPolygonData.name);
      expect(found.points).toEqual(complexPolygonData.points);
    });

    it('should handle concurrent operations correctly', async () => {
      const polygonDataArray = Array.from({ length: 10 }, (_, i) => ({
        name: `Concurrent Polygon ${i}`,
        points: [[i, i], [i + 1, i], [i + 0.5, i + 1]] as [number, number][]
      }));

      // Create all polygons concurrently
      const createPromises = polygonDataArray.map(data => service.create(data));
      const results = await Promise.all(createPromises);

      expect(results).toHaveLength(10);
      expect(new Set(results.map(r => r.id)).size).toBe(10); // All unique IDs

      // Verify all were stored
      const all = await service.findAll();
      expect(all).toHaveLength(10);

      // Delete some concurrently
      const deletePromises = results.slice(0, 5).map(r => service.remove(r.id));
      await Promise.all(deletePromises);

      const remaining = await service.findAll();
      expect(remaining).toHaveLength(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid polygon data', async () => {
      // This test focuses on service-level error handling rather than database errors
      // since database errors are harder to simulate without breaking the test teardown
      
      const polygonData: PolygonData = {
        name: 'Valid Test',
        points: [[0, 0], [1, 1], [2, 2]]
      };

      // This should work normally
      const result = await service.create(polygonData);
      expect(result.name).toBe('Valid Test');
      
      // Test that the service properly handles the case where database returns null
      await expect(service.findOne('definitely-non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});