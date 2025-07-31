import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // HTTP request logging
  app.use(morgan('combined'));
  
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
