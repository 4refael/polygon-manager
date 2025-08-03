import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, { 
    logger: ['error', 'warn', 'log'],
    cors: { origin: '*', credentials: true }
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  app.setGlobalPrefix('api');

  const port = +(process.env['PORT'] ?? '3000');
  await app.listen(port, '0.0.0.0');
  
  new Logger('Bootstrap').log(`Server running on http://localhost:${port}/api`);
};

bootstrap().catch(console.error);