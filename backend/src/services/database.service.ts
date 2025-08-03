import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Database } from 'sqlite3';
import type { Polygon } from '../types';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private db: Database | null = null;
  private readonly dbPath = process.env['DB_FILE'] ?? '../data/polygons.db';

  async onModuleInit(): Promise<void> {
    await this.connect();
    await this.initializeTables();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new Database(this.dbPath, (err) => {
        if (err) {
          this.logger.error(`Failed to connect to database: ${err.message}`);
          reject(err);
        } else {
          this.logger.log(`Connected to SQLite database: ${this.dbPath}`);
          resolve();
        }
      });
    });
  }

  private async disconnect(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          this.logger.error(`Error closing database: ${err.message}`);
          reject(err);
        } else {
          this.logger.log('Database connection closed');
          resolve();
        }
      });
    });
  }

  private async initializeTables(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const query = `
      CREATE TABLE IF NOT EXISTS polygons (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        points TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise((resolve, reject) => {
      this.db!.run(query, (err) => {
        if (err) {
          this.logger.error(`Failed to create table: ${err.message}`);
          reject(err);
        } else {
          this.logger.log('Database tables initialized');
          resolve();
        }
      });
    });
  }

  async findAll(): Promise<Polygon[]> {
    if (!this.db) throw new Error('Database not connected');

    return new Promise((resolve, reject) => {
      this.db!.all('SELECT * FROM polygons ORDER BY created_at DESC', (err, rows: any[]) => {
        if (err) {
          this.logger.error(`Failed to fetch polygons: ${err.message}`);
          reject(err);
        } else {
          resolve(rows.map(this.mapRowToPolygon));
        }
      });
    });
  }

  async findById(id: string): Promise<Polygon | null> {
    if (!this.db) throw new Error('Database not connected');

    return new Promise((resolve, reject) => {
      this.db!.get('SELECT * FROM polygons WHERE id = ?', [id], (err, row: any) => {
        if (err) {
          this.logger.error(`Failed to fetch polygon ${id}: ${err.message}`);
          reject(err);
        } else {
          resolve(row ? this.mapRowToPolygon(row) : null);
        }
      });
    });
  }

  async create(polygon: Polygon): Promise<Polygon> {
    if (!this.db) throw new Error('Database not connected');

    const query = 'INSERT INTO polygons (id, name, points, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
    const params = [
      polygon.id,
      polygon.name,
      JSON.stringify(polygon.points),
      polygon.createdAt.toISOString(),
      polygon.updatedAt.toISOString()
    ];

    return new Promise((resolve, reject) => {
      this.db!.run(query, params, (err) => {
        if (err) {
          this.logger.error(`Failed to create polygon: ${err.message}`);
          reject(err);
        } else {
          resolve(polygon);
        }
      });
    });
  }

  async delete(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');

    return new Promise((resolve, reject) => {
      this.db!.run('DELETE FROM polygons WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  private mapRowToPolygon(row: any): Polygon {
    return {
      id: row.id,
      name: row.name,
      points: JSON.parse(row.points),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}