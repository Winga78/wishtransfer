import { Module } from '@nestjs/common';
import { FiledbModule } from 'src/filedb/filedb.module';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';

@Module({
    imports: [FiledbModule],
    controllers: [MinioController],
    providers: [MinioService],
})
export class MinioModule {}
