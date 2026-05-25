import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { fileProviders } from './file.providers';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [],
  providers: [...fileProviders, FileService],
  exports: [FileService],
})
export class FiledbModule {}
