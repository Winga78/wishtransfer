
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FileUpload } from './file.entity';

@Injectable()
export class FileService {
  constructor(
    @Inject('FILE_REPOSITORY')
    private fileRepository: Repository<FileUpload>,
  ) {}

  async findAll(): Promise<FileUpload[]> {
    return this.fileRepository.find();
  }

  async create(file: FileUpload): Promise<FileUpload> {
    return this.fileRepository.save(file);
  }

  async findOne(id: string): Promise<FileUpload | null> {
    return this.fileRepository.findOneBy({ id });
  }
 
  async update(id: string, file: FileUpload): Promise<FileUpload> {
    await this.fileRepository.update(id, file);
    return this.findOne(id) as Promise<FileUpload>;
  }

  async delete(id: string): Promise<void> {
    await this.fileRepository.delete(id);
  }
}
