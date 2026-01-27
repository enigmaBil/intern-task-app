import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security - Helmet
  app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour Swagger
  }));

  // CORS - Configuration sécurisée
  const frontendUrl = configService.get<string>('app.frontendUrl') || process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://192.168.100.144:3000', 'http://localhost:3001', 'http://192.168.100.144:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  });

  // Global prefix pour toutes les routes API
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health'], // Exclure certaines routes du préfixe
  });

  // Global Pipes - Validation
  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  })
);

  // Global Filters - Exception handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Mini JIRA API')
    .setDescription(
      '🚀 **API REST sécurisée pour la gestion de projets agiles**'
    )
    .setVersion('1.0.0')
    .addTag('Users', 'Gestion des utilisateurs - Requires ADMIN role')
    .addTag('Tasks', 'Gestion des tâches - Permissions granulaires (tasks:*)')
    .addTag('Scrum Notes', 'Notes de scrum quotidiennes - Permissions granulaires (scrum_note:*)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 
          '🔑 **Token JWT obtenu depuis Keycloak**\n\n' +
          'Format: `Bearer <your-jwt-token>`\n\n' +
          'Le token contient vos rôles (realm + client) qui déterminent vos permissions.',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3001', 'Développement local')
    .addServer('http://192.168.100.144:3001', 'Réseau local')
    .addServer(`http://localhost:${configService.get('app.port', 3001)}`, 'Serveur actuel')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Garde le token en mémoire
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none', // Collapse tous les endpoints par défaut
      filter: true, // Active la recherche
      displayRequestDuration: true, // Affiche la durée des requêtes
    },
    customSiteTitle: 'Mini JIRA - API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
  });

  const port = configService.get<number>('app.port') || process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  // Logs de démarrage
  logger.log('='.repeat(60));
  logger.log('🚀 Mini JIRA Backend - Application démarrée');
  logger.log('='.repeat(60));
  logger.log(`📍 URL: http://localhost:${port}`);
  logger.log(`📚 Swagger: http://localhost:${port}/api/docs`);
  logger.log(`🔐 Keycloak: ${configService.get('keycloak.url') || process.env.KC_AUTH_SERVER_URL}`);
  logger.log(`🌍 Realm: ${configService.get('keycloak.realm') || process.env.KC_REALM || 'mini-jira'}`);
  logger.log(`🔑 Client: ${configService.get('keycloak.clientId') || process.env.KC_CLIENT_ID || 'mini-jira-backend'}`);
  logger.log(`🌐 CORS: ${frontendUrl}`);
  logger.log('='.repeat(60));
}

bootstrap();
