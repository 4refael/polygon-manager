import { Module } from '@nestjs/common';
import { PolygonController } from './controllers/polygon.controller';
import { PolygonService } from './services/polygon.service';
import { DatabaseService } from './services/database.service';

@Module({
  controllers: [PolygonController],
  providers: [
    DatabaseService,
    PolygonService
  ]
})
export class AppModule {}