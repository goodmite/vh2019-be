import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.port || process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(port);
}

bootstrap()
  .then(() => {
    console.log('Bootstrap success:: ' + (process.env.port || process.env.PORT || 3000));
  });
