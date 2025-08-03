import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable()
export class DelayInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DelayInterceptor.name);
  private readonly delayMs = +(process.env['API_DELAY_MS'] ?? '5000');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const start = Date.now();
    
    return next.handle().pipe(
      delay(this.delayMs),
      tap(() => this.logger.log(`${req.method} ${req.url} - ${Date.now() - start}ms`))
    );
  }
}