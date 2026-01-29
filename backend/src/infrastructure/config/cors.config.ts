import { registerAs } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export default registerAs('cors', (): CorsOptions => {
  const origins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) ?? [];

  console.log('[CORS DEBUG] origins =', origins);

  return {
    origin: origins,
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  };
});