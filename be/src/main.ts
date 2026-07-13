import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 8080);
  app.useGlobalPipes(new ValidationPipe());
  // console.log('app>>>>>>>>>>>>', app);
  console.log('port', process.env.PORT);
}
bootstrap();
