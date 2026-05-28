import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { MinioService } from './minio/minio.service';
import { MinioController } from './minio/minio.controller';
import { FiledbModule } from './filedb/filedb.module';
import { MinioModule } from './minio/minio.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [
    DbModule, 
    FiledbModule, 
    MinioModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

  ],
  controllers: [AppController, MinioController],
  providers: [AppService, MinioService],
})
export class AppModule {}
