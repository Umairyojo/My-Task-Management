import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const allowedOrigins = ['http://localhost:3000'];

  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }

  app.enableCors({
    origin: allowedOrigins,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const portValue = configService.get<string>('PORT') ?? process.env.PORT;
  const port = portValue ? Number(portValue) : 3001;

  await app.listen(Number.isNaN(port) ? 3001 : port);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
