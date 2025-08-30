import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

void (async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: [process.env.NODE_ENV === 'production' ? 'error' : 'debug'],
  });
  await app.listen(process.env.PORT ?? 3000);
})();
