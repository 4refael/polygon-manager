import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PolygonController } from './polygon.controller';
import { PolygonService } from '../services/polygon.service';
import { DatabaseService } from '../services/database.service';
import { CreatePolygonDto } from '../dto/polygon.dto';

describe('PolygonController', () => {
  let controller: PolygonController;

  let databaseService: DatabaseService;

  beforeEach(async () => {
    // Use in-memory SQLite database for testing
    process.env['DB_FILE'] = ':memory:';

    const module = await Test.createTestingModule({
      controllers: [PolygonController],
      providers: [PolygonService, DatabaseService],
    }).compile();

    controller = module.get(PolygonController);
    databaseService = module.get(DatabaseService);
    
    // Initialize database
    await databaseService.onModuleInit();
  });

  afterEach(async () => {
    await databaseService.onModuleDestroy();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('POST /polygons', () => {
    it('should create a new polygon', async () => {
      const createDto: CreatePolygonDto = {
        name: 'Test Triangle',
        points: [[0, 0], [10, 0], [5, 10]]
      };

      const result = await controller.create(createDto);

      expect(result).toMatchObject({
        id: expect.any(String),
        name: 'Test Triangle',
        points: [[0, 0], [10, 0], [5, 10]],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should create polygon with complex point data', async () => {
      const createDto: CreatePolygonDto = {
        name: 'Complex Shape',
        points: [
          [0.123456789, -9.987654321],
          [1000.5, 2000.75],
          [-500, -1000],
          [0, 0]
        ]
      };

      const result = await controller.create(createDto);

      expect(result.name).toBe('Complex Shape');
      expect(result.points).toEqual(createDto.points);
    });

    it('should handle special characters in polygon names', async () => {
      const createDto: CreatePolygonDto = {
        name: 'Test with "quotes" & symbols: é, ñ, 中文, 🔥',
        points: [[1, 1], [2, 2], [3, 3]]
      };

      const result = await controller.create(createDto);
      expect(result.name).toBe(createDto.name);
    });

    it('should create multiple unique polygons', async () => {
      const dto1: CreatePolygonDto = {
        name: 'Polygon 1',
        points: [[0, 0], [1, 0], [0.5, 1]]
      };

      const dto2: CreatePolygonDto = {
        name: 'Polygon 2',
        points: [[2, 2], [3, 2], [2.5, 3]]
      };

      const result1 = await controller.create(dto1);
      const result2 = await controller.create(dto2);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.name).toBe('Polygon 1');
      expect(result2.name).toBe('Polygon 2');
    });
  });

  describe('GET /polygons', () => {
    it('should return empty array when no polygons exist', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });

    it('should return all polygons', async () => {
      const dto1: CreatePolygonDto = {
        name: 'First',
        points: [[0, 0], [1, 0], [0.5, 1]]
      };

      const dto2: CreatePolygonDto = {
        name: 'Second',
        points: [[2, 2], [3, 2], [2.5, 3]]
      };

      const created1 = await controller.create(dto1);
      const created2 = await controller.create(dto2);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(created2); // Newest first
      expect(result).toContainEqual(created1);
    });

    it('should return polygons in correct order (newest first)', async () => {
      // Create polygons with slight delay to ensure different timestamps
      const dto1: CreatePolygonDto = {
        name: 'First',
        points: [[0, 0], [1, 0], [0.5, 1]]
      };

      const created1 = await controller.create(dto1);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const dto2: CreatePolygonDto = {
        name: 'Second',
        points: [[2, 2], [3, 2], [2.5, 3]]
      };

      const created2 = await controller.create(dto2);

      const result = await controller.findAll();

      expect(result[0]?.id).toBe(created2.id); // Newest first
      expect(result[1]?.id).toBe(created1.id);
    });
  });

  describe('GET /polygons/:id', () => {
    it('should return specific polygon by id', async () => {
      const createDto: CreatePolygonDto = {
        name: 'Find Me',
        points: [[1, 1], [2, 2], [3, 3]]
      };

      const created = await controller.create(createDto);
      const found = await controller.findOne(created.id);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundException for non-existent id', async () => {
      await expect(controller.findOne('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should handle UUID format ids correctly', async () => {
      const createDto: CreatePolygonDto = {
        name: 'UUID Test',
        points: [[0, 0], [1, 1], [2, 2]]
      };

      const created = await controller.create(createDto);
      
      // Verify the ID is UUID format
      expect(created.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      
      const found = await controller.findOne(created.id);
      expect(found.id).toBe(created.id);
    });
  });

  describe('DELETE /polygons/:id', () => {
    it('should delete existing polygon', async () => {
      const createDto: CreatePolygonDto = {
        name: 'To Delete',
        points: [[1, 1], [2, 2], [3, 3]]
      };

      const created = await controller.create(createDto);
      
      // Delete should not return anything (void)
      const result = await controller.remove(created.id);
      expect(result).toBeUndefined();

      // Polygon should no longer exist
      await expect(controller.findOne(created.id))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when deleting non-existent polygon', async () => {
      await expect(controller.remove('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should only delete specified polygon', async () => {
      const dto1: CreatePolygonDto = {
        name: 'Keep Me',
        points: [[1, 1], [2, 2], [3, 3]]
      };

      const dto2: CreatePolygonDto = {
        name: 'Delete Me',
        points: [[4, 4], [5, 5], [6, 6]]
      };

      const created1 = await controller.create(dto1);
      const created2 = await controller.create(dto2);

      await controller.remove(created2.id);

      // First polygon should still exist
      const found = await controller.findOne(created1.id);
      expect(found).toEqual(created1);

      // All polygons list should contain only the first one
      const all = await controller.findAll();
      expect(all).toHaveLength(1);
      expect(all[0]?.id).toBe(created1.id);
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete CRUD workflow', async () => {
      // Create
      const createDto: CreatePolygonDto = {
        name: 'Workflow Test',
        points: [[0, 0], [5, 0], [2.5, 5]]
      };

      const created = await controller.create(createDto);
      expect(created.name).toBe('Workflow Test');

      // Read single
      const found = await controller.findOne(created.id);
      expect(found).toEqual(created);

      // Read all
      const all = await controller.findAll();
      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(created);

      // Delete
      await controller.remove(created.id);

      // Verify deletion
      await expect(controller.findOne(created.id))
        .rejects
        .toThrow(NotFoundException);

      const emptyList = await controller.findAll();
      expect(emptyList).toHaveLength(0);
    });

    it('should handle concurrent operations', async () => {
      // Create multiple polygons concurrently
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        controller.create({
          name: `Concurrent ${i}`,
          points: [[i, i], [i + 1, i], [i + 0.5, i + 1]]
        })
      );

      const created = await Promise.all(createPromises);
      expect(created).toHaveLength(5);

      // Read all
      const all = await controller.findAll();
      expect(all).toHaveLength(5);

      // Delete some concurrently
      const deletePromises = created.slice(0, 3).map(p => controller.remove(p.id));
      await Promise.all(deletePromises);

      // Verify remaining
      const remaining = await controller.findAll();
      expect(remaining).toHaveLength(2);
    });

    it('should maintain data integrity across operations', async () => {
      const complexDto: CreatePolygonDto = {
        name: 'Data Integrity Test with éñü 中文 🔥',
        points: [
          [0.123456789, -9.987654321],
          [1000.5, 2000.75],
          [-500.25, -1000.33]
        ]
      };

      const created = await controller.create(complexDto);
      
      // Verify data is exactly as provided
      expect(created.name).toBe(complexDto.name);
      expect(created.points).toEqual(complexDto.points);
      
      // Verify data persists through read operations
      const found = await controller.findOne(created.id);
      expect(found.name).toBe(complexDto.name);
      expect(found.points).toEqual(complexDto.points);
      
      const all = await controller.findAll();
      const foundInList = all.find(p => p.id === created.id);
      expect(foundInList?.name).toBe(complexDto.name);
      expect(foundInList?.points).toEqual(complexDto.points);
    });
  });
});